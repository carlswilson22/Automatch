/**
 * main.jsx — Ponto de entrada (entrypoint) do frontend React no DOM.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para inicializar a raiz da aplicação React com React 18 createRoot,
 *     importar os estilos globais (index.css) e renderizar a árvore de componentes no elemento #root.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
