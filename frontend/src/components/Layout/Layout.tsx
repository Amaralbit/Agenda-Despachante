import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',         label: 'Dashboard',  icon: '📋' },
  { to: '/clientes', label: 'Clientes',   icon: '👥' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 text-base">
            🚗
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Agenda</p>
            <p className="text-gray-400 text-xs">Despachante</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? pathname === '/'
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuário + Logout */}
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
              {usuario?.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nome}</p>
              <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-gray-500 hover:text-red-600 font-medium text-left transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Barra de título da página */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
          <h1 className="text-lg font-bold text-gray-900">
            {pathname === '/'          && 'Dashboard — Kanban de Serviços'}
            {pathname === '/clientes'  && 'Gestão de Clientes e Veículos'}
            {pathname.includes('/historico') && 'Histórico do Veículo'}
          </h1>
        </header>

        <div className="flex-1 px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
