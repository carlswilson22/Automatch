import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  XCircle, CheckCircle2, Loader2, Home, Phone, Building2, 
  MapPin, Sparkles, FileText, KeyRound, ArrowLeft, Clock,
  Copy, AlertTriangle, Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AutomatchLogo from '../components/ui/microkit/AutomatchLogo';
import GlowButton from '../components/ui/microkit/GlowButton';
import { modalVariants } from '../utils/motionTokens';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Recovery flow state
  const [recoveryMode, setRecoveryMode] = useState(false);  // 'forgot' modal active
  const [recoveryStep, setRecoveryStep] = useState(1);       // 1=email, 2=otp+new_password
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [otpPopup, setOtpPopup] = useState('');              // Código OTP para exibir no popup
  const [copiedOtp, setCopiedOtp] = useState(false);

  const selectedPlanId = location.state?.planId;

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', document: '', storeName: '', city: '',
  });

  const from = location.state?.from?.pathname || '/';

  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    setFormData(prev => ({ ...prev, phone: v }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === 'email') {
      // Remove @ inicial caso o usuário tenha colado ou digitado acidentalmente antes do nome
      sanitizedValue = value.replace(/^@+/, '').trim();
    }
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const cleanEmail = formData.email.replace(/^@+/, '').trim();

    try {
      if (isLogin) {
        await login(cleanEmail, formData.password);
        setSuccess('Login realizado com sucesso! Redirecionando...');
      } else {
        await register(
          formData.name.trim(), 
          cleanEmail, 
          formData.password, 
          { 
            accountType, 
            phone: formData.phone, 
            document: formData.document,
            storeName: formData.storeName,
            city: formData.city,
            planId: selectedPlanId || (accountType === 'store' ? 'pro' : 'free')
          }
        );
        setSuccess('Conta criada com sucesso! Bem-vindo(a).');
      }

      setTimeout(() => {
        if (selectedPlanId && selectedPlanId !== 'free') {
          navigate(`/checkout?type=plan&planId=${selectedPlanId}`);
        } else if (!isLogin) {
          if (accountType === 'seller') {
            navigate('/novo-anuncio');
          } else if (accountType === 'store') {
            navigate('/dashboard');
          } else {
            navigate('/encontrar');
          }
        } else {
          navigate(from, { replace: true });
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro inesperado.');
      setIsLoading(false);
    }
  };

  // ─── Recovery Handlers ─────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const cleanRecoveryEmail = recoveryEmail.replace(/^@+/, '').trim();
    if (!cleanRecoveryEmail) {
      setRecoveryError('Digite seu e-mail cadastrado.');
      return;
    }
    setRecoveryLoading(true);
    setRecoveryError('');
    setRecoverySuccess('');
    setOtpPopup('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanRecoveryEmail })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Erro ao solicitar recuperação.');
      }

      // Extrair OTP do message (modo dev)
      const otpMatch = data.message?.match(/(\d{6})/);
      if (otpMatch) {
        setOtpPopup(otpMatch[1]);
      }
      
      setRecoverySuccess(data.message);
      setRecoveryStep(2);
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setRecoveryError('Digite o código de 6 dígitos.');
      return;
    }
    if (newPassword.length < 6) {
      setRecoveryError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          otp: otpCode.trim(),
          new_password: newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Erro ao redefinir senha.');
      }

      setRecoverySuccess(data.message);
      setTimeout(() => {
        setRecoveryMode(false);
        setRecoveryStep(1);
        setOtpCode('');
        setNewPassword('');
        setOtpPopup('');
        setRecoverySuccess('');
        setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
      }, 2000);
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const closeRecovery = () => {
    setRecoveryMode(false);
    setRecoveryStep(1);
    setRecoveryEmail('');
    setOtpCode('');
    setNewPassword('');
    setRecoveryError('');
    setRecoverySuccess('');
    setOtpPopup('');
  };

  const copyOtp = () => {
    if (otpPopup) {
      navigator.clipboard?.writeText(otpPopup);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-800/90"
      >
        {/* Top Multi-tone Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        <div className="p-6 sm:p-9">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div 
              className="cursor-pointer mb-3 transition-transform hover:scale-105 active:scale-95"
              onClick={() => navigate('/')}
            >
              <AutomatchLogo theme="light" size="lg" />
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              {isLogin ? 'Entre na sua conta para gerenciar anúncios e compras' : 'Crie sua conta e aproveite o ecossistema com IA'}
            </p>
          </div>

          {/* Mode Tabs (Entrar / Criar Conta) */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`relative py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isLogin 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`relative py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                !isLogin 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs sm:text-sm font-bold"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs sm:text-sm font-bold"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Account Type Selector (Only on Register) */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block text-center">
                Selecione Seu Perfil
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAccountType('buyer')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    accountType === 'buyer'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Comprador</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('seller')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    accountType === 'seller'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Vendedor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('store')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    accountType === 'store'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Lojista</span>
                </button>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Specific Fields */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {accountType === 'store' ? 'Nome do Responsável' : 'Nome Completo'}
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      <input 
                        type="text" 
                        name="name"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={accountType === 'store' ? 'Ex: Carlos Wilson' : 'Ex: Carlos Wilson Gomes'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {accountType === 'store' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nome da Loja / Revenda</label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input 
                          type="text" 
                          name="storeName"
                          required
                          value={formData.storeName}
                          onChange={handleInputChange}
                          placeholder="Ex: Automatch Motors Barra"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">WhatsApp / Telefone</label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {accountType === 'store' ? 'CNPJ' : 'CPF (Opcional)'}
                      </label>
                      <div className="relative group">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input 
                          type="text" 
                          name="document"
                          value={formData.document}
                          onChange={handleInputChange}
                          placeholder={accountType === 'store' ? '00.000.000/0001-00' : '000.000.000-00'}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={(e) => setFormData(prev => ({ ...prev, email: prev.email.replace(/^@+/, '').trim() }))}
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Senha</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => { setRecoveryMode(true); setRecoveryEmail(formData.email); }}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 uppercase hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Acessar Plataforma' : 'Criar Conta Agora'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Switch Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs sm:text-sm font-medium text-slate-400">
              {isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                className="ml-2 text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tight hover:underline cursor-pointer"
              >
                {isLogin ? 'Cadastre-se' : 'Fazer Login'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Recovery Password Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {recoveryMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Recuperar Senha</h3>
                    <p className="text-blue-100 text-xs font-medium">
                      {recoveryStep === 1 ? 'Etapa 1 de 2 — Identificação de E-mail' : 'Etapa 2 de 2 — Código OTP & Redefinição'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Messages */}
                <AnimatePresence mode="wait">
                  {recoveryError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs sm:text-sm font-bold"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{recoveryError}</span>
                    </motion.div>
                  )}
                  {recoverySuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{recoverySuccess}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP Popup Toast (modo dev) */}
                <AnimatePresence>
                  {otpPopup && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Código OTP (Ambiente de Testes)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black tracking-[0.3em] text-white font-mono">
                          {otpPopup}
                        </span>
                        <button
                          type="button"
                          onClick={copyOtp}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer active:scale-95"
                        >
                          {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedOtp ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <p className="text-amber-400/80 text-[10px] font-medium">
                        Código válido por 15 minutos • Em produção, seria enviado ao e-mail informado.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 1: Email */}
                {recoveryStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Digite o e-mail cadastrado na sua conta. Enviaremos um código de verificação para validar sua identidade.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">E-mail Cadastrado</label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => { setRecoveryEmail(e.target.value); setRecoveryError(''); }}
                          placeholder="exemplo@email.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleForgotPassword}
                      disabled={recoveryLoading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      <span>Enviar Código</span>
                    </button>
                  </div>
                )}

                {/* Step 2: OTP + New Password */}
                {recoveryStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Digite o código de 6 dígitos recebido e defina sua nova senha de acesso.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Código de 6 Dígitos</label>
                      <div className="relative group">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6)); setRecoveryError(''); }}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-base text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all tracking-[0.3em] font-mono text-center font-bold"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nova Senha</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setRecoveryError(''); }}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleResetPassword}
                      disabled={recoveryLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Redefinir Senha</span>
                    </button>

                    <button
                      onClick={() => { setRecoveryStep(1); setOtpPopup(''); setRecoveryError(''); setRecoverySuccess(''); }}
                      className="w-full text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 py-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar e reenviar código</span>
                    </button>
                  </div>
                )}

                {/* Cancel button */}
                <button
                  onClick={closeRecovery}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs font-semibold py-2 transition-colors cursor-pointer"
                >
                  Cancelar e voltar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return to home link */}
      <button 
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 font-bold transition-all text-xs cursor-pointer active:scale-95 group"
      >
        <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        <span>Voltar para o Início</span>
      </button>
    </div>
  );
};

export default AuthPage;
