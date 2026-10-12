"use strict";

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const gameState = {
  board: Array(9).fill(""), currentPlayer: "X", mode: "human", difficulty: "hard",
  gameOver: false, scores: { X: 0, O: 0, draws: 0 }, roundId: 0, aiTimer: null, winningLine: []
};

const elements = {
  board: document.querySelector("#board"), cells: [...document.querySelectorAll(".cell")],
  status: document.querySelector("#status-message"), turnPill: document.querySelector("#turn-pill"),
  turnLabel: document.querySelector("#turn-label"), difficulty: document.querySelector("#difficulty"),
  difficultyGroup: document.querySelector("#difficulty-group"), scoreX: document.querySelector("#score-x"),
  scoreO: document.querySelector("#score-o"), scoreDraw: document.querySelector("#score-draw"), scoreOLabel: document.querySelector("#score-o-label")
};

function getResult(board) {
  for (const line of winningLines) {
    const [first, second, third] = line;
    if (board[first] && board[first] === board[second] && board[first] === board[third]) return { winner: board[first], line };
  }
  return board.every(Boolean) ? { winner: "draw", line: [] } : null;
}

function availableMoves(board) { return board.map((value, index) => value ? -1 : index).filter(index => index !== -1); }
function isAiTurn() { return gameState.mode === "ai" && gameState.currentPlayer === "O" && !gameState.gameOver; }

function render() {
  elements.cells.forEach((cell, index) => {
    const value = gameState.board[index];
    cell.textContent = value;
    cell.classList.toggle("x", value === "X"); cell.classList.toggle("o", value === "O");
    cell.classList.toggle("winner", gameState.winningLine.includes(index));
    cell.disabled = Boolean(value) || gameState.gameOver || isAiTurn();
    const positions = ["Top left", "Top center", "Top right", "Middle left", "Center", "Middle right", "Bottom left", "Bottom center", "Bottom right"];
    cell.setAttribute("aria-label", `${positions[index]}, ${value || "empty"}`);
  });
  const thinking = isAiTurn();
  elements.status.textContent = gameState.gameOver ? (gameState.winningLine.length ? `Player ${gameState.currentPlayer} wins!` : "It's a draw!") : thinking ? "AI is thinking..." : `Player ${gameState.currentPlayer}'s turn`;
  elements.turnLabel.textContent = gameState.gameOver ? "Round complete" : thinking ? "AI thinking" : `${gameState.currentPlayer} to move`;
  elements.turnPill.classList.toggle("is-o", gameState.currentPlayer === "O");
  elements.scoreX.textContent = gameState.scores.X; elements.scoreO.textContent = gameState.scores.O; elements.scoreDraw.textContent = gameState.scores.draws;
  elements.scoreOLabel.textContent = gameState.mode === "ai" ? "Computer O" : "Player O";
}

function finishRound(result) {
  gameState.gameOver = true; gameState.winningLine = result.line;
  if (result.winner === "draw") gameState.scores.draws += 1; else gameState.scores[result.winner] += 1;
  render();
}

function makeMove(index, player) {
  if (gameState.gameOver || gameState.board[index] || player !== gameState.currentPlayer) return false;
  gameState.board[index] = player;
  const result = getResult(gameState.board);
  if (result) finishRound(result);
  else { gameState.currentPlayer = player === "X" ? "O" : "X"; render(); if (isAiTurn()) scheduleAiMove(); }
  return true;
}

function scheduleAiMove() {
  const roundAtSchedule = gameState.roundId;
  clearTimeout(gameState.aiTimer);
  gameState.aiTimer = setTimeout(() => {
    if (roundAtSchedule !== gameState.roundId || !isAiTurn()) return;
    const move = chooseAiMove(gameState.board, gameState.difficulty);
    if (move !== -1) makeMove(move, "O");
  }, 420);
}

function chooseAiMove(board, difficulty) {
  const moves = availableMoves(board);
  if (!moves.length) return -1;
  if (difficulty === "easy") return moves[Math.floor(Math.random() * moves.length)];
  if (difficulty === "medium") return chooseMediumMove(board, moves);
  return chooseHardMove(board);
}

function chooseMediumMove(board, moves) {
  for (const player of ["O", "X"]) {
    for (const index of moves) { const candidate = [...board]; candidate[index] = player; if (getResult(candidate)?.winner === player) return index; }
  }
  if (moves.includes(4)) return 4;
  const corners = moves.filter(index => [0, 2, 6, 8].includes(index));
  return corners.length ? corners[Math.floor(Math.random() * corners.length)] : moves[Math.floor(Math.random() * moves.length)];
}

function chooseHardMove(board) {
  let bestScore = -Infinity; let bestMoves = [];
  for (const index of availableMoves(board)) {
    const nextBoard = [...board]; nextBoard[index] = "O";
    const score = minimax(nextBoard, false, 0);
    if (score > bestScore) { bestScore = score; bestMoves = [index]; } else if (score === bestScore) bestMoves.push(index);
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

// Minimax explores every remaining board state. Scores reward faster wins and delay losses.
function minimax(board, maximizing, depth) {
  const result = getResult(board);
  if (result?.winner === "O") return 10 - depth;
  if (result?.winner === "X") return depth - 10;
  if (result?.winner === "draw") return 0;
  const scores = availableMoves(board).map(index => { const nextBoard = [...board]; nextBoard[index] = maximizing ? "O" : "X"; return minimax(nextBoard, !maximizing, depth + 1); });
  return maximizing ? Math.max(...scores) : Math.min(...scores);
}

function startNewRound() {
  clearTimeout(gameState.aiTimer); gameState.roundId += 1; gameState.board = Array(9).fill("");
  gameState.currentPlayer = "X"; gameState.gameOver = false; gameState.winningLine = []; render();
}

function setMode(mode) {
  if (mode === gameState.mode) return;
  gameState.mode = mode;
  document.querySelectorAll("[data-mode]").forEach(button => { const selected = button.dataset.mode === mode; button.classList.toggle("is-selected", selected); button.setAttribute("aria-pressed", selected); });
  const aiModeActive = mode === "ai";
  elements.difficulty.disabled = !aiModeActive;
  elements.difficulty.value = gameState.difficulty;
  elements.difficultyGroup.classList.toggle("is-active", aiModeActive);
  elements.difficultyGroup.setAttribute("aria-hidden", !aiModeActive);
  startNewRound();
}

elements.board.addEventListener("click", event => { const cell = event.target.closest(".cell"); if (cell && !isAiTurn()) makeMove(Number(cell.dataset.index), gameState.currentPlayer); });
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
elements.difficulty.addEventListener("change", event => { gameState.difficulty = event.target.value; });
document.querySelector("#new-round").addEventListener("click", startNewRound);
document.querySelector("#reset-scores").addEventListener("click", () => { if (!window.confirm("Reset all scores and start a new round?")) return; gameState.scores = { X: 0, O: 0, draws: 0 }; startNewRound(); });
render();
if (typeof window !== "undefined") window.ticTacToeTest = { getResult, chooseAiMove, minimax };