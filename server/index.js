// server/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // load .env

const app = express();
app.use(cors());
app.use(express.json());

// ==== 1. Read env variables ====
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
}

// ==== 2. Connect to MongoDB ====
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
// ==== 3. Schemas & Models ====

// Room: current board + whose turn
const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  board: { type: [String], default: () => Array(9).fill(null) },
  xIsNext: { type: Boolean, default: true },
});

const Room = mongoose.model("Room", roomSchema);

// RoomStats: game history per room
const roomStatsSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  games: [
    {
      winner: { type: String, default: null },
      loser: { type: String, default: null },
      draw: { type: Boolean, default: false },
      players: {
        xPlayer: { type: String },
        oPlayer: { type: String },
      },
      finishedAt: { type: Date, default: Date.now },
    },
  ],
});

const RoomStats = mongoose.model("RoomStats", roomStatsSchema);

// ==== 4. Helpers ====

async function getOrCreateRoom(roomCode) {
  let room = await Room.findOne({ code: roomCode });
  if (!room) {
    room = new Room({ code: roomCode });
    await room.save();
  }
  return room;
}

async function getOrCreateRoomStats(roomCode) {
  let stats = await RoomStats.findOne({ roomCode });
  if (!stats) {
    stats = new RoomStats({ roomCode, games: [] });
    await stats.save();
  }
  return stats;
}

// ==== 5. Routes ====

// Health check
app.get("/", (req, res) => {
  res.send("Tic Tac Toe REST backend with MongoDB stats is running");
});

// Get room state (board + turn)
app.get("/api/rooms/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await getOrCreateRoom(roomCode);
    res.json({
      board: room.board,
      xIsNext: room.xIsNext,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get room" });
  }
});

// Make a move (no winner logic here, frontend still checks winner)
app.post("/api/rooms/:roomCode/move", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { index } = req.body;

    if (typeof index !== "number" || index < 0 || index > 8) {
      return res.status(400).json({ error: "Invalid index" });
    }

    const room = await getOrCreateRoom(roomCode);
    const board = [...room.board];

    if (board[index] !== null) {
      return res.status(400).json({ error: "Cell already used" });
    }

    const currentSymbol = room.xIsNext ? "X" : "O";
    board[index] = currentSymbol;
    room.board = board;
    room.xIsNext = !room.xIsNext;
    await room.save();

    res.json({
      board: room.board,
      xIsNext: room.xIsNext,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Move failed" });
  }
});

// Reset board (start new game but does NOT record anything)
app.post("/api/rooms/:roomCode/reset", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await getOrCreateRoom(roomCode);
    room.board = Array(9).fill(null);
    room.xIsNext = true;
    await room.save();
    res.json({
      board: room.board,
      xIsNext: room.xIsNext,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reset failed" });
  }
});

// Record game result: who played and who won/lost/draw
// body: { xPlayer, oPlayer, result } where result = "X" | "O" | "draw"
app.post("/api/rooms/:roomCode/result", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { xPlayer, oPlayer, result } = req.body;

    if (!xPlayer || !oPlayer || !result) {
      return res
        .status(400)
        .json({ error: "xPlayer, oPlayer and result are required" });
    }

    const roomStats = await getOrCreateRoomStats(roomCode);

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
      players: { xPlayer, oPlayer },
      finishedAt: new Date(),
    });

    await roomStats.save();

    res.json({ message: "Result recorded", stats: roomStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record result" });
  }
});

// Get all stats for a room (history of games)
app.get("/api/rooms/:roomCode/stats", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const roomStats = await getOrCreateRoomStats(roomCode);
    res.json(roomStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Debug: see all rooms + stats
app.get("/api/debug/all", async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    const stats = await RoomStats.find().lean();
    res.json({ rooms, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get debug data" });
  }
});

// ==== 6. Start server ====
app.listen(PORT, () => {
  console.log(`REST backend with MongoDB running on http://localhost:${PORT}`);
});