/**
 * postcss.config.js — Configuração do compilador PostCSS para o frontend do Automatch.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para processar os utilitários CSS gerados pelo TailwindCSS e aplicar autoprefixers
 *     necessários para compatibilidade multi-browser no pipeline de build do Vite.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
