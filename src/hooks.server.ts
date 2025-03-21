// hooks.server.ts
import type { SupabaseClient, AuthSession } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession: (event: RequestEvent) => Promise<AuthSession | null>;
    }
    interface PageData {
      session: AuthSession | null;
    }
    interface Error {
      code?: string;
      supabaseError?: unknown;
      message: string;
    }
  }
}