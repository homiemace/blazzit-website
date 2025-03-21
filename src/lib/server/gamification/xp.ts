import { db } from '$lib/server/db';
import { xpTransactions, xpLimits } from '$lib/server/db/schema/gamification';
import { profiles } from '$lib/server/db/schema/users';
import { notifications } from '$lib/server/db/schema/notifications';
import { eq, and, sql, desc } from 'drizzle-orm';
import { redis, REDIS_PREFIXES } from '$lib/server/redis';

// XP values for different actions
export const XP_VALUES = {
	CREATE_POST: 10,
	CREATE_QUALITY_POST: 25, // More detailed/engaging posts
	BOOKMARK_RECEIVED: 5,
	COMMENT_RECEIVED: 3,
	COMMENT_CREATED: 2,
	DAILY_LOGIN: 5,
	COMPLETE_PROFILE: 20,
	SHELF_CURATION: 10 // Organizing bookmarks
};

// Daily caps for different activities
export const DAILY_XP_CAPS = {
	POSTS: 100,
	COMMENTS: 50,
	RECEIVED_INTERACTIONS: 100,
	TOTAL_DAILY: 500
};

// Milestones for notifications
const XP_MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];

/**
 * Awards XP to a user for an action
 * @param userId The user ID
 * @param amount The XP amount
 * @param reason The reason for the XP award
 * @param source The source of the XP (post, comment, challenge, etc.)
 * @param sourceId Optional ID of the source
 * @param options Additional options
 * @returns The actual amount of XP awarded (may be reduced due to caps)
 */
export async function awardXp(
	userId: string,
	amount: number,
	reason: string,
	source: string,
	sourceId?: string,
	options?: {
		isDecayable?: boolean;
		decayDays?: number;
		bypassDailyCap?: boolean;
		metadata?: Record<string, any>;
	}
): Promise<number> {
	try {
		// Check if user exists
		const [userProfile] = await db
			.select({ id: profiles.id, totalXp: profiles.totalXp })
			.from(profiles)
			.where(eq(profiles.userId, userId))
			.limit(1);

		if (!userProfile) {
			throw new Error(`User profile not found for user ID: ${userId}`);
		}

		// Check daily XP caps unless bypassed
		let actualAmount = amount;
		if (!options?.bypassDailyCap) {
			actualAmount = await applyDailyXpCaps(userId, amount, source);
		}

		// If amount was reduced to 0 due to caps, don't create a transaction
		if (actualAmount <= 0) {
			return 0;
		}

		// Calculate decay date if applicable
		let decayDate = null;
		if (options?.isDecayable !== false) {
			const decayDays = options?.decayDays || 90; // Default: 90 days
			decayDate = new Date();
			decayDate.setDate(decayDate.getDate() + decayDays);
		}

		// Create XP transaction
		await db.insert(xpTransactions).values({
			userId,
			amount: actualAmount,
			reason,
			source,
			sourceId,
			isDecayable: options?.isDecayable !== false,
			decayDate,
			metadata: options?.metadata || {}
		});

		// Update user's total XP
		const newTotalXp = Number(userProfile.totalXp || 0) + actualAmount;
		await db.update(profiles).set({ totalXp: newTotalXp }).where(eq(profiles.id, userProfile.id));

		// Check if user hit a milestone
		await checkXpMilestone(userId, newTotalXp);

		return actualAmount;
	} catch (error) {
		console.error('Error awarding XP:', error);
		return 0;
	}
}

/**
 * Applies daily XP caps
 * @param userId The user ID
 * @param amount The original XP amount
 * @param source The source of the XP
 * @returns The adjusted XP amount after applying caps
 */
