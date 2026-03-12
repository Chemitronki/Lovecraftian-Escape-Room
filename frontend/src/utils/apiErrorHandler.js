/**
 * API Error Handler
 * Centralized error handling for API requests
 */

/**
 * Handle API errors with retry logic
 */
export const handleApiError = (error, retryCallback = null, maxRetries = 3) => {
  // Network error
  if (!error.response) {
    return {
      type: 'network',
      message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      canRetry: true,
      retryCallback,
      maxRetries,
    };
  }

  const { status, data } = error.response;

  // Authentication error
  if (status === 401) {
    // Clear auth token
    localStorage.removeItem('token');
    
    return {
      type: 'auth',
      message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      canRetry: false,
      shouldRedirect: '/login',
    };
  }

  // Validation error
  if (status === 422) {
    return {
      type: 'validation',
      message: data.message || 'Error de validación',
      errors: data.errors || {},
      canRetry: false,
    };
  }

  // Not found error
  if (status === 404) {
    return {
      type: 'notFound',
      message: data.message || 'Recurso no encontrado',
      canRetry: false,
    };
  }

  // Server error
  if (status >= 500) {
    return {
      type: 'server',
      message: 'Error del servidor. Por favor, intenta más tarde.',
      canRetry: true,
      retryCallback,
      maxRetries,
    };
  }

  // Generic error
  return {
    type: 'generic',
    message: data.message || 'Ha ocurrido un error inesperado',
    canRetry: false,
  };
};

/**
 * Retry failed API request
 */
export const retryApiRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
};

/**
 * Display user-friendly error message
 */
export const getErrorMessage = (error) => {
  const errorInfo = handleApiError(error);
  return errorInfo.message;
};

/**
 * Log error to monitoring service
 */
export const logError = (error, context = {}) => {
  if (import.meta.env.PROD) {
    // Placeholder for error logging service
    console.error('Error logged:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error('Error:', error, 'Context:', context);
  }
};
