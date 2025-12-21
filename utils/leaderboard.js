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

