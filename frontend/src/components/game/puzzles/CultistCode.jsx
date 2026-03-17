import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CultistCode.css';

/**
 * CultistCode - Puzzle where user decodes intercepted messages using frequency analysis
 * Requirements: 3.1, 3.7
 */
const CultistCode = ({ puzzleData, onSubmit, disabled }) => {
  const solutionData = typeof puzzleData?.solution_data === 'string' 
    ? JSON.parse(puzzleData.solution_data) 
    : puzzleData?.solution_data || {};
  
  const encodedMessage = solutionData?.encrypted || '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const [decodedMessage, setDecodedMessage] = useState('');
  const [substitutions, setSubstitutions] = useState({});
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Calculate letter frequency
  const calculateFrequency = () => {
    const freq = {};
    const cleanMessage = encodedMessage.toUpperCase().replace(/[^A-Z]/g, '');
    
    for (const char of cleanMessage) {
      freq[char] = (freq[char] || 0) + 1;
    }

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([letter, count]) => ({
        letter,
        count,
        percentage: ((count / cleanMessage.length) * 100).toFixed(1),
      }));
  };

  const frequency = calculateFrequency();

  const handleSubstitution = (encodedLetter, decodedLetter) => {
    if (disabled) return;

    const newSubstitutions = { ...substitutions };
    
    // Remove previous mapping for this decoded letter
    Object.keys(newSubstitutions).forEach(key => {
      if (newSubstitutions[key] === decodedLetter) {
        delete newSubstitutions[key];
      }
    });

    newSubstitutions[encodedLetter] = decodedLetter;
    setSubstitutions(newSubstitutions);
    setSelectedLetter(null);

    // Update decoded message
    updateDecodedMessage(newSubstitutions);
  };

  const updateDecodedMessage = (subs) => {
    let decoded = '';
    for (const char of encodedMessage) {
      const upper = char.toUpperCase();
      if (subs[upper]) {
        decoded += char === upper ? subs[upper] : subs[upper].toLowerCase();
      } else if (/[A-Za-z]/.test(char)) {
        decoded += '_';
      } else {
        decoded += char;
      }
    }
    setDecodedMessage(decoded);
  };

  const handleReset = () => {
    setSubstitutions({});
    setDecodedMessage('');
    setSelectedLetter(null);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!disabled && !submitted) {
      setSubmitted(true);
      onSubmit(decodedMessage);
    }
  };

  const isComplete = () => {
    const uniqueLetters = new Set(
      encodedMessage.toUpperCase().replace(/[^A-Z]/g, '').split('')
    );
    return uniqueLetters.size === Object.keys(substitutions).length;
  };

  return (
    <div className="cultist-code">
      <div className="code-instructions">
        Descifra el mensaje interceptado usando análisis de frecuencia
      </div>

      <div className="code-layout">
        <div className="frequency-panel">
          <h4>Análisis de Frecuencia</h4>
          <div className="frequency-list">
            {frequency.map(({ letter, count, percentage }) => (
              <div key={letter} className="frequency-item">
                <span className="freq-letter">{letter}</span>
                <div className="freq-bar-container">
                  <div
                    className="freq-bar"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="freq-count">{count} ({percentage}%)</span>
              </div>
            ))}
          </div>
          <div className="frequency-hint">
            <small>💡 En español, las letras más comunes son: E, A, O, S, R, N, I, L</small>
          </div>
        </div>

        <div className="message-panel">
          <div className="message-section">
            <h4>Mensaje Codificado</h4>
            <div className="encoded-message">{encodedMessage}</div>
          </div>

          <div className="message-section">
            <h4>Mensaje Decodificado</h4>
            <div className="decoded-message">
              {decodedMessage || encodedMessage.replace(/[A-Za-z]/g, '_')}
            </div>
          </div>

          <div className="substitution-section">
            <h4>Sustituciones</h4>
            <div className="substitution-grid">
              {frequency.map(({ letter }) => (
                <div key={letter} className="substitution-pair">
                  <span className="encoded-char">{letter}</span>
                  <span className="arrow">→</span>
                  <button
                    className={`decoded-char ${selectedLetter === letter ? 'selected' : ''}`}
                    onClick={() => setSelectedLetter(letter)}
                    disabled={disabled}
                  >
                    {substitutions[letter] || '?'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedLetter && (
            <div className="alphabet-selector">
              <h4>Selecciona la letra para "{selectedLetter}":</h4>
              <div className="alphabet-grid">
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    className="alphabet-btn"
                    onClick={() => handleSubstitution(selectedLetter, letter)}
                    disabled={disabled}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="code-controls">
        <button
          onClick={handleReset}
          disabled={disabled}
          className="code-reset"
        >
          Reiniciar
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || !isComplete()}
          className="code-submit"
        >
          Enviar Decodificación
        </button>
      </div>

      <div className="code-progress">
        <span className="progress-label">Letras decodificadas:</span>
        <span className="progress-value">
          {Object.keys(substitutions).length} / {frequency.length}
        </span>
      </div>
    </div>
  );
};

CultistCode.propTypes = {
  puzzleData: PropTypes.shape({
    data: PropTypes.shape({
      encoded: PropTypes.string,
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default CultistCode;
