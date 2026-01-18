import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Server-side Supabase client
if (ENV.supabaseUrl) {
    const keyType = ENV.supabaseServiceKey ? 'Service' : 'Anon';
    console.log(`[Supabase] Initializing admin client with ${keyType} key`);
}

export const supabaseAdmin = ENV.supabaseUrl
    ? createClient(
        ENV.supabaseUrl,
        ENV.supabaseServiceKey || ENV.supabaseAnonKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
    : null;

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
