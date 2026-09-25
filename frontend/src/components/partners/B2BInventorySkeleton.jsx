import React from 'react';

/**
 * B2BInventorySkeleton
 * Shimmer loader para a grade de estoque compartilhado B2B.
 * Fornece feedback visual instantâneo sem congelamento da thread de renderização.
 */
export default function B2BInventorySkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`b2b-skeleton-${index}`}
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-sm"
        >
          {/* Header de Imagem com Shimmer */}
          <div className="relative h-48 bg-slate-200/80 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="absolute top-3 left-3 w-28 h-6 bg-slate-300 rounded-full" />
            <div className="absolute bottom-3 right-3 w-24 h-5 bg-slate-300 rounded-xl" />
          </div>

          {/* Corpo do Card */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-5 bg-slate-300 rounded-lg w-3/4" />
              <div className="h-3.5 bg-slate-200 rounded-md w-1/2" />
            </div>

            {/* Pricing Box Skeleton */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-200 rounded w-28" />
                <div className="h-4 bg-slate-300 rounded w-20" />
              </div>
              <div className="pt-2 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-300 rounded w-16" />
                </div>
                <div className="h-2 bg-slate-200 rounded-full w-full" />
              </div>
            </div>

            {/* Total / Botão de Ação */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="h-3 bg-slate-200 rounded w-20" />
                <div className="h-5 bg-slate-300 rounded w-24" />
              </div>
              <div className="h-10 bg-slate-300 rounded-2xl w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
