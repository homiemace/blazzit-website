import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth/auth-utils';
import { db } from '$lib/server/db';
import { shelves, shelfItems } from '$lib/server/db/schema/content';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const addToShelfSchema = z.object({
  shelfId: z.string().uuid(),
  postId: z.string().uuid(),
  sortOrder: z.number().optional()
});

export async function POST({ request, cookies }) {
  try {
    const session = await validateSession(cookies);
    if (!session.isValid || !session.userId) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = addToShelfSchema.parse(body);
    
    // Verify shelf ownership
    const [shelf] = await db
      .select()
      .from(shelves)
      .where(
        and(
          eq(shelves.id, validated.shelfId),
          eq(shelves.userId, session.userId)
        )
      )
      .limit(1);
    
    if (!shelf) {
      return json({ 
        success: false, 
        error: 'Shelf not found or not owned by you' 
      }, { status: 404 });
    }
    
    // Check if item already exists in shelf
    const [existingItem] = await db
      .select()
      .from(shelfItems)
      .where(
        and(
          eq(shelfItems.shelfId, validated.shelfId),
          eq(shelfItems.postId, validated.postId)
        )
      )
      .limit(1);
    
    if (existingItem) {
      return json({
        success: false,
        error: 'Post already exists in this shelf'
      }, { status: 400 });
    }
    
    // Add to shelf
    const [item] = await db.insert(shelfItems).values({
      shelfId: validated.shelfId,
      postId: validated.postId,
      sortOrder: validated.sortOrder
    }).returning();
    
    // Update shelf's updatedAt timestamp
    await db.update(shelves)
      .set({ updatedAt: new Date() })
      .where(eq(shelves.id, validated.shelfId));
    
    return json({
      success: true,
      item: {
        id: item.id,
        shelfId: item.shelfId,
        postId: item.postId
      }
    }, { status: 201 });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Failed to add item to shelf'
    }, { status: 400 });
  }
}