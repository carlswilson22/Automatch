import React from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL RUNTIME ERROR CAUGHT BY GLOBAL BOUNDARY:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white select-none">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/25 rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-md">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-950/40">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Instabilidade Temporária</h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                Ocorreu uma falha inesperada na interface. Seus dados estão seguros e o sistema foi blindado para evitar interrupções maiores.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                id="global-error-reload-btn"
                onClick={this.handleReload}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/30"
              >
                <RotateCcw className="w-4 h-4" /> Recarregar
              </button>
              <button
                type="button"
                id="global-error-home-btn"
                onClick={this.handleGoHome}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
              >
                <Home className="w-4 h-4" /> Ir para Início
              </button>
            </div>

            {/* Painel colapsável de diagnóstico para suporte técnico */}
            {this.state.error && (
              <details className="text-left text-[11px] text-slate-500 font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer overflow-hidden">
                <summary className="font-semibold text-slate-400 select-none hover:text-slate-300">
                  Detalhes técnicos para suporte
                </summary>
                <div className="mt-2 text-red-400/90 break-words whitespace-pre-wrap">
                  {String(this.state.error)}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-[10px] text-slate-500 overflow-x-auto p-2 bg-slate-900/50 rounded-lg">
                    {this.state.errorInfo.componentStack.slice(0, 500)}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
