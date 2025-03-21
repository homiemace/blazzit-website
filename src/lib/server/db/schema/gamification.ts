import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// Simplified XP transactions
export const xpTransactions = pgTable('xp_transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	amount: integer('amount').notNull(),
	reason: text('reason').notNull(),
	source: text('source').notNull(), // post, bookmark, comment, etc.
	sourceId: uuid('source_id'), // ID of the source
	createdAt: timestamp('created_at').defaultNow().notNull(),
	metadata: jsonb('metadata').default({})
});

// XP limits for daily caps
export const xpLimits = pgTable('xp_limits', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	activityType: text('activity_type').notNull(), // posting, commenting, bookmarking, etc.
	dailyCap: integer('daily_cap').notNull(),
	currentDaily: integer('current_daily').default(0),
	resetAt: timestamp('reset_at').notNull(),
	// For diminishing returns
	recentActivities: jsonb('recent_activities').default([]),
	diminishingFactor: integer('diminishing_factor').default(100),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
	user: one(users, {
		fields: [xpTransactions.userId],
		references: [users.id]
	})
}));
