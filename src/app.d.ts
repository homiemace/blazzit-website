import { SupabaseClient, Session } from '@supabase/supabase-js'
import type { Database } from '$lib/server/db/schema';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession: () => Promise<Session | null>;
      user?: { id: string };
    }
    interface PageData {
      session: Session | null;
    }
    interface Error {
      code?: string;
      supabaseError?: unknown;
    }
  }
}
