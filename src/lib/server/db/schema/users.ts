import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  status: text('status').default('active'),
  // Privacy settings
  privacySettings: jsonb('privacy_settings').default({
    profileVisibility: 'public',
    bookmarksVisibility: 'private',
    allowTagging: true
  }),
});

// User profiles
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  username: text('username').unique().notNull(),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  theme: text('theme').default('default'),
  // Profile visibility
  isPublic: boolean('is_public').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User preferences
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  notificationPreferences: jsonb('notification_preferences').default({
    shelfNameSuggestions: true,
    mentions: true,
    comments: true
  }),
  feedPreferences: jsonb('feed_preferences').default({
    contentFilters: [],
    preferredCategories: [],
    hideNsfw: true,
  }),
  themePreferences: jsonb('theme_preferences').default({
    darkMode: false,
    syncWithShelf: true,
    fontPreference: 'default',
  }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Followers table
export const followers = pgTable('followers', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  followedId: uuid('followed_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  following: many(followers),
  followers: many(followers), 
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);