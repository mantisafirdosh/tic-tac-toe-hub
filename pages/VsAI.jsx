import React, { useEffect, useState } from "react";

function VsAI() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

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

  const getAvailableMoves = (b) =>
    b
      .map((val, idx) => (val === null ? idx : null))
      .filter((idx) => idx !== null);

  const evaluateBoard = (b) => {
    const result = checkGameStatus(b);
    if (!result) return 0;
    if (result.type === "draw") return 0;
    if (result.type === "winner") {
      if (result.player === "O") return 10;
      if (result.player === "X") return -10;
    }
    return 0;
  };

  const minimax = (b, depth, isMax) => {
    const score = evaluateBoard(b);
    if (score === 10 || score === -10) return score;
    if (getAvailableMoves(b).length === 0) return 0;

    if (isMax) {
      let best = -Infinity;
      for (const move of getAvailableMoves(b)) {
        const newBoard = [...b];
        newBoard[move] = "O";
        best = Math.max(best, minimax(newBoard, depth + 1, false));
      }
      return best - depth;
    } else {
      let best = Infinity;
      for (const move of getAvailableMoves(b)) {
        const newBoard = [...b];
        newBoard[move] = "X";
        best = Math.min(best, minimax(newBoard, depth + 1, true));
      }
      return best + depth;
    }
  };

  const findBestMove = (b) => {
    let bestVal = -Infinity;
    let bestMove = null;
    for (const move of getAvailableMoves(b)) {
      const newBoard = [...b];
      newBoard[move] = "O";
      const moveVal = minimax(newBoard, 0, false);
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = move;
      }
    }
    return bestMove;
  };

  useEffect(() => {
    if (winner) return;
    if (currentPlayer === "O") {
      setAiThinking(true);
      const id = setTimeout(() => {
        setBoard((prev) => {
          const b = [...prev];
          const move = findBestMove(b);
          if (move === null || move === undefined) return b;
          b[move] = "O";
          const status = checkGameStatus(b);
          if (status) {
            if (status.type === "winner") setWinner(status.player);
            else if (status.type === "draw") setWinner("draw");
          } else {
            setCurrentPlayer("X");
          }
          return b;
        });
        setAiThinking(false);
      }, 500);
      return () => clearTimeout(id);
    }
  }, [currentPlayer, winner]);

  const handleClick = (index) => {
    if (
      board[index] ||
      winner ||
      currentPlayer !== "X" ||
      aiThinking
    ) {
      return;
    }
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    const status = checkGameStatus(newBoard);
    if (status) {
      if (status.type === "winner") setWinner(status.player);
      else if (status.type === "draw") setWinner("draw");
    } else {
      setCurrentPlayer("O");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setCurrentPlayer("X");
    setAiThinking(false);
  };

  const getStatusMessage = () => {
    if (winner === "draw") return "It's a draw!";
    if (winner === "X") return "You win!";
    if (winner === "O") return "AI wins!";
    return currentPlayer === "X" ? "Your turn" : "AI is thinking...";
  };

  return (
    <div className="page-layout">
      <div className="page-left">
        <h2>Play vs AI</h2>
        <div className="board-grid">
          {board.map((cell, index) => {
            const filledClass =
              cell === "X"
                ? "filled-x"
                : cell === "O"
                ? "filled-o"
                : "";
            const disabled =
              !!cell ||
              !!winner ||
              currentPlayer !== "X" ||
              aiThinking;
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
          <h3>Tips</h3>
          <p style={{ fontSize: "0.9rem" }}>
            You are always X; AI is O. AI plays optimally, so try to
            create forks and block its lines.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VsAI;