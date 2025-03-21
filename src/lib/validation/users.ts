import { z } from 'zod';
import { insertUserSchema, insertProfileSchema } from '$lib/server/db/schema/users';

// Registration validation
export const registerUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Login validation
export const loginUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

// Profile update validation
export const updateProfileSchema = z.object({
  displayName: z.string().max(50, 'Display name must be at most 50 characters').optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  avatarUrl: z.string().url('Please enter a valid URL').optional().nullable(),
  theme: z.string().optional(),
  customCss: z.string().max(5000, 'Custom CSS must be at most 5000 characters').optional(),
  bentoLayout: z.array(z.any()).optional(),
  scrapbookItems: z.array(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter your current password'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

// Email update validation
export const updateEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

// Privacy settings validation
export const updatePrivacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'followers', 'private']),
  bookmarksVisibility: z.enum(['public', 'followers', 'private']),
  allowTagging: z.boolean(),
  dataUsageConsent: z.boolean(),
});

// Notification preferences validation
export const updateNotificationPreferencesSchema = z.object({
  shelfNameSuggestions: z.boolean(),
  mentions: z.boolean(),
  comments: z.boolean(),
  challenges: z.boolean(),
  xpMilestones: z.boolean(),
  factionUpdates: z.boolean(),
});

// Feed preferences validation
export const updateFeedPreferencesSchema = z.object({
  contentFilters: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  hideNsfw: z.boolean().optional(),
});

// Theme preferences validation
export const updateThemePreferencesSchema = z.object({
  darkMode: z.boolean().optional(),
  syncWithShelf: z.boolean().optional(),
  fontPreference: z.string().optional(),
});

export { insertUserSchema, insertProfileSchema };