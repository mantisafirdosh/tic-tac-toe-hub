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

function LocalTwo() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState("Next turn: X");

  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const playSound = createSoundPlayer(soundOnRef);

  const [lastMoveIndex, setLastMoveIndex] = useState(null);

  const winner = calculateWinner(board);

  useEffect(() => {
    if (winner) {
      setStatus(`Winner: ${winner}`);
      playSound("/sounds/win.mp3");
    } else if (board.every((cell) => cell !== null)) {
      setStatus("Draw!");
      playSound("/sounds/reset.mp3");
    } else {
      setStatus(`Next turn: ${xIsNext ? "X" : "O"}`);
    }
  }, [board, xIsNext, winner, playSound]);

  const handleClick = (index) => {
    if (winner || board[index]) return;
    const squares = board.slice();
    squares[index] = xIsNext ? "X" : "O";
    setBoard(squares);
    setXIsNext(!xIsNext);
    setLastMoveIndex(index);
    playSound("/sounds/move.mp3");
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setStatus("Next turn: X");
    setLastMoveIndex(null);
    playSound("/sounds/reset.mp3");
  };

  return (
    <div className="page-layout">
      <div className="page-left">
        <h2>2 Players (Same Screen)</h2>
        <p style={{ maxWidth: 260 }}>
          Two players take turns on one device: X then O. First to get 3 in a
          row wins.
        </p>

        <div style={{ marginTop: "12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong>Game status:</strong>
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
                onClick={() => handleClick(index)}
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

export default LocalTwo;
