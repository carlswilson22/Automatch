import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  FileCheck2, 
  Cpu, 
  ExternalLink 
} from 'lucide-react';

export default function LaudoFeedbackCard({ feedback, pdfUrl, fileName }) {
  if (!feedback) return null;

  const {
    veredito = 'Aprovado',
    score_procedencia = 95,
    resumo = '',
    itens_auditados = [],
    alertas = [],
    modelo_ia = 'Automatch Vision & PDF Engine'
  } = feedback;

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
        <div className="space-y-2.5">
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
  );
}