async function applyDailyXpCaps(userId: string, amount: number, source: string): Promise<number> {
	try {
		// Get today's date string (YYYY-MM-DD)
		const todayStr = new Date().toISOString().split('T')[0];

		// Determine which cap to check based on source
		let activityType: string;
		let dailyCap: number;

		if (source === 'post') {
			activityType = 'posts';
			dailyCap = DAILY_XP_CAPS.POSTS;
		} else if (source === 'comment') {
			activityType = 'comments';
			dailyCap = DAILY_XP_CAPS.COMMENTS;
		} else if (['bookmark_received', 'comment_received', 'reaction_received'].includes(source)) {
			activityType = 'received_interactions';
			dailyCap = DAILY_XP_CAPS.RECEIVED_INTERACTIONS;
		} else {
			activityType = 'general';
			dailyCap = DAILY_XP_CAPS.TOTAL_DAILY; // Use total daily cap
		}

		// Get or initialize the daily cap from Redis
		const xpKey = `${REDIS_PREFIXES.XP_DAILY}${userId}:${activityType}:${todayStr}`;
		const currentXp = await redis.get(xpKey);
		const currentAmount = currentXp ? parseInt(currentXp) : 0;

		// Check if we're at the cap
		if (currentAmount >= dailyCap) {
			return 0; // Cap reached, no XP awarded
		}

		// Calculate how much more XP can be awarded before hitting cap
		const remainingCap = dailyCap - currentAmount;
		const adjustedAmount = Math.min(amount, remainingCap);

		// Update Redis
		const newAmount = currentAmount + adjustedAmount;

		// Set with expiry to end of day
		const midnight = new Date();
		midnight.setHours(23, 59, 59, 999);
		const secondsUntilMidnight = Math.floor((midnight.getTime() - Date.now()) / 1000);

		await redis.set(xpKey, newAmount.toString(), 'EX', secondsUntilMidnight);

		// Also update the database for persistence
		const existingLimit = await db
			.select()
			.from(xpLimits)
			.where(
				and(
					eq(xpLimits.userId, userId),
					eq(xpLimits.activityType, activityType),
					sql`date(${xpLimits.resetAt}) = date(now())`
				)
			)
			.limit(1);

		if (existingLimit.length > 0) {
			await db
				.update(xpLimits)
				.set({
					currentDaily: newAmount,
					updatedAt: new Date()
				})
				.where(eq(xpLimits.id, existingLimit[0].id));
		} else {
			// Create new record
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);

			await db.insert(xpLimits).values({
				userId,
				activityType,
				dailyCap,
				currentDaily: adjustedAmount,
				resetAt: tomorrow
			});
		}

		return adjustedAmount;
	} catch (error) {
		console.error('Error applying daily XP caps:', error);
		// In case of error, return original amount
		return amount;
	}
}

/**
 * Applies diminishing returns to repeated activities
 * @param userId The user ID
 * @param activityType The type of activity
 * @param baseAmount The base XP amount
 * @returns The adjusted XP amount
 */
export async function applyDiminishingReturns(
	userId: string,
	activityType: string,
	baseAmount: number
): Promise<number> {
	try {
		// Get recent activities from Redis
		const todayStr = new Date().toISOString().split('T')[0];
		const activitiesKey = `${REDIS_PREFIXES.XP_DAILY}${userId}:${activityType}:activities:${todayStr}`;

		// Get activities count
		const activitiesCount = await redis.llen(activitiesKey);

		// Add current activity timestamp
		await redis.lpush(activitiesKey, Date.now().toString());
		await redis.ltrim(activitiesKey, 0, 19); // Keep only the 20 most recent

		// Set expiry to end of day if new key
		if (activitiesCount === 0) {
			const midnight = new Date();
			midnight.setHours(23, 59, 59, 999);
			const secondsUntilMidnight = Math.floor((midnight.getTime() - Date.now()) / 1000);
			await redis.expire(activitiesKey, secondsUntilMidnight);
		}

		// Calculate diminishing factor
		// More recent activities = lower factor
		let diminishingFactor = 100; // Start at 100%

		if (activitiesCount > 0) {
			// Each activity reduces the factor by 5%, down to a minimum of 20%
			diminishingFactor = Math.max(20, 100 - activitiesCount * 5);
		}

		// Update the xpLimits record in the database
		const [limitRecord] = await db
			.select()
			.from(xpLimits)
			.where(
				and(
					eq(xpLimits.userId, userId),
					eq(xpLimits.activityType, activityType),
					sql`date(${xpLimits.resetAt}) = date(now())`
				)
			)
			.limit(1);

		if (limitRecord) {
			await db
				.update(xpLimits)
				.set({
					diminishingFactor,
					updatedAt: new Date()
				})
				.where(eq(xpLimits.id, limitRecord.id));
		}

		// Apply the diminishing factor
		return Math.floor(baseAmount * (diminishingFactor / 100));
	} catch (error) {
		console.error('Error applying diminishing returns:', error);
		// In case of error, return original amount
		return baseAmount;
	}
}

