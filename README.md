# Tic-Tac-Toe

A polished, responsive Tic-Tac-Toe game that runs directly in a modern browser. It uses only HTML, CSS, and vanilla JavaScript, with no backend, build step, external dependency, or account required.

## Features

- Human vs Human mode with clear turn and win/draw states.
- Human vs AI mode where the human plays X and starts first.
- Easy AI chooses a legal move at random.
- Medium AI wins when possible, blocks immediate threats, and otherwise favors the center and corners.
- Hard AI uses Minimax and cannot lose against correct play.
- Winning cells are highlighted, scores persist across rounds, and Reset Scores asks for confirmation.
- Responsive layout, keyboard-friendly controls, visible focus states, semantic buttons, and live status announcements.

## Project structure

```text
index.html   Page structure and accessible game controls
style.css    Responsive visual design and board states
script.js    Game state, rules, scorekeeping, and AI logic
README.md    This guide
```

## Run locally

No installation is needed. Open `index.html` in a modern browser, or serve the folder with any simple static server. For example:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## How to play

Choose Two players or Vs. computer. Select a difficulty when playing against the computer. Select an empty square to place your mark. X always goes first. Use New round to clear the board while keeping scores, or Reset scores to clear the scoreboard after confirmation.

## How the AI works

Easy selects a random empty square. Medium first checks every legal move for an immediate win, then checks whether it must block X, followed by a simple center/corner preference.

Hard uses the Minimax algorithm. It simulates every possible continuation of the current board, gives O wins a positive score, X wins a negative score, and draws zero, then chooses the move with the best guaranteed outcome. Search depth rewards quick wins and delays losses.

## Manual testing checklist

- [ ] X wins horizontally, O wins vertically, and both diagonal wins are detected.
- [ ] A full board with no winner becomes a draw.
- [ ] Occupied cells and cells after a finished round cannot be selected.
- [ ] Each completed round increments exactly one score.
- [ ] New round preserves scores; Reset scores clears them after confirmation.
- [ ] Easy makes only legal moves; Medium wins and blocks immediate wins.
- [ ] Hard does not lose to legal human play.
- [ ] Changing mode cancels an AI turn; changing difficulty leaves the board intact.
- [ ] Mouse, touch, keyboard focus, desktop, and narrow mobile layouts work correctly.

For lightweight rule checks, load the page and use the browser console helpers exposed as `window.ticTacToeTest`.
