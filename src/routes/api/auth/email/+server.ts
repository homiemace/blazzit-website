import { json } from '@sveltejs/kit';
import { validateSession, updateEmail } from '$lib/server/auth/auth-utils';
import { updateEmailSchema } from '$lib/validation/users';
import { ZodError } from 'zod';

export async function PUT({ request, cookies }) {
  try {
    // Validate session
    const session = await validateSession(cookies);
    if (!session.isValid || !session.userId) {
      return json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validated = updateEmailSchema.parse(body);
    
    // Update email
    const result = await updateEmail(
      session.userId,
      validated.newEmail,
      validated.password
    );
    
    if (!result.success) {
      return json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
    
    return json({
      success: true,
      message: 'Email updated successfully'
    });
  } catch (error) {
    console.error('Email update error:', error);
    
    if (error instanceof ZodError) {
      return json({
        success: false,
        error: error.issues
      }, { status: 400 });
    }
    
    return json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}