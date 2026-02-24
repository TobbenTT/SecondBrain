const { createClient } = require('@supabase/supabase-js');
const log = require('../helpers/logger');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isSupabaseConfigured() {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Client for auth operations (login/logout)
const supabase = isSupabaseConfigured()
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Admin client for user management (create/delete/list) — needs service_role key
const supabaseAdmin = (isSupabaseConfigured() && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
    : null;

if (isSupabaseConfigured()) {
    log.info('Supabase configured', { url: SUPABASE_URL, adminEnabled: !!supabaseAdmin });
} else if (process.env.NODE_ENV !== 'test') {
    log.warn('Supabase not configured — using SQLite auth fallback');
}

module.exports = { supabase, supabaseAdmin, isSupabaseConfigured };
