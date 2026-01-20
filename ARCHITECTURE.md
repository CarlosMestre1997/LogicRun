# Logic Run – Developer Architecture Guide

> A browser-based educational game teaching programming concepts through visual puzzles.

## 🏗️ Project Structure

```
startie/
├── src/
│   ├── main.js              # Entry point for play.html
│   ├── engine/              # Game logic core
│   │   ├── index.js         # Engine factory & exports
│   │   ├── commands.js      # Command parser (move, jump, spin, while)
│   │   ├── executor.js      # Command execution & state machine
│   │   ├── rules.js         # Scoring & win condition logic
│   │   └── state.js         # Game state factory
│   ├── levels/              # Level definitions
│   │   ├── index.js         # Level registry & lookup functions
│   │   ├── levels-data.js   # All level configurations (consolidated)
│   │   └── helpers.js       # Goal utility functions
│   ├── render/              # Canvas rendering
│   │   ├── index.js         # Render orchestration
│   │   ├── grid.js          # Isometric grid & tiles
│   │   ├── startie.js       # Character sprite rendering
│   │   └── animations.js    # Celebration & ghost effects
│   ├── ui/                  # User interface modules
│   │   ├── terminal.js      # Code input handling
│   │   ├── mobile-commands.js # Mobile command buttons
│   │   ├── modals.js        # Password & intro dialogs
│   │   └── navigation.js    # Level navigation buttons
│   └── utils/               # Utilities & services
│       ├── assets.js        # Asset path resolution
│       ├── sounds.js        # Audio management
│       ├── supabase.js      # Supabase client + authentication
│       └── player-session.js # Player registration, sign-in & real-time leaderboard
├── styles/                  # Modular CSS
│   ├── base.css             # Variables & reset
│   ├── banner.css           # Header banner
│   ├── game.css             # Game container & canvas
│   ├── highscores.css       # Leaderboard panel
│   ├── landing.css          # Landing page styles
│   ├── mobile.css           # Mobile responsive styles
│   ├── modal.css            # Modal dialogs
│   ├── navigation.css       # Nav buttons
│   ├── terminal.css         # Terminal input
│   └── ui.css               # UI panel
├── tests/                   # Unit tests
│   ├── commands.test.js     # Command parser tests
│   └── rules.test.js        # Game rules tests
├── assets/
│   └── sounds/              # Audio files
├── index.html               # Landing page
├── play.html                # Game page (all levels)
├── highscores.html          # Leaderboard page
├── style.css                # CSS imports (modular)
├── tsconfig.json            # TypeScript configuration
├── vite.config.js           # Vite bundler configuration
├── package.json             # Dependencies & scripts
├── vercel.json              # Deployment configuration
└── .env                     # Environment variables (not committed)
```

---

## 🎮 Core Concepts

### Level Data Structure

Each level is a JavaScript object with the following shape:

```javascript
export const level1 = {
  tiles: [                    // 2D array of tile heights (0 = void, 1+ = ground)
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  start: { x: 0, y: 0, z: 1, facing: 'E' },  // Starting position & direction
  goals: [{ x: 2, y: 0, z: 1 }],             // Win condition positions (array)
  laptop: null,               // Optional: { x, y, z } for hackable laptop
  maxCommands: 3,             // Maximum commands allowed
};
```

**Important:** The `goals` property is always an array, even for single goals.

### Level Registry

Levels are registered in [src/levels/index.js](src/levels/index.js):

```javascript
export const levels = {
  1: { 
    data: level1,           // Level data object
    password: 'MVE',        // Level access code
    next: 2,                // Next level number (null if final)
    prev: null,             // Previous level number (null if first)
    name: 'Move',           // Display name
    description: 'Learn to move',
    hints: ['move()', 'move()', 'move()']  // Starter code hints
  },
  // ...
};
```

### URL Routing

The game uses URL parameters to load levels:
- `/play.html?password=MVE` – Load by password (primary method)
- `/play.html?level=1` – Load by level number (fallback)

### Game State

The engine maintains immutable state transitions:

```javascript
{
  x, y, z,           // Position on grid
  facing,            // Direction: 'N', 'E', 'S', 'W'
  status,            // 'playing', 'won', 'lost'
  dead,              // Boolean death state
  hacking,           // Boolean laptop collected state
  goalsVisited,      // Set of visited goal coordinates
  ghostVisible,      // Animation state
  ghostY,            // Ghost vertical position
}
```

### Command Parser

Commands are parsed from terminal input:

| Command | Syntax | Description |
|---------|--------|-------------|
| Move | `move()` | Move forward one tile |
| Jump | `jump()` | Jump forward (can clear gaps/walls) |
| Spin | `spin(l)` or `spin(r)` | Rotate left or right |
| Loop | `while(hacking) { ... }` | Repeat until all goals visited |

