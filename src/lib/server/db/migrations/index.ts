import { db } from '$lib/server/db';
import { createInitialMigration } from './0000_initial';
import { sql } from 'drizzle-orm';

// Run all migrations
export async function runMigrations() {
  try {
    // Check if the _migrations table exists
    const migrationTableResult = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_migrations'
      ) as "exists";
    `);
    
    // Fix: Access the first result directly
    const hasTable = migrationTableResult[0]?.exists || false;

    // If the migrations table doesn't exist, create it
    if (!hasTable) {
      await db.execute(sql`
        CREATE TABLE _migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      console.log('Created _migrations table');
    }

    // Check if the initial migration has already been run
    const initialMigrationResult = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM _migrations 
        WHERE name = '0000_initial'
      ) as "exists";
    `);
    
    // Fix: Access the first result directly
    const hasInitialMigration = initialMigrationResult[0]?.exists || false;

    if (!hasInitialMigration) {
      console.log('Running initial migration...');
      await createInitialMigration(db); // Now this should work

      // Record the initial migration in the _migrations table
      await db.execute(sql`
        INSERT INTO _migrations (name) VALUES ('0000_initial');
      `);
      console.log('Initial migration completed successfully');
    } else {
      console.log('Initial migration already applied');
    }

    // Add more migrations here as needed (e.g., 0001_migration, etc.)

    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}
