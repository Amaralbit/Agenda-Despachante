import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem('auth_usuario');

    if (token && stored) {
      try {
        setUsuario(JSON.parse(stored));
      } catch {
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await handleResponse<{ token: string; usuario: Usuario }>(res);

    setToken(data.token);
    setUsuario(data.usuario);
    localStorage.setItem('auth_usuario', JSON.stringify(data.usuario));
  }, []);

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    await handleResponse(res);
    await login(email, senha);
  }, [login]);

  const logout = useCallback(() => {
    removeToken();
    setUsuario(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
