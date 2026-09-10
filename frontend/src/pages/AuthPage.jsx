import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  XCircle, CheckCircle2, Loader2, Home, Phone, Building2, 
  MapPin, Sparkles, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('buyer'); // 'buyer' | 'seller' | 'store'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Preselected plan if coming from plans page
  const selectedPlanId = location.state?.planId;

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    document: '',
    storeName: '',
    city: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess('Login realizado com sucesso! Redirecionando...');
      } else {
        await register(
          formData.name, 
          formData.email, 
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
        } else {
          navigate(from, { replace: true });
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro inesperado.');
      setIsLoading(false);
    }
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
                  <button type="button" className="text-[11px] font-bold text-blue-400 uppercase hover:underline">
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
