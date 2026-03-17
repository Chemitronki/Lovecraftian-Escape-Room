import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import PuzzleContainer from './PuzzleContainer';
import PuzzleFeedback from './PuzzleFeedback';
import HintPanel from './HintPanel';
import usePuzzleSubmit from '../../hooks/usePuzzleSubmit';
import {
  SymbolCipher,
  RitualPattern,
  AncientLock,
  MemoryFragments,
  CosmicAlignment,
  TentacleMaze,
  ForbiddenTome,
  ShadowReflection,
  CultistCode,
  ElderSignDrawing,
} from './puzzles';
import './Puzzle.css';

/**
 * Puzzle - Main puzzle component that renders different puzzle types
 * Handles puzzle loading, submission, and feedback
 */
const Puzzle = ({ puzzle, onComplete, disabled }) => {
  const { session, isActive } = useSelector((state) => state.game);
  const { submitSolution, isSubmitting, feedback, clearFeedback } = usePuzzleSubmit(
    puzzle?.id,
    session?.id
  );
  
  const [localSolution, setLocalSolution] = useState('');
  const [showingFeedback, setShowingFeedback] = useState(false);

  const handleSubmit = async (solution) => {
    const result = await submitSolution(solution || localSolution);
    
    if (result.success && result.correct) {
      setLocalSolution('');
      setShowingFeedback(true);
      
      // Call onComplete after showing feedback
      setTimeout(() => {
        setShowingFeedback(false);
        clearFeedback();
        if (onComplete) {
          onComplete();
        }
      }, 2000);
    }
  };

  // Map puzzle types to their components
  const getPuzzleComponent = () => {
    const puzzleComponents = {
      'symbol_cipher': SymbolCipher,
      'ritual_pattern': RitualPattern,
      'ancient_lock': AncientLock,
      'memory_fragments': MemoryFragments,
      'cosmic_alignment': CosmicAlignment,
      'tentacle_maze': TentacleMaze,
      'forbidden_tome': ForbiddenTome,
      'shadow_reflection': ShadowReflection,
      'cultist_code': CultistCode,
      'elder_sign': ElderSignDrawing,
    };

    const PuzzleComponent = puzzleComponents[puzzle.type];
    
    if (PuzzleComponent) {
      return (
        <PuzzleComponent
          puzzleData={puzzle}
          onSubmit={handleSubmit}
          disabled={isDisabled}
        />
      );
    }

    // Fallback for unknown puzzle types
    return (
      <div className="puzzle-type-placeholder">
        <p className="puzzle-type-label">Tipo: {puzzle.type}</p>
        <p className="puzzle-implementation-note">
          Tipo de puzzle no reconocido
        </p>
        
        {/* Generic input for testing */}
        <div className="generic-puzzle-input">
          <input
            type="text"
            value={localSolution}
            onChange={(e) => setLocalSolution(e.target.value)}
            placeholder="Ingresa tu solución..."
            disabled={isDisabled}
            className="puzzle-input"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={isDisabled || !localSolution}
            className="puzzle-submit-btn"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solución'}
          </button>
        </div>
      </div>
    );
  };

  if (!puzzle) {
    return (
      <div className="no-puzzle">
        <p>No hay puzzle disponible</p>
      </div>
    );
  }

  const isDisabled = disabled || !isActive || isSubmitting || showingFeedback;

  const handleHintUsed = (hint) => {
    console.log('Hint used:', hint);
  };

  return (
    <PuzzleContainer
      title={puzzle.title}
      description={puzzle.description}
      disabled={!isActive}
    >
      {feedback && showingFeedback && (
        <PuzzleFeedback
          isCorrect={feedback.isCorrect}
          message={feedback.message}
          onDismiss={clearFeedback}
        />
      )}
      
      {/* Hint Panel */}
      {isActive && puzzle && !showingFeedback && (
        <HintPanel
          puzzleId={puzzle.id}
          timeSpent={puzzle.time_spent || 0}
          onHintUsed={handleHintUsed}
        />
      )}
      
      <div className="puzzle-interface">
        {getPuzzleComponent()}
      </div>
    </PuzzleContainer>
  );
};

Puzzle.propTypes = {};

export default Puzzle;
