/**
 * LaudoFeedbackCard.jsx — Card de feedback documental e imagens extraídas do laudo.
 * 
 * Objetivo e Motivo da Criação:
 *   - Processa obrigatoriamente três camadas de informação pericial:
 *     1. Conferência de Dados (Cross-Check): Placa, Chassi, Marca/Modelo, Ano e Quilometragem.
 *     2. Matriz de Riscos e Pontos de Atenção: Leilão, Sinistro, Remarcação, Restrição Judicial e Estrutura.
 *     3. Classificação Geral: Tag semafórica (Sem Ressalvas, Com Atenção, Com Restrições) e Resumo Executivo.
 *   - Exibe imagens extraídas para conferência manual, sem concluir sobre avarias.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Sparkles, FileCheck2, Cpu, ExternalLink,
  Camera, ZoomIn, X, Info, AlertOctagon, SearchCheck, ShieldAlert
} from 'lucide-react';

export default function LaudoFeedbackCard({ feedback, pdfUrl, fileName, yoloFeedback, iaFeedback: directIaFeedback }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!feedback && !directIaFeedback) return null;

  // Normalização do IA Feedback (suporta tanto payload puro quanto aninhado em feedback.ia_feedback)
  const ia = directIaFeedback || feedback?.ia_feedback || (feedback?.classificacao_geral ? feedback : null);

  const {
    veredito: rawVeredito = 'Aprovado',
    resumo: rawResumo = '',
  } = feedback || {};

  const activeYolo = yoloFeedback || feedback?.yolo_feedback;

  // Derivação da classificação geral
  const classificacaoGeral = ia?.classificacao_geral || (
    rawVeredito === 'Aprovado' ? 'SEM_RESSALVAS' : (rawVeredito === 'Aprovado com Apontamento' ? 'COM_ATENCAO' : 'COM_RESTRICOES')
  );

  const isApproved = classificacaoGeral === 'SEM_RESSALVAS';
  const isWarning = classificacaoGeral === 'COM_ATENCAO';

  const theme = isApproved
    ? {
        border: 'border-emerald-200/90',
        bgGradient: 'from-emerald-950/20 via-slate-900/40 to-emerald-900/10',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        scoreColor: 'text-emerald-500',
        barColor: 'bg-emerald-500',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
        Icon: ShieldCheck,
        badgeText: '✓ Sem Ressalvas (Aprovado)',
        label: 'SEM_RESSALVAS'
      }
    : isWarning
    ? {
        border: 'border-amber-200/90',
        bgGradient: 'from-amber-950/20 via-slate-900/40 to-amber-900/10',
        badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        scoreColor: 'text-amber-500',
        barColor: 'bg-amber-500',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
        Icon: AlertTriangle,
        badgeText: '⚠️ Com Atenção (Apontamentos)',
        label: 'COM_ATENCAO'
      }
    : {
        border: 'border-rose-300',
        bgGradient: 'from-rose-950/20 via-slate-900/40 to-rose-900/10',
        badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
        scoreColor: 'text-rose-500',
        barColor: 'bg-rose-500',
        glow: 'shadow-[0_0_25px_rgba(244,63,94,0.18)]',
        Icon: XCircle,
        badgeText: '✕ Com Restrições Críticas',
        label: 'COM_RESTRICOES'
      };

  const finalResumo = ia?.resumo_executivo || rawResumo || 'Auditoria pericial automatizada concluída com sucesso.';
  const conferencia = ia?.conferencia_dados;
  const riscos = ia?.pontos_atencao_riscos || [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        data-testid="laudo-feedback-card"
        className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-white shadow-xl ${theme.glow} p-5 sm:p-6 transition-all`}
      >
        {/* Glow decorativo de fundo */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Auditoria Pericial por IA
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini 1.5 Flash
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Validação Inteligente do Laudo Cautelar
              </h4>
            </div>
          </div>

          {/* Badge da Classificação Geral */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span 
              data-testid="badge-classificacao-geral"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${theme.badgeBg}`}
            >
              <theme.Icon className="w-4 h-4 shrink-0" />
              {theme.badgeText}
            </span>
          </div>
        </div>

        {/* Resumo Executivo em Destaque */}
        <div className="mb-6 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5 text-slate-700">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Resumo Executivo da Perícia
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {finalResumo}
          </p>
          {fileName && (
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500">
              <span className="truncate max-w-[280px]">
                Documento analisado: <strong className="text-slate-700 font-medium">{fileName}</strong>
              </span>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors ml-2 shrink-0"
                >
                  Abrir Laudo Original <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* CAMADA 1: CONFERÊNCIA DE DADOS (CROSS-CHECK) */}
        {conferencia && (
          <div className="mb-6" data-testid="conferencia-dados-container">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <SearchCheck className="w-4 h-4 text-indigo-600" />
                Conferência Cruzada de Dados (Laudo vs Anúncio)
              </span>
              <span className="text-[11px] text-slate-500">Validação Cadastral Automatizada</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {/* Placa */}
              <div className={`p-3 rounded-xl border ${conferencia.placa?.match ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-rose-50/80 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Placa</span>
                  {conferencia.placa?.match ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 font-mono mt-1 truncate">
                  {conferencia.placa?.valor_laudo || 'Conferido'}
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${conferencia.placa?.match ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                  {conferencia.placa?.match ? '✓ Placa Válida' : '✕ Divergência'}
                </span>
              </div>

              {/* Chassi */}
              <div className={`p-3 rounded-xl border ${conferencia.chassi?.match ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-rose-50/80 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chassi</span>
                  {conferencia.chassi?.match ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 font-mono mt-1 truncate" title={conferencia.chassi?.valor_laudo}>
                  {conferencia.chassi?.valor_laudo ? `${String(conferencia.chassi.valor_laudo).slice(0, 9)}...` : 'Conferido'}
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${conferencia.chassi?.match ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                  {conferencia.chassi?.match ? '✓ Chassi Conforme' : '✕ Inconsistente'}
                </span>
              </div>

              {/* Marca / Modelo */}
              <div className={`p-3 rounded-xl border ${conferencia.marca_modelo?.match ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-amber-50/80 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Modelo</span>
                  {conferencia.marca_modelo?.match ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1 truncate" title={conferencia.marca_modelo?.valor_laudo}>
                  {conferencia.marca_modelo?.valor_laudo || 'Conferido'}
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${conferencia.marca_modelo?.match ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {conferencia.marca_modelo?.match ? '✓ Modelo Correto' : '⚠️ Atenção'}
                </span>
              </div>

              {/* Ano */}
              <div className={`p-3 rounded-xl border ${conferencia.ano?.match ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-rose-50/80 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ano Fab/Mod</span>
                  {conferencia.ano?.match ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {conferencia.ano?.valor_laudo || 'Conferido'}
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${conferencia.ano?.match ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {conferencia.ano?.match ? '✓ Ano Confirmado' : '✕ Divergente'}
                </span>
              </div>

              {/* Quilometragem */}
              <div className={`p-3 rounded-xl border ${conferencia.quilometragem?.match_aproximado ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-rose-50/80 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hodômetro</span>
                  {conferencia.quilometragem?.match_aproximado ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {conferencia.quilometragem?.valor_laudo ? `${Number(conferencia.quilometragem.valor_laudo).toLocaleString('pt-BR')} km` : 'Conferido'}
                </div>
                <span className={`text-[10px] font-bold block mt-0.5 ${conferencia.quilometragem?.match_aproximado ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {conferencia.quilometragem?.match_aproximado ? '✓ Km Coincidente' : '✕ Alerta Hodômetro'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CAMADA 2: MATRIZ DE RISCOS E PONTOS DE ATENÇÃO */}
        <div className="mb-6" data-testid="matriz-riscos-container">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              Matriz de Riscos & Apontamentos Identificados
            </span>
            <span className="text-[11px] text-slate-500">Varredura Estrutural, Sinistro & Restrições</span>
          </div>

          {riscos.length > 0 ? (
            <div className="space-y-2">
              {riscos.map((risco, idx) => {
                const isAlta = risco.gravidade === 'ALTA';
                const isMedia = risco.gravidade === 'MEDIA';
                const borderClass = isAlta ? 'border-rose-200 bg-rose-50/60' : (isMedia ? 'border-amber-200 bg-amber-50/60' : 'border-blue-200 bg-blue-50/60');
                const badgeClass = isAlta ? 'bg-rose-100 text-rose-800 border-rose-300' : (isMedia ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300');

                return (
                  <div key={idx} className={`p-3 rounded-xl border ${borderClass} flex items-start gap-3`}>
                    <div className="shrink-0 mt-0.5">
                      {isAlta ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                      ) : isMedia ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          {risco.categoria}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          Gravidade {risco.gravidade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {risco.descricao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-slate-700 text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>Nenhum apontamento listado nesta análise. Confira o documento original.</span>
            </div>
          )}
        </div>

        {/* As imagens extraídas são exibidas somente para conferência humana. */}
        {activeYolo && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Imagens extraídas do documento</span>
            </div>
            <p className="text-xs text-slate-700 mb-3">
              Análise visual inconclusiva. As imagens não confirmam nem contestam o parecer; confira o documento manualmente.
            </p>
            {activeYolo.imagens_inspecionadas?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeYolo.imagens_inspecionadas.map((imgItem, index) => (
                  <button type="button" key={imgItem.id}
                    onClick={() => setSelectedImage({ ...imgItem, titulo: 'Imagem ' + (index + 1) + ' do documento' })}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left hover:border-indigo-300">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {imgItem.thumbnail_b64 ? (
                        <img src={imgItem.thumbnail_b64} alt={'Imagem ' + (index + 1) + ' do documento'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500"><Camera className="w-8 h-8 opacity-40" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="block p-2 text-xs font-semibold text-slate-800">Imagem {index + 1}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Nenhuma imagem disponível para exibição.
              </div>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}>
            <motion.div onClick={(event) => event.stopPropagation()}
              className="relative max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 p-5">
              <button type="button" aria-label="Fechar imagem" onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-600"><X className="w-4 h-4" /></button>
              <h3 className="text-sm font-bold text-slate-900 mb-3">{selectedImage.titulo}</h3>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center mb-4">
                {selectedImage.thumbnail_b64 ? (
                  <img src={selectedImage.thumbnail_b64} alt={selectedImage.titulo} className="max-h-full max-w-full object-contain" />
                ) : <Camera className="w-12 h-12 text-slate-600" />}
              </div>
              <p className="text-xs text-slate-600">Imagem para conferência manual; a análise visual de avarias é inconclusiva.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
