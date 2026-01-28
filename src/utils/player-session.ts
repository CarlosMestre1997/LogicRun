// Player session management - handles registration and score tracking
import type { PlayerSession, PendingVerification, ScoreUpdateResult, RegistrationResult, LeaderboardEntry } from '../types';
import { getSupabaseClient } from './supabase';

const SESSION_KEY = 'logicrun_player';
const PENDING_VERIFICATION_KEY = 'logicrun_pending_verification';
const LEVEL_SCORES_KEY = 'logicrun_level_scores';

/**
 * Get current player session from localStorage
 */
export function getPlayerSession(): PlayerSession | null {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Save player session to localStorage
 */
export function savePlayerSession(session: PlayerSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear player session
 */
export function clearPlayerSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PENDING_VERIFICATION_KEY);
  localStorage.removeItem(LEVEL_SCORES_KEY);
  localStorage.removeItem('local_score');
  localStorage.removeItem('local_level');
}

/**
 * Check if player is registered (has email + username)
 */
export function isPlayerRegistered(): boolean {
  const session = getPlayerSession();
  return session !== null && !!session.email && !!session.username;
}

/**
 * Sign in an existing verified player by email
 * Checks database for verified player and restores their session
 */
export async function signInExistingPlayer(email: string): Promise<{ success: boolean; player?: PlayerSession; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Check if verified player exists with this email
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verified', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'No verified account found with this email' };
    }

    // Restore session locally
    const session: PlayerSession = {
      email: data.email,
      username: data.username,
      score: data.score,
      level: data.current_level,
      verified: true,
      id: data.id
    };
    savePlayerSession(session);
    
    // Clear any stale level scores from localStorage to avoid conflicts
    localStorage.removeItem(LEVEL_SCORES_KEY);

    return { success: true, player: session };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Register a new player - saves directly to database (no verification required)
 */
