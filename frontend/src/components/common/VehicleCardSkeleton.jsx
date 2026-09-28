import React from 'react';

/**
 * VehicleCardSkeleton.jsx
 * Skeleton animado de card de veículo para o catálogo durante busca, filtros e paginação.
 */
export default function VehicleCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-5 animate-pulse">
        <div className="w-full md:w-80 aspect-[16/10] shrink-0 rounded-xl bg-slate-200" />
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-2">
            <div className="w-3/4 h-6 bg-slate-200 rounded-md" />
            <div className="w-1/3 h-4 bg-slate-100 rounded-md" />
          </div>
          <div className="flex gap-4 my-3">
            <div className="w-20 h-4 bg-slate-100 rounded" />
            <div className="w-20 h-4 bg-slate-100 rounded" />
            <div className="w-20 h-4 bg-slate-100 rounded" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="w-28 h-7 bg-blue-100/60 rounded-lg" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-4 flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-[16/10] rounded-xl bg-slate-200" />
      <div className="space-y-2 pt-1">
        <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
        <div className="w-1/2 h-3.5 bg-slate-100 rounded-md" />
      </div>
      <div className="flex gap-3 my-1">
        <div className="w-16 h-3 bg-slate-100 rounded" />
        <div className="w-16 h-3 bg-slate-100 rounded" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-auto">
        <div className="w-24 h-6 bg-blue-100/60 rounded-lg" />
        <div className="w-16 h-3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
