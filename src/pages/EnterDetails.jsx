import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function EnterDetails() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("main-room");
  const navigate = useNavigate();

  const handleGoOnline = () => {
    navigate("/online", { state: { name, room } });
  };

  const handleGoLocalTwo = () => {
    navigate("/local-two", { state: { name } });
  };

  const handleGoVsAI = () => {
    navigate("/vs-ai", { state: { name } });
  };

  // Sample static board (dummy) for the right section
  const sampleBoard = ["X", "O", "X", "O", "X", null, null, "O", null];

  return (
    <div className="page-layout enter-details-layout">
      {/* SECTION 1: Welcome + enter details (left) */}
      <div className="page-left">
        <h2>Welcome to Tic Tac Toe Hub</h2>
        <p style={{ maxWidth: 260 }}>
          Enter your name and preferred online room code. Then choose how you
          want to play.
        </p>

        <div style={{ marginTop: "12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <label>Your name:</label>
            <br />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
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

          <div style={{ marginBottom: "8px" }}>
            <label>Default online room code:</label>
            <br />
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room code"
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
        </div>
      </div>

      {/* SECTION 2: Options for play rooms (middle) */}
      <div className="page-middle">
        <div className="mode-panel">
          <h3>Play Online with Friends</h3>
          <p style={{ fontSize: "0.9rem" }}>
            Use the room code to invite a friend. Both of you join the same
            code to share the board and chat.
          </p>
          <button className="primary-btn" onClick={handleGoOnline}>
            Go to Online Room
          </button>
        </div>

        <div className="mode-panel">
          <h3>2 Players (Same Screen)</h3>
          <p style={{ fontSize: "0.9rem" }}>
            Two players take turns on one device: X then O.
          </p>
          <button className="primary-btn" onClick={handleGoLocalTwo}>
            Go to 2 Players
          </button>
        </div>

        <div className="mode-panel">
          <h3>Play vs AI</h3>
          <p style={{ fontSize: "0.9rem" }}>
            You play as X, an intelligent AI plays as O.
          </p>
          <button className="primary-btn" onClick={handleGoVsAI}>
            Go to AI Mode
          </button>
        </div>
      </div>

      {/* SECTION 3: Dummy board (right) */}
      <div className="page-right">
        <h3>Game Preview</h3>
        <p style={{ fontSize: "0.9rem", marginTop: 0 }}>
          A sample Tic Tac Toe board to match the style of the game.
        </p>

        <div
          style={{
            marginTop: "8px",
            alignSelf: "center",
            transform: "scale(0.8)",
            transformOrigin: "top center",
          }}
        >
          <div className="board-grid">
            {sampleBoard.map((cell, index) => {
              const filledClass =
                cell === "X"
                  ? "filled-x"
                  : cell === "O"
                  ? "filled-o"
                  : "";
              return (
                <div
                  key={index}
                  className={`board-cell ${filledClass} disabled`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterDetails;