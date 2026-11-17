import React, { useEffect, useId, useRef, useState } from 'react';
import { X, Globe2, CheckCircle2, Download } from 'lucide-react';
import { api, isDemoModeEnabled } from '../../services/apiClient';
import { useDialog } from '../../utils/useDialog';
import { demoOwner, buildVehicleFeed, demoChannels, formatBrl, readDemoTools, simulatePublication, vehicleName } from '../../utils/demoTools';

function MultichannelContent({ onClose, car }) {
  const id = useId();
  const ref = useDialog(true, onClose);
  const request = useRef(null);
  const [selected, setSelected] = useState(demoChannels.map(channel => channel.id));
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const xml = buildVehicleFeed([car]);
  useEffect(() => {
    try { setHistory(readDemoTools().publications.filter(item => item.car_id === String(car.id))); }
    catch (failure) { setError(failure.message); }
    return () => request.current?.abort();
  }, [car.id]);

  const run = async () => {
    if (request.current || !selected.length) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    try {
      let publication;
      if (isDemoModeEnabled()) {
        publication = simulatePublication(car, selected);
        setHistory(readDemoTools().publications.filter(item => item.car_id === String(car.id)));
      } else {
        const response = await api.post('/api/integrations/sync', { car_id: String(car.id), car_name: vehicleName(car), channels: selected }, { signal: controller.signal });
        if (response?.status !== 'success' || !response.protocolo || response.envio_externo !== false) throw new Error('A simulação não foi confirmada. Tente novamente.');
        publication = { id: response.protocolo, channels: response.canais_sincronizados.map(channel => channel.canal_id) };
      }
      if (!controller.signal.aborted) setResult(publication);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message || 'Não foi possível preparar a amostra.');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
      request.current = null;
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'catalogo-demonstracao.xml';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7 shadow-2xl text-white outline-none">
      <header className="flex items-start gap-3 mb-4"><Globe2 aria-hidden="true" className="w-6 h-6 text-cyan-300 shrink-0" /><div className="flex-1 min-w-0"><h2 id={`${id}-title`} className="text-lg font-bold">Publicação multicanal</h2><p className="text-xs text-cyan-300 mt-1">Exemplo interativo</p></div><button type="button" onClick={onClose} aria-label="Fechar publicação multicanal" className="min-w-11 min-h-11 flex items-center justify-center rounded-xl hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><X aria-hidden="true" className="w-5 h-5" /></button></header>
      <p id={`${id}-description`} className="text-sm text-slate-300 mb-4">Escolha os canais e veja como este anúncio seria preparado. A amostra fica no site, sem enviar conteúdo aos portais.</p>
      <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 mb-4"><p className="font-semibold break-words">{vehicleName(car)}</p><p className="text-sm text-cyan-300 mt-1">{formatBrl(car.price)} · {car.year || 'Ano não informado'}</p></div>
      <fieldset disabled={busy} className="space-y-2"><legend className="text-sm text-slate-300 mb-2">Canais para demonstração</legend>{demoChannels.map(channel => <label key={channel.id} className="flex items-center gap-3 min-h-12 rounded-xl border border-slate-600 bg-slate-950 p-3 cursor-pointer"><input type="checkbox" checked={selected.includes(channel.id)} onChange={event => { setSelected(current => event.target.checked ? [...current, channel.id] : current.filter(value => value !== channel.id)); setResult(null); }} className="w-4 h-4 accent-cyan-400" /><span className="flex-1 text-sm">{channel.name}</span><span className="text-xs text-slate-400">{result?.channels.includes(channel.id) ? 'Amostra preparada' : 'Exemplo'}</span></label>)}</fieldset>
      {error && <p role="alert" className="text-sm text-rose-300 mt-3">{error}</p>}
      <button type="button" onClick={run} disabled={busy || !selected.length} className="min-h-11 w-full mt-4 p-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{busy ? 'Preparando amostra…' : 'Simular publicação'}</button>
      {result && <div role="status" className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950/30 p-4"><p className="flex gap-2 items-center text-sm font-semibold text-emerald-200"><CheckCircle2 aria-hidden="true" className="w-4 h-4" />Amostra preparada em {result.channels.length} canal(is)</p><p className="text-xs text-slate-300 mt-2 break-all">Referência do exemplo: {result.id}</p><p className="text-xs text-slate-400 mt-2">Nenhum anúncio foi publicado fora do Automatch.</p></div>}
      <details className="mt-4 rounded-xl border border-slate-700 p-3"><summary className="cursor-pointer text-sm text-slate-200 min-h-8">Dados do anúncio em XML</summary><pre className="mt-3 overflow-auto max-h-48 text-xs text-slate-300 whitespace-pre-wrap break-all">{xml}</pre><button type="button" onClick={download} className="min-h-11 mt-3 flex items-center gap-2 rounded-lg bg-slate-800 px-3 text-sm"><Download aria-hidden="true" className="w-4 h-4" />Baixar exemplo XML</button></details>
      {history.length > 0 && <details className="mt-3 rounded-xl border border-slate-700 p-3"><summary className="cursor-pointer text-sm min-h-8">Histórico desta demonstração ({history.length})</summary><ul className="mt-2 space-y-2 text-xs text-slate-300">{history.slice(0, 5).map(item => <li key={item.id} className="break-all">{new Date(item.created_at).toLocaleString('pt-BR')} · {item.channels.length} canal(is) · {item.id}</li>)}</ul></details>}
    </section>
  </div>;
}

export default function MultichannelSyncModal({ isOpen, onClose, car }) {
  return isOpen && car ? <MultichannelContent key={`${demoOwner()}:${car.id}`} onClose={onClose} car={car} /> : null;
}
