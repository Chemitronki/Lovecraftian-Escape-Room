import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TentacleMaze.css';

/**
 * TentacleMaze - Puzzle where user navigates through maze avoiding tentacles
 * Requirements: 3.1, 3.7
 */
const TentacleMaze = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const gridSize = solutionData?.maze_size || 8;
  
  // Generate random obstacles
  const obstacles = Array.from({ length: solutionData?.tentacles || 5 }).map((_, i) => ({
    x: Math.floor(Math.random() * (gridSize - 2)) + 1,
    y: Math.floor(Math.random() * (gridSize - 2)) + 1,
  }));
  
  const exitPos = solutionData?.exit || { x: gridSize - 1, y: gridSize - 1 };
  
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [path, setPath] = useState([{ x: 0, y: 0 }]);
  const [hasCollided, setHasCollided] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if player reached exit
    if (playerPos.x === exitPos.x && playerPos.y === exitPos.y && !hasCollided && !submitted) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmit(true);
      }, 500);
    }
  }, [playerPos.x, playerPos.y, exitPos.x, exitPos.y, hasCollided, submitted, onSubmit]);

  const isObstacle = (x, y) => {
    return obstacles.some(obs => obs.x === x && obs.y === y);
  };

  const isExit = (x, y) => {
    return x === exitPos.x && y === exitPos.y;
  };

  const isPlayerAt = (x, y) => {
    return playerPos.x === x && playerPos.y === y;
  };

  const isInPath = (x, y) => {
    return path.some(pos => pos.x === x && pos.y === y);
  };

  const movePlayer = (dx, dy) => {
    if (disabled || hasCollided) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Check boundaries
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
      return;
    }

    // Check collision with obstacles
    if (isObstacle(newX, newY)) {
      setHasCollided(true);
      return;
    }

    setPlayerPos({ x: newX, y: newY });
    setPath([...path, { x: newX, y: newY }]);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        movePlayer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        movePlayer(1, 0);
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setPlayerPos({ x: 0, y: 0 });
    setPath([{ x: 0, y: 0 }]);
    setHasCollided(false);
    setSubmitted(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="tentacle-maze">
      <div className="maze-instructions">
        Usa las flechas o WASD para navegar. Evita los tentáculos y alcanza la salida.
      </div>

      {hasCollided && (
        <div className="collision-warning">
          ¡Has chocado con un tentáculo! Reinicia para intentar de nuevo.
        </div>
      )}

      <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const isObst = isObstacle(x, y);
          const isExitCell = isExit(x, y);
          const isPlayer = isPlayerAt(x, y);
          const inPath = isInPath(x, y);

          return (
            <div
              key={index}
              className={`maze-cell ${isObst ? 'obstacle' : ''} ${
                isExitCell ? 'exit' : ''
              } ${isPlayer ? 'player' : ''} ${inPath ? 'path' : ''}`}
            >
              {isObst && <div className="tentacle">🐙</div>}
              {isExitCell && !isPlayer && <div className="exit-icon">🚪</div>}
              {isPlayer && <div className="player-icon">👤</div>}
            </div>
          );
        })}
      </div>

      <div className="maze-controls">
        <button onClick={handleReset} disabled={disabled} className="maze-reset">
          Reiniciar
        </button>
        <div className="control-buttons">
          <button onClick={() => movePlayer(0, -1)} disabled={disabled || hasCollided} className="control-btn">
            ↑
          </button>
          <div className="control-row">
            <button onClick={() => movePlayer(-1, 0)} disabled={disabled || hasCollided} className="control-btn">
              ←
            </button>
            <button onClick={() => movePlayer(0, 1)} disabled={disabled || hasCollided} className="control-btn">
              ↓
            </button>
            <button onClick={() => movePlayer(1, 0)} disabled={disabled || hasCollided} className="control-btn">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TentacleMaze.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      gridSize: PropTypes.number,
      obstacles: PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired,
        })
      ),
      exit: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      }),
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default TentacleMaze;
