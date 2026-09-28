import React from 'react';

/**
 * RouteLoadingSkeleton.jsx
 * Componente de fallback para o React.Suspense durante o carregamento assíncrono de rotas (Code Splitting).
 * Mantém o tema Dark Mode sem clarão branco (FOUC) com animações suaves de shimmer.
 */
export default function RouteLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col animate-pulse">
      {/* Navbar Placeholder */}
      <header className="h-20 bg-slate-900/60 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/20" />
          <div className="w-32 h-6 rounded-md bg-slate-800" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="w-20 h-4 rounded bg-slate-800" />
          <div className="w-24 h-4 rounded bg-slate-800" />
          <div className="w-16 h-4 rounded bg-slate-800" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-9 rounded-full bg-slate-800" />
          <div className="w-28 h-9 rounded-full bg-blue-600/30" />
        </div>
      </header>

      {/* Hero / Header Skeleton */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <div className="h-40 rounded-3xl bg-gradient-to-r from-slate-900/80 via-slate-800/40 to-slate-900/80 border border-slate-800/70 p-8 flex flex-col justify-center gap-4 mb-10 shadow-xl">
          <div className="w-2/3 md:w-1/3 h-8 rounded-lg bg-slate-800" />
          <div className="w-full md:w-1/2 h-4 rounded-md bg-slate-800/60" />
          <div className="w-48 h-10 rounded-xl bg-blue-600/20 mt-2" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/80 flex flex-col gap-3 shadow-lg"
            >
              <div className="w-full aspect-[16/10] rounded-xl bg-slate-800/70 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
              <div className="w-3/4 h-5 rounded bg-slate-800" />
              <div className="w-1/2 h-4 rounded bg-slate-800/60" />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                <div className="w-24 h-6 rounded bg-blue-950/40" />
                <div className="w-20 h-4 rounded bg-slate-800/60" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
