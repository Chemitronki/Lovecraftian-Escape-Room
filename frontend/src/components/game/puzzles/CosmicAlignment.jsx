import React, { useState } from 'react';
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
  
  const [starPositions, setStarPositions] = useState(
    stars.map((star, index) => ({
      name: star.name,
      x: positions[index]?.x || (50 + (index * 60) % 300),
      y: positions[index]?.y || (50 + Math.floor(index / 5) * 60),
    }))
  );
  
  const [draggedStar, setDraggedStar] = useState(null);

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
      // Send star names in order of their positions
      const solution = starPositions.map(star => star.name);
      onSubmit(solution);
    }
  };

  const handleReset = () => {
    setStarPositions(
      stars.map((star, index) => ({
        name: star.name,
        x: 50 + (index * 60) % 300,
        y: 50 + Math.floor(index / 5) * 60,
      }))
    );
  };

  return (
    <div className="cosmic-alignment">
      <div className="alignment-instructions">
        Arrastra las estrellas para alinearlas según el mapa estelar
      </div>

      <div
        className="star-field"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {starPositions.map((star, index) => (
          <div
            key={index}
            className={`star ${draggedStar === index ? 'dragging' : ''}`}
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
          </div>
        ))}
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
