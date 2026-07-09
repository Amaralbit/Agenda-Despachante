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

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-200/50 placeholder-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-4">
      <div className="ambient-backdrop" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-lg font-black tracking-tight text-white shadow-xl shadow-slate-950/20">
            AD
          </div>
          <h1 className="text-2xl font-black text-slate-950">Agenda Despachante</h1>
          <p className="mt-1 text-sm text-slate-500">Gestao de Servicos Veiculares</p>
        </div>

        <div className="glass-panel rounded-lg p-8">
          <div className="mb-6 flex rounded-lg border border-white/80 bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro('');
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                modo === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
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
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                modo === 'cadastro' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Criar conta
            </button>
          </div>

          <h2 className="mb-2 text-lg font-bold text-slate-950">
            {modo === 'login' ? 'Entrar na conta' : 'Criar nova conta'}
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            {modo === 'login'
              ? 'Acesse para gerenciar clientes, veiculos e servicos.'
              : 'Seu cadastro faz login automaticamente ao terminar.'}
          </p>

          {erro && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {modo === 'cadastro' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                required
                autoFocus={modo === 'login'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className={inputClass}
              />
            </div>

            {modo === 'cadastro' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar senha</label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita sua senha"
                  className={inputClass}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-slate-950 py-2.5 font-semibold text-white shadow-lg shadow-slate-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:translate-y-0 disabled:bg-slate-400"
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

          <p className="mt-6 text-center text-xs text-slate-400">
            Usuario padrao para teste: admin@despachante.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};
