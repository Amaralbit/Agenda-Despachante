import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const temaSalvo = window.localStorage.getItem('agenda-despachante-dark-mode');
const usarTemaEscuro = temaSalvo === null
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : temaSalvo === 'true';
document.documentElement.classList.toggle('dark-mode', usarTemaEscuro);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
