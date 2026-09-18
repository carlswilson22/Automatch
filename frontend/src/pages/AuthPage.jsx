import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  XCircle, CheckCircle2, Loader2, Home, Phone, Building2, 
  MapPin, Sparkles, FileText, KeyRound, ArrowLeft, Clock,
  Copy, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
        setSuccess('Senha redefinida! Faça login com sua nova senha.');
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
    navigator.clipboard?.writeText(otpPopup);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glow elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-700/80"
      >
        <div className="p-6 sm:p-10">
          {/* Logo/Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div 
              className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 group transition-transform hover:scale-110 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mb-1">
              Automatch
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {isLogin ? 'Acesse sua conta para continuar' : 'Crie sua conta e explore com confiança'}
            </p>
          </div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm font-semibold"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm font-semibold"
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block text-center">
                Tipo de Cadastro
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setAccountType('buyer')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    accountType === 'buyer'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Comprador</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('seller')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    accountType === 'seller'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Vendedor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('store')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    accountType === 'store'
                      ? 'bg-blue-600 text-white shadow-md'
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
            {/* Full Name / Store Name */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {accountType === 'store' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Loja / Revenda</label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input 
                          type="text" 
                          name="storeName"
                          required
                          value={formData.storeName}
                          onChange={handleInputChange}
                          placeholder="Ex: Automatch Motors Barra"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp / Telefone</label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</label>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => { setRecoveryMode(true); setRecoveryEmail(formData.email); }}
                    className="text-[11px] font-bold text-blue-400 uppercase hover:underline"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-2 mt-6"
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
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-8 pt-6 border-t border-slate-700/80 text-center">
            <p className="text-sm font-medium text-slate-400">
              {isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                className="ml-2 text-blue-400 font-bold tracking-tight uppercase hover:underline"
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeRecovery}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <KeyRound className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Recuperar Senha</h3>
                      <p className="text-blue-200 text-xs font-medium">
                        {recoveryStep === 1 ? 'Etapa 1 de 2 — Identificação' : 'Etapa 2 de 2 — Redefinição'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Messages */}
                  <AnimatePresence mode="wait">
                    {recoveryError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm font-semibold"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {recoveryError}
                      </motion.div>
                    )}
                    {recoverySuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-sm font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {recoverySuccess}
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
                        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          Código OTP (Modo Desenvolvimento)
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-black tracking-[0.3em] text-white font-mono">
                            {otpPopup}
                          </span>
                          <button
                            onClick={copyOtp}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copiar
                          </button>
                        </div>
                        <p className="text-amber-400/70 text-[10px] font-medium">
                          Expira em 15 minutos • Em produção, este código seria enviado por e-mail
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Step 1: Email */}
                  {recoveryStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-sm">
                        Digite o e-mail cadastrado na sua conta. Enviaremos um código de recuperação.
                      </p>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          <input
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => { setRecoveryEmail(e.target.value); setRecoveryError(''); }}
                            placeholder="exemplo@email.com"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            autoFocus
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleForgotPassword}
                        disabled={recoveryLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        Enviar Código
                      </button>
                    </div>
                  )}

                  {/* Step 2: OTP + New Password */}
                  {recoveryStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-sm">
                        Digite o código de 6 dígitos e sua nova senha.
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Código OTP</label>
                        <div className="relative group">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6)); setRecoveryError(''); }}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-[0.3em] font-mono text-lg text-center"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nova Senha</label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setRecoveryError(''); }}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleResetPassword}
                        disabled={recoveryLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Redefinir Senha
                      </button>

                      <button
                        onClick={() => { setRecoveryStep(1); setOtpPopup(''); setRecoveryError(''); setRecoverySuccess(''); }}
                        className="w-full text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 py-2 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Voltar e reenviar código
                      </button>
                    </div>
                  )}

                  {/* Close */}
                  <button
                    onClick={closeRecovery}
                    className="w-full text-slate-500 hover:text-slate-300 text-xs font-medium py-2 transition-colors"
                  >
                    Cancelar e voltar ao login
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer link to home */}
      <button 
        onClick={() => navigate('/')}
        className="fixed bottom-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 font-bold transition-all text-xs group"
      >
        <Home className="w-4 h-4" />
        Voltar para o Início
      </button>
    </div>
  );
};

export default AuthPage;
