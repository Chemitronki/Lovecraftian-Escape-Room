import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../lib/supabaseAuth';

// Get user from localStorage
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const initialState = {
  user: getStoredUser(),
  token: null,
  isAuthenticated: !!getStoredUser(),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      localStorage.removeItem('game_session');
      const data = await authService.register(username, email, password);
      const user = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || username,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al registrarse');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      localStorage.removeItem('game_session');
      const data = await authService.login(email, password);
      const user = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || data.user.email,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al iniciar sesión');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('game_session');
      return null;
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('game_session');
      return rejectWithValue(error.message || 'Error al cerrar sesión');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const supabaseUser = await authService.getUser();
      if (!supabaseUser) return rejectWithValue('No hay sesión activa');
      const user = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        username: supabaseUser.user_metadata?.username || supabaseUser.email,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      localStorage.removeItem('user');
      return rejectWithValue(error.message || 'Error al obtener usuario');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('game_session');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder
      .addCase(logout.pending, (state) => { state.loading = true; })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });

    builder
      .addCase(fetchUser.pending, (state) => { state.loading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
