import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';

// Reports (for content, users, or factions)
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'set null' }),
  targetType: text('target_type').notNull(), // user, post, comment, faction
  targetId: uuid('target_id').notNull(),
  reason: text('reason').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: text('status').default('pending'), // pending, reviewed, actioned, dismissed
  reviewedById: uuid('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  // Actions taken
  action: text('action'), // warning, mute, ban, delete, none
  actionDetails: jsonb('action_details').default({}),
  // For repeated issues
  isRepeatOffense: boolean('is_repeat_offense').default(false),
  priority: text('priority').default('normal'), // low, normal, high, urgent
});

// Content filters
export const contentFilters = pgTable('content_filters', {
  id: uuid('id').primaryKey().defaultRandom(),
  pattern: text('pattern').notNull(), // Regex or text pattern
  filterType: text('filter_type').notNull(), // hate_speech, nsfw, spam, etc.
  action: text('action').default('flag'), // flag, block, delete
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true),
  severity: text('severity').default('medium'), // low, medium, high
  // False positive tracking
  falsePositiveCount: integer('false_positive_count').default(0),
  // For training
  examples: jsonb('examples').default([]),
});

// Content filter matches (audit log)
export const contentFilterMatches = pgTable('content_filter_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  filterId: uuid('filter_id').references(() => contentFilters.id, { onDelete: 'cascade' }).notNull(),
  contentType: text('content_type').notNull(), // post, comment, message
  contentId: uuid('content_id').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchedText: text('matched_text'),
  actionTaken: text('action_taken').notNull(), // flagged, blocked, deleted
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // For review
  reviewStatus: text('review_status').default('pending'), // pending, confirmed, false_positive
  reviewedById: uuid('reviewed_by_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
});

// User moderation actions
export const moderationActions = pgTable('moderation_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetUserId: uuid('target_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: text('action_type').notNull(), // warning, mute, ban, unban
  reason: text('reason').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // For temporary actions
  expiresAt: timestamp('expires_at'),
  // Related info
  reportId: uuid('report_id').references(() => reports.id),
  factionId: uuid('faction_id'), // If faction-specific action
  // Status
  isActive: boolean('is_active').default(true),
  resolvedAt: timestamp('resolved_at'),
  resolvedReason: text('resolved_reason'),
});

// Moderation logs (audit trail)
export const moderationLogs = pgTable('moderation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: text('action_type').notNull(), // report_review, content_delete, user_mute, etc.
  details: jsonb('details').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Related entities
  relatedEntityType: text('related_entity_type'), // user, post, comment, report, etc.
  relatedEntityId: uuid('related_entity_id'),
  factionId: uuid('faction_id'), // If faction-specific
  // For system actions
  isSystemAction: boolean('is_system_action').default(false),
});

// Relations
export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [reports.reviewedById],
    references: [users.id],
  }),
}));

export const contentFiltersRelations = relations(contentFilters, ({ many }) => ({
  matches: many(contentFilterMatches),
}));

export const contentFilterMatchesRelations = relations(contentFilterMatches, ({ one }) => ({
  filter: one(contentFilters, {
    fields: [contentFilterMatches.filterId],
    references: [contentFilters.id],
  }),
  user: one(users, {
    fields: [contentFilterMatches.userId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [contentFilterMatches.reviewedById],
    references: [users.id],
  }),
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  targetUser: one(users, {
    fields: [moderationActions.targetUserId],
    references: [users.id],
  }),
  moderator: one(users, {
    fields: [moderationActions.moderatorId],
    references: [users.id],
  }),
  report: one(reports, {
    fields: [moderationActions.reportId],
    references: [reports.id],
  }),
}));

// Zod schemas for validation
export const insertReportSchema = createInsertSchema(reports);
export const selectReportSchema = createSelectSchema(reports);
export const insertContentFilterSchema = createInsertSchema(contentFilters);
export const selectContentFilterSchema = createSelectSchema(contentFilters);
export const insertModerationActionSchema = createInsertSchema(moderationActions);
export const selectModerationActionSchema = createSelectSchema(moderationActions);