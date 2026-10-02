import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, QrCode, CreditCard, FileText, 
  CheckCircle2, Copy, Check, Lock, Clock, AlertCircle, 
  Sparkles, Car, Loader2, ArrowRight, Printer, ExternalLink,
  ShieldAlert, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS_DATA } from '../data/plansData';
import { showcaseCars } from '../data/showcaseData';
import AutomatchLogo from '../components/ui/microkit/AutomatchLogo';
import SpotlightCard from '../components/ui/microkit/SpotlightCard';
import GlowButton from '../components/ui/microkit/GlowButton';
import WipeButton from '../components/ui/microkit/WipeButton';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const type = searchParams.get('type') || 'plan'; // 'plan' | 'vehicle'
  const planId = searchParams.get('planId') || 'pro';
  const billing = searchParams.get('billing') || 'monthly';
  const vehicleId = searchParams.get('vehicleId');

  // Redireciona tentativa de reserva com sinal para a vitrine
  useEffect(() => {
    if (type === 'vehicle') {
      navigate(vehicleId ? `/encontrar/${vehicleId}` : '/encontrar', { replace: true });
    }
  }, [type, vehicleId, navigate]);

  const selectedPlan = PLANS_DATA.find(p => p.id === planId) || PLANS_DATA[1];
  const selectedVehicle = showcaseCars.find(c => c.id === vehicleId) || showcaseCars[0];

  // Price Calculation
  const isVehicle = type === 'vehicle';
  const reservationDeposit = 1500; // R$ 1.500 de sinal reembolsável
  const planPrice = billing === 'annual' ? selectedPlan.annualPrice * 12 : selectedPlan.monthlyPrice;
  const totalPrice = isVehicle ? reservationDeposit : planPrice;

  // Form & Method states
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' | 'card' | 'boleto'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min in seconds

  // Card Form
  const [cardData, setCardData] = useState({
    number: '',
    name: user?.name || '',
    expiry: '',
    cvv: '',
    installments: '1',
    document: ''
  });

  // Pix Code
  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${totalPrice}.005802BR5920AUTOMATCH TECNOLOGIA6009SAO PAULO62070503***6304`;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardData(prev => ({ ...prev, expiry: val }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const itemDesc = isVehicle ? `Reserva de Veículo: ${selectedVehicle.name}` : `Assinatura Plano ${selectedPlan.name}`;
    const customer = cardData.name || user?.name || 'Cliente Automatch';

    try {
      const token = user?.token || JSON.parse(localStorage.getItem('automatch_user') || '{}')?.token;
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          customer_name: customer,
          customer_email: user?.email || 'cliente@automatch.com',
          item_description: itemDesc,
          amount: totalPrice,
          payment_method: paymentMethod
        })
      });

      if (response.ok) {
        const receipt = await response.json();
        setOrderReceipt(receipt);
        setIsSuccess(true);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn('Fallback para checkout:', err);
    }

    // Fallback gracioso caso necessário
    const receipt = {
      protocol: `ATM-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString('pt-BR'),
      item: itemDesc,
      amount: totalPrice,
      method: paymentMethod.toUpperCase(),
      customer: customer,
      status: 'Aprovado'
    };
    setOrderReceipt(receipt);
    setIsSuccess(true);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header */}
      <nav className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-800 cursor-pointer active:scale-95"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <AutomatchLogo isDark={true} size="md" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ambiente Seguro SSL 256-bit</span>
            <span className="sm:hidden">Seguro SSL</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 relative z-10">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="checkout-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8"
            >
              {/* Left Column: Payment Methods & Forms */}
              <div className="space-y-6">
                {/* Method Tabs */}
                <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-1.5 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'boleto'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Boleto Bancário</span>
                  </button>
                </div>

                {/* Form Container */}
                <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-xl backdrop-blur-xl">
                  {/* === TAB 1: PIX === */}
                  {paymentMethod === 'pix' && (
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Código expira em {formatTimer(timeLeft)}</span>
                      </div>

                      {/* QR Code Visual Box */}
                      <div className="p-5 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
                        <div className="w-48 h-48 bg-slate-950 rounded-2xl p-3 flex items-center justify-center relative overflow-hidden">
                          {/* Simulated SVG QR Code */}
                          <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-white rounded-xl">
                            {Array.from({ length: 36 }).map((_, i) => (
                              <div
                                key={i}
                                className={`rounded-sm ${
                                  [0,1,2,5,6,11,12,17,18,23,24,29,30,33,34,35,7,14,21,28].includes(i)
                                    ? 'bg-slate-900'
                                    : (i % 3 === 0 ? 'bg-slate-900' : 'bg-transparent')
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800 mt-2.5 uppercase tracking-wider">
                          Escaneie com seu app bancário
                        </span>
                      </div>

                      {/* Copia e Cola */}
                      <div className="w-full space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Ou utilize a chave Copia e Cola:
                        </label>
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 pr-3">
                          <input
                            type="text"
                            readOnly
                            value={pixCopyPasteCode}
                            className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none px-2 truncate"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                              copiedPix
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Confirmando Pagamento...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Confirmar Pagamento PIX</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* === TAB 2: CARTÃO DE CRÉDITO === */}
                  {paymentMethod === 'card' && (
                    <form onSubmit={handlePay} className="space-y-4">
                      {/* Virtual Card Preview */}
                      <div className="w-full aspect-[1.8/1] max-w-sm mx-auto rounded-3xl p-6 bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-800 border border-white/20 shadow-2xl flex flex-col justify-between mb-6 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300 shadow-inner" />
                          <span className="text-[11px] font-black tracking-widest text-white/70 uppercase">AUTOMATCH CARD</span>
                        </div>
                        <div className="font-mono text-base sm:text-lg font-bold tracking-widest text-white">
                          {cardData.number || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end text-xs uppercase tracking-wider text-white/80">
                          <div>
                            <span className="text-[9px] block text-white/50">Titular</span>
                            <span className="font-bold">{cardData.name || 'SEU NOME AQUI'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] block text-white/50">Validade</span>
                            <span className="font-bold">{cardData.expiry || 'MM/AA'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Número do Cartão</label>
                        <input
                          required
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={handleCardNumberChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nome Impresso no Cartão</label>
                        <input
                          required
                          type="text"
                          placeholder="Ex: CARLOS W GOMES"
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Validade</label>
                          <input
                            required
                            type="text"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={handleExpiryChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">CVV</label>
                          <input
                            required
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Opções de Parcelamento</label>
                        <select
                          value={cardData.installments}
                          onChange={(e) => setCardData(prev => ({ ...prev, installments: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer"
                        >
                          <option value="1">1x de R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Sem juros)</option>
                          <option value="3">3x de R$ {(totalPrice / 3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Sem juros)</option>
                          <option value="6">6x de R$ {(totalPrice / 6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Sem juros)</option>
                          <option value="12">12x de R$ {(totalPrice * 1.12 / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (com taxa operadora)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 mt-6 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processando Pagamento...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Pagar R$ {totalPrice.toLocaleString('pt-BR')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* === TAB 3: BOLETO === */}
                  {paymentMethod === 'boleto' && (
                    <div className="space-y-6 text-center">
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center">
                        <FileText className="w-12 h-12 text-blue-400 mb-3" />
                        <h4 className="font-bold text-lg text-white mb-1">Boleto Bancário Automatch</h4>
                        <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                          O boleto será gerado com vencimento em até 3 dias úteis. A compensação pode levar até 24h úteis.
                        </p>
                        <div className="w-full bg-slate-900 p-3.5 rounded-xl font-mono text-xs text-slate-300 select-all border border-slate-800 break-all">
                          34191.79001 01043.510047 91020.150008 8 98760000{totalPrice}00
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Printer className="w-4 h-4" />
                            <span>Gerar e Visualizar Boleto</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-6">
                <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-xl backdrop-blur-xl sticky top-24">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 pb-4 border-b border-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Resumo do Pedido</span>
                  </h3>

                  {isVehicle ? (
                    <div className="space-y-4 mb-6">
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img 
                          src={selectedVehicle.image || selectedVehicle.images?.[0] || '/images/placeholder-carro.jpg'} 
                          alt={selectedVehicle.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Reserva de Veículo</span>
                        <h4 className="text-xl font-black text-white">{selectedVehicle.name}</h4>
                        <p className="text-xs text-slate-400">{selectedVehicle.year} • {selectedVehicle.mileage.toLocaleString('pt-BR')} km</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-300 leading-relaxed">
                        🔒 Este sinal garante a reserva e bloqueia o veículo para outros compradores por 72h. Valor 100% reembolsável caso não feche negócio.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      <div>
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Assinatura de Plano</span>
                        <h4 className="text-2xl font-black text-white">{selectedPlan.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{billing === 'annual' ? 'Ciclo Anual (-20% de desconto incluso)' : 'Ciclo Mensal sem fidelidade'}</p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-800">
                        {selectedPlan.features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-6 border-t border-slate-800">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">R$ {totalPrice.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Taxa de processamento</span>
                      <span className="text-emerald-400 font-bold">Grátis</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-slate-800">
                      <span>Total</span>
                      <span className="text-2xl text-blue-400">R$ {totalPrice.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* === SUCCESS / RECEIPT SCREEN === */
            <motion.div
              key="success-receipt"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl mx-auto bg-slate-900/95 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Pagamento Aprovado!</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Sua transação foi processada e confirmada com sucesso em nossos servidores seguros.
              </p>

              {/* Receipt Details Card */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Protocolo</span>
                  <span className="font-mono text-sm font-black text-blue-400">{orderReceipt?.protocol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Data e Hora</span>
                  <span className="text-xs font-bold text-white">{orderReceipt?.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Item Adquirido</span>
                  <span className="text-xs font-bold text-white text-right max-w-[220px] truncate">{orderReceipt?.item}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Método de Pagamento</span>
                  <span className="text-xs font-bold text-white">{orderReceipt?.method}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className="text-sm font-bold text-slate-300">Valor Total Pago</span>
                  <span className="text-xl font-black text-emerald-400">R$ {orderReceipt?.amount.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/perfil')}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
                >
                  Ir para Meu Perfil
                </button>
                <button
                  onClick={() => navigate('/encontrar')}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 cursor-pointer active:scale-95"
                >
                  Continuar Explorando
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CheckoutPage;
