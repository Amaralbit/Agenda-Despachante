import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  conta?: { id: string; nome: string; papel: 'PROPRIETARIO' | 'MEMBRO' } | null;
}

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsuario = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usuarioAtual = await handleResponse<Usuario>(res);
    setUsuario(usuarioAtual);
    localStorage.setItem('auth_usuario', JSON.stringify(usuarioAtual));
  }, []);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem('auth_usuario');

    if (token && stored) {
      try {
        setUsuario(JSON.parse(stored));
        refreshUsuario().catch(() => removeToken());
      } catch {
        removeToken();
      }
    }
    setIsLoading(false);
  }, [refreshUsuario]);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await handleResponse<{ token: string; usuario: Usuario }>(res);

    setToken(data.token);
    await refreshUsuario();
  }, [refreshUsuario]);

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
    <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, isLoading, login, register, logout, refreshUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
