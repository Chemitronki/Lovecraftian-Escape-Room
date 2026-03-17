import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitPuzzleSolution } from '../features/game/gameSlice';

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
      if (!sessionId) throw new Error('No hay sesión activa');

      const result = await dispatch(submitPuzzleSolution({
        puzzleId,
        solution,
        sessionId
      })).unwrap();

      // Supabase returns { correct: true/false } directly
      const correct = result.correct === true;

      setFeedback({
        isCorrect: correct,
        message: correct ? '¡Excelente! Has resuelto el puzzle.' : 'Incorrecto, inténtalo de nuevo.',
        puzzleCompleted: correct,
        allCompleted: false,
      });

      return {
        success: true,
        correct,
        puzzleCompleted: correct,
        allCompleted: false,
      };
    } catch (err) {
      console.error('Error submitting solution:', err);
      const errorMessage = err.message || 'Error al enviar la solución';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFeedback = () => {
    setFeedback(null);
    setError(null);
  };

  return { submitSolution, isSubmitting, feedback, error, clearFeedback };
};

export default usePuzzleSubmit;
