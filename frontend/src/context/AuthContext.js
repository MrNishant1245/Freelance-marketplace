import React, { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';
import { authAPI } from '../api';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS': return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'AUTH_ERROR':   return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':       return { ...initialState, isLoading: false };
    case 'UPDATE_USER':  return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':  return { ...state, isLoading: action.payload };
    default:             return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const raw = localStorage.getItem('fm_dark_mode');
      return raw ? JSON.parse(raw) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fm_dark_mode', JSON.stringify(isDarkMode));
    } catch (e) {}
    const root = document.documentElement || document.body;
    if (isDarkMode) root.classList.add('dark-theme');
    else root.classList.remove('dark-theme');
  }, [isDarkMode]);

  const toggleDarkMode = useCallback((val) => {
    if (typeof val === 'boolean') setIsDarkMode(val);
    else setIsDarkMode(prev => !prev);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccess();
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user });
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          tokenStorage.clear();
          dispatch({ type: 'LOGOUT' });
        } else {
          console.warn('Auth check failed (non-401):', status, '— keeping session');
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const timeout = setTimeout(() => dispatch({ type: 'SET_LOADING', payload: false }), 8000);
    initAuth().finally(() => clearTimeout(timeout));
  }, []);

  const register = useCallback(async (formData) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authAPI.register(formData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return data;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message || 'Registration failed' });
      throw error;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authAPI.login(credentials);
      const { user, accessToken, refreshToken } = data.data;
      tokenStorage.setAccess(accessToken);
      tokenStorage.setRefresh(refreshToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      return data;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout(tokenStorage.getRefresh());
    } catch {}
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, updateUser, isDarkMode, setIsDarkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
