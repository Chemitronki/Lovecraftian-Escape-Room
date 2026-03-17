import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ShadowReflection.css';

/**
 * ShadowReflection - Puzzle where user mirrors movements to match shadow patterns
 * Requirements: 3.1, 3.7
 */
const ShadowReflection = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const targetPattern = solutionData?.solution || [];
  const patternLength = targetPattern.length;
  
  const [userPattern, setUserPattern] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isShowingPattern, setIsShowingPattern] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [displayedStep, setDisplayedStep] = useState(0);

  useEffect(() => {
    // Show the pattern sequentially
    if (isShowingPattern && displayedStep < patternLength) {
      const timer = setTimeout(() => {
        setDisplayedStep(displayedStep + 1);
      }, 2000); // 2 seconds per movement (1.5s animation + 0.5s pause)
      return () => clearTimeout(timer);
    } else if (isShowingPattern && displayedStep >= patternLength) {
      // Pattern finished showing, hide it after a brief pause
      const timer = setTimeout(() => {
        setIsShowingPattern(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isShowingPattern, displayedStep, patternLength]);

  useEffect(() => {
    // Auto-submit when pattern is complete
    if (userPattern.length === patternLength && userPattern.length > 0 && !submitted) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmit(userPattern);
      }, 500);
    }
  }, [userPattern.length, patternLength, submitted]);

  const handleMovement = (direction) => {
    if (disabled || isShowingPattern || userPattern.length >= patternLength) return;

    const newPattern = [...userPattern, direction];
    setUserPattern(newPattern);
    setCurrentStep(currentStep + 1);
  };

  const handleReset = () => {
    setUserPattern([]);
    setCurrentStep(0);
    setDisplayedStep(0);
    setIsShowingPattern(true);
    setSubmitted(false);
  };

  const getPositionClass = (direction) => {
    switch (direction) {
      case 'up': return 'pos-up';
      case 'down': return 'pos-down';
      case 'left': return 'pos-left';
      case 'right': return 'pos-right';
      case 'center': return 'pos-center';
      default: return 'pos-center';
    }
  };

  return (
    <div className="shadow-reflection">
      <div className="reflection-instructions">
        {isShowingPattern 
          ? 'Observa el patrón de la sombra...' 
          : 'Replica los movimientos de la sombra'}
      </div>

      <div className="reflection-display">
        <div className="shadow-side">
          <h4>Sombra</h4>
          <div className="shadow-grid">
            {isShowingPattern && displayedStep > 0 && (
              <div
                className={`shadow-position ${getPositionClass(targetPattern[displayedStep - 1])} active`}
                style={{ animationDelay: '0s' }}
              >
                <div className="shadow-figure">👤</div>
              </div>
            )}
            {!isShowingPattern && (
              <div className="shadow-hidden">
                <span>???</span>
              </div>
            )}
          </div>
        </div>

        <div className="mirror-line"></div>

        <div className="player-side">
          <h4>Tu Reflejo</h4>
          <div className="player-grid">
            {userPattern.map((direction, index) => (
              <div
                key={index}
                className={`player-position ${getPositionClass(direction)}`}
              >
                <div className="player-figure">🧍</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="movement-controls">
        <div className="control-grid">
          <div className="control-row">
            <button
              onClick={() => handleMovement('up')}
              disabled={disabled || isShowingPattern || userPattern.length >= patternLength}
              className="movement-btn"
            >
              ↑ Arriba
            </button>
          </div>
          <div className="control-row">
            <button
              onClick={() => handleMovement('left')}
              disabled={disabled || isShowingPattern || userPattern.length >= patternLength}
              className="movement-btn"
            >
              ← Izquierda
            </button>
            <button
              onClick={() => handleMovement('center')}
              disabled={disabled || isShowingPattern || userPattern.length >= patternLength}
              className="movement-btn"
            >
              • Centro
            </button>
            <button
              onClick={() => handleMovement('right')}
              disabled={disabled || isShowingPattern || userPattern.length >= patternLength}
              className="movement-btn"
            >
              Derecha →
            </button>
          </div>
          <div className="control-row">
            <button
              onClick={() => handleMovement('down')}
              disabled={disabled || isShowingPattern || userPattern.length >= patternLength}
              className="movement-btn"
            >
              ↓ Abajo
            </button>
          </div>
        </div>
      </div>

      <div className="reflection-progress">
        <span className="progress-label">Progreso:</span>
        <span className="progress-value">{userPattern.length} / {patternLength}</span>
      </div>

      <div className="reflection-controls">
        <button
          onClick={handleReset}
          disabled={disabled}
          className="reflection-reset"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
};

ShadowReflection.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      pattern: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ShadowReflection;
