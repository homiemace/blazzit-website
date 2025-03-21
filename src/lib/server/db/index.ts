import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// Ensure the database URL is defined
const connectionString = env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  throw new Error('SUPABASE_DATABASE_URL is not set. Please check your environment variables.');
}

// Create the database client
export const client = postgres(connectionString, {
  max: 1,
  prepare: false,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });

// Helper function to verify the database connection
export async function ensureDbConnection() {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}