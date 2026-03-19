# CLAUDE.md — Communal Jar of Laughter

## Project Overview

**Communal Jar of Laughter** is a multiplayer, real-time web art experience created by Yiwei Huang during the 2021 pandemic. Users laugh into their microphone (or click/tap) to drop animated emoji-like shapes into a shared physics simulation that all connected users see simultaneously.

- **Live URL**: https://communal-jar-of-laughter22.glitch.me/
- **Hosting**: Glitch
- **Purpose**: Interactive art / social experience — not a traditional software product

---

## Architecture

```
communal-jar-of-laughter/
├── server.js              # Node.js/Express + Socket.IO server
├── package.json           # Dependencies and start script
├── p5-dependencies.js     # Duplicate of package.json (unused artifact)
├── shrinkwrap.yaml        # Glitch-specific lockfile (do not modify)
├── public/                # Static files served by Express
│   ├── index.html         # Entry point; loads all scripts via CDN + local files
│   ├── sketch.js          # Main p5.js sketch — ML model, physics, Socket.IO client
│   ├── circle.js          # Circle class (laughing face shape)
│   ├── poke.js            # Poke class (pointing finger shape)
│   ├── boundary.js        # Boundary class (invisible physics walls)
│   ├── matter.min.js      # Bundled Matter.js (local copy)
│   └── style.css          # Minimal global styles
└── demopic1.png           # Demo screenshot used in README
```

### Data Flow

1. **ML model** (ml5.js + Teachable Machine) continuously listens to the microphone via `classifier.classify(gotResult)` in `sketch.js`.
2. When `label === "Laughing"`, `dropCircle()` fires each animation frame, spawning a `Circle` object and emitting a `trigger` event to the server.
3. Mouse clicks / touch events call `dropPoke()`, spawning a `Poke` object and emitting a `trigger` event.
4. **Server** (`server.js`) receives `trigger` events and broadcasts them to all other connected sockets.
5. Remote clients receive the `trigger` event and call `dropFriendCircle(data)`, spawning the corresponding shape.
6. All shapes are governed by **Matter.js** physics (gravity, bounce, friction) and rendered by **p5.js** in `draw()`.

---

## Key Technologies

| Technology | Version | Role |
|---|---|---|
| Node.js | 12.x | Server runtime |
| Express | ^4.17.1 | Static file server |
| Socket.IO | ^4.0.1 | Real-time bidirectional events |
| p5.js | 1.1.9 (CDN) | Canvas drawing / animation loop |
| Matter.js | bundled locally | 2D rigid-body physics |
| ml5.js | latest (CDN) | Sound classification wrapper |
| Teachable Machine | hosted model | Custom laughter vs. ambient sound model |

---

## Server (`server.js`)

- Serves `public/` as static files via `express.static`.
- Tracks `online` (current count) and `sequence` (monotonically increasing user index).
- On new connection:
  - Emits `onlineNum` (current count) to all sockets.
  - Emits `indexNum` (unique sequence number) to the new socket — used to assign a consistent color to each user.
- On `trigger` message: broadcasts `data` to all *other* sockets (not the sender).
- On disconnect: decrements `online` and re-broadcasts `onlineNum`.

**Socket events (server-side):**

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `connection` | server ← client | — | New user joined |
| `disconnect` | server ← client | — | User left |
| `trigger` | server ← client | `{ index, mode }` | User laughed or poked |
| `onlineNum` | server → all | `number` | Updated online count |
| `indexNum` | server → new client | `number` | Assign user color index |
| `trigger` | server → others | `{ index, mode }` | Broadcast laugh/poke to peers |

---

## Client (`public/sketch.js`)

### Global State

| Variable | Purpose |
|---|---|
| `classifier` | ml5 sound classifier instance |
| `label` | Current ML prediction label ("listening...", "Laughing", etc.) |
| `eventLabel` | The label that triggers a drop — currently `"Laughing"` |
| `socket` | Socket.IO client connection |
| `index` | This user's color index (assigned by server) |
| `onlineNumber` | Current online user count (for UI display) |
| `circles` | Array of all active `Circle` / `Poke` physics objects |
| `grounds` | Array of `Boundary` objects forming the invisible container |
| `engine` / `world` | Matter.js engine and world |
| `sizes` | Array of possible radii (scaled to viewport) |
| `colorStrings` | 7 fixed hex color strings for user differentiation |
| `backgroundColors` | `[black, orange, light-blue]` — changes with state |

### p5.js Lifecycle

- **`preload()`** — loads the Teachable Machine sound model from CDN.
- **`setup()`** — creates canvas, starts ML classification, connects Socket.IO, creates Matter.js engine and boundary walls.
- **`draw()`** — called every frame: runs `eventCounter()`, sets background based on ML label, draws text overlays, steps physics engine, renders all shapes.

### Shape Classes

All three classes follow the same pattern: constructor creates a Matter.js body and adds it to the world; `show()` renders it using p5.js drawing primitives at the body's current position/angle.

- **`Circle`** (`circle.js`) — Smiley face: colored ellipse with two eyes and a smile arc.
- **`Poke`** (`poke.js`) — Pointing hand: colored arc (palm) with four rectangles and ellipses (fingers).
- **`Boundary`** (`boundary.js`) — Invisible static rectangle used as floor and side walls. Physics `isStatic: true`.

---

## Development Workflow

### Running Locally

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

The app requires microphone access. On first load, the browser will prompt for permission.

### Deploying to Glitch

The project is designed for Glitch hosting. Push to `main`/`master` or edit directly in the Glitch editor — Glitch auto-restarts the server on file changes.

### No Build Step

There is no bundler, transpiler, or test suite. All client JS is loaded directly in `index.html`. Changes to `public/` take effect immediately on reload.

---

## Conventions and Patterns

- **No modules on the client** — all client-side classes (`Circle`, `Poke`, `Boundary`) are global and loaded via `<script>` tags in order. `sketch.js` must be loaded last.
- **Matter.js aliasing** — at the top of `sketch.js`, Matter.js namespaces are aliased to globals (`Engine`, `World`, `Bodies`, etc.). Always use these aliases, not `Matter.Engine` etc.
- **Responsive sizing** — `module` is computed from viewport dimensions; `sizes` array derives from it. Always use `window.innerWidth` / `window.innerHeight` for layout math.
- **Color assignment by index** — `colorStrings[index % colorStrings.length]` maps each user's sequence number to a color. Remote shapes use `data.index` for the same lookup.
- **`sketch.js copy`** — this file is a stale backup copy and should be ignored; do not edit it.
- **`p5-dependencies.js`** — this is a leftover artifact (identical to `package.json` in content) and is not loaded anywhere; do not edit it.

---

## Known Issues / Quirks

- `draw()` logs `label` to console every frame — can be noisy in dev tools.
- The `isFriend` background branch in `draw()` is unreachable because the `label !== eventLabel` branch above it always catches non-laughing states first.
- `shrinkwrap.yaml` is Glitch-specific; do not replace it with a standard `npm-shrinkwrap.json`.
- The Teachable Machine model URL is hardcoded in `sketch.js` (`soundModel`). Changing the model requires updating that URL.
- Node.js engine is pinned to `12.x` (EOL) for Glitch compatibility — do not upgrade without testing on Glitch.
