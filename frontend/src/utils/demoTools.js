import { parseVehicleNumber } from './vehicleNumbers.js';

export const demoChannels = Object.freeze([
  { id: 'autocerto', name: 'AutoCerto DMS' },
  { id: 'autoavaliar', name: 'AutoAvaliar' },
  { id: 'olx', name: 'OLX Autos' },
]);

export function demoOwner(storage) {
  try {
    const user = JSON.parse((storage || globalThis.sessionStorage)?.getItem('automatch_user') || 'null');
    return String(user?.id || user?.email || 'visitante');
  } catch { return 'visitante'; }
}

function stateKey(owner) { return `@automatch:demo-tools:${encodeURIComponent(owner)}`; }
export function readDemoTools(owner = demoOwner(), storage = globalThis.localStorage) {
  const raw = storage?.getItem(stateKey(owner));
  if (!raw) return { alerts: [], publications: [] };
  try {
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.alerts) || !Array.isArray(state.publications)) throw new Error();
    return state;
  } catch { throw new Error('Os exemplos salvos não puderam ser lidos. Os dados anteriores foram preservados.'); }
}
function writeDemoTools(owner, state, storage) {
  if (!storage) throw new Error('O armazenamento do navegador está indisponível.');
  try { storage.setItem(stateKey(owner), JSON.stringify(state)); }
  catch { throw new Error('Não foi possível salvar o exemplo neste navegador. Tente novamente.'); }
}
const sampleId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const vehiclePrice = car => parseVehicleNumber(car?.price ?? car?.preco) || 0;
export const vehicleName = car => car?.name || [car?.brand, car?.model].filter(Boolean).join(' ') || 'Veículo';
export const formatBrl = value => Number.isFinite(Number(value)) && value != null ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado';

export function saveDemoAlert(input, { owner = demoOwner(), storage = globalThis.localStorage } = {}) {
  const price = Number(input.target_price);
  const contact = String(input.contact_value || '').trim();
  if (!input.car_id || !Number.isFinite(price) || price <= 0 || !contact || !['email', 'whatsapp'].includes(input.contact_type)) throw new Error('Confira o veículo, o valor-alvo e o contato.');
  const state = readDemoTools(owner, storage);
  const previous = state.alerts.find(alert => String(alert.car_id) === String(input.car_id) && alert.contact_type === input.contact_type && alert.contact_value.toLowerCase() === contact.toLowerCase());
  const alert = { ...input, car_id: String(input.car_id), target_price: price, contact_value: contact, id: previous?.id || sampleId(), saved_at: new Date().toISOString(), mode: 'demonstracao' };
  writeDemoTools(owner, { ...state, alerts: [alert, ...state.alerts.filter(item => item.id !== alert.id)].slice(0, 100) }, storage);
  return alert;
}

export function previewPriceAlert(alert, price = alert.target_price) {
  if (!Number.isFinite(Number(price)) || Number(price) <= 0 || Number(price) > alert.target_price) return null;
  return { id: `${alert.id}:preview`, title: 'Exemplo de alerta de preço', message: `${alert.car_name}: o valor de ${formatBrl(price)} atingiu seu alvo de ${formatBrl(alert.target_price)}.`, channel: alert.contact_type, external_delivery: false };
}

export function simulatePublication(car, selected, { owner = demoOwner(), storage = globalThis.localStorage } = {}) {
  const channels = [...new Set(selected)].filter(id => demoChannels.some(channel => channel.id === id));
  if (!car?.id || !channels.length) throw new Error('Escolha um veículo e ao menos um canal.');
  const state = readDemoTools(owner, storage);
  const publication = { id: `DEMO-${sampleId()}`, car_id: String(car.id), car_name: vehicleName(car), price: vehiclePrice(car), channels, created_at: new Date().toISOString(), mode: 'demonstracao', external_delivery: false };
  writeDemoTools(owner, { ...state, publications: [publication, ...state.publications].slice(0, 100) }, storage);
  return publication;
}

