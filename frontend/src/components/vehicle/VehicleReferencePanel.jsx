import React from 'react';
import { formatBrl, vehicleReference } from '../../utils/demoTools';

export default function VehicleReferencePanel({ type, car, data }) {
  const reference = vehicleReference(car);
  const rows = type === 'laudo' ? [
    ['Situação informada', data?.resultado_geral || 'Vistoria não realizada'],
    ['Estrutura', data?.analise_estrutural?.longarinas_dianteiras || 'Não consultado'],
    ['Micragem da pintura', data?.analise_estrutural?.espessura_media_tinta_micras != null ? `${data.analise_estrutural.espessura_media_tinta_micras} micras` : 'Não medida'],
    ['Referência de preço', data?.dados_oficiais_fipe?.valor || 'Não disponível'],
  ] : type === 'detran' ? [
    ['Placa', data?.placa || 'Não informada'], ['Situação cadastral', data?.situacao_veiculo || 'Não consultado'],
    ['IPVA', data?.debitos?.ipva || 'Não consultado'], ['Licenciamento', data?.debitos?.licenciamento_status || 'Não consultado'],
    ['Gravame', data?.restricoes?.gravame || 'Não consultado'],
    ['Multas', data?.debitos?.total_multas != null ? formatBrl(data.debitos.total_multas) : 'Não consultado'],
  ] : [
    ['Preço anunciado', formatBrl(car.price)], ['Referência informada', formatBrl(reference.value)],
    ['Código FIPE', reference.code || 'Não informado'], ['Mês de referência', reference.reference || 'Não informado'],
  ];
  const title = type === 'laudo' ? 'Informações do laudo' : type === 'detran' ? 'Situação cadastral' : 'Referência de preço';
  return <section className="p-5 rounded-2xl bg-slate-950 border border-slate-700 space-y-4" aria-label={title}>
    <h4 className="text-sm font-bold text-white">{title}</h4>
    <p className="text-xs leading-relaxed text-amber-200">{type === 'fipe' ? 'Valores informados no anúncio. Confira o mês e o código antes de comparar; preço não comprova condição mecânica ou estrutural.' : data?.sample ? 'Amostra de demonstração a partir do cadastro. Não houve consulta oficial ou vistoria.' : 'Uma consulta de preço ou cadastro não constitui perícia. Itens sem confirmação permanecem não consultados.'}</p>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">{rows.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-900 p-3 min-w-0"><dt className="text-xs text-slate-400 mb-1">{label}</dt><dd className="text-slate-100 break-words">{String(value)}</dd></div>)}</dl>
    {type === 'laudo' && car.laudoUrl && <a href={car.laudoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-300">Acessar Laudo em PDF</a>}
  </section>;
}