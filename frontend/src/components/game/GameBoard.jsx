import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  startGame, 
  getSession, 
  recoverSession, 
  abandonGame, 
  getCurrentPuzzle,
  completeGame 
} from '../../features/game/gameSlice';
import { logout } from '../../features/auth/authSlice';
import Timer from './Timer';
import ProgressIndicator from './ProgressIndicator';
import GameOver from './GameOver';
import Victory from './Victory';
import PuzzleContainer from './PuzzleContainer';
import Puzzle from './Puzzle';
import HintPanel from './HintPanel';
import Cinematic from '../cinematic/Cinematic';
import AmbientAudio from '../audio/AmbientAudio';
import { initSessionTimeout } from '../../utils/sessionTimeout';
import { setupBeforeUnloadHandler } from '../../utils/statePersistence';
import SessionTimeoutWarning from '../auth/SessionTimeoutWarning';

const GameBoard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    session, 
    timeRemaining, 
    isActive, 
    loading, 
    error,
    currentPuzzle,
    puzzleLoading,
    completedPuzzles,
    totalPuzzles 
  } = useSelector((state) => state.game);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [showCinematic, setShowCinematic] = useState(false);
  const [cinematicType, setCinematicType] = useState('opening');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize session timeout tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanup = initSessionTimeout(
      () => setShowTimeoutWarning(true),
      () => {
        dispatch(logout());
        navigate('/login');
      }
    );

    return cleanup;
  }, [isAuthenticated, dispatch, navigate]);

  // Handle page reload warning when game is active
  useEffect(() => {
    if (!isActive) return;
    
    const cleanup = setupBeforeUnloadHandler(true);
    return cleanup;
  }, [isActive]);

  // Try to recover session from localStorage on mount
  useEffect(() => {
    dispatch(recoverSession());
    
    const storedSession = localStorage.getItem('game_session');
    if (!storedSession) {
      dispatch(getSession());
    }
  }, [dispatch]);

  // Load current puzzle when session is active
  useEffect(() => {
    if (session?.id && isActive) {
      dispatch(getCurrentPuzzle(session.id));
    }
  }, [session?.id, isActive, dispatch]);

  // Check if all puzzles completed
  useEffect(() => {
    if (completedPuzzles === totalPuzzles && isActive) {
      dispatch(completeGame(timeRemaining));
    }
  }, [completedPuzzles, totalPuzzles, isActive, timeRemaining, dispatch]);

  // Handle game start
  const handleStartGame = async () => {
    try {
      await dispatch(startGame()).unwrap();
      setCinematicType('opening');
      setShowCinematic(true);
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  // Handle cinematic complete
  const handleCinematicComplete = () => {
    setShowCinematic(false);
  };

  // Handle abandon game
  const handleAbandonGame = async () => {
    if (window.confirm('¿Estás seguro de que quieres abandonar el juego?')) {
      try {
        await dispatch(abandonGame()).unwrap();
        navigate('/');
      } catch (err) {
        console.error('Error abandoning game:', err);
      }
    }
  };

  // Handle puzzle completion
  const handlePuzzleComplete = () => {
    // Reload current puzzle (will get next puzzle)
    if (session?.id) {
      dispatch(getCurrentPuzzle(session.id));
    }
  };

  // Handle session timeout warning
  const handleExtendSession = () => {
    setShowTimeoutWarning(false);
  };

  const handleTimeoutLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Show cinematic
  if (showCinematic) {
    return <Cinematic type={cinematicType} onComplete={handleCinematicComplete} />;
  }

  // Show session timeout warning
  if (showTimeoutWarning) {
    return (
      <SessionTimeoutWarning 
        onExtend={handleExtendSession}
        onLogout={handleTimeoutLogout}
      />
    );
  }

  // Show game over screen
  if (session?.status === 'timeout' || (timeRemaining === 0 && isActive)) {
    return <GameOver puzzlesCompleted={completedPuzzles} totalPuzzles={totalPuzzles} />;
  }

  // Show victory screen
  if (session?.status === 'completed') {
    return <Victory completionTime={session.completion_time} />;
  }

  // Show start screen if no active session
  if (!session || !isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-8 shadow-2xl fade-in">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-green-400 mb-4 font-serif glitch-text">
              Escape Room Lovecraftiano
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Adéntrate en la gruta oscura y resuelve los misterios antes de que el tiempo se agote
            </p>
          </div>

          <div className="bg-gray-800 border-l-4 border-green-500 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-3">Instrucciones:</h2>
            <ul className="text-gray-300 space-y-2 list-disc list-inside">
              <li>Tienes 25 minutos para completar todos los puzzles</li>
              <li>Resuelve 10 puzzles únicos en secuencia</li>
              <li>Las pistas estarán disponibles después de 2 minutos en cada puzzle</li>
              <li>Tu tiempo de completado se registrará en el ranking global</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-6 error-shake">
              {error}
            </div>
          )}

          <button
            onClick={handleStartGame}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105 disabled:transform-none text-xl touch-target"
          >
            {loading ? 'Iniciando...' : 'Comenzar Juego'}
          </button>
        </div>
      </div>
    );
  }

  // Main game board
  return (
    <>
      <AmbientAudio enabled={isActive} />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with timer and progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 fade-in">
            <Timer />
            <ProgressIndicator 
              puzzlesCompleted={completedPuzzles} 
              totalPuzzles={totalPuzzles} 
            />
          </div>

          {/* Main game area */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 shadow-2xl min-h-[500px] fade-in">
            {puzzleLoading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando puzzle...</p>
              </div>
            ) : currentPuzzle ? (
              <>
                <Puzzle 
                  puzzle={currentPuzzle}
                  onComplete={handlePuzzleComplete}
                  disabled={!isActive || timeRemaining === 0}
                />
                
                <HintPanel 
                  puzzleId={currentPuzzle.id}
                  timeSpent={currentPuzzle.time_spent || 0}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No hay puzzles disponibles
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={handleAbandonGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 touch-target"
            >
              Abandonar Juego
            </button>
            
            <p className="text-gray-500 text-sm">
              Sesión ID: {session?.id}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameBoard;
