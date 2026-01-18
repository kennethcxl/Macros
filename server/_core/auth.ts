import type { Request } from 'express';
import { supabaseAdmin } from './supabase';
import * as db from '../db';
import type { User } from '../../drizzle/schema';

/**
 * Extract Supabase access token from Authorization header or cookie
 */
function getAccessToken(req: Request): string | null {
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Check cookies (Supabase stores token as 'sb-access-token')
    const cookies = req.headers.cookie;
    if (cookies) {
        const match = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
        if (match) {
            try {
                const tokenData = JSON.parse(decodeURIComponent(match[1]));
                return tokenData.access_token || null;
            } catch {
                return null;
            }
        }
    }

    return null;
}

/**
 * Authenticate request using Supabase JWT token
 * Returns the authenticated user from our database
 */
export async function authenticateRequest(req: Request): Promise<User> {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
        throw new Error('No authentication token provided');
    }

    // Verify the token with Supabase
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !supabaseUser) {
        console.error('[Auth] Supabase token verification failed:', error?.message);
        throw new Error('Invalid or expired authentication token');
    }

    console.log('[Auth] Authenticated Supabase user:', supabaseUser.email);

    // Get or create user in our database
    let user = await db.getUserByOpenId(supabaseUser.id);

    if (!user) {
        // Create user if doesn't exist
        await db.upsertUser({
            openId: supabaseUser.id,
            email: supabaseUser.email || null,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || null,
            loginMethod: 'email',
            lastSignedIn: new Date(),
        });

        user = await db.getUserByOpenId(supabaseUser.id);
    } else {
        // Update last signed in
        await db.upsertUser({
            openId: user.openId,
            lastSignedIn: new Date(),
        });
    }

    if (!user) {
        throw new Error('Failed to create or retrieve user');
    }

    return user;
}
