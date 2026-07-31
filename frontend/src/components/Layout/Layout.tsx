import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Visão geral', shortLabel: 'Início', icon: 'VG' },
  { to: '/clientes', label: 'Clientes', shortLabel: 'Clientes', icon: 'CL' },
  { to: '/graficos', label: 'Desempenho', shortLabel: 'Gráficos', icon: 'DS' },
  { to: '/lembretes', label: 'Lembretes', shortLabel: 'Lembretes', icon: 'LM' },
  { to: '/emplacamento', label: 'Emplacamento', shortLabel: 'Emplacar', icon: 'EP' },
];

const PAGE_META: Record<string, { kicker: string; title: string }> = {
  '/': { kicker: 'Operação', title: 'Visão geral dos serviços' },
  '/clientes': { kicker: 'Relacionamento', title: 'Clientes e veículos' },
  '/graficos': { kicker: 'Inteligência', title: 'Desempenho dos processos' },
  '/lembretes': { kicker: 'Organização', title: 'Lembretes da equipe' },
  '/emplacamento': { kicker: 'Operação', title: 'Emplacamento' },
  '/equipe': { kicker: 'Administração', title: 'Equipe e acessos' },
};

const LITE_MODE_STORAGE_KEY = 'agenda-despachante-lite-mode';
const DARK_MODE_STORAGE_KEY = 'agenda-despachante-dark-mode';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();
  const navItems = usuario?.conta?.papel === 'PROPRIETARIO'
    ? [...NAV_ITEMS, { to: '/equipe', label: 'Equipe', shortLabel: 'Equipe', icon: 'EQ' }]
    : NAV_ITEMS;
  const [isLiteMode, setIsLiteMode] = useState(
    () => window.localStorage.getItem(LITE_MODE_STORAGE_KEY) === 'true',
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const salvo = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
    return salvo === null ? window.matchMedia('(prefers-color-scheme: dark)').matches : salvo === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('lite-mode', isLiteMode);
    window.localStorage.setItem(LITE_MODE_STORAGE_KEY, String(isLiteMode));
  }, [isLiteMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  const activePath = pathname === '/emplacamentos-mobile' ? '/emplacamento' : pathname;
  const pageMeta = pathname.includes('/historico')
    ? { kicker: 'Veículos', title: 'Histórico do veículo' }
    : PAGE_META[activePath] ?? PAGE_META['/'];

  function isActive(to: string) {
    return to === '/' ? activePath === '/' : activePath.startsWith(to);
  }

  return (
    <div className="app-shell">
      <div className="ambient-backdrop" />

      <aside className="app-sidebar">
        <div className="border-b border-white/10 px-5 py-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Ir para a visão geral">
            <div className="brand-mark">AD</div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-white">Agenda Despachante</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Gestão veicular</p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5" aria-label="Navegação principal">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Menu principal</p>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={isActive(item.to) ? 'nav-link nav-link-active' : 'nav-link'}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
            <div className="user-avatar">{usuario?.nome.charAt(0).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{usuario?.nome}</p>
              <p className="truncate text-xs text-slate-500">{usuario?.conta?.nome ?? usuario?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setIsLiteMode((value) => !value)} className="sidebar-control" aria-pressed={isLiteMode}>
              {isLiteMode ? 'Lite ativo' : 'Modo lite'}
            </button>
            <button type="button" onClick={logout} className="sidebar-control hover:text-rose-300">Sair</button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 min-h-screen min-w-0 flex-1 lg:ml-64">
        <header className="app-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="brand-mark h-9 w-9 lg:hidden" aria-label="Ir para a visão geral">AD</Link>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">{pageMeta.kicker}</p>
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">{pageMeta.title}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDarkMode((value) => !value)}
            aria-pressed={isDarkMode}
            aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="theme-toggle"
          >
            <span className="theme-toggle-indicator" aria-hidden="true">{isDarkMode ? '☀' : '☾'}</span>
            <span className="hidden sm:inline">{isDarkMode ? 'Tema claro' : 'Tema escuro'}</span>
          </button>
        </header>

        <div className="min-w-0 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</div>
      </main>

      <nav className="mobile-nav scrollbar-thin" aria-label="Navegação principal móvel">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className={isActive(item.to) ? 'mobile-nav-link mobile-nav-link-active' : 'mobile-nav-link'}>
            <span className="text-[10px] font-black">{item.icon}</span>
            <span>{item.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
