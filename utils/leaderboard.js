// Leaderboard management using localStorage
export function saveScore(levelNumber, score, commands) {
  const key = `level${levelNumber}_leaderboard`;
  const leaderboard = getLeaderboard(levelNumber);
  
  // Add new score
  leaderboard.push({
    score,
    commands,
    date: new Date().toISOString()
  });
  
  // Sort by score (highest first) and keep top 10
  leaderboard.sort((a, b) => b.score - a.score);
  const topScores = leaderboard.slice(0, 10);
  
  localStorage.setItem(key, JSON.stringify(topScores));
  return topScores;
}

export function getLeaderboard(levelNumber) {
  const key = `level${levelNumber}_leaderboard`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function getBestScore(levelNumber) {
  const leaderboard = getLeaderboard(levelNumber);
  return leaderboard.length > 0 ? leaderboard[0].score : null;
}

// Cumulative score (run total) management
export function saveCumulativeScore(code, totalScore) {
  const key = 'cumulative_leaderboard';
  const leaderboard = getCumulativeLeaderboard();
  
  // Add new score
  leaderboard.push({
    code: code.toUpperCase(),
    score: totalScore,
    date: new Date().toISOString()
  });
  
  // Sort by score (highest first) and keep top 10
  leaderboard.sort((a, b) => b.score - a.score);
  const topScores = leaderboard.slice(0, 10);
  
  localStorage.setItem(key, JSON.stringify(topScores));
  return topScores;
}

export function getCumulativeLeaderboard() {
  const key = 'cumulative_leaderboard';
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Get current run total score from localStorage
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

