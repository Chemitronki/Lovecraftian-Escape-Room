import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './AncientLock.css';

/**
 * AncientLock - Puzzle where user solves a combination based on clues
 * Requirements: 3.1, 3.7
 */
const AncientLock = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const clues = solutionData?.clues || [];
  const combinationLength = solutionData?.solution?.length || 4;
  
  const [combination, setCombination] = useState(Array(combinationLength).fill(''));
  const [iconPositions, setIconPositions] = useState({});

  // Initialize random positions for icons - full screen with separation
  useEffect(() => {
    const positions = {};
    clues.forEach((_, clueIndex) => {
      // Get count for this clue
      let count = 0;
      const clue = clues[clueIndex];
      if (clue.includes('tentáculo')) count = 7;
      else if (clue.includes('ángulo')) count = 3;
      else if (clue.includes('ojo')) count = 9;
      else if (clue.includes('estrella')) count = 4;
      
      // Create separate position for each icon
      for (let i = 0; i < count; i++) {
        const key = `${clueIndex}-${i}`;
        positions[key] = {
          x: Math.random() * (window.innerWidth - 60),
          y: Math.random() * (window.innerHeight - 60),
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
        };
      }
    });
    setIconPositions(positions);
  }, [clues.length]);

  // Animate icons across full screen
  useEffect(() => {
    const interval = setInterval(() => {
      setIconPositions(prev => {
        const newPositions = { ...prev };
        Object.keys(newPositions).forEach(key => {
          const pos = newPositions[key];
          let newX = pos.x + pos.vx;
          let newY = pos.y + pos.vy;
          let newVx = pos.vx;
          let newVy = pos.vy;

          // Bounce off walls (full screen)
          if (newX <= 0 || newX >= window.innerWidth - 60) newVx *= -1;
          if (newY <= 0 || newY >= window.innerHeight - 60) newVy *= -1;

          newX = Math.max(0, Math.min(window.innerWidth - 60, newX));
          newY = Math.max(0, Math.min(window.innerHeight - 60, newY));

          newPositions[key] = { x: newX, y: newY, vx: newVx, vy: newVy };
        });
        return newPositions;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleDigitChange = (index, value) => {
    if (disabled) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newCombination = [...combination];
    newCombination[index] = value;
    setCombination(newCombination);

    // Auto-focus next input
    if (value && index < combinationLength - 1) {
      const nextInput = document.getElementById(`lock-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !combination[index] && index > 0) {
      const prevInput = document.getElementById(`lock-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = () => {
    const fullCombination = combination.join('');
    if (fullCombination.length === combinationLength && !disabled) {
      onSubmit(fullCombination);
    }
  };

  const handleReset = () => {
    setCombination(Array(combinationLength).fill(''));
    const firstInput = document.getElementById('lock-digit-0');
    if (firstInput) firstInput.focus();
  };

  const isComplete = combination.every(digit => digit !== '');

  return (
    <div className="ancient-lock">
      {/* Floating icons across screen - separated */}
      <div className="floating-icons-container">
        {clues.map((clue, clueIndex) => {
          let icon = '🔮';
          let count = 0;
          
          if (clue.includes('tentáculo')) {
            icon = '🐙';
            count = 7;
          } else if (clue.includes('ángulo')) {
            icon = '📐';
            count = 3;
          } else if (clue.includes('ojo')) {
            icon = '👁️';
            count = 9;
          } else if (clue.includes('estrella')) {
            icon = '⭐';
            count = 4;
          }
          
          return Array(count).fill(0).map((_, i) => {
            const key = `${clueIndex}-${i}`;
            const pos = iconPositions[key] || { x: 0, y: 0 };
            
            return (
              <span 
                key={key}
                className="floating-icon"
                style={{
                  position: 'fixed',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  fontSize: '2.5rem',
                  zIndex: 10,
                  pointerEvents: 'none',
                  transition: 'all 0.03s linear',
                  textShadow: '0 0 10px rgba(0,0,0,0.8)',
                }}
              >
                {icon}
              </span>
            );
          });
        })}
      </div>

      <div className="lock-visual">
        <div className="lock-body">
          <div className="lock-shackle"></div>
          <div className="lock-face">
            <div className="lock-keyhole"></div>
          </div>
        </div>
      </div>

      <div className="clues-section">
        <h3 className="clues-title">Pistas del Entorno:</h3>
        <div className="clues-list">
          {clues.map((clue, index) => (
            <div key={index} className="clue-item">
              <span className="clue-text">{clue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="combination-input">
        <div className="combination-display">
          {combination.map((digit, index) => (
            <input
              key={index}
              id={`lock-digit-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={disabled}
              className="digit-input"
            />
          ))}
        </div>
      </div>

      <div className="lock-controls">
        <button
          onClick={handleReset}
          disabled={disabled || !combination.some(d => d)}
          className="lock-reset"
        >
          Reiniciar
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || !isComplete}
          className="lock-submit"
        >
          Abrir Cerradura
        </button>
      </div>
    </div>
  );
};

AncientLock.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      clues: PropTypes.arrayOf(PropTypes.string),
      length: PropTypes.number,
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AncientLock;
