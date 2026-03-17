import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ElderSignDrawing.css';

/**
 * ElderSignDrawing - Puzzle where user traces complex geometric patterns without lifting cursor
 * Requirements: 3.1, 3.7
 */
const ElderSignDrawing = ({ puzzleData, onSubmit, disabled }) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [hasLifted, setHasLifted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const targetPattern = solutionData?.points || [];
  const tolerance = solutionData?.tolerance || 50; // Increased from 20 to 50

  useEffect(() => {
    // Draw the target pattern on overlay canvas
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (targetPattern.length > 0) {
      ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(targetPattern[0].x, targetPattern[0].y);
      
      for (let i = 1; i < targetPattern.length; i++) {
        ctx.lineTo(targetPattern[i].x, targetPattern[i].y);
      }
      
      ctx.stroke();

      // Draw start point
      ctx.fillStyle = '#63ffda';
      ctx.beginPath();
      ctx.arc(targetPattern[0].x, targetPattern[0].y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw end point
      ctx.fillStyle = '#ff006e';
      ctx.beginPath();
      ctx.arc(
        targetPattern[targetPattern.length - 1].x,
        targetPattern[targetPattern.length - 1].y,
        8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, [targetPattern]);

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getTouchPos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const calculateAccuracy = (userPath) => {
    if (targetPattern.length === 0 || userPath.length === 0) return 0;

    // Check if user path follows the target pattern in sequence
    let matchedPoints = 0;
    let userIndex = 0;
    const strictTolerance = 30; // Stricter tolerance

    for (let i = 0; i < targetPattern.length; i++) {
      const targetPoint = targetPattern[i];
      let found = false;

      // Look for a matching point in the user path starting from userIndex
      for (let j = userIndex; j < userPath.length; j++) {
        const userPoint = userPath[j];
        const distance = Math.sqrt(
          Math.pow(targetPoint.x - userPoint.x, 2) +
          Math.pow(targetPoint.y - userPoint.y, 2)
        );
        
        if (distance <= strictTolerance) {
          matchedPoints++;
          userIndex = j + 1;
          found = true;
          break;
        }
      }

      // If we didn't find a match, check if we're close enough to continue
      if (!found && userIndex < userPath.length) {
        const closestDistance = Math.sqrt(
          Math.pow(targetPoint.x - userPath[userIndex].x, 2) +
          Math.pow(targetPoint.y - userPath[userIndex].y, 2)
        );
        
        if (closestDistance > 60) {
          // Too far off the pattern
          break;
        }
      }
    }

    // Calculate accuracy based on how many target points were matched
    const accuracy = (matchedPoints / targetPattern.length) * 100;
    return Math.round(Math.min(100, accuracy));
  };

  const drawPath = (ctx, pathToDraw) => {
    if (pathToDraw.length === 0) return;

    ctx.strokeStyle = hasLifted ? '#ff006e' : '#63ffda';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(pathToDraw[0].x, pathToDraw[0].y);

    for (let i = 1; i < pathToDraw.length; i++) {
      ctx.lineTo(pathToDraw[i].x, pathToDraw[i].y);
    }

    ctx.stroke();
  };

  const handleStart = (pos) => {
    if (disabled) return;

    setIsDrawing(true);
    setPath([pos]);
    setHasLifted(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleMove = (pos) => {
    if (!isDrawing || disabled) return;

    const newPath = [...path, pos];
    setPath(newPath);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPath(ctx, newPath);

    const currentAccuracy = calculateAccuracy(newPath);
    setAccuracy(currentAccuracy);
  };

  const handleEnd = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    
    // Only mark as lifted if path is too short (didn't complete the pattern)
    if (path.length < 20) {
      setHasLifted(true);
    }
    
    const finalAccuracy = calculateAccuracy(path);
    setAccuracy(finalAccuracy);

    // Redraw with error color if lifted
    if (path.length < 20) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPath(ctx, path);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, e);
    handleStart(pos);
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, e);
    handleMove(pos);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const pos = getTouchPos(canvas, e);
    handleStart(pos);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const pos = getTouchPos(canvas, e);
    handleMove(pos);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleEnd();
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setPath([]);
    setAccuracy(0);
    setIsDrawing(false);
    setHasLifted(false);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!disabled && path.length > 0 && !submitted) {
      setSubmitted(true);
      onSubmit(true); // Send true instead of object
    }
  };

  const canSubmit = accuracy >= 80 && path.length > 30;

  return (
    <div className="elder-sign-drawing">
      <div className="drawing-instructions">
        Traza el Signo de los Antiguos sin levantar el cursor
      </div>

      <div className="canvas-container">
        <canvas
          ref={overlayCanvasRef}
          width={600}
          height={400}
          className="overlay-canvas"
        />
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="drawing-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      <div className="drawing-stats">
        <div className="stat-item">
          <span className="stat-label">Precisión:</span>
          <span className={`stat-value ${accuracy >= 70 ? 'good' : 'poor'}`}>
            {accuracy}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Estado:</span>
          <span className={`stat-value ${hasLifted ? 'error' : 'ok'}`}>
            {hasLifted ? 'Cursor levantado ❌' : isDrawing ? 'Dibujando... ✏️' : 'Listo ✓'}
          </span>
        </div>
      </div>

      {hasLifted && (
        <div className="warning-message">
          ⚠️ Has levantado el cursor. Debes trazar el patrón en un solo movimiento continuo.
        </div>
      )}

      <div className="drawing-legend">
        <div className="legend-item">
          <span className="legend-dot start"></span>
          <span>Punto de inicio</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot end"></span>
          <span>Punto final</span>
        </div>
        <div className="legend-item">
          <span className="legend-line target"></span>
          <span>Patrón objetivo</span>
        </div>
        <div className="legend-item">
          <span className="legend-line user"></span>
          <span>Tu trazo</span>
        </div>
      </div>

      <div className="drawing-controls">
        <button
          onClick={handleReset}
          disabled={disabled}
          className="drawing-reset"
        >
          Reiniciar
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || !canSubmit}
          className="drawing-submit"
        >
          Completar Signo
        </button>
      </div>

      {!canSubmit && path.length > 0 && (
        <div className="hint-message">
          💡 Necesitas al menos 80% de precisión y un trazo completo
        </div>
      )}
    </div>
  );
};

ElderSignDrawing.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      pattern: PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired,
        })
      ),
      tolerance: PropTypes.number,
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ElderSignDrawing;