/**
 * Processes XP decay for old transactions
 * This should be run as a scheduled job (e.g., daily)
 */
export async function processXpDecay(): Promise<void> {
	try {
		const now = new Date();

		// Find XP transactions ready for decay
		const decayableTransactions = await db
			.select()
			.from(xpTransactions)
			.where(
				and(
					eq(xpTransactions.isDecayable, true),
					sql`${xpTransactions.decayDate} < ${now}`,
					sql`${xpTransactions.amount} > 0`
				)
			)
			.limit(100); // Process in batches

		// Process each transaction
		for (const transaction of decayableTransactions) {
			// Create a new negative transaction to represent the decay
			await db.insert(xpTransactions).values({
				userId: transaction.userId,
				amount: -transaction.amount, // Negative amount
				reason: 'XP Decay',
				source: 'system',
				sourceId: transaction.id, // Reference the original transaction
				isDecayable: false, // Decay transactions themselves don't decay
				metadata: {
					originalTransaction: transaction.id,
					originalAmount: transaction.amount,
					originalReason: transaction.reason,
					decayDate: now
				}
			});

			// Update the user's total XP
			const [userProfile] = await db
				.select({ id: profiles.id, totalXp: profiles.totalXp })
				.from(profiles)
				.where(eq(profiles.userId, transaction.userId))
				.limit(1);

			if (userProfile) {
				const newTotalXp = Math.max(0, Number(userProfile.totalXp || 0) - transaction.amount);
				await db
					.update(profiles)
					.set({ totalXp: newTotalXp })
					.where(eq(profiles.id, userProfile.id));
			}

			// Mark the original transaction as processed (amount = 0)
			await db
				.update(xpTransactions)
				.set({ amount: 0 })
				.where(eq(xpTransactions.id, transaction.id));
		}
	} catch (error) {
		console.error('Error processing XP decay:', error);
	}
}

/**
 * Checks if a user has hit an XP milestone and sends a notification
 * @param userId The user ID
 * @param totalXp The user's new total XP
 */
async function checkXpMilestone(userId: string, totalXp: number): Promise<void> {
	try {
		// Get user's previous XP transactions to find the last milestone
		const prevTransactions = await db
			.select()
			.from(xpTransactions)
			.where(eq(xpTransactions.userId, userId))
			.orderBy(desc(xpTransactions.createdAt))
			.limit(50);

		// Calculate the previous total before this transaction
		const prevTotal = totalXp - prevTransactions[0].amount;

		// Check if we crossed any milestone
		for (const milestone of XP_MILESTONES) {
			if (prevTotal < milestone && totalXp >= milestone) {
				// Milestone reached! Create notification
				await db.insert(notifications).values({
					userId,
					type: 'xp_milestone',
					title: 'XP Milestone Reached!',
					content: `Congratulations! You've reached ${milestone} XP.`,
					metadata: { milestone, totalXp }
				});

				// Award a small XP bonus for reaching the milestone (doesn't count towards caps)
				await awardXp(
					userId,
					Math.floor(milestone * 0.05), // 5% of the milestone as bonus
					'Milestone Bonus',
					'system',
					undefined,
					{ bypassDailyCap: true, isDecayable: false }
				);

				break; // Only notify for the highest milestone crossed
			}
		}
	} catch (error) {
		console.error('Error checking XP milestone:', error);
	}
}

/**
 * Gets a user's XP history with pagination
 * @param userId The user ID
 * @param page The page number
 * @param limit The page size
 * @returns Paginated XP transactions
 */
export async function getUserXpHistory(
	userId: string,
	page: number = 1,
	limit: number = 20
): Promise<{
	transactions: any[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	try {
		const offset = (page - 1) * limit;

		// Get transactions
		const transactions = await db
			.select()
			.from(xpTransactions)
			.where(eq(xpTransactions.userId, userId))
			.orderBy(desc(xpTransactions.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count
		const [count] = await db
			.select({ count: sql<number>`count(*)` })
			.from(xpTransactions)
			.where(eq(xpTransactions.userId, userId));

		const total = count?.count || 0;
		const totalPages = Math.ceil(total / limit);

		return {
			transactions,
			total,
			page,
			limit,
			totalPages
		};
	} catch (error) {
		console.error('Error getting user XP history:', error);
		return {
			transactions: [],
			total: 0,
			page,
			limit,
			totalPages: 0
		};
	}
}
