// Main game initialization for play page
import { createEngine, calculateScore, countCommands } from './engine/index.js';
import { drawLevel, initRenderer } from './render/index.js';
import { levels, getLevelByPassword, getLevelByNumber } from './levels/index.js';
import { initSounds, loadSoundPreference, toggleSound, isSoundEnabled, playBackgroundMusic, saveMusicPosition } from './utils/sounds.js';
import { initTerminal, getTerminalCommands } from './ui/terminal.js';
import { initMobileCommands } from './ui/mobile-commands.js';
import { createPasswordModal, createIntroModal, createRegistrationModal, createVerificationSuccessModal } from './ui/modals.js';
import { initNavigation, navigateToNextLevel } from './ui/navigation.js';
import { initSupabase, getCurrentUser } from './utils/supabase.js';
import { 
  isPlayerRegistered, 
  getPlayerSession, 
  registerPlayer, 
  updatePlayerScore, 
  completeRegistration,
  hasPendingVerification,
  subscribeToLeaderboard
} from './utils/player-session.js';
import { animateCelebration } from './render/animations.js';

// Get level from URL: /play.html?level=1 or /play.html?password=JMP
function getCurrentLevel() {
  const params = new URLSearchParams(window.location.search);
  
  const levelNum = params.get('level');
  if (levelNum) {
    return getLevelByNumber(parseInt(levelNum, 10));
  }
  
  const password = params.get('password');
  if (password) {
    return getLevelByPassword(password);
  }
  
  // Default to level 1
  return getLevelByNumber(1);
}

