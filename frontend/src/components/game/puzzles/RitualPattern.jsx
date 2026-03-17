import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './RitualPattern.css';

/**
 * RitualPattern - Puzzle where user arranges ritual items in correct sequence
 * Requirements: 3.1, 3.7
 */
const RitualPattern = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const items = (solutionData?.items || []).map((item, index) => ({
    id: index,
    name: item.charAt(0).toUpperCase() + item.slice(1),
    icon: item === 'candle' ? '🕯️' : item === 'tome' ? '📖' : item === 'dagger' ? '🗡️' : item === 'chalice' ? '🏆' : '💀'
  }));
  const [selectedSequence, setSelectedSequence] = useState([]);

  const handleItemClick = (item) => {
    if (disabled) return;
    
    // Toggle item selection
    if (selectedSequence.includes(item.id)) {
      setSelectedSequence(selectedSequence.filter(id => id !== item.id));
    } else {
      setSelectedSequence([...selectedSequence, item.id]);
    }
  };

  const handleReset = () => {
    setSelectedSequence([]);
  };

  const handleSubmit = () => {
    if (selectedSequence.length > 0 && !disabled) {
      // Convert selected indices to item names
      const solution = selectedSequence.map(id => solutionData?.items[id]);
      onSubmit(solution);
    }
  };

  const getItemPosition = (itemId) => {
    const index = selectedSequence.indexOf(itemId);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <div className="ritual-pattern">
      <div className="ritual-instructions">
        Haz clic en los objetos rituales en el orden correcto
      </div>

      <div className="ritual-items-grid">
        {items.map((item) => {
          const position = getItemPosition(item.id);
          const isSelected = position !== null;

          return (
            <div
              key={item.id}
              className={`ritual-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="item-icon">{item.icon}</div>
              <div className="item-name">{item.name}</div>
              {isSelected && (
                <div className="item-position">{position}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="ritual-controls">
        <button
          onClick={handleReset}
          disabled={disabled || selectedSequence.length === 0}
          className="ritual-reset"
        >
          Reiniciar
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || selectedSequence.length === 0}
          className="ritual-submit"
        >
          Completar Ritual
        </button>
      </div>

      {selectedSequence.length > 0 && (
        <div className="sequence-display">
          <span className="sequence-label">Secuencia:</span>
          <span className="sequence-count">{selectedSequence.length} de {items.length}</span>
        </div>
      )}
    </div>
  );
};

RitualPattern.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          name: PropTypes.string.isRequired,
          icon: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default RitualPattern;
