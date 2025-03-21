import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth/auth-utils';
import { createBookmarkSchema, updateBookmarkSchema } from '$lib/validation/content';
import { ZodError } from 'zod';
import { db } from '$lib/server/db';
import { bookmarks, posts } from '$lib/server/db/schema/content';
import { eq, and, desc, sql } from 'drizzle-orm';
import { checkBookmarkRateLimits, detectBookmarkSpam } from '$lib/server/redis/rate-limiting';
import { autoTagBookmark } from '$lib/server/ai/auto-tagging';
import { checkAndSuggestShelfName } from '$lib/server/ai/shelf-naming';
import { awardXp, XP_VALUES, applyDiminishingReturns } from '$lib/server/gamification/xp';

export async function POST({ request, cookies }) {
	try {
		// Validate session
		const session = await validateSession(cookies);
		if (!session.isValid || !session.userId) {
			return json(
				{
					success: false,
					error: 'Unauthorized'
				},
				{ status: 401 }
			);
		}

		const userId = session.userId;

		// Check rate limits
		const rateLimitResult = await checkBookmarkRateLimits(userId);
		if (!rateLimitResult.allowed) {
			return json(
				{
					success: false,
					error: rateLimitResult.reason,
					resetTime: rateLimitResult.resetTime
				},
				{ status: 429 }
			);
		}

		// Check for spam patterns
		const spamCheck = await detectBookmarkSpam(userId);
		if (spamCheck.isSpam && spamCheck.confidence > 0.7) {
			return json(
				{
					success: false,
					error: 'Suspicious activity detected. Please try again later.'
				},
				{ status: 429 }
			);
		}

		const body = await request.json();

		// Validate request body
		const validated = createBookmarkSchema.parse(body);

		// Create bookmark
		const [bookmark] = await db
			.insert(bookmarks)
			.values({
				userId,
				postId: validated.postId,
				notes: validated.notes,
				customTags: validated.customTags || [],
				colorCode: validated.colorCode,
				emojiReaction: validated.emojiReaction,
				svgOverlay: validated.svgOverlay,
				folderPath: validated.folderPath,
				isPrivate: validated.isPrivate ?? true
			})
			.returning();

		if (!bookmark) {
			return json(
				{
					success: false,
					error: 'Failed to create bookmark'
				},
				{ status: 500 }
			);
		}

		// Increment post bookmark count
		await db.execute(sql`
			UPDATE posts 
			SET bookmark_count = bookmark_count + 1 
			WHERE id = ${validated.postId}
		  `);

		// Get post author
		const [post] = await db
			.select({ userId: posts.userId })
			.from(posts)
			.where(eq(posts.id, validated.postId))
			.limit(1);

		// Award XP to the user
		const baseXpAmount = XP_VALUES.SHELF_CURATION;
		const adjustedXpAmount = await applyDiminishingReturns(
			userId,
			'bookmark_creation',
			baseXpAmount
		);

		await awardXp(userId, adjustedXpAmount, 'Bookmark Created', 'bookmark', bookmark.id);

		// Award XP to the post creator if not self-bookmarking
		if (post && post.userId !== userId) {
			await awardXp(
				post.userId,
				XP_VALUES.BOOKMARK_RECEIVED,
				'Post Bookmarked',
				'bookmark_received',
				bookmark.id
			);
		}

		// Trigger AI auto-tagging (non-blocking)
		autoTagBookmark(bookmark.id).catch((err) => console.error('Error auto-tagging bookmark:', err));

		// Check if we should generate a new shelf name (non-blocking)
		checkAndSuggestShelfName(userId).catch((err) =>
			console.error('Error checking shelf name:', err)
		);

		return json(
			{
				success: true,
				bookmark: {
					id: bookmark.id,
					createdAt: bookmark.createdAt
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Bookmark creation error:', error);

		if (error instanceof ZodError) {
			return json(
				{
					success: false,
					error: error.issues
				},
				{ status: 400 }
			);
		}

		return json(
			{
				success: false,
				error: 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
}

export async function GET({ url, cookies }) {
	try {
		// Validate session
		const session = await validateSession(cookies);
		if (!session.isValid || !session.userId) {
			return json(
				{
					success: false,
					error: 'Unauthorized'
				},
				{ status: 401 }
			);
		}

		const userId = session.userId;

		// Parse query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const postId = url.searchParams.get('postId');
		const folderPath = url.searchParams.get('folderPath');

		// Build where conditions
		let whereConditions = [eq(bookmarks.userId, userId)];
		if (postId) {
			whereConditions.push(eq(bookmarks.postId, postId));
		}
		if (folderPath) {
			whereConditions.push(eq(bookmarks.folderPath, folderPath));
		}

		// Construct the query with a single where clause
		const bookmarksList = await db
			.select({
				bookmarkId: bookmarks.id,
				bookmarkUserId: bookmarks.userId,
				bookmarkPostId: bookmarks.postId,
				bookmarkNotes: bookmarks.notes,
				bookmarkCustomTags: bookmarks.customTags,
				bookmarkColorCode: bookmarks.colorCode,
				bookmarkEmojiReaction: bookmarks.emojiReaction,
				bookmarkSvgOverlay: bookmarks.svgOverlay,
				bookmarkFolderPath: bookmarks.folderPath,
				bookmarkIsPrivate: bookmarks.isPrivate,
				bookmarkCreatedAt: bookmarks.createdAt,
				postId: posts.id,
				postTitle: posts.title,
				postContent: posts.content,
				postContentType: posts.contentType,
				postMediaUrls: posts.mediaUrls,
				postTags: posts.tags,
				postCreatedAt: posts.createdAt
			})
			.from(bookmarks)
			.innerJoin(posts, eq(bookmarks.postId, posts.id))
			.where(and(...whereConditions))
			.orderBy(desc(bookmarks.createdAt))
			.limit(limit)
			.offset((page - 1) * limit);

		return json({
			success: true,
			bookmarks: bookmarksList
		});
	} catch (error) {
		console.error('Bookmark retrieval error:', error);
		return json(
			{
				success: false,
				error: 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
}

export async function PUT({ request, cookies }) {
	try {
		// Validate session
		const session = await validateSession(cookies);
		if (!session.isValid || !session.userId) {
			return json(
				{
					success: false,
					error: 'Unauthorized'
				},
				{ status: 401 }
			);
		}

		const userId = session.userId;
		const body = await request.json();

		// Validate request body
		const validated = updateBookmarkSchema.parse(body);

		// Check if bookmark exists and belongs to user
		const [existingBookmark] = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.id, validated.id), eq(bookmarks.userId, userId)))
			.limit(1);

		if (!existingBookmark) {
			return json(
				{
					success: false,
					error: 'Bookmark not found or not owned by you'
				},
				{ status: 404 }
			);
		}

		// Update bookmark
		const [updatedBookmark] = await db
			.update(bookmarks)
			.set({
				notes: validated.notes ?? existingBookmark.notes,
				customTags: validated.customTags ?? existingBookmark.customTags,
				colorCode: validated.colorCode ?? existingBookmark.colorCode,
				emojiReaction: validated.emojiReaction ?? existingBookmark.emojiReaction,
				svgOverlay: validated.svgOverlay ?? existingBookmark.svgOverlay,
				folderPath: validated.folderPath ?? existingBookmark.folderPath,
				isPrivate: validated.isPrivate ?? existingBookmark.isPrivate
			})
			.where(eq(bookmarks.id, validated.id))
			.returning();

		return json({
			success: true,
			bookmark: updatedBookmark
		});
	} catch (error) {
		console.error('Bookmark update error:', error);

		if (error instanceof ZodError) {
			return json(
				{
					success: false,
					error: error.issues
				},
				{ status: 400 }
			);
		}

		return json(
			{
				success: false,
				error: 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
}

export async function DELETE({ url, cookies }) {
	try {
		// Validate session
		const session = await validateSession(cookies);
		if (!session.isValid || !session.userId) {
			return json(
				{
					success: false,
					error: 'Unauthorized'
				},
				{ status: 401 }
			);
		}

		const userId = session.userId;
		const bookmarkId = url.searchParams.get('id');

		if (!bookmarkId) {
			return json(
				{
					success: false,
					error: 'Bookmark ID is required'
				},
				{ status: 400 }
			);
		}

		// Get the bookmark to find the post ID
		const [bookmark] = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
			.limit(1);

		if (!bookmark) {
			return json(
				{
					success: false,
					error: 'Bookmark not found or not owned by you'
				},
				{ status: 404 }
			);
		}

		// Delete the bookmark
		await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));

		// Decrement post bookmark count
		await db.execute(sql`
			UPDATE posts 
			SET bookmark_count = GREATEST(0, bookmark_count - 1) 
			WHERE id = ${bookmark.postId}
		`);

		return json({
			success: true,
			message: 'Bookmark deleted successfully'
		});
	} catch (error) {
		console.error('Bookmark deletion error:', error);

		return json(
			{
				success: false,
				error: 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
}
