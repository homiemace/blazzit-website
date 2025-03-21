import { z } from 'zod';
import { 
  insertPostSchema, 
  insertBookmarkSchema,
  insertShelfSchema,
  insertCommentSchema
} from '$lib/server/db/schema/content';

// Post creation validation
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  content: z.string().min(1, 'Content is required'),
  contentType: z.enum(['text', 'image', 'video', 'link']),
  mediaUrls: z.array(z.string().url('Please enter a valid URL')).optional(),
  tags: z.array(z.string().max(30, 'Tag must be at most 30 characters')).optional(),
  isNsfw: z.boolean().optional(),
  factionId: z.string().uuid('Invalid faction ID').optional(),
});

// Post update validation
export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid('Invalid post ID'),
});

// Bookmark creation validation
export const createBookmarkSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  customTags: z.array(z.string().max(30, 'Tag must be at most 30 characters')).optional(),
  colorCode: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color code').optional(),
  emojiReaction: z.string().max(10, 'Emoji must be at most 10 characters').optional(),
  svgOverlay: z.string().max(5000, 'SVG must be at most 5000 characters').optional(),
  folderPath: z.string().max(100, 'Folder path must be at most 100 characters').optional(),
  isPrivate: z.boolean().optional(),
});

// Bookmark update validation
export const updateBookmarkSchema = z.object({
  id: z.string().uuid('Invalid bookmark ID'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  customTags: z.array(z.string().max(30, 'Tag must be at most 30 characters')).optional(),
  colorCode: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color code').optional(),
  emojiReaction: z.string().max(10, 'Emoji must be at most 10 characters').optional(),
  svgOverlay: z.string().max(5000, 'SVG must be at most 5000 characters').optional(),
  folderPath: z.string().max(100, 'Folder path must be at most 100 characters').optional(),
  isPrivate: z.boolean().optional(),
});

// Shelf creation validation
export const createShelfSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  isMain: z.boolean().optional(),
  theme: z.any().optional(),
  layout: z.any().optional(),
  isPublic: z.boolean().optional(),
  factionId: z.string().uuid('Invalid faction ID').optional(),
});

// Shelf update validation
export const updateShelfSchema = z.object({
  id: z.string().uuid('Invalid shelf ID'),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters').optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  theme: z.any().optional(),
  layout: z.any().optional(),
  isPublic: z.boolean().optional(),
});

// Shelf name suggestion response
export const shelfNameResponseSchema = z.object({
  shelfId: z.string().uuid('Invalid shelf ID'),
  action: z.enum(['accept', 'edit', 'decline']),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters').optional(),
});

// Comment creation validation
export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  content: z.string().min(1, 'Content is required').max(1000, 'Content must be at most 1000 characters'),
  parentId: z.string().uuid('Invalid parent comment ID').optional(),
});

// Comment update validation
export const updateCommentSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
  content: z.string().min(1, 'Content is required').max(1000, 'Content must be at most 1000 characters'),
});

// Reaction creation validation
export const createReactionSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),
  contentType: z.enum(['post', 'comment']),
  reactionType: z.enum(['like', 'love', 'laugh', 'sad', 'angry', 'wow']),
});

// Shelf item addition validation
export const addToShelfSchema = z.object({
  shelfId: z.string().uuid('Invalid shelf ID'),
  postId: z.string().uuid('Invalid post ID'),
  sortOrder: z.number().int().optional(),
  selectionType: z.enum(['algorithm', 'manual', 'recommendation']).optional(),
});

export { 
  insertPostSchema,
  insertBookmarkSchema,
  insertShelfSchema,
  insertCommentSchema
};