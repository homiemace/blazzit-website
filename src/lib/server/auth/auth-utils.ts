import { auth } from './auth-config';
import { db } from '$lib/server/db';
import { users, profiles } from '$lib/server/db/schema/users';
import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';

// Define an interface to describe the methods available on the auth object
interface AuthUtils {
  createUser: (options: { identifier: string; password: string; attributes: Record<string, any> }) => Promise<string>;
  authenticateUser: (identifier: string, password: string) => Promise<{ userId: string }>;
  createSession: (options: { userId: string; attributes: Record<string, any> }) => Promise<{ id: string }>;
  validateSession: (sessionId: string) => Promise<{ userId: string } | null>;
  invalidateSession: (sessionId: string) => Promise<void>;
  setSessionCookie: (cookies: Cookies, sessionId: string) => void;
  clearSessionCookie: (cookies: Cookies) => void;
  verifyPassword: (identifier: string, password: string) => Promise<boolean>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  invalidateAllUserSessions: (userId: string) => Promise<void>;
  getUserByIdentifier: (identifier: string) => Promise<{ id: string } | null>;
  updateUserIdentifier: (userId: string, newIdentifier: string) => Promise<void>;
  sessionCookieName: string;
}

// Cast the auth object to the AuthUtils interface to satisfy TypeScript
const authUtils = auth as unknown as AuthUtils;

/**
 * Creates a new user account with the provided email, password, and username
 * @param email The user's email address
 * @param password The user's password
 * @param username The user's chosen username
 * @returns An object with the created user ID or an error message
 */
export async function createUser(
  email: string,
  password: string,
  username: string
): Promise<{ userId: string; error: null } | { userId: null; error: string }> {
  try {
    // Create a user in the authentication system using Better-Auth
    const userId = await authUtils.createUser({
      identifier: email.toLowerCase(),
      password,
      attributes: {
        email: email.toLowerCase(),
        emailVerified: false,
        status: 'active'
      }
    });
    
    // Insert a profile for the user into the database using Drizzle ORM
    await db.insert(profiles).values({
      userId,
      username,
      displayName: username,
    });
    
    // Return success with the user ID
    return { userId, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle specific errors like duplicate email or username
    if (errorMessage.includes('duplicate') && errorMessage.includes('email')) {
      return { userId: null, error: 'Email already in use' };
    }
    
    if (errorMessage.includes('duplicate') && errorMessage.includes('username')) {
      return { userId: null, error: 'Username already taken' };
    }
    
    // Generic error for unexpected issues
    return { userId: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Validates a user's email and password
 * @param email The user's email address
 * @param password The user's password
 * @returns An object with the user ID if valid, or an error message
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<{ userId: string; error: null } | { userId: null; error: string }> {
  try {
    // Authenticate the user using Better-Auth
    const { userId } = await authUtils.authenticateUser(email.toLowerCase(), password);
    
    if (!userId) {
      return { userId: null, error: 'Invalid email or password' };
    }
    
    // Update the user's last login time in the database
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
    
    // Return success with the user ID
    return { userId, error: null };
  } catch (error) {
    console.error('Error validating credentials:', error);
    return { userId: null, error: 'Invalid email or password' };
  }
}

/**
 * Creates a new session for a user and sets a session cookie
 * @param userId The ID of the user
 * @param cookies SvelteKit cookies object for managing cookies
 * @returns True if the session was created successfully, false otherwise
 */
export async function createSession(
  userId: string,
  cookies: Cookies
): Promise<boolean> {
  try {
    // Create a session using Better-Auth
    const session = await authUtils.createSession({
      userId,
      attributes: {}
    });
    
    // Set the session cookie in the user's browser
    authUtils.setSessionCookie(cookies, session.id);
    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
}

/**
 * Validates a session based on the session cookie
 * @param cookies SvelteKit cookies object
 * @returns An object indicating if the session is valid and the associated user ID
 */
export async function validateSession(
  cookies: Cookies
): Promise<{ userId: string | null; isValid: boolean }> {
  try {
    // Get the session ID from the cookies
    const sessionId = cookies.get(authUtils.sessionCookieName);
    if (!sessionId) {
      return { userId: null, isValid: false };
    }
    
    // Validate the session using Better-Auth
    const session = await authUtils.validateSession(sessionId);
    if (!session || !session.userId) {
      return { userId: null, isValid: false };
    }
    
    // Return the user ID if the session is valid
    return { userId: session.userId, isValid: true };
  } catch (error) {
    console.error('Error validating session:', error);
    return { userId: null, isValid: false };
  }
}

/**
 * Invalidates a user's session and clears the session cookie
 * @param cookies SvelteKit cookies object
 * @returns True if the session was invalidated successfully, false otherwise
 */
export async function invalidateSession(cookies: Cookies): Promise<boolean> {
  try {
    // Get the session ID from the cookies
    const sessionId = cookies.get(authUtils.sessionCookieName);
    if (!sessionId) {
      return false;
    }
    
    // Invalidate the session using Better-Auth
    await authUtils.invalidateSession(sessionId);
    // Clear the session cookie from the user's browser
    authUtils.clearSessionCookie(cookies);
    return true;
  } catch (error) {
    console.error('Error invalidating session:', error);
    return false;
  }
}

/**
 * Changes a user's password after verifying the current password
 * @param userId The ID of the user
 * @param currentPassword The user's current password
 * @param newPassword The new password to set
 * @returns An object indicating success or an error message
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Fetch the user's email from the database
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Verify the current password using Better-Auth
    const isValid = await authUtils.verifyPassword(user.email, currentPassword);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Update the user's password
    await authUtils.updateUserPassword(userId, newPassword);
    
    // Invalidate all existing sessions for the user
    await authUtils.invalidateAllUserSessions(userId);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates a user's email address after verifying their password
 * @param userId The ID of the user
 * @param newEmail The new email address
 * @param password The user's current password for verification
 * @returns An object indicating success or an error message
 */
export async function updateEmail(
  userId: string,
  newEmail: string,
  password: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Fetch the user's current email from the database
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Verify the user's password
    const isValid = await authUtils.verifyPassword(user.email, password);
    if (!isValid) {
      return { success: false, error: 'Password is incorrect' };
    }
    
    // Check if the new email is already in use by another user
    const existingUser = await authUtils.getUserByIdentifier(newEmail.toLowerCase());
    if (existingUser && existingUser.id !== userId) {
      return { success: false, error: 'Email already in use' };
    }
    
    // Update the user's identifier (email) in the authentication system
    await authUtils.updateUserIdentifier(userId, newEmail.toLowerCase());
    
    // Update the user's email and emailVerified status in the database
    await db.update(users)
      .set({ 
        email: newEmail.toLowerCase(),
        emailVerified: false
      })
      .where(eq(users.id, userId));
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating email:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}