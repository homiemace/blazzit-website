import { json } from '@sveltejs/kit';
import { createUser, createSession } from '$lib/server/auth/auth-utils';
import { registerUserSchema } from '$lib/validation/users';
import { ZodError } from 'zod';

export async function POST({ request, cookies }) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validated = registerUserSchema.parse(body);
    
    // Create user
    const result = await createUser(
      validated.email,
      validated.password,
      validated.username
    );
    
    // Check if there’s an error from createUser
    if (result.error) {
      return json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
    
    // Ensure userId exists and is not null
    if (!result.userId) {
      return json({
        success: false,
        error: 'User ID not found'
      }, { status: 500 });
    }
    
    // Create session with a guaranteed string userId
    const sessionCreated = await createSession(
      result.userId,
      cookies
    );
    
    if (!sessionCreated) {
      return json({
        success: true,
        userId: result.userId,
        message: 'Account created but unable to log in automatically'
      }, { status: 201 });
    }
    
    return json({
      success: true,
      userId: result.userId,
      message: 'Account created and logged in successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
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