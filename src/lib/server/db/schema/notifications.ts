import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // bookmark, shelf_name, mention, xp, challenge, etc.
  title: text('title').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Related entity
  entityType: text('entity_type'), // post, comment, shelf, faction, challenge, etc.
  entityId: uuid('entity_id'),
  // Actions (e.g., "Accept", "Edit", "View")
  actions: jsonb('actions').default([]),
  // Push notification sent status
  isPushSent: boolean('is_push_sent').default(false),
  // Expiration
  expiresAt: timestamp('expires_at'),
  // Additional metadata
  metadata: jsonb('metadata').default({}),
});

// Device tokens for push notifications
export const deviceTokens = pgTable('device_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  platform: text('platform').notNull(), // ios, android, web
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastUsed: timestamp('last_used'),
  isActive: boolean('is_active').default(true),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(users, {
    fields: [deviceTokens.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export const insertDeviceTokenSchema = createInsertSchema(deviceTokens);
export const selectDeviceTokenSchema = createSelectSchema(deviceTokens);