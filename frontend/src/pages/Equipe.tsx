import { FormEvent, useEffect, useState } from 'react';
import { contaApi, Equipe as EquipeData } from '../api/conta.api';

export function Equipe() {
  const [equipe, setEquipe] = useState<EquipeData | null>(null);
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [linkConvite, setLinkConvite] = useState('');

  const carregar = () => contaApi.equipe().then(setEquipe).catch((err: Error) => setErro(err.message));
  useEffect(() => { carregar(); }, []);

  async function convidar(event: FormEvent) {
    event.preventDefault();
    setErro(''); setSucesso('');
    try {
      const convite = await contaApi.criarConvite(email);
      const link = `${window.location.origin}/convite/${convite.token}`;
      await navigator.clipboard?.writeText(link).catch(() => undefined);
      setLinkConvite(link);
      setSucesso(`Convite criado para ${convite.email}. Envie este link à pessoa.`);
      setEmail('');
      carregar();
    } catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível criar o convite.'); }
  }

  async function cancelar(id: string) {
    await contaApi.cancelarConvite(id);
    carregar();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="glass-panel rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-950">Equipe {equipe ? `— ${equipe.nome}` : ''}</h2>
        <p className="mt-1 text-sm text-slate-500">Cada pessoa usa seu próprio e-mail e senha, mas trabalha nos mesmos processos, clientes e serviços.</p>
        <form onSubmit={convidar} className="mt-5 flex gap-3">
          <input className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email do funcionário" />
          <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Gerar convite</button>
        </form>
        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
        {sucesso && <p className="mt-3 text-sm text-emerald-700">{sucesso}</p>}
        {linkConvite && <input readOnly value={linkConvite} onFocus={(e) => e.currentTarget.select()} className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" aria-label="Link do convite" />}
      </section>

      <section className="glass-panel rounded-xl p-6">
        <h3 className="font-bold text-slate-950">Pessoas na equipe</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {equipe?.membros.map((membro) => (
            <div key={membro.id} className="flex items-center justify-between py-3 text-sm">
              <div><p className="font-medium text-slate-800">{membro.usuario.nome}</p><p className="text-slate-500">{membro.usuario.email}</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{membro.papel === 'PROPRIETARIO' ? 'Proprietário' : 'Funcionário'}</span>
            </div>
          ))}
        </div>
      </section>

      {!!equipe?.convites.length && <section className="glass-panel rounded-xl p-6">
        <h3 className="font-bold text-slate-950">Convites pendentes</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {equipe.convites.map((convite) => (
            <div key={convite.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div><p className="font-medium text-slate-800">{convite.email}</p><p className="text-slate-500">Expira em {new Date(convite.expiraEm).toLocaleDateString('pt-BR')}</p></div>
              <button onClick={() => cancelar(convite.id)} className="text-xs font-semibold text-red-600">Cancelar</button>
            </div>
          ))}
        </div>
      </section>}
    </div>
  );
}
