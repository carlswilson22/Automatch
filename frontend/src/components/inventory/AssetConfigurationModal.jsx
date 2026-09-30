import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Trash2, 
  DollarSign, 
  Store, 
  ShieldCheck, 
  FileText, 
  Eye, 
  Users, 
  AlertCircle, 
  CheckCircle2,
  Sliders,
  Car,
  Tag,
  Gauge,
  Calendar,
  Sparkles
} from 'lucide-react';
import { getVehicleImageUrl, handleVehicleImageError } from '../../utils/imageHelper';

export default function AssetConfigurationModal({
  isOpen,
  onClose,
  asset,
  onSave,
  onDelete,
  stores = []
}) {
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'details' | 'visibility'
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Bloqueio estrito de rolagem da tela de fundo ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (asset) {
      setFormData({
        id: asset.id,
        storeId: asset.storeId || 'store-1',
        brand: asset.brand || '',
        model: asset.model || '',
        plate: asset.plate || '',
        sale_value: asset.sale_value || 0,
        floor_price: asset.floor_price || Math.round((asset.sale_value || 0) * 0.92),
        financial_status: asset.financial_status || 'paid',
        operational_status: asset.operational_status || 'available',
        year: asset.year || '2023/2024',
        mileage: asset.mileage || 20000,
        color: asset.color || 'Prata',
        fuel: asset.fuel || 'Flex',
        visible_showcase: asset.visible_showcase !== false,
        visible_b2b: asset.visible_b2b !== false,
        notes: asset.notes || '',
        image: asset.image || asset.imagem || '/images/FotoGolfGTI.jpeg'
      });
      setIsConfirmingDelete(false);
      setHasSaved(false);
      setActiveTab('pricing');
    }
  }, [asset]);

  if (!isOpen || !formData) return null;

  const currentStore = stores.find(s => s.id === formData.storeId);
  const margin = (Number(formData.sale_value) || 0) - (Number(formData.floor_price) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSaved(true);
    if (onSave) {
      onSave({
        ...formData,
        sale_value: Number(formData.sale_value) || 0,
        floor_price: Number(formData.floor_price) || 0,
        mileage: Number(formData.mileage) || 0
      });
    }
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(formData.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shrink-0 bg-slate-800 shadow-md">
              <img
                src={getVehicleImageUrl(formData.image || formData.imagem || 'FotoGolfGTI.jpeg')}
                alt={`${formData.brand} ${formData.model}`}
                onError={handleVehicleImageError}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                  style={{ backgroundColor: currentStore?.color_theme || '#2563eb' }}
                >
                  <Store className="w-3.5 h-3.5" />
                  {currentStore?.name || 'Unidade Automatch'}
                </span>
                <span className="text-xs font-mono font-bold bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full border border-white/10">
                  {formData.plate}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {formData.brand} {formData.model}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Configuração Comercial & Gestão de Estoque
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/10 -mb-2 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Preço & Financeiro
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Dados & Unidade
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visibility')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'visibility'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visibilidade & Notas
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 flex-1 overflow-y-auto overscroll-contain max-h-[65vh]">
          {/* TAB 1: PREÇO & FINANCEIRO */}
          {activeTab === 'pricing' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preço de Venda */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Valor Sugerido de Venda
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      value={formData.sale_value}
                      onChange={(e) => setFormData({ ...formData, sale_value: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-base font-black text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Preço exibido ao consumidor final na vitrine</p>
                </div>

                {/* Preço Mínimo (Floor Price) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Preço Mínimo de Repasse (B2B)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      value={formData.floor_price}
                      onChange={(e) => setFormData({ ...formData, floor_price: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-base font-black text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Valor base para transações e rede de parceiros</p>
                </div>
              </div>

              {/* Margem Estimada */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Margem / Spread Operacional Estimado</span>
                  <span className="text-[11px] text-blue-700">Diferença entre valor sugerido e piso de repasse</span>
                </div>
                <span className={`text-base font-black ${margin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  R$ {margin.toLocaleString('pt-BR')}
                </span>
              </div>

              {/* Status Financeiro */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Status Financeiro do Ativo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'paid', label: 'Quitado', color: 'emerald', desc: 'Sem alienação ativa' },
                    { id: 'pending', label: 'Pendente', color: 'amber', desc: 'Gravame / Doc' },
                    { id: 'financed', label: 'Financiado', color: 'blue', desc: 'Em amortização' }
                  ].map((status) => {
                    const isSelected = formData.financial_status === status.id;
                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, financial_status: status.id })}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            status.id === 'paid' ? 'bg-emerald-500' : status.id === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <span className="text-xs font-black text-slate-800">{status.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{status.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Operacional de Estoque */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Disponibilidade Operacional
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'available', label: 'Disponível', badge: 'bg-emerald-100 text-emerald-800' },
                    { id: 'negotiation', label: 'Negociação', badge: 'bg-amber-100 text-amber-800' },
                    { id: 'reserved', label: 'Reservado', badge: 'bg-indigo-100 text-indigo-800' },
                    { id: 'sold', label: 'Vendido', badge: 'bg-slate-200 text-slate-700' }
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, operational_status: op.id })}
                      className={`p-2.5 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        formData.operational_status === op.id
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DADOS & UNIDADE */}
          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Seleção de Unidade / Loja */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-blue-600" /> Loja / Unidade Alocada
                </label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5">Transfira a gestão física e digital do ativo para outra unidade</p>
              </div>

              {/* Marca & Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Placa, Ano e KM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Placa</label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ano/Modelo</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">KM Rodados</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Cor e Combustível */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cor</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Combustível</label>
                  <input
                    type="text"
                    value={formData.fuel}
                    onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: VISIBILIDADE & NOTAS */}
          {activeTab === 'visibility' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Visível na Vitrine Pública
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Permite que compradores finais vejam o anúncio no catálogo
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.visible_showcase}
                    onChange={(e) => setFormData({ ...formData, visible_showcase: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      Disponibilizar no Hub B2B
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Permite reserva e comissionamento por lojistas parceiros
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.visible_b2b}
                    onChange={(e) => setFormData({ ...formData, visible_b2b: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Anotações Internas */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Anotações Internas / Checklist da Concessionária
                </label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Laudo cautelar aprovado com apontamento leve de funilaria no parachoque dianteiro. Troca de pastilhas feita recentemente."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </motion.div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {!isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5 py-1 px-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover Ativo
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-1.5 rounded-xl">
                  <span className="text-[11px] font-bold text-red-800">Confirmar exclusão?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={hasSaved}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {hasSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Salvo!
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
