import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Send, 
  Search, 
  Percent, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

export default function NewPartnershipInviteCard({ 
  availableStores = [], 
  onInviteSuccess, 
  getAuthHeaders 
}) {
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionRate, setCommissionRate] = useState(3.0);
  const [proposalNotes, setProposalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filtra apenas lojas sem parceria ativa ou pendente para novas conexões
  const unpartneredStores = useMemo(() => {
    return availableStores.filter(s => s.partnership_status === 'nenhuma' || !s.partnership_status);
  }, [availableStores]);

  const filteredStores = useMemo(() => {
    if (!searchTerm.trim()) return unpartneredStores.slice(0, 6);
    const term = searchTerm.toLowerCase();
    return unpartneredStores.filter(s => 
      s.name.toLowerCase().includes(term) || 
      (s.description && s.description.toLowerCase().includes(term))
    );
  }, [unpartneredStores, searchTerm]);

  const commissionPresets = [2.0, 3.0, 5.0, 7.5];

  const handleSendInvite = async () => {
    if (!selectedStore) {
      setFeedback({ type: 'error', text: 'Selecione uma loja para enviar o pedido de parceria.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/partnerships/invite', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiver_store_id: selectedStore.id,
          commission_rate: Number(commissionRate) || 3.0,
          notes: proposalNotes.trim() || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ 
          type: 'success', 
          text: `Convite enviado com sucesso para ${selectedStore.name}! Aguardando aprovação.` 
        });
        setSelectedStore(null);
        setProposalNotes('');
        setCommissionRate(3.0);
        setSearchTerm('');
        if (onInviteSuccess) {
          onInviteSuccess();
        }
      } else {
        setFeedback({ 
          type: 'error', 
          text: data.detail || 'Não foi possível enviar o convite de parceria.' 
        });
      }
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        text: 'Erro de conexão ao enviar o pedido de parceria.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedCommission = (100000 * (Number(commissionRate) / 100));

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              Conectar com Nova Loja Parceira
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                Rede B2B
              </span>
            </h3>
            <p className="text-slate-400 text-xs">
              Envie uma proposta personalizada de parceria para compartilhar estoque e expandir vendas.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium border ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
            : 'bg-red-500/10 text-red-300 border-red-500/30'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
          <button 
            type="button" 
            onClick={() => setFeedback(null)} 
            className="ml-auto text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Seleção de Loja */}
      <div className="space-y-4">
        {!selectedStore ? (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              1. Encontre a Concessionária ou Lojista
            </label>
            <div className="relative mb-2.5">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome da loja ou cidade..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grid de lojas disponíveis */}
            {filteredStores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredStores.map(store => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setSelectedStore(store);
                      setFeedback(null);
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-blue-600/15 border border-slate-700/80 hover:border-blue-500/50 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/80 group-hover:bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                      {store.name ? store.name.substring(0, 2).toUpperCase() : 'LJ'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-xs font-semibold truncate group-hover:text-blue-300">
                        {store.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {store.description || 'Lojista cadastrado'}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                {searchTerm 
                  ? `Nenhuma loja encontrada para "${searchTerm}".` 
                  : 'Nenhuma nova loja disponível no momento para conectar.'}
              </div>
            )}
          </div>
        ) : (
          /* Loja Selecionada */
          <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {selectedStore.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm truncate flex items-center gap-2">
                  {selectedStore.name}
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Loja Selecionada
                  </span>
                </div>
                <div className="text-xs text-slate-300 truncate">
                  {selectedStore.description || 'Concessionária Parceira'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStore(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shrink-0"
            >
              Trocar
            </button>
          </div>
        )}

        {/* Parâmetros da Proposta (Comissão e Notas) */}
        {selectedStore && (
          <div className="space-y-4 pt-2 border-t border-slate-700/60 animate-in fade-in duration-200">
            {/* Seletor de Comissão */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-400" />
                  2. Taxa de Comissão Proposta sobre o Repasse:
                </label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                  {commissionRate}%
                </span>
              </div>

              {/* Chips rápidos */}
              <div className="flex items-center gap-2 mb-2">
                {commissionPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCommissionRate(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      commissionRate === preset
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {preset}% {preset === 3.0 ? '(Padrão)' : ''}
                  </button>
                ))}
                <div className="flex-1 ml-2">
                  <input
                    type="range"
                    min="1.0"
                    max="12.0"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span>💡 Estimativa em venda de R$ 100.000:</span>
                <span className="font-semibold text-emerald-400">
                  R$ {estimatedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Mensagem da Proposta */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                3. Mensagem / Termos da Proposta (Opcional):
              </label>
              <textarea
                value={proposalNotes}
                onChange={(e) => setProposalNotes(e.target.value)}
                placeholder="Ex: Gostaríamos de compartilhar nosso estoque de SUVs e seminovos para atender demandas recíprocas com comissão acordada..."
                rows={2}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Botão de Envio */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando Proposta...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Solicitação de Parceria</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
