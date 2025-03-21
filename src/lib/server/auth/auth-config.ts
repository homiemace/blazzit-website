import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "$env/dynamic/private";
import argon2 from "@node-rs/argon2";
import { randomUUID } from "crypto";
import { db } from "$lib/server/db";

// Create the database adapter using Drizzle (for Postgres)
const dbAdapter = drizzleAdapter(db, {
  provider: "pg",
});

// Initialize Better Auth using the "database" property
export const auth = betterAuth({
  database: dbAdapter,
  secure: env.NODE_ENV === "production",

  // Configure password hashing using argon2.

  hash: {
    async hash(password: string): Promise<string> {
      return await argon2.hash(password);
    },
    async verify(hash: string, password: string): Promise<boolean> {
      return await argon2.verify(hash, password);
    },
  },

  // Generate unique IDs for users and sessions
  generateUserId: () => randomUUID(),
  generateSessionId: () => randomUUID(),

  // Session cookie configuration
  sessionCookie: {
    name: "blazzit_session",
    options: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  },
});
