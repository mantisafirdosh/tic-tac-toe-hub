import React, { useState, useEffect, useRef } from "react";

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

function createSoundPlayer(soundOnRef) {
  return function play(src) {
    if (!soundOnRef.current) return;
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };
}

// Very simple AI: pick first empty cell
function pickAiMove(board) {
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) return i;
  }
  return null;
}

function VsAI() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // player is X
  const [status, setStatus] = useState("Your turn (X)");
  const [thinking, setThinking] = useState(false);

  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const playSound = createSoundPlayer(soundOnRef);

  const [lastMoveIndex, setLastMoveIndex] = useState(null);

  const winner = calculateWinner(board);

  useEffect(() => {
    if (winner) {
      const who =
        winner === "X" ? "You win! (X)" : "AI wins! (O)";
      setStatus(who);
      playSound("/sounds/win.mp3");
      setThinking(false);
    } else if (board.every((cell) => cell !== null)) {
      setStatus("Draw!");
      playSound("/sounds/reset.mp3");
      setThinking(false);
    } else if (xIsNext) {
      setStatus("Your turn (X)");
    } else {
      setStatus("AI is thinking...");
    }
  }, [board, xIsNext, winner, playSound]);

  const handlePlayerClick = (index) => {
    if (!xIsNext || winner || board[index]) return;
    const squares = board.slice();
    squares[index] = "X";
    setBoard(squares);
    setXIsNext(false);
    setLastMoveIndex(index);
    playSound("/sounds/move.mp3");
    setThinking(true);
  };

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (winner || board.every((c) => c !== null)) return;
    if (xIsNext) return;

    const timer = setTimeout(() => {
      const aiIndex = pickAiMove(board);
      if (aiIndex == null) {
        setThinking(false);
        return;
      }
      const squares = board.slice();
      if (!squares[aiIndex]) {
        squares[aiIndex] = "O";
        setBoard(squares);
        setXIsNext(true);
        setLastMoveIndex(aiIndex);
        playSound("/sounds/move.mp3");
      }
      setThinking(false);
    }, 500); // AI delay

    return () => clearTimeout(timer);
  }, [xIsNext, board, winner, playSound]);

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setStatus("Your turn (X)");
    setThinking(false);
    setLastMoveIndex(null);
    playSound("/sounds/reset.mp3");
  };

  return (
    <div className="page-layout">
      <div className="page-left">
        <h2>Play vs AI</h2>
        <p style={{ maxWidth: 260 }}>
          You play as X, a simple AI plays as O. Try to beat it!
        </p>

        <div style={{ marginTop: "12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong>Status:</strong>
            <div>{status}</div>
          </div>

          <div className="button-row">
            <button className="primary-btn" onClick={handleReset}>
              Reset Game
            </button>
          </div>

          <div style={{ marginTop: "8px", fontSize: "0.9rem" }}>
            <label>
              <input
                type="checkbox"
                checked={soundOn}
                onChange={(e) => setSoundOn(e.target.checked)}
                style={{ marginRight: "6px" }}
              />
              Enable sound effects
            </label>
          </div>

          {thinking && (
            <div style={{ marginTop: "6px", fontSize: "0.85rem", color: "#ccc" }}>
              AI is thinking...
            </div>
          )}
        </div>
      </div>

      <div className="page-right">
        <h3>Board</h3>
        <div className="board-grid">
          {board.map((cell, index) => {
            const filledClass =
              cell === "X"
                ? "filled-x"
                : cell === "O"
                ? "filled-o"
                : "";
            const justPlayedClass =
              index === lastMoveIndex && cell !== null ? "just-played" : "";
            return (
              <div
                key={index}
                className={`board-cell ${filledClass} ${justPlayedClass}`}
                onClick={() => handlePlayerClick(index)}
              >
                {cell}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VsAI;
