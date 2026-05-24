import { useState, useEffect } from "react";
import "./index.css";
import "./App.css";

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(board) {
  for (const [a,b,c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  return null;
}

function ScoreBoard({ scores }) {
  return (
    <div className="scoreboard">
      <div className="score-item x-score">
        <span className="score-symbol x">X</span>
        <span className="score-label">PLAYER 1</span>
        <span className="score-number">{scores.X}</span>
      </div>
      <div className="score-divider">
        <span className="score-draws">{scores.draws}</span>
        <span className="score-draw-label">DRAWS</span>
      </div>
      <div className="score-item o-score">
        <span className="score-number">{scores.O}</span>
        <span className="score-label">PLAYER 2</span>
        <span className="score-symbol o">O</span>
      </div>
    </div>
  );
}

function Cell({ value, index, onClick, isWinning, disabled }) {
  return (
    <button
      className={`cell ${value ? `cell-${value.toLowerCase()}` : ''} ${isWinning ? 'cell-winning' : ''} ${disabled ? 'cell-disabled' : ''}`}
      onClick={() => !disabled && onClick(index)}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ''}`}
    >
      {value && (
        <span className={`cell-symbol ${isWinning ? 'winning-symbol' : ''}`}>
          {value}
        </span>
      )}
      {!value && !disabled && <span className="cell-hover-hint" />}
    </button>
  );
}

function Board({ board, onCellClick, winningLine, gameOver }) {
  return (
    <div className="board">
      {board.map((cell, i) => (
        <Cell
          key={i}
          value={cell}
          index={i}
          onClick={onCellClick}
          isWinning={winningLine?.includes(i)}
          disabled={!!cell || gameOver}
        />
      ))}
    </div>
  );
}

function StatusBar({ currentPlayer, result }) {
  if (result) {
    if (result === 'draw') {
      return (
        <div className="status draw-status">
          <span className="status-icon">⚡</span>
          <span>DRAW — Well played!</span>
        </div>
      );
    }
    return (
      <div className={`status win-status win-${result.toLowerCase()}`}>
        <span className={`status-player ${result.toLowerCase()}`}>{result}</span>
        <span>WINS THE ROUND!</span>
      </div>
    );
  }
  return (
    <div className="status turn-status">
      <span className="status-label">NEXT MOVE</span>
      <span className={`turn-indicator ${currentPlayer.toLowerCase()}`}>{currentPlayer}</span>
    </div>
  );
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [result, setResult] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [animating, setAnimating] = useState(false);

  const handleCellClick = (i) => {
    if (board[i] || result) return;
    const newBoard = [...board];
    newBoard[i] = currentPlayer;
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setWinningLine(win.line);
      setResult(win.winner);
      setScores(s => ({ ...s, [win.winner]: s[win.winner] + 1 }));
    } else if (newBoard.every(Boolean)) {
      setResult("draw");
      setScores(s => ({ ...s, draws: s.draws + 1 }));
    } else {
      setCurrentPlayer(p => p === "X" ? "O" : "X");
    }
  };

  const resetRound = () => {
    setAnimating(true);
    setTimeout(() => {
      setBoard(Array(9).fill(null));
      setResult(null);
      setWinningLine(null);
      setCurrentPlayer("X");
      setAnimating(false);
    }, 300);
  };

  const resetAll = () => {
    resetRound();
    setScores({ X: 0, O: 0, draws: 0 });
  };

  return (
    <div className="app">
      <div className="game-card">
        <header className="header">
          <h1 className="title">TIC<span className="title-x">X</span>TAC<span className="title-o">O</span></h1>
          <p className="subtitle">TWO PLAYER BATTLE</p>
        </header>

        <ScoreBoard scores={scores} />

        <StatusBar currentPlayer={currentPlayer} result={result} />

        <div className={`board-wrapper ${animating ? 'board-exit' : 'board-enter'}`}>
          <Board
            board={board}
            onCellClick={handleCellClick}
            winningLine={winningLine}
            gameOver={!!result}
          />
        </div>

        <div className="controls">
          {result && (
            <button className="btn btn-primary" onClick={resetRound}>
              NEXT ROUND
            </button>
          )}
          <button className="btn btn-secondary" onClick={resetAll}>
            RESET ALL
          </button>
        </div>
      </div>
    </div>
  );
}
