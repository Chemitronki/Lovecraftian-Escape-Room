/**
 * Session Timeout Manager
 * Handles automatic logout after 2 hours of inactivity
 */

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

let timeoutId = null;
let warningTimeoutId = null;
let lastActivityTime = Date.now();

/**
 * Reset the session timeout timer
 */
export const resetSessionTimeout = (onWarning, onTimeout) => {
  lastActivityTime = Date.now();
  
  // Clear existing timers
  if (timeoutId) clearTimeout(timeoutId);
  if (warningTimeoutId) clearTimeout(warningTimeoutId);

  // Set warning timer (5 minutes before timeout)
  warningTimeoutId = setTimeout(() => {
    if (onWarning) onWarning();
  }, SESSION_TIMEOUT - WARNING_TIME);

  // Set timeout timer
  timeoutId = setTimeout(() => {
    if (onTimeout) onTimeout();
  }, SESSION_TIMEOUT);
};

/**
 * Clear all session timeout timers
 */
export const clearSessionTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId);
  if (warningTimeoutId) clearTimeout(warningTimeoutId);
  timeoutId = null;
  warningTimeoutId = null;
};

/**
 * Get time remaining until session timeout
 */
export const getTimeRemaining = () => {
  const elapsed = Date.now() - lastActivityTime;
  const remaining = SESSION_TIMEOUT - elapsed;
  return Math.max(0, remaining);
};

/**
 * Check if session has timed out
 */
export const hasSessionTimedOut = () => {
  return getTimeRemaining() === 0;
};

/**
 * Initialize session timeout tracking
 */
export const initSessionTimeout = (onWarning, onTimeout) => {
  // Track user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  const handleActivity = () => {
    resetSessionTimeout(onWarning, onTimeout);
  };

  activityEvents.forEach(event => {
    window.addEventListener(event, handleActivity);
  });

  // Start initial timeout
  resetSessionTimeout(onWarning, onTimeout);

  // Return cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    clearSessionTimeout();
  };
};
