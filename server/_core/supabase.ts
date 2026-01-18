import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Server-side Supabase client
export const supabaseAdmin = createClient(
    ENV.supabaseUrl,
    ENV.supabaseServiceKey || ENV.supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Helper to get Supabase client with user's JWT
export function getSupabaseClient(accessToken: string) {
    return createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
