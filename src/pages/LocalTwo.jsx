import React, { useState } from "react";

function LocalTwo() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);

  const checkGameStatus = (b) => {
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
    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { type: "winner", player: b[a] };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { type: "draw" };
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const status = checkGameStatus(newBoard);
    if (status) {
      if (status.type === "winner") setWinner(status.player);
      else if (status.type === "draw") setWinner("draw");
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setCurrentPlayer("X");
  };

  const getStatusMessage = () => {
    if (winner === "draw") return "It's a draw!";
    if (winner) return `Player ${winner} wins!`;
    return `Player ${currentPlayer}'s turn`;
  };

  return (
    <div className="page-layout">
      <div className="page-left">
        <h2>2 Players (Local)</h2>
        <div className="board-grid">
          {board.map((cell, index) => {
            const filledClass =
              cell === "X"
                ? "filled-x"
                : cell === "O"
                ? "filled-o"
                : "";
            const disabled = !!cell || !!winner;
            return (
              <div
                key={index}
                className={`board-cell ${filledClass} ${
                  disabled ? "disabled" : ""
                }`}
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            );
          })}
        </div>

        <div className="status-text">{getStatusMessage()}</div>

        <div className="button-row">
          <button className="primary-btn" onClick={resetGame}>
            New Game
          </button>
        </div>
      </div>

      <div className="page-right">
        <div className="mode-panel">
          <h3>How it works</h3>
          <p style={{ fontSize: "0.9rem" }}>
            Take turns tapping the board. Player X goes first, followed by
            Player O. The status text will always show whose turn it is.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LocalTwo;