export async function registerPlayer(email: string, username: string): Promise<RegistrationResult> {
  if (!email || !username) {
    return { success: false, error: 'Email and username are required' };
  }

  if (username.length !== 3 || !/^[A-Z0-9]{3}$/i.test(username)) {
    return { success: false, error: 'Username must be exactly 3 alphanumeric characters' };
  }

  const supabase = getSupabaseClient();
  
  if (supabase) {
    // Check if username is already taken by a different email
    const { data: existingUsername } = await supabase
      .from('players')
      .select('username, email')
      .eq('username', username.toUpperCase())
      .single();

    if (existingUsername && existingUsername.email !== email.toLowerCase()) {
      return { success: false, error: 'Username already taken. Choose another.' };
    }

    // Check if email already exists (returning player)
    const { data: existingEmail } = await supabase
      .from('players')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      // Returning player - restore their session
      const session: PlayerSession = {
        email: existingEmail.email,
        username: existingEmail.username,
        score: existingEmail.score,
        level: existingEmail.current_level,
        verified: true,
        id: existingEmail.id
      };
      savePlayerSession(session);
      return { success: true, player: session };
    }
  }

  // Get any local scores to include
  const levelScoresData = localStorage.getItem(LEVEL_SCORES_KEY);
  const levelScores: Record<string, number> = levelScoresData ? JSON.parse(levelScoresData) : {};
  const totalScore = Object.values(levelScores).reduce((sum, score) => sum + score, 0);
  const highestLevel = Object.keys(levelScores).length > 0 
    ? Math.max(...Object.keys(levelScores).map(Number)) 
    : 1;

  if (supabase) {
    try {
      // Create new player in database
      const { data, error } = await supabase
        .from('players')
        .insert({
          email: email.toLowerCase(),
          username: username.toUpperCase(),
          score: totalScore,
          current_level: highestLevel,
          verified: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Save session locally
      const session: PlayerSession = {
        email: data.email,
        username: data.username,
        score: data.score,
        level: data.current_level,
        verified: true,
        id: data.id
      };
      savePlayerSession(session);

      return { success: true, player: session };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Offline mode - save locally only
  const session: PlayerSession = {
    email: email.toLowerCase(),
    username: username.toUpperCase(),
    score: totalScore,
    level: highestLevel,
    verified: true
  };
  savePlayerSession(session);

  return { success: true, player: session };
}

/**
 * Get best scores per level from localStorage
 */
function getLevelScores(): Record<number, number> {
  const data = localStorage.getItem(LEVEL_SCORES_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * Save level scores to localStorage
 */
function saveLevelScores(scores: Record<number, number>): void {
  localStorage.setItem(LEVEL_SCORES_KEY, JSON.stringify(scores));
}

/**
 * Calculate total score from best scores per level
 */
function calculateTotalScore(levelScores: Record<number, number>): number {
  return Object.values(levelScores).reduce((sum, score) => sum + score, 0);
}

/**
 * Update player's score after completing a level
 * Only updates if the new score is better than previous best for that level
 */
export async function updatePlayerScore(levelScore: number, levelNumber: number): Promise<ScoreUpdateResult> {
  // Get current best scores per level from localStorage
  const levelScores = getLevelScores();
  const previousBest = levelScores[levelNumber] || 0;
  
  // Check if this is an improvement for this level
  if (levelScore <= previousBest) {
    // No improvement, return current total
    const session = getPlayerSession();
    const currentTotal = session ? session.score : calculateTotalScore(levelScores);
    return { 
      success: true, 
      newScore: currentTotal, 
      improved: false 
    };
  }
  
  // Update best score for this level in localStorage
  levelScores[levelNumber] = levelScore;
  saveLevelScores(levelScores);
  
  // Calculate total from localStorage level scores
  const localTotalScore = calculateTotalScore(levelScores);
  
  const session = getPlayerSession();
  if (!session) {
    // Player not registered, store locally for now
    localStorage.setItem('local_score', localTotalScore.toString());
    localStorage.setItem('local_level', levelNumber.toString());
    return { success: true, newScore: localTotalScore, improved: true };
  }

  // For registered players, use the HIGHER of:
  // - Their current database score
  // - Their localStorage total (sum of best per level)
  // This ensures score never goes down and properly handles returning players
  const newTotalScore = Math.max(session.score || 0, localTotalScore);

  const supabase = getSupabaseClient();
  if (!supabase) {
    // Offline mode - update local session
    session.score = newTotalScore;
    session.level = Math.max(session.level || 1, levelNumber);
    savePlayerSession(session);
    return { success: true, newScore: newTotalScore, improved: true };
  }

  try {
    // Update player in database with new total score
    const { data, error } = await supabase
      .from('players')
      .update({
        score: newTotalScore,
        current_level: Math.max(session.level || 1, levelNumber),
        updated_at: new Date().toISOString()
      })
      .eq('email', session.email)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      // Fallback to local update
      session.score = newTotalScore;
      session.level = Math.max(session.level || 1, levelNumber);
      savePlayerSession(session);
      return { success: true, newScore: newTotalScore, improved: true };
    }

    // Update local session
    session.score = data.score;
    session.level = data.current_level;
    savePlayerSession(session);

    return { success: true, newScore: data.score, improved: true };
  } catch (error) {
    console.error('Error updating score:', error);
    session.score = newTotalScore;
    session.level = Math.max(session.level || 1, levelNumber);
    savePlayerSession(session);
    return { success: true, newScore: newTotalScore, improved: true };
  }
}

/**
 * Get the live leaderboard with real-time updates
 */
export function subscribeToLeaderboard(callback: (leaderboard: LeaderboardEntry[]) => void): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Return empty leaderboard for offline mode
    callback([]);
    return () => {};
  }

  // Initial fetch
  fetchLeaderboard().then(callback);

  // Subscribe to real-time changes
  const channel = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players'
      },
      () => {
        // Refetch leaderboard on any change
        fetchLeaderboard().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch current leaderboard
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('players')
      .select('username, score, current_level, updated_at')
      .eq('verified', true)
      .gt('score', 0)
      .order('score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Check if there's a pending verification to complete
 */
export function hasPendingVerification(): boolean {
  return localStorage.getItem(PENDING_VERIFICATION_KEY) !== null;
}

/**
 * Get pending verification data
 */
export function getPendingVerification(): PendingVerification | null {
  const data = localStorage.getItem(PENDING_VERIFICATION_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Get local score (for unregistered players)
 */
export function getLocalScore(): number {
  return parseInt(localStorage.getItem('local_score') || '0', 10);
}

/**
 * Clear local score
 */
export function clearLocalScore(): void {
  localStorage.removeItem('local_score');
  localStorage.removeItem('local_level');
}
