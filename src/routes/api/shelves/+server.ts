import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth/auth-utils';
import { createShelfSchema, updateShelfSchema } from '$lib/validation/content';
import { ZodError } from 'zod';
import { db } from '$lib/server/db';
import { shelves, shelfItems, posts } from '$lib/server/db/schema/content';
import { eq, and, desc, inArray, count } from 'drizzle-orm';
import { getCacheOrSet, invalidateCache, CACHE_TTL } from '$lib/server/redis/cache';

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
		const body = await request.json();

		// Validate request body
		const validated = createShelfSchema.parse(body);

		// Check if this is the main shelf
		if (validated.isMain) {
			// Check if user already has a main shelf
			const [existingMainShelf] = await db
				.select()
				.from(shelves)
				.where(and(eq(shelves.userId, userId), eq(shelves.isMain, true)))
				.limit(1);

			if (existingMainShelf) {
				return json(
					{
						success: false,
						error: 'You already have a main shelf'
					},
					{ status: 400 }
				);
			}
		}

		// Create shelf
		const [shelf] = await db
			.insert(shelves)
			.values({
				userId,
				name: validated.name,
				description: validated.description,
				isMain: validated.isMain ?? false,
				theme: validated.theme || {},
				layout: validated.layout || {},
				isPublic: validated.isPublic ?? false
			})
			.returning();

		if (!shelf) {
			return json(
				{
					success: false,
					error: 'Failed to create shelf'
				},
				{ status: 500 }
			);
		}

		// Invalidate shelf cache
		invalidateCache(`shelves:${userId}`);

		return json(
			{
				success: true,
				shelf: {
					id: shelf.id,
					name: shelf.name,
					isMain: shelf.isMain,
					createdAt: shelf.createdAt
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Shelf creation error:', error);

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
		const includeItems = url.searchParams.get('includeItems') === 'true';
		const isMain = url.searchParams.get('isMain') === 'true';
		const shelfId = url.searchParams.get('id');

		// Use cache for better performance
		const cacheKey = `shelves:${userId}:${isMain ? 'main' : 'all'}:${page}:${limit}`;

		const result = await getCacheOrSet(
			cacheKey,
			async () => {
				// Base query
				const shelvesList = await db.query.shelves.findMany({
					where: (shelf, { eq, and }) => {
						if (shelfId) {
							return eq(shelf.id, shelfId);
						} else {
							let conditions = [eq(shelf.userId, userId)];
							if (isMain) {
								conditions.push(eq(shelf.isMain, true));
							}
							return and(...conditions);
						}
					},
					orderBy: (shelf, { desc }) => desc(shelf.updatedAt),
					limit,
					offset: (page - 1) * limit
				});

				const totalQuery = db
					.select({ count: count() })
					.from(shelves)
					.where(
						shelfId
							? eq(shelves.id, shelfId)
							: and(eq(shelves.userId, userId), isMain ? eq(shelves.isMain, true) : undefined)
					);
				const [{ count: total }] = await totalQuery;

				// If requested, get shelf items for each shelf
				let shelvesWithItems = shelvesList;

				if (includeItems && shelvesList.length > 0) {
					const shelfIds = shelvesList.map((shelf) => shelf.id);

					// Get items for all shelves
					const items = await db
						.select({
							item: shelfItems,
							post: {
								id: posts.id,
								title: posts.title,
								contentType: posts.contentType,
								mediaUrls: posts.mediaUrls,
								tags: posts.tags,
								bookmarkCount: posts.bookmarkCount
							}
						})
						.from(shelfItems)
						.leftJoin(posts, eq(shelfItems.postId, posts.id))
						.where(inArray(shelfItems.shelfId, shelfIds))
						.orderBy(shelfItems.sortOrder);

					// Group items by shelf ID
					const itemsByShelf: Record<string, any[]> = {};
					items.forEach((item) => {
						if (!itemsByShelf[item.item.shelfId]) {
							itemsByShelf[item.item.shelfId] = [];
						}
						itemsByShelf[item.item.shelfId].push({
							id: item.item.id,
							postId: item.item.postId,
							addedAt: item.item.addedAt,
							sortOrder: item.item.sortOrder,
							selectionType: item.item.selectionType,
							relevanceScore: item.item.relevanceScore,
							post: item.post
						});
					});

					// Add items to shelves
					shelvesWithItems = shelvesList.map((shelf) => ({
						...shelf,
						items: itemsByShelf[shelf.id] || []
					}));
				}

				return {
					shelves: shelvesWithItems,
					pagination: {
						page,
						limit,
						total
					}
				};
			},
			CACHE_TTL.FEED
		);

		return json({
			success: true,
			...result
		});
	} catch (error) {
		console.error('Shelves retrieval error:', error);

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
		const validated = updateShelfSchema.parse(body);

		// Check if shelf exists and belongs to user
		const [existingShelf] = await db
			.select()
			.from(shelves)
			.where(and(eq(shelves.id, validated.id), eq(shelves.userId, userId)))
			.limit(1);

		if (!existingShelf) {
			return json(
				{
					success: false,
					error: 'Shelf not found or not owned by you'
				},
				{ status: 404 }
			);
		}

		// Update shelf
		const [updatedShelf] = await db
			.update(shelves)
			.set({
				name: validated.name ?? existingShelf.name,
				description: validated.description ?? existingShelf.description,
				theme: validated.theme ?? existingShelf.theme,
				layout: validated.layout ?? existingShelf.layout,
				isPublic: validated.isPublic ?? existingShelf.isPublic,
				updatedAt: new Date()
			})
			.where(eq(shelves.id, validated.id))
			.returning();

		// Invalidate cache
		invalidateCache(`shelves:${userId}`);

		return json({
			success: true,
			shelf: updatedShelf
		});
	} catch (error) {
		console.error('Shelf update error:', error);

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
		const shelfId = url.searchParams.get('id');

		if (!shelfId) {
			return json(
				{
					success: false,
					error: 'Shelf ID is required'
				},
				{ status: 400 }
			);
		}

		// Check if shelf exists and belongs to user
		const [existingShelf] = await db
			.select()
			.from(shelves)
			.where(and(eq(shelves.id, shelfId), eq(shelves.userId, userId)))
			.limit(1);

		if (!existingShelf) {
			return json(
				{
					success: false,
					error: 'Shelf not found or not owned by you'
				},
				{ status: 404 }
			);
		}

		// Check if it's the main shelf
		if (existingShelf.isMain) {
			return json(
				{
					success: false,
					error: 'Cannot delete the main shelf'
				},
				{ status: 400 }
			);
		}

		// Delete shelf (cascade will handle shelf items)
		await db.delete(shelves).where(eq(shelves.id, shelfId));

		// Invalidate cache
		invalidateCache(`shelves:${userId}`);

		return json({
			success: true,
			message: 'Shelf deleted successfully'
		});
	} catch (error) {
		console.error('Shelf deletion error:', error);

		return json(
			{
				success: false,
				error: 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
}
