import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gameService } from '../../lib/supabaseGame';

export const startGame = createAsyncThunk(
  'game/startGame',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;
      if (!user?.id) return rejectWithValue('No hay usuario autenticado');
      const session = await gameService.startGame(user.id);
      localStorage.setItem('game_session', JSON.stringify(session));
      return session;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al iniciar el juego');
    }
  }
);

export const getSession = createAsyncThunk(
  'game/getSession',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;
      if (!user?.id) return rejectWithValue('No hay usuario autenticado');
      const session = await gameService.getActiveSession(user.id);
      if (!session) return rejectWithValue('No hay sesión activa');
      localStorage.setItem('game_session', JSON.stringify(session));
      const sync = await gameService.syncSession(session.id);
      return { session, timeRemaining: sync.time_remaining };
    } catch (error) {
      localStorage.removeItem('game_session');
      return rejectWithValue(error.message || 'Error al obtener sesión');
    }
  }
);

export const syncSession = createAsyncThunk(
  'game/syncSession',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { session } = getState().game;
      if (!session?.id) return rejectWithValue('No hay sesión');
      const result = await gameService.syncSession(session.id);
      return result.time_remaining;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al sincronizar');
    }
  }
);

export const completeGame = createAsyncThunk(
  'game/completeGame',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { session } = getState().game;
      const { user } = getState().auth;
      if (!session?.id) return rejectWithValue('No hay sesión');
      const result = await gameService.completeGame(session.id, user.id);
      localStorage.removeItem('game_session');
      return { ...session, status: 'completed', completion_time: result.completion_time };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al completar el juego');
    }
  }
);

export const abandonGame = createAsyncThunk(
  'game/abandonGame',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { session } = getState().game;
      if (!session?.id) return rejectWithValue('No hay sesión');
      await gameService.abandonGame(session.id);
      localStorage.removeItem('game_session');
      return { ...session, status: 'abandoned' };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al abandonar el juego');
    }
  }
);

export const getSessionProgress = createAsyncThunk(
  'game/getSessionProgress',
  async (sessionId, { rejectWithValue }) => {
    if (!sessionId) return rejectWithValue('Session ID requerido');
    try {
      const result = await gameService.getSessionProgress(sessionId);
      return { completed_puzzles: result.completed, total_puzzles: result.total };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener progreso');
    }
  }
);

export const getCurrentPuzzle = createAsyncThunk(
  'game/getCurrentPuzzle',
  async (sessionId, { rejectWithValue }) => {
    if (!sessionId) return rejectWithValue('Session ID requerido');
    try {
      const puzzle = await gameService.getCurrentPuzzle(sessionId);
      if (!puzzle) return { allCompleted: true };
      return { puzzle };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener puzzle');
    }
  }
);

export const submitPuzzleSolution = createAsyncThunk(
  'game/submitPuzzleSolution',
  async ({ puzzleId, solution, sessionId }, { rejectWithValue }) => {
    try {
      const result = await gameService.submitSolution(sessionId, puzzleId, solution);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al enviar solución');
    }
  }
);

export const getHint = createAsyncThunk(
  'game/getHint',
  async ({ puzzleId, level, sessionId }, { rejectWithValue }) => {
    try {
      const hint = await gameService.getHint(puzzleId, level);
      await gameService.useHint(sessionId, puzzleId);
      return { hint };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener pista');
    }
  }
);

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
    updateTimeRemaining: (state, action) => { state.timeRemaining = action.payload; },
    decrementTimer: (state) => { if (state.timeRemaining > 0) state.timeRemaining -= 1; },
    syncTimer: (state, action) => { state.timeRemaining = action.payload; },
    clearSession: (state) => {
      state.session = null;
      state.timeRemaining = 1500;
      state.isActive = false;
      state.currentPuzzle = null;
      state.completedPuzzles = 0;
      state.hints = [];
      localStorage.removeItem('game_session');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startGame.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(startGame.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.isActive = true;
        state.timeRemaining = 1500;
        state.completedPuzzles = 0;
      })
      .addCase(startGame.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(getSession.pending, (state) => { state.loading = true; state.error = null; })
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

    builder
      .addCase(syncSession.fulfilled, (state, action) => { state.timeRemaining = action.payload; });

    builder
      .addCase(completeGame.pending, (state) => { state.loading = true; })
      .addCase(completeGame.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.isActive = false;
      })
      .addCase(completeGame.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(abandonGame.pending, (state) => { state.loading = true; })
      .addCase(abandonGame.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.isActive = false;
      })
      .addCase(abandonGame.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(getSessionProgress.fulfilled, (state, action) => {
        state.completedPuzzles = action.payload.completed_puzzles;
      });

    builder
      .addCase(getCurrentPuzzle.pending, (state) => { state.puzzleLoading = true; state.error = null; })
      .addCase(getCurrentPuzzle.fulfilled, (state, action) => {
        state.puzzleLoading = false;
        if (action.payload.allCompleted) {
          state.currentPuzzle = null;
        } else {
          state.currentPuzzle = action.payload.puzzle;
        }
      })
      .addCase(getCurrentPuzzle.rejected, (state, action) => { state.puzzleLoading = false; state.error = action.payload; });

    builder
      .addCase(submitPuzzleSolution.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitPuzzleSolution.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.correct) state.completedPuzzles += 1;
      })
      .addCase(submitPuzzleSolution.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(getHint.pending, (state) => { state.loading = true; })
      .addCase(getHint.fulfilled, (state, action) => {
        state.loading = false;
        state.hints.push(action.payload.hint);
      })
      .addCase(getHint.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { recoverSession, updateTimeRemaining, decrementTimer, syncTimer, clearSession, clearError } = gameSlice.actions;
export default gameSlice.reducer;
