import { json } from '@sveltejs/kit';
import { invalidateSession } from '$lib/server/auth/auth-utils';

export async function POST({ cookies }) {
  try {
    const result = await invalidateSession(cookies);
    
    if (!result) {
      return json({
        success: false,
        error: 'No active session'
      }, { status: 401 });
    }
    
    return json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    return json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}