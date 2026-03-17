import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Async thunks
export const startGame = createAsyncThunk(
  'game/startGame',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/game/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const session = response.data.session;
      localStorage.setItem('game_session', JSON.stringify(session));
      
      return session;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al iniciar el juego'
      );
    }
  }
);

export const getSession = createAsyncThunk(
  'game/getSession',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      
      // Ensure token exists
      if (!token) {
        return rejectWithValue('No hay token de autenticación');
      }
      
      const response = await axios.get(
        `${API_URL}/game/session`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const session = response.data.session;
      localStorage.setItem('game_session', JSON.stringify(session));
      
      return {
        session,
        timeRemaining: response.data.time_remaining
      };
    } catch (error) {
      // Clear invalid session on error
      localStorage.removeItem('game_session');
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener sesión'
      );
    }
  }
);

export const syncSession = createAsyncThunk(
  'game/syncSession',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/game/sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data.time_remaining;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al sincronizar'
      );
    }
  }
);

export const completeGame = createAsyncThunk(
  'game/completeGame',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/game/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      localStorage.removeItem('game_session');
      
      return response.data.session;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al completar el juego'
      );
    }
  }
);

export const abandonGame = createAsyncThunk(
  'game/abandonGame',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/game/abandon`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      localStorage.removeItem('game_session');
      
      return response.data.session;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al abandonar el juego'
      );
    }
  }
);

export const getSessionProgress = createAsyncThunk(
  'game/getSessionProgress',
  async (sessionId, { rejectWithValue, getState }) => {
    if (!sessionId) {
      return rejectWithValue('Session ID is required');
    }
    
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No hay token de autenticación');
      }
      
      const response = await axios.get(
        `${API_URL}/puzzles/${sessionId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener progreso'
      );
    }
  }
);

export const getCurrentPuzzle = createAsyncThunk(
  'game/getCurrentPuzzle',
  async (sessionId, { rejectWithValue, getState }) => {
    // Validate sessionId
    if (!sessionId) {
      return rejectWithValue('Session ID is required');
    }
    
    try {
      const { token } = getState().auth;
      
      // Ensure token exists
      if (!token) {
        return rejectWithValue('No hay token de autenticación');
      }
      
      const response = await axios.get(
        `${API_URL}/puzzles/${sessionId}/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Check if all puzzles are completed
      if (response.data.session?.status === 'completed') {
        return {
          allCompleted: true,
          session: response.data.session
        };
      }
      
      return response.data;
    } catch (error) {
      // Check if error is because all puzzles are completed
      if (error.response?.status === 200 && error.response?.data?.session?.status === 'completed') {
        return {
          allCompleted: true,
          session: error.response.data.session
        };
      }
      
      // Clear invalid session on 404
      if (error.response?.status === 404) {
        localStorage.removeItem('game_session');
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener puzzle'
      );
    }
  }
);

export const submitPuzzleSolution = createAsyncThunk(
  'game/submitPuzzleSolution',
  async ({ puzzleId, solution, sessionId }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/puzzles/${puzzleId}/submit`,
        {
          solution,
          session_id: sessionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al enviar solución'
      );
    }
  }
);

export const getHint = createAsyncThunk(
  'game/getHint',
  async ({ puzzleId, level, sessionId }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(
        `${API_URL}/hints/puzzles/${puzzleId}/${level}?session_id=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener pista'
      );
    }
  }
);

// Initial state
const initialState = {
  session: null,
  timeRemaining: 1500,
  isActive: false,
  loading: false,
  error: null,
  currentPuzzle: null,
  puzzleLoading: false,
  completedPuzzles: 0,
  totalPuzzles: 10,
  hints: [],
};

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    recoverSession: (state) => {
      const storedSession = localStorage.getItem('game_session');
      if (storedSession) {
        state.session = JSON.parse(storedSession);
        state.isActive = true;
      }
    },
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    decrementTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    syncTimer: (state, action) => {
      state.timeRemaining = action.payload;
    },
    clearSession: (state) => {
      state.session = null;
      state.timeRemaining = 1500;
      state.isActive = false;
      state.currentPuzzle = null;
      state.completedPuzzles = 0;
      state.hints = [];
      localStorage.removeItem('game_session');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Start game
    builder
      .addCase(startGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.isActive = true;
        state.timeRemaining = 1500;
        state.completedPuzzles = 0;
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Get session
    builder
      .addCase(getSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.timeRemaining = action.payload.timeRemaining;
        state.isActive = true;
      })
      .addCase(getSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isActive = false;
      });
    
    // Sync session
    builder
      .addCase(syncSession.pending, (state) => {
        // No loading state for sync
      })
      .addCase(syncSession.fulfilled, (state, action) => {
        state.timeRemaining = action.payload;
      })
      .addCase(syncSession.rejected, (state) => {
        // Silent fail for sync
      });
    
    // Complete game
    builder
      .addCase(completeGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeGame.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.isActive = false;
      })
      .addCase(completeGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Abandon game
    builder
      .addCase(abandonGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(abandonGame.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.isActive = false;
      })
      .addCase(abandonGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Get session progress
    builder
      .addCase(getSessionProgress.pending, (state) => {
        // No loading state for progress
      })
      .addCase(getSessionProgress.fulfilled, (state, action) => {
        state.completedPuzzles = action.payload.completed_puzzles;
      })
      .addCase(getSessionProgress.rejected, (state) => {
        // Silent fail for progress
      });
    
    // Get current puzzle
    builder
      .addCase(getCurrentPuzzle.pending, (state) => {
        state.puzzleLoading = true;
        state.error = null;
      })
      .addCase(getCurrentPuzzle.fulfilled, (state, action) => {
        state.puzzleLoading = false;
        
        // Check if all puzzles are completed
        if (action.payload.allCompleted) {
          state.session = action.payload.session;
          state.currentPuzzle = null;
        } else {
          state.currentPuzzle = action.payload.puzzle;
        }
      })
      .addCase(getCurrentPuzzle.rejected, (state, action) => {
        state.puzzleLoading = false;
        state.error = action.payload;
      });
    
    // Submit puzzle solution
    builder
      .addCase(submitPuzzleSolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPuzzleSolution.fulfilled, (state, action) => {
        state.loading = false;
        // Check if solution is correct - handle both response formats
        const isCorrect = action.payload.data?.correct || action.payload.correct;
        if (isCorrect) {
          state.completedPuzzles += 1;
        }
      })
      .addCase(submitPuzzleSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Get hint
    builder
      .addCase(getHint.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHint.fulfilled, (state, action) => {
        state.loading = false;
        state.hints.push(action.payload.hint);
      })
      .addCase(getHint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { recoverSession, updateTimeRemaining, decrementTimer, syncTimer, clearSession, clearError } = gameSlice.actions;
export default gameSlice.reducer;
