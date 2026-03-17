import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Get token from localStorage
const getStoredToken = () => {
  return localStorage.getItem('auth_token');
};

// Get user from localStorage
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Initial state
const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Clear old game session before registering
      localStorage.removeItem('game_session');
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { user, token } = response.data;
      
      console.log('Register response:', { user, token });
      
      // Store token and user in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Token saved to localStorage:', localStorage.getItem('auth_token'));
      
      return { user, token };
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(', ');
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(
        error.response?.data?.message || 'Error de conexión al servidor'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Clear old game session before logging in
      localStorage.removeItem('game_session');
      
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      const { user, token } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      if (error.response?.status === 429) {
        return rejectWithValue(
          error.response.data.errors?.[0] || 'Demasiados intentos. Por favor, espere.'
        );
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessage = Array.isArray(errors) ? errors.join(', ') : Object.values(errors).flat().join(', ');
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(
        error.response?.data?.message || 'Error de conexión al servidor'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      return null;
    } catch (error) {
      // Even if the API call fails, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      return rejectWithValue(
        error.response?.data?.message || 'Error al cerrar sesión'
      );
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No hay token de autenticación');
      }
      
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        const { user } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } else {
        return rejectWithValue(response.data.message || 'Error al obtener usuario');
      }
    } catch (error) {
      // If token is invalid, clear auth state
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Error de conexión al servidor'
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
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
    
    // Fetch user
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
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
