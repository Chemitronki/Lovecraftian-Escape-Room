/**
 * State Persistence Utilities
 * Handles saving and loading state from localStorage
 */

const STATE_KEY = 'lovecraftian_escape_state';

/**
 * Save state to localStorage
 */
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STATE_KEY, serializedState);
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

/**
 * Load state from localStorage
 */
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Error loading state:', error);
    return undefined;
  }
};

/**
 * Clear persisted state
 */
export const clearState = () => {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem('game_session');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};

/**
 * Save game session to localStorage
 */
export const saveGameSession = (session) => {
  try {
    localStorage.setItem('game_session', JSON.stringify(session));
  } catch (error) {
    console.error('Error saving game session:', error);
  }
};

/**
 * Load game session from localStorage
 */
export const loadGameSession = () => {
  try {
    const session = localStorage.getItem('game_session');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error loading game session:', error);
    return null;
  }
};

/**
 * Clear game session from localStorage
 */
export const clearGameSession = () => {
  try {
    localStorage.removeItem('game_session');
  } catch (error) {
    console.error('Error clearing game session:', error);
  }
};

/**
 * Handle browser navigation (back/forward)
 */
export const setupNavigationHandler = (onNavigate) => {
  const handlePopState = (event) => {
    if (onNavigate) {
      onNavigate(event);
    }
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

/**
 * Handle page reload/close
 */
export const setupBeforeUnloadHandler = (shouldWarn = true) => {
  const handleBeforeUnload = (event) => {
    if (shouldWarn) {
      const message = '¿Estás seguro de que quieres salir? Tu progreso se guardará.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};
