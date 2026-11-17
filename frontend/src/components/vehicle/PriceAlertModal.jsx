import React, { useEffect, useId, useRef, useState } from 'react';
import { Bell, X, CheckCircle2, MessageCircle, Mail } from 'lucide-react';
import { api, isDemoModeEnabled } from '../../services/apiClient';
import { useDialog } from '../../utils/useDialog';
import { demoOwner, formatBrl, previewPriceAlert, readDemoTools, saveDemoAlert, vehicleName } from '../../utils/demoTools';
import { parseVehicleNumber } from '../../utils/vehicleNumbers';

function PriceAlertContent({ onClose, car }) {
  const demo = isDemoModeEnabled();
  const id = useId();
  const ref = useDialog(true, onClose);
  const request = useRef(null);
  const price = parseVehicleNumber(car.price);
  const [initial] = useState(() => {
    try { return { alert: demo ? readDemoTools().alerts.find(item => String(item.car_id) === String(car.id)) : null }; }
    catch (error) { return { error: error.message }; }
  });
  const [targetPrice, setTargetPrice] = useState(initial.alert?.target_price || Math.round(price * 0.95) || '');
  const [channel, setChannel] = useState(initial.alert?.contact_type || 'whatsapp');
  const [contactValue, setContactValue] = useState(initial.alert?.contact_value || '');
  const [notifyBelowFipe, setNotifyBelowFipe] = useState(initial.alert?.notify_below_fipe ?? false);
  const [error, setError] = useState(initial.error || '');
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewPrice, setPreviewPrice] = useState('');
  const [preview, setPreview] = useState(undefined);
  useEffect(() => () => request.current?.abort(), []);

  const submit = async event => {
    event.preventDefault();
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setError('');
    setBusy(true);
    const payload = { car_id: String(car.id), car_name: vehicleName(car), current_price: price, target_price: Number(targetPrice), contact_type: channel, contact_value: contactValue.trim(), notify_below_fipe: notifyBelowFipe };
    try {
      if (!Number.isFinite(payload.target_price) || payload.target_price <= 0 || !payload.contact_value) throw new Error('Confira o valor-alvo e o contato.');
      let alert;
      if (demo) alert = saveDemoAlert(payload);
      else {
        const result = await api.post('/api/alerts', payload, { signal: controller.signal });
        if (result?.status !== 'success' || !result.alerta?.id) throw new Error('O cadastro não foi confirmado. Tente novamente.');
        alert = result.alerta;
      }
      if (controller.signal.aborted) return;
      setSaved(alert);
      setPreviewPrice(alert.target_price);
      setPreview(undefined);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message || 'Não foi possível registrar seu interesse.');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
      request.current = null;
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1} className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white outline-none">
      <header className="flex items-start gap-3 mb-4"><Bell aria-hidden="true" className="w-6 h-6 text-cyan-400 shrink-0" /><div className="flex-1 min-w-0"><h2 id={`${id}-title`} className="font-bold text-lg">Radar de oportunidades</h2><p className="text-xs text-cyan-300 mt-1">{demo ? 'Exemplo interativo' : 'Registro de interesse'}</p></div><button type="button" aria-label="Fechar radar de oportunidades" onClick={onClose} className="min-w-11 min-h-11 flex items-center justify-center rounded-xl hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><X aria-hidden="true" className="w-5 h-5" /></button></header>
      <p id={`${id}-description`} className="text-sm text-slate-300 mb-5">Defina seu valor para <strong>{vehicleName(car)}</strong>. Depois de salvar, experimente uma queda de preço e veja o aviso aqui. A amostra não envia mensagens externas.</p>
      {error && <p role="alert" className="text-sm text-rose-300 mb-4">{error}</p>}
      {!saved ? <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-400">Preço anunciado: <strong className="text-white">{formatBrl(price)}</strong></p>
        <label htmlFor={`${id}-target`} className="block text-sm text-slate-300">Valor-alvo (R$)<input data-dialog-autofocus id={`${id}-target`} type="number" min="0.01" step="0.01" required value={targetPrice} onChange={event => setTargetPrice(event.target.value)} className="block w-full mt-1.5 rounded-xl bg-slate-950 border border-slate-600 px-3 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400" /></label>
        <fieldset><legend className="text-sm text-slate-300 mb-2">Canal do exemplo</legend><div className="grid grid-cols-2 gap-2">{[['whatsapp', 'WhatsApp', MessageCircle], ['email', 'E-mail', Mail]].map(([value, label, Icon]) => <button key={value} type="button" aria-pressed={channel === value} onClick={() => { setChannel(value); setContactValue(''); }} className={`min-h-11 rounded-xl border px-3 flex items-center justify-center gap-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${channel === value ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200' : 'border-slate-600 text-slate-300'}`}><Icon aria-hidden="true" className="w-4 h-4" />{label}</button>)}</div></fieldset>
        <label htmlFor={`${id}-contact`} className="block text-sm text-slate-300">{channel === 'email' ? 'E-mail para o exemplo' : 'WhatsApp com DDD para o exemplo'}<input id={`${id}-contact`} type={channel === 'email' ? 'email' : 'tel'} maxLength={320} required value={contactValue} onChange={event => setContactValue(event.target.value)} placeholder={channel === 'email' ? 'cliente@exemplo.invalid' : '(11) 99999-0000'} className="block w-full mt-1.5 rounded-xl bg-slate-950 border border-slate-600 px-3 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400" /></label>
        <label className="flex items-start gap-2 text-sm text-slate-300"><input type="checkbox" checked={notifyBelowFipe} onChange={event => setNotifyBelowFipe(event.target.checked)} className="mt-1" />Incluir interesse em ofertas abaixo da referência de preço cadastrada.</label>
        <button type="submit" disabled={busy} className="w-full min-h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-3 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{busy ? 'Salvando interesse…' : 'Salvar interesse'}</button>
      </form> : <div className="space-y-4">
        <p role="status" className="flex items-center gap-2 text-emerald-300 font-semibold"><CheckCircle2 aria-hidden="true" className="w-5 h-5" />Interesse registrado</p>
        <p className="text-sm text-slate-300">Valor-alvo: <strong>{formatBrl(saved.target_price)}</strong>. {demo ? 'O exemplo foi salvo neste navegador.' : 'O cadastro foi confirmado.'}</p>
        <label htmlFor={`${id}-sample-price`} className="block text-sm text-slate-300">Preço para testar o aviso (R$)<input id={`${id}-sample-price`} type="number" min="0.01" step="0.01" value={previewPrice} onChange={event => { setPreviewPrice(event.target.value); setPreview(undefined); }} className="block mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400" /></label>
        <button type="button" disabled={!Number.isFinite(Number(previewPrice)) || Number(previewPrice) <= 0} onClick={() => setPreview(previewPriceAlert(saved, Number(previewPrice)))} className="min-h-11 w-full rounded-xl bg-cyan-400 text-slate-950 font-semibold p-3 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Simular queda de preço</button>
        {preview !== undefined && <div role="status" className="rounded-xl border border-cyan-700 bg-cyan-950/30 p-4 text-sm"><p className="font-semibold text-cyan-200">{preview?.title || 'Preço acima do alvo'}</p><p className="text-slate-200 mt-2">{preview?.message || 'O valor ainda não atingiu o alvo. Experimente um preço menor.'}</p><p className="text-xs text-slate-400 mt-2">Prévia no site · nenhum envio externo.</p></div>}
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSaved(null)} className="min-h-11 flex-1 rounded-xl border border-slate-600 p-3 text-sm">Ajustar interesse</button><button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-xl bg-slate-800 p-3 text-sm">Concluir</button></div>
      </div>}
    </section>
  </div>;
}

export default function PriceAlertModal({ isOpen, onClose, car }) {
  return isOpen && car ? <PriceAlertContent key={`${demoOwner()}:${car.id}`} onClose={onClose} car={car} /> : null;
}
