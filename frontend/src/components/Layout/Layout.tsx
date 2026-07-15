import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'DB' },
  { to: '/clientes', label: 'Clientes', icon: 'CL' },
  { to: '/graficos', label: 'Graficos', icon: 'GR' },
  { to: '/lembretes', label: 'Lembretes', icon: 'LM' },
];

const LITE_MODE_STORAGE_KEY = 'agenda-despachante-lite-mode';
const DARK_MODE_STORAGE_KEY = 'agenda-despachante-dark-mode';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();
  const navItems = usuario?.conta?.papel === 'PROPRIETARIO'
    ? [...NAV_ITEMS, { to: '/equipe', label: 'Equipe', icon: 'EQ' }]
    : NAV_ITEMS;
  const [isLiteMode, setIsLiteMode] = useState(
    () => window.localStorage.getItem(LITE_MODE_STORAGE_KEY) === 'true',
  );
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('lite-mode', isLiteMode);
    window.localStorage.setItem(LITE_MODE_STORAGE_KEY, String(isLiteMode));
  }, [isLiteMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-100">
      <div className="ambient-backdrop" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-60 shrink-0 flex-col border-r border-white/10 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black tracking-tight text-slate-950 shadow-sm">
              AD
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">Agenda</p>
              <p className="text-xs text-slate-400">Despachante</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <span
                    className={`
                      flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black tracking-tight
                      ${isActive ? 'bg-slate-950 text-white' : 'bg-white/10 text-slate-300'}
                    `}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-xs font-bold text-cyan-200 ring-1 ring-cyan-300/25">
                {usuario?.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{usuario?.nome}</p>
                <p className="truncate text-xs text-slate-400">{usuario?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLiteMode((enabled) => !enabled)}
              aria-pressed={isLiteMode}
              className={`mb-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                isLiteMode
                  ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>Modo Lite</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {isLiteMode ? 'Ativo' : 'Desligado'}
              </span>
            </button>
            <button
              onClick={logout}
              className="w-full text-left text-xs font-medium text-slate-400 transition-colors hover:text-red-300"
            >
              Sair
            </button>
          </div>
        </aside>

        <main className="ml-60 flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/70 bg-white/80 px-8 py-5 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
            <h1 className="text-lg font-bold text-slate-950">
              {pathname === '/' && 'Dashboard - Kanban de Servicos'}
              {pathname === '/clientes' && 'Gestao de Clientes e Veiculos'}
              {pathname === '/graficos' && 'Graficos de Processos'}
              {pathname === '/lembretes' && 'Lembretes'}
              {pathname === '/equipe' && 'Equipe'}
              {pathname.includes('/historico') && 'Historico do Veiculo'}
            </h1>
            <button
              type="button"
              onClick={() => setIsDarkMode((enabled) => !enabled)}
              aria-pressed={isDarkMode}
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isDarkMode
                  ? 'bg-amber-300 text-slate-950 hover:bg-amber-200'
                  : 'bg-slate-950 text-white hover:bg-slate-800'
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {isDarkMode ? '☀' : '☾'}
              </span>
              {isDarkMode ? 'Modo claro' : 'Modo escuro'}
            </button>
          </header>

          <div className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
