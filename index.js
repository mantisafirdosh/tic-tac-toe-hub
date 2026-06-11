const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
// rooms: { [roomCode]: { board, xIsNext } }
// stats: { [roomCode]: { games: [ { winner, loser, draw, players } ] } }
const rooms = {};
const stats = {};

function createEmptyBoard() {
  return Array(9).fill(null);
}

function getOrCreateRoom(roomCode) {
  if (!rooms[roomCode]) {
    rooms[roomCode] = {
      board: createEmptyBoard(),
      xIsNext: true,
    };
  }
  return rooms[roomCode];
}

function getOrCreateStats(roomCode) {
  if (!stats[roomCode]) {
    stats[roomCode] = {
      games: [], // each: { winner, loser, draw, players: { xPlayer, oPlayer } }
    };
  }
  return stats[roomCode];
}

// Health check
app.get("/", (req, res) => {
  res.send("Tic Tac Toe REST backend with stats is running");
});

// Get room state (board + turn)
app.get("/api/rooms/:roomCode", (req, res) => {
  const { roomCode } = req.params;
  const room = getOrCreateRoom(roomCode);
  res.json(room);
});

// Make a move (no winner logic here, frontend still checks winner)
app.post("/api/rooms/:roomCode/move", (req, res) => {
  const { roomCode } = req.params;
  const { index } = req.body;

  if (typeof index !== "number" || index < 0 || index > 8) {
    return res.status(400).json({ error: "Invalid index" });
  }

  const room = getOrCreateRoom(roomCode);
  const board = room.board.slice();

  if (board[index] !== null) {
    return res.status(400).json({ error: "Cell already used" });
  }

  const currentSymbol = room.xIsNext ? "X" : "O";
  board[index] = currentSymbol;
  room.board = board;
  room.xIsNext = !room.xIsNext;

  res.json(room);
});

// Reset board (start new game but does NOT record anything)
app.post("/api/rooms/:roomCode/reset", (req, res) => {
  const { roomCode } = req.params;
  const room = getOrCreateRoom(roomCode);
  room.board = createEmptyBoard();
  room.xIsNext = true;
  res.json(room);
});

// Record game result: who played and who won/lost/draw
// body: { xPlayer, oPlayer, result } where result = "X" | "O" | "draw"
app.post("/api/rooms/:roomCode/result", (req, res) => {
  const { roomCode } = req.params;
  const { xPlayer, oPlayer, result } = req.body;

  if (!xPlayer || !oPlayer || !result) {
    return res
      .status(400)
      .json({ error: "xPlayer, oPlayer and result are required" });
  }

  const roomStats = getOrCreateStats(roomCode);

  let winner = null;
  let loser = null;
  let draw = false;

  if (result === "X") {
    winner = xPlayer;
    loser = oPlayer;
  } else if (result === "O") {
    winner = oPlayer;
    loser = xPlayer;
  } else if (result === "draw") {
    draw = true;
  } else {
    return res.status(400).json({ error: "Invalid result value" });
  }

  roomStats.games.push({
    winner,
    loser,
    draw,
    players: {
      xPlayer,
      oPlayer,
    },
    finishedAt: new Date().toISOString(),
  });

  res.json({ message: "Result recorded", stats: roomStats });
});

// Get all stats for a room (history of games)
app.get("/api/rooms/:roomCode/stats", (req, res) => {
  const { roomCode } = req.params;
  const roomStats = getOrCreateStats(roomCode);
  res.json(roomStats);
});

// Debug: see all stats and rooms (optional)
app.get("/api/debug/all", (req, res) => {
  res.json({ rooms, stats });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`REST backend running on http://localhost:${PORT}`);
});