import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './MemoryFragments.css';

/**
 * MemoryFragments - Memory matching puzzle with eldritch imagery
 * Requirements: 3.1, 3.7
 */
const MemoryFragments = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const totalPairs = solutionData?.pairs || 6;
  const images = solutionData?.images || [];
  
  // Create card pairs - memoized so it only happens once
  const cards = useMemo(() => {
    return images.flatMap((image, index) => [
      { pairId: index, icon: image === 'tentacle' ? '🐙' : image === 'eye' ? '👁️' : image === 'star' ? '⭐' : image === 'tome' ? '📖' : image === 'portal' ? '🌀' : image === 'cultist' ? '🧙' : image === 'monster' ? '👹' : '🔮' },
      { pairId: index, icon: image === 'tentacle' ? '🐙' : image === 'eye' ? '👁️' : image === 'star' ? '⭐' : image === 'tome' ? '📖' : image === 'portal' ? '🌀' : image === 'cultist' ? '🧙' : image === 'monster' ? '👹' : '🔮' }
    ]).sort(() => Math.random() - 0.5);
  }, [images]);
  
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.pairId]);
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  }, [flippedCards, cards, matchedPairs]);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Auto-submit when all pairs are matched (only once)
    if (matchedPairs.length === totalPairs && matchedPairs.length > 0 && !submitted) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmit(true);
      }, 500);
    }
  }, [matchedPairs, totalPairs, onSubmit, submitted]);

  const handleCardClick = (index) => {
    if (disabled || isChecking || flippedCards.length >= 2) return;
    if (flippedCards.includes(index)) return;
    if (matchedPairs.includes(cards[index].pairId)) return;

    setFlippedCards([...flippedCards, index]);
  };

  const isCardFlipped = (index) => {
    return flippedCards.includes(index) || matchedPairs.includes(cards[index].pairId);
  };

  const isCardMatched = (index) => {
    return matchedPairs.includes(cards[index].pairId);
  };

  return (
    <div className="memory-fragments">
      <div className="memory-stats">
        <div className="stat-item">
          <span className="stat-label">Pares encontrados:</span>
          <span className="stat-value">{matchedPairs.length} / {totalPairs}</span>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`memory-card ${isCardFlipped(index) ? 'flipped' : ''} ${
              isCardMatched(index) ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="card-pattern">?</div>
              </div>
              <div className="card-back">
                <div className="card-icon">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matchedPairs.length === totalPairs && (
        <div className="completion-message">
          ¡Todos los fragmentos de memoria han sido restaurados!
        </div>
      )}
    </div>
  );
};

MemoryFragments.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      pairs: PropTypes.number,
      cards: PropTypes.arrayOf(
        PropTypes.shape({
          pairId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          icon: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default MemoryFragments;
