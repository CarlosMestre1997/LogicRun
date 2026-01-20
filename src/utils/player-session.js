// Player session management - handles registration and score tracking
import { getSupabaseClient, sendMagicLink, getCurrentUser, onAuthStateChange } from './supabase.js';

const SESSION_KEY = 'logicrun_player';
const PENDING_VERIFICATION_KEY = 'logicrun_pending_verification';
const LEVEL_SCORES_KEY = 'logicrun_level_scores';

/**
 * Get current player session from localStorage
 * @returns {{email: string, username: string, score: number, level: number, verified: boolean} | null}
 */
export function getPlayerSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Save player session to localStorage
 * @param {object} session - Player session data
 */
export function savePlayerSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear player session
 */
export function clearPlayerSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PENDING_VERIFICATION_KEY);
  localStorage.removeItem(LEVEL_SCORES_KEY);
  localStorage.removeItem('local_score');
  localStorage.removeItem('local_level');
}

/**
 * Check if player is registered (has email + username)
 * @returns {boolean}
 */
export function isPlayerRegistered() {
  const session = getPlayerSession();
  return session !== null && session.email && session.username;
}

/**
 * Sign in an existing verified player by email
 * Checks database for verified player and restores their session
 * @param {string} email - Player's email
 * @returns {Promise<{success: boolean, player?: object, error?: string}>}
 */
export async function signInExistingPlayer(email) {
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
    const session = {
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
    return { success: false, error: error.message };
  }
}

/**
 * Register a new player - sends magic link for email verification
 * @param {string} email - Player's email
 * @param {string} username - 3-character username
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function registerPlayer(email, username) {
  if (!email || !username) {
    return { success: false, error: 'Email and username are required' };
  }

  if (username.length !== 3 || !/^[A-Z0-9]{3}$/i.test(username)) {
    return { success: false, error: 'Username must be exactly 3 alphanumeric characters' };
  }

  // Check if username is already taken
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: existing } = await supabase
      .from('players')
      .select('username')
      .eq('username', username.toUpperCase())
      .single();

    if (existing) {
      return { success: false, error: 'Username already taken. Choose another.' };
    }
  }

  // Store pending registration
  localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify({
    email,
    username: username.toUpperCase(),
    timestamp: Date.now()
  }));

  // Send magic link
  const result = await sendMagicLink(email);
  
  if (!result.success) {
    return { success: false, error: result.error || 'Failed to send verification email' };
  }

  return { success: true };
}

/**
 * Complete registration after email verification
 * Called when user returns from magic link
 * @returns {Promise<{success: boolean, player?: object, error?: string}>}
 */
export async function completeRegistration() {
  const pending = localStorage.getItem(PENDING_VERIFICATION_KEY);
  if (!pending) {
    return { success: false, error: 'No pending registration found' };
  }

  const { email, username } = JSON.parse(pending);
  const { user } = await getCurrentUser();

  if (!user || user.email !== email) {
    return { success: false, error: 'Email verification failed' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get level scores and calculate total
    const levelScoresData = localStorage.getItem(LEVEL_SCORES_KEY);
    const levelScores = levelScoresData ? JSON.parse(levelScoresData) : {};
    const totalScore = Object.values(levelScores).reduce((sum, score) => sum + score, 0);
    const highestLevel = Object.keys(levelScores).length > 0 
      ? Math.max(...Object.keys(levelScores).map(Number)) 
      : 1;

    // Create or update player in database
    const { data, error } = await supabase
      .from('players')
      .upsert({
        email: email,
        username: username,
        user_id: user.id,
        score: totalScore,
        current_level: highestLevel,
        verified: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Save session locally
    const session = {
      email: data.email,
      username: data.username,
      score: data.score,
      level: data.current_level,
      verified: true,
      id: data.id
    };
    savePlayerSession(session);
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
    localStorage.removeItem('local_score');
    localStorage.removeItem('local_level');

    return { success: true, player: session };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get best scores per level from localStorage
 * @returns {Object.<number, number>} Map of level number to best score
 */
function getLevelScores() {
  const data = localStorage.getItem(LEVEL_SCORES_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * Save level scores to localStorage
 * @param {Object.<number, number>} scores - Map of level number to best score
 */
function saveLevelScores(scores) {
  localStorage.setItem(LEVEL_SCORES_KEY, JSON.stringify(scores));
}

/**
 * Calculate total score from best scores per level
 * @param {Object.<number, number>} levelScores - Map of level number to best score
 * @returns {number} Total score
 */
function calculateTotalScore(levelScores) {
  return Object.values(levelScores).reduce((sum, score) => sum + score, 0);
}

/**
 * Update player's score after completing a level
 * Only updates if the new score is better than previous best for that level
 * @param {number} levelScore - Score from the completed level
 * @param {number} levelNumber - Level that was completed
 * @returns {Promise<{success: boolean, newScore?: number, improved?: boolean, error?: string}>}
 */
export async function updatePlayerScore(levelScore, levelNumber) {
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
 * @param {function} callback - Called with leaderboard data on updates
 * @returns {function} Unsubscribe function
 */
export function subscribeToLeaderboard(callback) {
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
 * @returns {Promise<Array>}
 */
export async function fetchLeaderboard() {
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
 * @returns {boolean}
 */
export function hasPendingVerification() {
  return localStorage.getItem(PENDING_VERIFICATION_KEY) !== null;
}

/**
 * Get pending verification data
 * @returns {{email: string, username: string} | null}
 */
export function getPendingVerification() {
  const data = localStorage.getItem(PENDING_VERIFICATION_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Get local score (for unregistered players)
 * @returns {number}
 */
export function getLocalScore() {
  return parseInt(localStorage.getItem('local_score') || '0', 10);
}

/**
 * Clear local score
 */
export function clearLocalScore() {
  localStorage.removeItem('local_score');
  localStorage.removeItem('local_level');
}
