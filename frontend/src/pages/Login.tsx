import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (modo === 'cadastro' && senha !== confirmarSenha) {
      setErro('As senhas nao conferem.');
      return;
    }

    setLoading(true);

    try {
      if (modo === 'login') {
        await login(email, senha);
      } else {
        await register(nome, email, senha);
      }

      navigate('/', { replace: true });
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : modo === 'login'
            ? 'Erro ao fazer login'
            : 'Erro ao criar conta',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4 text-3xl">
            🚗
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda Despachante</h1>
          <p className="text-gray-500 text-sm mt-1">Gestao de Servicos Veiculares</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro('');
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                modo === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('cadastro');
                setErro('');
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                modo === 'cadastro' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Criar conta
            </button>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {modo === 'login' ? 'Entrar na conta' : 'Criar nova conta'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {modo === 'login'
              ? 'Acesse para gerenciar clientes, veiculos e servicos.'
              : 'Seu cadastro faz login automaticamente ao terminar.'}
          </p>

          {erro && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {modo === 'cadastro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                autoFocus={modo === 'login'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>

            {modo === 'cadastro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading
                ? modo === 'login'
                  ? 'Entrando...'
                  : 'Criando conta...'
                : modo === 'login'
                  ? 'Entrar'
                  : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Usuario padrao para teste: admin@despachante.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};