const xml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
export function buildVehicleFeed(cars) {
  const items = cars.filter(car => car?.id).map(car => {
    const fields = { titulo: vehicleName(car), marca: car.brand || car.marca, modelo: car.model || car.modelo || car.name, ano_modelo: car.year || car.ano, preco: vehiclePrice(car).toFixed(2), km: parseVehicleNumber(car.mileage ?? car.km) || 0, cor: car.color || car.cor, transmissao: car.transmission, combustivel: car.fuel };
    return `  <veiculo id="${xml(car.id)}">\n${Object.entries(fields).filter(([, value]) => value != null && value !== '').map(([key, value]) => `    <${key}>${xml(value)}</${key}>`).join('\n')}\n  </veiculo>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<estoque ambiente="demonstracao">\n${items.join('\n')}\n</estoque>\n`;
}

export function vehicleReference(car) {
  const price = parseVehicleNumber(car?.fipePrice ?? car?.fipe_price);
  return { value: Number.isFinite(price) && price > 0 ? price : null, code: car?.fipeCode || car?.fipe_code || null, reference: car?.fipeReference || car?.mes_referencia_fipe || null, source: 'Referência informada no anúncio' };
}
export function demoRegistration(car) {
  return { status: 'demonstracao', is_simulado: true, consulta_valida: false, origem: 'cadastro', dados_veiculo: { placa: car.plate || car.placa || 'Não informada', chassi: car.chassi || 'Não informado', uf: car.uf || 'Não informada', situacao_veiculo: 'Não consultado', debitos: { ipva: 'Não consultado', licenciamento_status: 'Não consultado', total_multas: null }, restricoes: { gravame: 'Não consultado' } } };
}
export function demoDossier(car) {
  const reference = vehicleReference(car);
  return { status: 'demonstracao', is_simulado: true, origem: 'cadastro', laudo: { laudo_id: `AMOSTRA-${car.id}`, resultado_geral: car.laudoStatus || car.laudo_status || 'Conferir documento', dados_oficiais_fipe: reference.value ? { valor: formatBrl(reference.value), codigoFipe: reference.code, mesReferencia: reference.reference || 'Não informada' } : null, analise_estrutural: { longarinas_dianteiras: 'Conferir no documento anexado', espessura_media_tinta_micras: null } } };
}

export function demoPlateLookup(plate) {
  if (plate !== 'ABC1234') throw new Error('Não há amostra para esta placa. Use ABC1234 para experimentar ou preencha manualmente.');
  return { placa: plate, marca: 'Toyota', modelo: 'Corolla Altis 2.0 Flex Aut.', ano_fabricacao: 2023, cor: 'Azul', combustivel: 'Flex', municipio: 'São Paulo', uf: 'SP', preco_fipe_sugerido: 142500, codigo_fipe: '002165-2', mes_referencia_fipe: 'Setembro de 2024', is_simulado: true, consulta_oficial: false, origem: 'amostra', mensagem: 'Amostra cadastral de demonstração; não é consulta oficial.', status_roubo_furto: 'Não consultado', restricoes_financeiras: 'Não consultado', historico_leilao: 'Não consultado' };
}

export function dossierInspectionItems(car) {
  return [
    { item: 'Laudo informado', result: car.laudoStatus || car.laudo_status || car.laudo || 'Não informado', observation: 'Confira o documento original; informação do anunciante.' },
    { item: 'Estrutura e Longarinas', result: 'Não vistoriado', observation: 'Confira o documento da vistoria; o cadastro não certifica integridade.' },
    { item: 'Pintura e Micragem', result: 'Não medida', observation: 'Não há medição de espessura realizada nesta demonstração.' },
    { item: 'Histórico de Leilão / Sinistro', result: car.auctionHistory || car.auction_history || car.leilao || 'Não informado', observation: 'Informação do anunciante; sem consulta externa.' },
    { item: 'Débitos e Restrições DETRAN', result: car.debtStatus || car.debt_status || car.debitos || 'Não informado', observation: 'Informação do anunciante; sem consulta ao DETRAN.' },
    { item: 'Motor e Transmissão', result: 'Não inspecionado', observation: 'Exige avaliação mecânica presencial.' },
  ].map(item => ({ ...item, approved: false }));
}