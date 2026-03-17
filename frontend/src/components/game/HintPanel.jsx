import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gameService } from '../../lib/supabaseGame';
import useSoundEffects from '../../hooks/useSoundEffects';
import './HintPanel.css';
import '../../styles/animations.css';

const HintPanel = ({ puzzleId, timeSpent, onHintUsed }) => {
  const [hintAvailability, setHintAvailability] = useState({
    available: false,
    time_on_puzzle: 0,
    hints_used: 0,
    max_hints: 3,
    next_hint_level: 1,
  });
  const [currentHint, setCurrentHint] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { playHintAvailable } = useSoundEffects();

  useEffect(() => {
    if (!puzzleId) return;

    const checkAvailability = async () => {
      try {
        const sessionId = localStorage.getItem('game_session')
          ? JSON.parse(localStorage.getItem('game_session')).id
          : null;
        if (!sessionId) return;

        const result = await gameService.checkHintAvailability(sessionId, puzzleId);

        const wasUnavailable = !hintAvailability.available;
        const availability = {
          available: result.available && result.hints_used < 3,
          time_on_puzzle: result.time_on_puzzle,
          hints_used: result.hints_used,
          max_hints: 3,
          next_hint_level: result.hints_used + 1,
        };

        setHintAvailability(availability);

        if (availability.available && wasUnavailable && availability.hints_used === 0) {
          setShowNotification(true);
          playHintAvailable();
          setTimeout(() => setShowNotification(false), 5000);
        }
      } catch (err) {
        console.error('Error checking hint availability:', err);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 10000);
    return () => clearInterval(interval);
  }, [puzzleId, timeSpent]);

  const requestHint = async () => {
    if (!hintAvailability.available) return;
    setLoading(true);
    setError(null);

    try {
      const sessionId = localStorage.getItem('game_session')
        ? JSON.parse(localStorage.getItem('game_session')).id
        : null;
      const level = hintAvailability.next_hint_level;

      const hint = await gameService.getHint(puzzleId, level);
      await gameService.useHint(sessionId, puzzleId);

      setCurrentHint(hint);
      setShowHintModal(true);

      const newHintsUsed = hintAvailability.hints_used + 1;
      setHintAvailability(prev => ({
        ...prev,
        hints_used: newHintsUsed,
        available: newHintsUsed < 3,
        next_hint_level: newHintsUsed + 1,
      }));

      if (onHintUsed) onHintUsed(hint);
    } catch (err) {
      console.error('Error requesting hint:', err);
      setError('Error al obtener la pista');
    } finally {
      setLoading(false);
    }
  };

  const timeLeft = Math.max(0, 120 - (hintAvailability.time_on_puzzle || 0));
  const timeLeftStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  return (
    <div className="hint-panel">
      {showNotification && (
        <div className="hint-notification hint-bounce">
          <span className="hint-notification-icon">💡</span>
          <span>¡Pista disponible! Has pasado más de 2 minutos en este puzzle.</span>
        </div>
      )}

      <div className="hint-button-container">
        <button
          className={`hint-button ${hintAvailability.available ? 'available' : 'unavailable'}`}
          onClick={requestHint}
          disabled={!hintAvailability.available || loading}
          title={
            hintAvailability.available
              ? `Obtener pista ${hintAvailability.next_hint_level}`
              : hintAvailability.time_on_puzzle < 120
              ? `Pistas disponibles en ${timeLeftStr}`
              : 'No hay más pistas disponibles'
          }
        >
          {loading ? (
            <span className="hint-loading">⏳</span>
          ) : (
            <>
              <span className="hint-icon">💡</span>
              <span className="hint-text">
                {hintAvailability.available ? 'Obtener Pista' : 'Sin Pistas'}
              </span>
            </>
          )}
        </button>

        <div className="hints-used-counter">
          <span className="hints-used-label">Pistas usadas:</span>
          <span className="hints-used-value">
            {hintAvailability.hints_used} / {hintAvailability.max_hints}
          </span>
        </div>
      </div>

      {error && (
        <div className="hint-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {showHintModal && currentHint && (
        <div className="hint-modal-overlay" onClick={() => setShowHintModal(false)}>
          <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hint-modal-header">
              <h3>Pista {currentHint.level}</h3>
              <button className="hint-modal-close" onClick={() => setShowHintModal(false)}>✕</button>
            </div>
            <div className="hint-modal-content">
              <p>{currentHint.content}</p>
            </div>
            <div className="hint-modal-footer">
              <button className="hint-modal-button" onClick={() => setShowHintModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

HintPanel.propTypes = {
  puzzleId: PropTypes.number.isRequired,
  timeSpent: PropTypes.number,
  onHintUsed: PropTypes.func,
};

export default HintPanel;
