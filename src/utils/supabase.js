// Supabase client initialization and authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

export function initSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Validate config
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase config not found. Make sure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

// Authentication functions

/**
 * Send a magic link to the user's email for passwordless authentication
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendMagicLink(email) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not available' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/highscores.html`
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get the current authenticated user
 * @returns {Promise<{user: object|null, error?: string}>}
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { user: null, error: 'Supabase not available' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { user: null, error: error.message };
    }

    return { user };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not available' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Called with (event, session) when auth state changes
 * @returns {function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { user } = await getCurrentUser();
  return user !== null;
}


