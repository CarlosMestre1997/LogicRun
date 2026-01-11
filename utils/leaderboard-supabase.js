// Leaderboard management using Supabase
// This is the Supabase version - use this instead of leaderboard.js once Supabase is set up

import { getSupabaseClient } from './supabase.js';

// Cumulative score (run total) management with Supabase
export async function saveCumulativeScore(code, totalScore) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client not available, falling back to localStorage');
    // Fallback to localStorage if Supabase is not available
    return saveCumulativeScoreLocal(code, totalScore);
  }

  try {
    // Insert the new score
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        {
          code: code.toUpperCase(),
          score: totalScore
        }
      ])
      .select();

    if (error) {
      console.error('Error saving score to Supabase:', error);
      // Fallback to localStorage
      return saveCumulativeScoreLocal(code, totalScore);
    }

    // Return the updated leaderboard
    return await getCumulativeLeaderboard();
  } catch (error) {
    console.error('Error saving score:', error);
    // Fallback to localStorage
    return saveCumulativeScoreLocal(code, totalScore);
  }
}

export async function getCumulativeLeaderboard() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client not available, falling back to localStorage');
    return getCumulativeLeaderboardLocal();
  }

  try {
    // Fetch top 10 scores, ordered by score descending
    const { data, error } = await supabase
      .from('leaderboard')
      .select('code, score, created_at')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard from Supabase:', error);
      // Fallback to localStorage
      return getCumulativeLeaderboardLocal();
    }

    // Transform the data to match the expected format
    return (data || []).map(entry => ({
      code: entry.code,
      score: entry.score,
      date: entry.created_at
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    // Fallback to localStorage
    return getCumulativeLeaderboardLocal();
  }
}

// Local storage fallback functions
function saveCumulativeScoreLocal(code, totalScore) {
  const key = 'cumulative_leaderboard';
  const leaderboard = getCumulativeLeaderboardLocal();
  
  leaderboard.push({
    code: code.toUpperCase(),
    score: totalScore,
    date: new Date().toISOString()
  });
  
  leaderboard.sort((a, b) => b.score - a.score);
  const topScores = leaderboard.slice(0, 10);
  
  localStorage.setItem(key, JSON.stringify(topScores));
  return topScores;
}

function getCumulativeLeaderboardLocal() {
  const key = 'cumulative_leaderboard';
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Get current run total score from localStorage (this stays local)
export function getCurrentRunTotal() {
  const data = localStorage.getItem('current_run_total');
  return data ? parseInt(data, 10) : 0;
}

// Set current run total score
export function setCurrentRunTotal(score) {
  localStorage.setItem('current_run_total', score.toString());
}

// Add to current run total
export function addToRunTotal(score) {
  const current = getCurrentRunTotal();
  setCurrentRunTotal(current + score);
}

// Reset current run total
export function resetRunTotal() {
  localStorage.removeItem('current_run_total');
}

