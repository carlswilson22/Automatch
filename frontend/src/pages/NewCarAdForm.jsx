import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Save, CheckCircle, AlertCircle, Loader2, UploadCloud, X, FileText, Copy, ExternalLink, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { stores as defaultStores } from '../data/inventoryData';
import { addNewCar } from '../data/newCarsManager';

const NewCarAdForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    preco: '',
    km: '',
    cor: '',
    transmissao: 'Automático',
    descricao: '',
    imagem: '',
    localizacao: '',
    laudo: 'Aprovado',
    debitos: 'Sem débitos',
    leilao: 'Não',
    store_id: 'store-1'
  });

  const [stores, setStores] = useState(defaultStores);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
        }
      })
      .catch(() => {
        // Keeps defaultStores
      });
  }, []);

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [createdCar, setCreatedCar] = useState(null);
  const [copied, setCopied] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [laudoPdf, setLaudoPdf] = useState(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);

  const formatProtocol = (uuid) => {
    if (!uuid) return '';
    const short = uuid.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `#${short.substring(0, 4)}-${short.substring(4, 8)}`;
  };

  const handleCopyId = () => {
    if (createdCar?.id) {
      navigator.clipboard.writeText(createdCar.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewCar = () => {
    setFormData({
      marca: '', modelo: '', ano: '', preco: '', km: '', cor: '',
      transmissao: '', descricao: '', imagem: '', localizacao: '',
      laudo: '', debitos: '', leilao: '', store_id: ''
    });
    setCreatedCar(null);
    setCopied(false);
    setStatus('idle');
    setLaudoPdf(null);
  };

  const processFile = (file) => {
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrorMessage('Apenas arquivos JPG ou PNG são aceitos.');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagem: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const processPdfFile = (file) => {
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Apenas arquivos PDF são aceitos para o laudo.');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
        return;
      }
      setLaudoPdf(file);
    }
  };

  const handleDropPdf = (e) => {
    e.preventDefault();
    setIsDraggingPdf(false);
    processPdfFile(e.dataTransfer.files?.[0]);
  };

  // Validations
  const isValidYear = formData.ano.length === 4 && Number(formData.ano) >= 1900 && Number(formData.ano) <= new Date().getFullYear() + 1;
  const isValidImageExt = formData.imagem === '' || 
    /\.(jpg|jpeg|png)(\?.*)?$/i.test(formData.imagem) || 
    /^data:image\//.test(formData.imagem);
  const isFormValid = 
    formData.marca.trim() !== '' &&
    formData.modelo.trim() !== '' &&
    isValidYear &&
    formData.preco !== '' &&
    formData.cor.trim() !== '' &&
    formData.transmissao !== '' &&
    formData.localizacao.trim() !== '' &&
    formData.laudo !== '' &&
    formData.debitos !== '' &&
    formData.leilao !== '' &&
    formData.store_id !== '' &&
    isValidImageExt;

  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setFormData(prev => ({ ...prev, preco: "" }));
      return;
    }
    const formatted = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setFormData(prev => ({ ...prev, preco: formatted }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios corretamente.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    setStatus('loading');
    
    // Convert price back to number
    const numericPrice = Number(formData.preco.replace(/[^0-9,-]+/g,"").replace(",", ".")) || 0;

    const newCarRecord = addNewCar({
      marca: formData.marca,
      modelo: formData.modelo,
      ano: Number(formData.ano),
      km: formData.km ? Number(formData.km) : 0,
      preco: numericPrice,
      cor: formData.cor,
      transmissao: formData.transmissao,
      descricao: formData.descricao,
      imagem: formData.imagem || '',
      localizacao: formData.localizacao,
      laudo: formData.laudo,
      debitos: formData.debitos,
      leilao: formData.leilao,
      storeId: formData.store_id || 'store-1'
    });

    const payload = {
      brand: formData.marca,
      model: formData.modelo,
      year: Number(formData.ano),
      km: formData.km ? Number(formData.km) : 0,
      price: numericPrice,
      image: formData.imagem || '',
      store_id: formData.store_id ? Number(String(formData.store_id).replace(/\D/g, '')) || 1 : 1
    };

    fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setCreatedCar(data);
      } else {
        setCreatedCar(newCarRecord);
      }
      setStatus('success');
    })
    .catch(() => {
      setCreatedCar(newCarRecord);
      setStatus('success');
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 flex flex-col"
    >
      {/* Header */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-black tracking-tight text-slate-800 hidden sm:block">AUTOMATCH</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 relative overflow-hidden">
          
          <AnimatePresence>
            {status === 'success' && createdCar && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                  {/* Green header */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center gap-3">
                    <div className="bg-white/20 rounded-full p-2">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Anúncio Publicado!</h3>
                      <p className="text-green-100 text-sm">
                        {stores.find(s => s.id?.toString() === formData.store_id?.toString())?.name || 'Automatch Vitrine'}
                      </p>
                    </div>
                  </div>

                  {/* Protocol receipt body */}
                  <div className="p-6 space-y-5">
                    <p className="text-slate-600 text-sm">Guarde o número de protocolo abaixo. Ele é a identidade única do seu anúncio.</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Protocolo do Anúncio</p>
                        <p className="font-mono text-xl font-black text-slate-800 tracking-wide">{formatProtocol(createdCar.id)}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-1 break-all">{createdCar.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className={`shrink-0 p-2.5 rounded-xl border transition-all ${
                          copied
                            ? 'bg-green-50 border-green-300 text-green-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        title="Copiar ID completo"
                      >
                        {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs text-green-600 font-medium text-center -mt-2">ID copiado para a área de transferência!</p>
                    )}

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <button
                        type="button"
                        onClick={() => navigate('/encontrar')}
                        className="w-full px-5 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Ver Vitrine de Carros
                      </button>
                      <button
                        type="button"
                        onClick={handleNewCar}
                        className="w-full px-5 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle className="w-5 h-5" />
                        Cadastrar Outro Carro
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 bg-red-500 text-white py-4 px-6 flex items-center justify-center gap-3 z-10"
              >
                <AlertCircle className="w-6 h-6" />
                <p className="font-bold">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 border-b border-slate-100 pb-6 mt-4">
            <h1 className="text-3xl font-black text-slate-800">Criar Novo Anúncio</h1>
            <p className="text-slate-500 mt-2 text-lg">Preencha os dados abaixo com atenção para atrair mais compradores.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Loja Parceira */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Loja Parceira *</label>
                <select required name="store_id" value={formData.store_id} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm appearance-none">
                  <option value="" disabled>Selecione uma loja vinculada...</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Marca *</label>
                <input required type="text" name="marca" value={formData.marca} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: Honda" />
              </div>
              
              {/* Modelo */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Modelo *</label>
                <input required type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: Civic Touring" />
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Ano *</label>
                <input required type="number" name="ano" value={formData.ano} onChange={handleChange} className={`w-full bg-slate-50 border ${formData.ano && !isValidYear ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm`} placeholder="Ex: 2023" min="1900" max={new Date().getFullYear() + 1} />
                {formData.ano && !isValidYear && <p className="text-xs text-red-500 mt-1">Insira um ano válido (4 dígitos).</p>}
              </div>

              {/* Preço */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Preço *</label>
                <input required type="text" name="preco" value={formData.preco} onChange={handlePriceChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium text-slate-800" placeholder="R$ 0,00" />
              </div>

              {/* Transmissão */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Transmissão *</label>
                <select required name="transmissao" value={formData.transmissao} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm appearance-none">
                  <option value="" disabled>Selecione o câmbio...</option>
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Cor */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Cor *</label>
                <input required type="text" name="cor" value={formData.cor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: Prata" />
              </div>

              {/* KM */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Quilometragem</label>
                <input type="number" name="km" value={formData.km} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: 45000" min="0" />
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Localização *</label>
                <input required type="text" name="localizacao" value={formData.localizacao} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: São Paulo, SP" />
              </div>
            </div>

            {/* Nova Seção: Histórico e Procedência */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Histórico e Procedência</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Laudo Cautelar */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Laudo Cautelar *</label>
                  <div className="space-y-2">
                    {['Aprovado', 'Aprovado com Apontamentos', 'Não possui'].map(opcao => (
                      <label key={opcao} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <input required type="radio" name="laudo" value={opcao} checked={formData.laudo === opcao} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">{opcao}</span>
                      </label>
                    ))}
                  </div>

                  {/* Upload do Laudo PDF (Condicional) */}
                  <AnimatePresence>
                    {(formData.laudo === 'Aprovado' || formData.laudo === 'Aprovado com Apontamentos') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        {!laudoPdf ? (
                          <div 
                            className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isDraggingPdf ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingPdf(true); }}
                            onDragLeave={() => setIsDraggingPdf(false)}
                            onDrop={handleDropPdf}
                          >
                            <input 
                              type="file" 
                              accept=".pdf"
                              onChange={(e) => processPdfFile(e.target.files?.[0])}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center p-4 text-slate-500 pointer-events-none">
                              <FileText className={`w-8 h-8 mb-2 ${isDraggingPdf ? 'text-blue-500' : 'text-slate-400'}`} />
                              <p className="text-xs font-semibold text-slate-600 text-center">
                                Anexar PDF do Laudo <span className="text-slate-400 font-normal">(opcional)</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                              <span className="text-sm font-semibold text-slate-700 truncate">{laudoPdf.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setLaudoPdf(null)}
                              className="p-1 hover:bg-blue-100 rounded-lg text-slate-500 transition-colors shrink-0 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Débitos e Multas */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Débitos e Multas *</label>
                  <div className="space-y-2">
                    {['Sem débitos', 'Com débitos'].map(opcao => (
                      <label key={opcao} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <input required type="radio" name="debitos" value={opcao} checked={formData.debitos === opcao} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">{opcao}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Passagem por Leilão ou Sinistro */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Leilão ou Sinistro *</label>
                  <div className="space-y-2">
                    {['Sim', 'Não'].map(opcao => (
                      <label key={opcao} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <input required type="radio" name="leilao" value={opcao} checked={formData.leilao === opcao} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">{opcao}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Imagem Upload */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-700">Foto da Capa do Veículo</label>
              
              {!formData.imagem ? (
                <div className="space-y-5">
                  <div 
                    className={`relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => processFile(e.target.files?.[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 pointer-events-none">
                      <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                      <p className="mb-2 text-sm font-semibold text-slate-600 text-center px-4">
                        Arraste a foto do carro aqui ou <span className="text-blue-600">clique para selecionar</span>
                      </p>
                      <p className="text-xs text-slate-500">Apenas arquivos .jpg, .jpeg, .png</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-2">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">OU</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>

                  <div className="space-y-2 pb-2">
                    <label className="text-sm font-bold text-slate-700">Ou cole o link da imagem (URL)</label>
                    <input 
                      type="url" 
                      name="imagem" 
                      value={formData.imagem} 
                      onChange={handleChange} 
                      className={`w-full bg-slate-50 border ${formData.imagem && !isValidImageExt ? 'border-amber-400 focus:ring-amber-500' : 'border-slate-200 focus:ring-blue-500'} rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm text-slate-700`} 
                      placeholder="https://exemplo.com/fotocarro.jpg" 
                    />
                    {formData.imagem && !isValidImageExt && <p className="text-xs text-amber-600 mt-1">Atenção: A URL informada parece não terminar com extensão aceita (.jpg, .png)</p>}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 aspect-[21/9] max-w-full bg-slate-100 relative group">
                  <img src={formData.imagem} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, imagem: '' }))}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Remover Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Descrição do Veículo</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="5" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm resize-y" placeholder="Destaque as qualidades do veículo, opcionais, estado de conservação..."></textarea>
            </div>

            {/* Botoes */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-1/3 px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={!isFormValid || status === 'loading' || status === 'success'}
                className="w-full sm:w-2/3 px-6 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-3 shadow-md shadow-blue-500/20"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Save className="w-6 h-6" />
                )}
                {status === 'loading' ? 'Processando...' : status === 'success' ? 'Anunciado!' : 'Publicar Anúncio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default NewCarAdForm;
