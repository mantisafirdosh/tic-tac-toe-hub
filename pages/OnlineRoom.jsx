import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE = "http://localhost:4000";

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function OnlineRoom() {
  const location = useLocation();
  const defaultName = location.state?.name || "Player";
  const defaultRoom = location.state?.room || "main-room";

  const [playerName] = useState(defaultName);
  const [roomCode, setRoomCode] = useState(defaultRoom);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("Waiting for moves...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const winner = calculateWinner(board);

  // Fetch room state from backend
  const fetchRoom = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/rooms/${roomCode}`);
      const data = await res.json();
      setBoard(data.board);
      setXIsNext(data.xIsNext);
    } catch (err) {
      console.error(err);
      if (!silent) setError("Failed to load room");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load + auto-polling when roomCode changes
  useEffect(() => {
    // Initial fetch
    fetchRoom();

    // Poll every 1 second for updates (HTTP polling, not WebSockets)
    const intervalId = setInterval(() => {
      fetchRoom(true); // silent: don't show "Loading..." every second
    }, 1000);

    // Cleanup when roomCode changes or component unmounts
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  useEffect(() => {
    if (winner) {
      setStatus(`Winner: ${winner}`);
    } else if (board.every((cell) => cell !== null)) {
      setStatus("Draw!");
    } else {
      setStatus(`Next turn: ${xIsNext ? "X" : "O"}`);
    }
  }, [board, xIsNext, winner]);

  const handleClick = async (index) => {
    if (winner || board[index]) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      if (!res.ok) {
        const errBody = await res.json();
        setError(errBody.error || "Move failed");
        return;
      }
      const data = await res.json();
      setBoard(data.board);
      setXIsNext(data.xIsNext);
    } catch (err) {
      console.error(err);
      setError("Move failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/reset`, {
        method: "POST",
      });
      const data = await res.json();
      setBoard(data.board);
      setXIsNext(data.xIsNext);
    } catch (err) {
      console.error(err);
      setError("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-left">
        <h2>Online Room </h2>
        <p style={{ maxWidth: 260 }}>
          Share this room code with your friend. Both of you use the same code.
          Every second the board auto-updates from the server.
        </p>
        <div style={{ marginTop: "12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <label>Your name:</label>
            <div>{playerName}</div>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label>Room code:</label>
            <br />
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "5px",
                border: "2px solid #5a3d7a",
                backgroundColor: "#1f0d3e",
                color: "white",
                outline: "none",
                width: "220px",
              }}
            />
          </div>
          <div className="button-row">
            <button className="primary-btn" onClick={() => fetchRoom()}>
              Refresh now
            </button>
          </div>
          <div style={{ marginTop: "8px", fontSize: "0.9rem" }}>
            {loading ? "Loading..." : "Auto-sync every 1s"}
          </div>
          {error && (
            <div style={{ color: "tomato", marginTop: "6px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="page-right">
        <h3>Shared Board</h3>
        <div className="board-grid">
          {board.map((cell, index) => {
            const filledClass =
              cell === "X"
                ? "filled-x"
                : cell === "O"
                ? "filled-o"
                : "";
            return (
              <div
                key={index}
                className={`board-cell ${filledClass}`}
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            );
          })}
        </div>

        <div className="status-text">{status}</div>

        <div className="button-row">
          <button className="primary-btn" onClick={handleReset}>
            Reset Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnlineRoom;