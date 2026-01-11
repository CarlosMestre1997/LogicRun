// Supabase client initialization
// This file handles the connection to Supabase

// Import config (you'll need to create config.js from config.js.example)
import { supabaseConfig } from '../config.js';

// Initialize Supabase client
let supabaseClient = null;

export function initSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Check if Supabase CDN is loaded
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase client not loaded. Make sure to include the Supabase script tag in your HTML.');
    return null;
  }

  // Validate config
  if (!supabaseConfig || !supabaseConfig.url || !supabaseConfig.anonKey) {
    console.error('Supabase config not found. Make sure config.js exists and has valid url and anonKey.');
    return null;
  }

  try {
    supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
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

