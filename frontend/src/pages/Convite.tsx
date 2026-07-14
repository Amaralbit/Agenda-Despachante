import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { contaApi } from '../api/conta.api';
import { useAuth } from '../contexts/AuthContext';

export function Convite() {
  const { token = '' } = useParams();
  const { isAuthenticated, refreshUsuario } = useAuth();
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    contaApi.aceitarConvite(token)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Não foi possível aceitar o convite.');
        await refreshUsuario();
        navigate('/', { replace: true });
      })
      .catch((err: Error) => setMensagem(err.message));
  }, [isAuthenticated, navigate, refreshUsuario, token]);

  if (!isAuthenticated) return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="glass-panel max-w-md rounded-xl p-8 text-center"><h1 className="text-xl font-bold">Você foi convidado para uma equipe</h1><p className="mt-2 text-sm text-slate-500">Entre ou crie sua conta usando o mesmo e-mail que recebeu o convite.</p><Link to={`/login?convite=${token}`} className="mt-6 inline-block rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Entrar ou criar conta</Link></div></div>;
  return <div className="flex min-h-screen items-center justify-center bg-slate-100"><p className="text-sm text-slate-600">{mensagem || 'Entrando na equipe...'}</p></div>;
}