---

## 🛠️ Development Workflow

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your Supabase credentials to .env
```

### Development Server

```bash
npm run dev
# Opens at http://localhost:3000
```

### Production Build

```bash
npm run build
# Output in dist/
```

### Deployment

The project deploys automatically to Vercel on push to main branch.

---

## 📁 Module Reference

### Engine (`src/engine/`)

| File | Purpose |
|------|---------|
| [index.js](src/engine/index.js) | Creates engine instance, exports score utilities |
| [commands.js](src/engine/commands.js) | Parses terminal text into command objects |
| [executor.js](src/engine/executor.js) | Executes commands, handles state transitions |
| [rules.js](src/engine/rules.js) | Win condition, scoring algorithm |
| [state.js](src/engine/state.js) | Creates initial game state from level |

### Render (`src/render/`)

| File | Purpose |
|------|---------|
| [index.js](src/render/index.js) | Orchestrates rendering, asset loading |
| [grid.js](src/render/grid.js) | Isometric tile rendering, grid calculations |
| [startie.js](src/render/startie.js) | Character sprite drawing |
| [animations.js](src/render/animations.js) | Celebration, ghost effects |

### UI (`src/ui/`)

| File | Purpose |
|------|---------|
| [terminal.js](src/ui/terminal.js) | Terminal input formatting & events |
| [mobile-commands.js](src/ui/mobile-commands.js) | Touch-friendly command buttons |
| [modals.js](src/ui/modals.js) | Password entry, intro overlays |
| [navigation.js](src/ui/navigation.js) | Level navigation buttons |

### Utils (`src/utils/`)

| File | Purpose |
|------|---------|
| [assets.js](src/utils/assets.js) | Asset URL resolution for Vite |
| [sounds.js](src/utils/sounds.js) | Audio playback, preferences |
| [supabase.js](src/utils/supabase.js) | Supabase client, authentication, magic links |
| [player-session.js](src/utils/player-session.js) | Player registration, score tracking, real-time leaderboard |

---

## 🎯 Adding a New Level

1. **Create level file** `src/levels/level11.js`:
   ```javascript
   export const level11 = {
     tiles: [
       [1, 1, 1],
       [0, 0, 1],
       [1, 1, 1],
     ],
     start: { x: 0, y: 0, z: 1, facing: 'E' },
     goals: [{ x: 2, y: 2, z: 1 }],
     maxCommands: 6,
   };
   ```

2. **Register in** [src/levels/index.js](src/levels/index.js):
   ```javascript
   import { level11 } from './level11.js';
   
   export const levels = {
     // ... existing levels
     10: { data: level10, password: 'FIN', next: 11, prev: 9, ... },
     11: { data: level11, password: 'NEW', next: null, prev: 10, 
           name: 'New Level', description: 'Your description',
           hints: ['move()', 'spin(r)'] },
   };
   ```

3. **Test** at `/play.html?level=11` or `/play.html?password=NEW`

---

## 🔧 Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

### Vite Configuration

[vite.config.js](vite.config.js) handles multi-page setup:
- `index.html` – Landing page
- `play.html` – Game page
- `highscores.html` – Leaderboard

---

## 🧪 Testing Checklist

When making changes, verify:

- [ ] All 10 levels load correctly via URL params
- [ ] Password lookup works (case-insensitive)
- [ ] Terminal commands parse correctly
- [ ] Character animations are smooth
- [ ] Sound toggle persists across page loads
- [ ] Leaderboard updates after level completion
- [ ] Mobile controls function properly
- [ ] Previous/Next navigation works

---

## 📊 Scoring & Leaderboard

### Score Calculation

```
Score = 100 + (maxCommands - actualCommands) × 10
```

- Base score: 100 points per level
- Bonus: 10 points per command under the limit
- Minimum: 100 points

### Best Score Tracking

The system tracks the **best score per level**:
- Replaying a level only updates if you beat your previous best
- Total score = sum of best scores across all levels
- Scores persist across sessions (stored in localStorage and synced to database)

### Player Registration

1. After completing Level 1, players register with email + 3-char username
2. Magic link sent for email verification
3. Verified players appear on the real-time leaderboard
4. Returning players can sign in with just their email (no magic link needed)
5. Top 20 verified players displayed

---

## 🚧 Known Limitations

1. **TypeScript ready** – tsconfig.json configured, migration pending
2. **Modular CSS** – Split into 9 files in styles/
3. **Unit tests** – Vitest configured with 29 passing tests
4. **Canvas-only** – No DOM-based fallback for accessibility

---

## 📞 Quick Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Useful URLs:**
- Dev: `http://localhost:3000`
- Level 1: `/play.html?password=MVE`
- Level by password: `/play.html?password=JMP`
- Highscores: `/highscores.html`
