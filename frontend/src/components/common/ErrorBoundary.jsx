import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou uma falha não tratada:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 bg-slate-900/95 border border-rose-500/30 rounded-3xl text-center shadow-2xl backdrop-blur-xl max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white mb-2">
            {this.props.title || 'Indisponibilidade Temporária no Módulo'}
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {this.props.description || 'Ocorreu uma instabilidade pontual ao renderizar estes dados. Suas preferências foram salvas com segurança.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
            {this.props.onClose && (
              <button
                type="button"
                onClick={this.props.onClose}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Fechar</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
