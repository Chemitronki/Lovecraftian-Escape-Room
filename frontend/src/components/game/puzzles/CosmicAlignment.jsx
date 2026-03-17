import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './CosmicAlignment.css';

/**
 * CosmicAlignment - Puzzle where user aligns celestial bodies to match a star chart
 * Requirements: 3.1, 3.7
 */
const CosmicAlignment = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const stars = (solutionData?.solution || []).map(name => ({ name }));
  const positions = solutionData?.positions || [];
  const TOLERANCE = 30; // pixels tolerance for correct placement
  
  const [starPositions, setStarPositions] = useState(
    stars.map((star, index) => ({
      name: star.name,
      x: 50 + Math.random() * 400,
      y: 50 + Math.random() * 400,
    }))
  );
  
  const [draggedStar, setDraggedStar] = useState(null);

  // Calculate which stars are correctly placed
  const correctPlacements = useMemo(() => {
    return starPositions.map((star, index) => {
      if (!positions[index]) return false;
      const dx = star.x - positions[index].x;
      const dy = star.y - positions[index].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= TOLERANCE;
    });
  }, [starPositions, positions]);

  const handleMouseDown = (index, e) => {
    if (disabled) return;
    e.preventDefault();
    setDraggedStar(index);
  };

  const handleMouseMove = (e) => {
    if (draggedStar === null || disabled) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStarPositions(prev => {
      const newPositions = [...prev];
      newPositions[draggedStar] = {
        ...newPositions[draggedStar],
        x: Math.max(0, Math.min(x, rect.width)),
        y: Math.max(0, Math.min(y, rect.height)),
      };
      return newPositions;
    });
  };

  const handleMouseUp = () => {
    setDraggedStar(null);
  };

  const handleTouchStart = (index, e) => {
    if (disabled) return;
    e.preventDefault();
    setDraggedStar(index);
  };

  const handleTouchMove = (e) => {
    if (draggedStar === null || disabled) return;
    
    const touch = e.touches[0];
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setStarPositions(prev => {
      const newPositions = [...prev];
      newPositions[draggedStar] = {
        ...newPositions[draggedStar],
        x: Math.max(0, Math.min(x, rect.width)),
        y: Math.max(0, Math.min(y, rect.height)),
      };
      return newPositions;
    });
  };

  const handleTouchEnd = () => {
    setDraggedStar(null);
  };

  const handleSubmit = () => {
    if (!disabled) {
      // Check if all stars are correctly placed
      const allCorrect = correctPlacements.every(isCorrect => isCorrect);
      if (allCorrect) {
        const solution = starPositions.map(star => star.name);
        onSubmit(solution);
      } else {
        // Show feedback - some stars are not in correct position
        alert('Las estrellas no están alineadas correctamente. Verifica la posición de cada una.');
      }
    }
  };

  const handleReset = () => {
    setStarPositions(
      stars.map((star, index) => ({
        name: star.name,
        x: 50 + Math.random() * 400,
        y: 50 + Math.random() * 400,
      }))
    );
  };

  return (
    <div className="cosmic-alignment">
      <div className="alignment-instructions">
        Arrastra las estrellas para alinearlas según el mapa estelar de referencia
      </div>

      <div className="alignment-container">
        <div className="alignment-single-field">
          <h3>✨ Alinea las Estrellas según el Mapa</h3>
          <div className="progress-indicator">
            {correctPlacements.filter(Boolean).length} / {correctPlacements.length} estrellas alineadas
          </div>
          <div
            className="star-field-unified"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Show reference positions as subtle guides */}
            {positions.map((pos, index) => (
              <div
                key={`target-${index}`}
                className="target-zone-reference"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                }}
              />
            ))}

            {/* Draggable stars */}
            {starPositions.map((star, index) => (
              <div
                key={index}
                className={`star ${draggedStar === index ? 'dragging' : ''} ${correctPlacements[index] ? 'correct' : ''}`}
                style={{
                  left: `${star.x}px`,
                  top: `${star.y}px`,
                }}
                onMouseDown={(e) => handleMouseDown(index, e)}
                onTouchStart={(e) => handleTouchStart(index, e)}
              >
                <div className="star-glow"></div>
                <div className="star-body">⭐</div>
                <div className="star-label">{star.name}</div>
                {correctPlacements[index] && <div className="correct-indicator">✓</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="alignment-controls">
        <button
          onClick={handleReset}
          disabled={disabled}
          className="alignment-reset"
        >
          Reiniciar
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="alignment-submit"
        >
          Confirmar Alineación
        </button>
      </div>
    </div>
  );
};

CosmicAlignment.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      stars: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
        })
      ),
      chart: PropTypes.string,
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default CosmicAlignment;
