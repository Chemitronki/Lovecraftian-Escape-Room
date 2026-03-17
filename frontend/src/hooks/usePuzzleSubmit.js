import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitPuzzleSolution } from '../features/game/gameSlice';

/**
 * Custom hook for handling puzzle solution submissions
 * Manages submission state, feedback, and API communication
 */
const usePuzzleSubmit = (puzzleId, sessionId) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const submitSolution = async (solution) => {
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      if (!sessionId) {
        throw new Error('No hay sesión activa');
      }
      
      console.log('Submitting solution:', { puzzleId, sessionId, solution });
      
      const result = await dispatch(submitPuzzleSolution({ 
        puzzleId, 
        solution, 
        sessionId 
      })).unwrap();

      console.log('Response received:', result);
      console.log('Solution sent:', solution);
      console.log('Response data:', result.data);

      if (result.success) {
        const { correct, feedback: feedbackMessage, puzzle_completed, all_puzzles_completed } = result.data;
        
        console.log('Puzzle submission successful:', {
          correct,
          puzzle_completed,
          all_puzzles_completed,
          feedbackMessage
        });
        
        setFeedback({
          isCorrect: correct,
          message: correct ? '¡Excelente! Has resuelto el puzzle.' : feedbackMessage,
          puzzleCompleted: puzzle_completed,
          allCompleted: all_puzzles_completed,
        });

        return {
          success: true,
          correct,
          puzzleCompleted: puzzle_completed,
          allCompleted: all_puzzles_completed,
        };
      } else {
        throw new Error(result.message || 'Error al enviar la solución');
      }
    } catch (err) {
      console.error('Error submitting solution:', err);
      const errorMessage = err.message || 'Error al enviar la solución';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFeedback = () => {
    setFeedback(null);
    setError(null);
  };

  return {
    submitSolution,
    isSubmitting,
    feedback,
    error,
    clearFeedback,
  };
};

export default usePuzzleSubmit;