async function initGame() {
  const levelInfo = getCurrentLevel();
  if (!levelInfo) {
    window.location.href = '/index.html';
    return;
  }
  
  const level = levelInfo.data;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const engine = createEngine(level);
  const status = document.getElementById('status');
  const scoreDisplay = document.getElementById('score');
  const terminal = document.getElementById('terminal');
  
  // Update UI with level info
  document.getElementById('level-title').textContent = `Level ${levelInfo.number}`;
  document.getElementById('level-password').textContent = `pass: ${levelInfo.password}`;
  document.title = `Startie – Level ${levelInfo.number}`;
  
  // Initialize systems
  loadSoundPreference();
  initSounds();
  initTerminal(terminal);
  
  // Set starter hints in terminal
  if (levelInfo.hints && levelInfo.hints.length > 0) {
    terminal.value = levelInfo.hints.map(cmd => `> ${cmd}`).join('\n');
  }
  
  // Initialize mobile commands if on mobile
  const mobileCommands = initMobileCommands(terminal, updateScore);
  
  // Initialize modals
  const passwordModal = createPasswordModal(levels);
  createIntroModal(levelInfo.number);
  
  // Create registration modal (shown after level 1 completion)
  const registrationModal = createRegistrationModal(registerPlayer);
  
  // Navigation
  initNavigation(levelInfo);
  
  document.getElementById('password-btn')?.addEventListener('click', () => passwordModal.show());
  document.getElementById('mobile-password-btn')?.addEventListener('click', () => passwordModal.show());
  
  // Initialize Supabase
  initSupabase();
  
  // Check if returning from email verification
  async function checkVerification() {
    if (hasPendingVerification()) {
      const { user } = await getCurrentUser();
      if (user) {
        const result = await completeRegistration();
        if (result.success) {
          createVerificationSuccessModal(result.player.username);
        }
      }
    }
  }
  checkVerification();
  
  // Initialize highscores panel with real-time updates
  let unsubscribeLeaderboard = null;
  
  function updateHighscoresPanel(leaderboard) {
    const highscoresList = document.getElementById('highscores-list');
    if (!highscoresList) return;
    
    highscoresList.innerHTML = '';
    
    if (!leaderboard || leaderboard.length === 0) {
      highscoresList.innerHTML = '<div style="color: #888; font-size: 0.8rem; text-align: center; padding: 1rem;">No scores yet</div>';
      return;
    }
    
    // Get current player to highlight their entry
    const session = getPlayerSession();
    
    leaderboard.forEach((entry, index) => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'highscore-entry';
      const isCurrentPlayer = session && entry.username === session.username;
      entryDiv.innerHTML = `
        <span class="highscore-rank" style="color: ${index < 3 ? 'var(--pink)' : '#888'}; margin-right: 8px;">#${index + 1}</span>
        <span class="highscore-code" style="${isCurrentPlayer ? 'color: var(--pink); font-weight: bold;' : ''}">${entry.username}</span>
        <span class="highscore-score">${entry.score.toLocaleString()}</span>
      `;
      highscoresList.appendChild(entryDiv);
    });
  }
  
  // Subscribe to real-time leaderboard updates
  unsubscribeLeaderboard = subscribeToLeaderboard(updateHighscoresPanel);
  
  // Start background music automatically when level 1 loads
  if (levelInfo.number === 1) {
    playBackgroundMusic(true);
  } else {
    playBackgroundMusic(false);
  }
  
  // Sound toggle button
  const soundToggle = document.getElementById('sound-toggle');
  function updateSoundButton() {
    soundToggle.textContent = isSoundEnabled() ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !isSoundEnabled());
  }
  updateSoundButton();
  
  soundToggle.onclick = () => {
    toggleSound();
    updateSoundButton();
  };
  
  // Real-time score calculation
  function updateScore() {
    const commandText = mobileCommands ? mobileCommands.getCommands() : getTerminalCommands(terminal);
    const lines = commandText.trim().split('\n').filter(l => l);
    
    if (lines.length === 0) {
      scoreDisplay.textContent = 'SCORE: 1000';
      return;
    }
    
    const result = engine.parse(commandText);
    if (result.error || !result.actions) {
      scoreDisplay.textContent = 'SCORE: 1000';
      return;
    }
    
    const commandCount = countCommands(result.actions);
    const score = calculateScore(commandCount);
    scoreDisplay.textContent = `SCORE: ${score}`;
  }
  
  terminal.addEventListener('input', updateScore);
  updateScore();
  
  // Initialize game state
  engine.state.x = level.start.x;
  engine.state.y = level.start.y;
  engine.state.z = 0;
  engine.state.facing = 'SE';
  
  // Initialize renderer
  initRenderer(() => {
    drawLevel(ctx, level, engine.state);
  }, level);
  drawLevel(ctx, level, engine.state);
  
  // Run button
  const runButton = document.getElementById('run');
  runButton.onclick = () => {
    status.textContent = '';
    
    const commandText = mobileCommands ? mobileCommands.getCommands() : getTerminalCommands(terminal);
    
    if (!commandText.trim()) {
      status.textContent = 'No commands to execute';
      return;
    }
    
    const result = engine.parse(commandText);
    if (result.error) {
      status.textContent = result.error;
      return;
    }

    if (!result.actions || result.actions.length === 0) {
      status.textContent = 'No commands to execute';
      return;
    }

    engine.execute(result.actions, s => drawLevel(ctx, level, s), s => {
      if (s.failed) {
        status.textContent = 'Game Over — Try Again';
      } else {
        // Check win condition
        const isAtGoal = level.goals.some(g => s.x === g.x && s.y === g.y);
        
        // For multi-goal levels, check if all goals are visited
        const hasCompletedLevel = level.goals.length === 1 
          ? isAtGoal
          : s.visitedGoals.size >= level.goals.length;
        
        if (hasCompletedLevel) {
          const commandCount = countCommands(result.actions);
          const score = calculateScore(commandCount);
          scoreDisplay.textContent = `SCORE: ${score}`;
          
          // Update player score in database
          updatePlayerScore(score, levelInfo.number);
          
          status.textContent = '✓ Level Complete';
          animateCelebration(s, (state) => drawLevel(ctx, level, state), 1500);
          
          // After level 1, show registration modal if not registered
          if (levelInfo.number === 1 && !isPlayerRegistered()) {
            setTimeout(() => {
              registrationModal.show();
              // Add listener to continue after modal closes
              const modal = document.getElementById('registration-modal');
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.attributeName === 'style' && modal.style.display === 'none') {
                    observer.disconnect();
                    setTimeout(() => navigateToNextLevel(levelInfo), 500);
                  }
                });
              });
              observer.observe(modal, { attributes: true });
            }, 1800);
          } else {
            setTimeout(() => {
              navigateToNextLevel(levelInfo);
            }, 2000);
          }
        } else {
          status.textContent = 'Try again';
        }
      }
    });
  };
  
  // Save music position before page unload
  window.addEventListener('beforeunload', () => {
    saveMusicPosition();
    // Cleanup leaderboard subscription
    if (unsubscribeLeaderboard) {
      unsubscribeLeaderboard();
    }
  });
}

// Start the game
initGame();
