import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  FileCheck2, 
  Cpu, 
  ExternalLink,
  Camera,
  ZoomIn,
  X,
  Eye
} from 'lucide-react';

export default function LaudoFeedbackCard({ feedback, pdfUrl, fileName, yoloFeedback }) {
  if (!feedback) return null;

  const [selectedImage, setSelectedImage] = useState(null);

  const {
    veredito = 'Aprovado',
    score_procedencia = 95,
    resumo = '',
    itens_auditados = [],
    alertas = [],
    modelo_ia = 'Automatch Vision & PDF Engine'
  } = feedback;

  const activeYolo = yoloFeedback || feedback?.yolo_feedback;

  // Esquema de cores e estilos dinâmicos conforme o veredito
  const isApproved = veredito === 'Aprovado';
  const isWarning = veredito === 'Aprovado com Apontamento';
  const isRejected = veredito === 'Reprovado';

  const theme = isApproved
    ? {
        border: 'border-emerald-200/80',
        bgGradient: 'from-emerald-950/20 via-slate-900/40 to-emerald-900/10',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        scoreColor: 'text-emerald-500',
        barColor: 'bg-emerald-500',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
        Icon: ShieldCheck,
        badgeText: '✓ Laudo Aprovado sem Restrições',
      }
    : isWarning
    ? {
        border: 'border-amber-200/80',
        bgGradient: 'from-amber-950/20 via-slate-900/40 to-amber-900/10',
        badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        scoreColor: 'text-amber-500',
        barColor: 'bg-amber-500',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
        Icon: AlertTriangle,
        badgeText: '⚠️ Aprovado com Apontamentos',
      }
    : {
        border: 'border-rose-200/80',
        bgGradient: 'from-rose-950/20 via-slate-900/40 to-rose-900/10',
        badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        scoreColor: 'text-rose-500',
        barColor: 'bg-rose-500',
        glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
        Icon: XCircle,
        badgeText: '✕ Inconformidades Críticas',
      };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
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
                  <Sparkles className="w-2.5 h-2.5" /> {modelo_ia.split(' ')[0]} 1.5
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                Parecer Técnico do Laudo Cautelar
              </h4>
            </div>
          </div>

          {/* Badge do Veredito */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${theme.badgeBg}`}>
              <theme.Icon className="w-4 h-4 shrink-0" />
              {theme.badgeText}
            </span>
          </div>
        </div>

        {/* Grid Principal: Score e Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-6">
          {/* Score Radial / Métrico */}
          <div className="md:col-span-4 bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Score de Procedência
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-4xl font-extrabold tracking-tight ${theme.scoreColor}`}>
                {score_procedencia}
              </span>
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score_procedencia}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${theme.barColor} rounded-full`}
              />
            </div>

            <span className="text-[11px] text-slate-500 font-medium mt-2">
              Índice de Confiabilidade Documental
            </span>
          </div>

          {/* Resumo Pericial Executivo */}
          <div className="md:col-span-8 bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 text-slate-700">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Síntese da Auditoria
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {resumo}
            </p>
            {fileName && (
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/80 text-[11px] text-slate-500">
                <span className="truncate max-w-[220px]">
                  Arquivo auditado: <strong className="text-slate-700 font-medium">{fileName}</strong>
                </span>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors ml-2 shrink-0"
                  >
                    Visualizar PDF <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Checklist dos 4 Pilares Periciais */}
        {itens_auditados && itens_auditados.length > 0 && (
          <div className="space-y-2.5 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Conformidade dos Pilares Inspecionados
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {itens_auditados.map((item, idx) => {
                const isItemOk = item.status === 'Conforme';
                const isItemWarn = item.status === 'Atenção';
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    {isItemOk ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : isItemWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {item.item}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isItemOk
                              ? 'bg-emerald-100 text-emerald-800'
                              : isItemWarn
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      {item.detalhe && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug truncate">
                          {item.detalhe}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEÇÃO NOVO RECURSO: Evidências Fotográficas do YOLOv8 (ATM-AI-05) */}
        {activeYolo && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Evidências Fotográficas Auditadas por Visão Computacional (YOLOv8)
                </span>
              </div>

              {/* Badge de Cross-Check */}
              {activeYolo.cross_check_status && (
                <div className="flex items-center gap-1.5">
                  {activeYolo.cross_check_status === 'Concordante' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Cross-Check: Concordante
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Cross-Check: Divergência Apontada
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Mensagem explicativa do Cross-Check */}
            {activeYolo.cross_check_mensagem && (
              <p className="text-xs text-slate-600 bg-slate-50/80 rounded-lg p-2.5 mb-3 border border-slate-100">
                {activeYolo.cross_check_mensagem}
              </p>
            )}

            {/* Grid de Fotos Inspecionadas */}
            {activeYolo.imagens_inspecionadas && activeYolo.imagens_inspecionadas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                {activeYolo.imagens_inspecionadas.map((imgItem) => (
                  <motion.div
                    key={imgItem.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedImage(imgItem)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {imgItem.thumbnail_b64 ? (
                        <img
                          src={imgItem.thumbnail_b64}
                          alt={imgItem.titulo}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                          <Camera className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      {/* Overlay com Ícone de Lupa */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn className="w-5 h-5 drop-shadow-md" />
                      </div>

                      {/* Badge Flutuante de Confiança */}
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-black/70 backdrop-blur-xs text-white px-1.5 py-0.5 rounded">
                        {imgItem.confianca}
                      </span>
                    </div>

                    {/* Rodapé da Imagem com Status */}
                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {imgItem.titulo}
                      </span>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-[10px] text-slate-500 truncate">
                          {imgItem.classe_detectada}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          imgItem.status_peca === 'Conforme'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {imgItem.status_peca}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Auditoria documental concluída. Nenhuma fotografia pericial embutida identificada no arquivo PDF.
              </div>
            )}
          </div>
        )}

        {/* Alertas / Ressalvas (se houver) */}
        {alertas && alertas.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-semibold block mb-0.5">Apontamentos a verificar:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {alertas.map((alerta, i) => (
                  <li key={i}>{alerta}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Lightbox de Inspeção Ampliada */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 p-5"
            >
              {/* Botão Fechar */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedImage.titulo}
                </h3>
              </div>

              {/* Imagem Ampliada */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center mb-4">
                {selectedImage.thumbnail_b64 ? (
                  <img
                    src={selectedImage.thumbnail_b64}
                    alt={selectedImage.titulo}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-slate-600" />
                )}
              </div>

              {/* Detalhes Periciais da Peça */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Elemento Identificado (YOLOv8):</span>
                  <strong className="text-slate-800 uppercase font-semibold">{selectedImage.classe_detectada}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Grau de Confiança do Modelo:</span>
                  <strong className="text-indigo-600 font-bold">{selectedImage.confianca}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Parecer de Conformidade:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    selectedImage.status_peca === 'Conforme'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedImage.status_peca}
                  </span>
                </div>
                {selectedImage.detalhe && (
                  <p className="text-slate-600 pt-1 leading-relaxed">
                    <strong>Observação Técnica:</strong> {selectedImage.detalhe}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

