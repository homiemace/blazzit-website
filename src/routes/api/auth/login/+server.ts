import { json } from '@sveltejs/kit';
import { validateCredentials, createSession } from '$lib/server/auth/auth-utils';
import { loginUserSchema } from '$lib/validation/users';
import { ZodError } from 'zod';
import { isRateLimited } from '$lib/server/redis/rate-limiting';

export async function POST(event) {
  try {
    // Check rate limiting using the full event object
    const rateLimitCheck = await isRateLimited(event);
    if (!rateLimitCheck.allowed) {
      return json({
        success: false,
        error: 'Too many login attempts. Please try again later.',
        resetTime: rateLimitCheck.resetTime
      }, { status: 429 });
    }

    // Access request body via event.request
    const body = await event.request.json();

    // Validate request body
    const validated = loginUserSchema.parse(body);

    // Validate credentials
    const result = await validateCredentials(validated.email, validated.password);

    if (result.error) {
      return json({
        success: false,
        error: result.error
      }, { status: 401 });
    }

    // Ensure userId is present and not null
    if (!result.userId) {
      return json({
        success: false,
        error: 'User ID not found'
      }, { status: 500 });
    }

    // Create session using event.cookies
    const sessionCreated = await createSession(result.userId, event.cookies);

    if (!sessionCreated) {
      return json({
        success: false,
        error: 'Failed to create session'
      }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Logged in successfully'
    });
  } catch (error) {
    console.error('Login error:', error);

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