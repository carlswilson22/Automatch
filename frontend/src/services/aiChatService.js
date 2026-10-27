/**
 * aiChatService.js — Serviço de comunicação com o assistente inteligente de IA.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para conectar a interface do usuário aos endpoints de chat inteligente do backend,
 *     gerenciando histórico de mensagens, contexto do veículo e streaming de respostas.
 */
/**
 * aiChatService.js — Serviço de Streaming SSE e Integração com o Consultor IA da Automatch.
 *
 * Características:
 * 1. Consome endpoint de Server-Sent Events (SSE) '/api/chat/stream' em tempo real.
 * 2. Suporta cancelamento gracioso via AbortController / AbortSignal.
 * 3. Decodifica chunks parciais via TextDecoder e buffer de linhas para garantir integridade JSON.
 * 4. Fallback transparente para o endpoint síncrono '/api/chat' em caso de erro de rede ou indisponibilidade de streaming.
 */

import { ApiError } from './apiClient';

/**
 * Consome o fluxo de SSE do Consultor IA em tempo real.
 *
 * @param {object} params
 * @param {string} params.message - Mensagem enviada pelo usuário
 * @param {Array} [params.historico=[]] - Histórico prévio da conversa
 * @param {object|null} [params.carContext=null] - Dados estruturados do veículo (se houver)
 * @param {function} params.onChunk - Callback acionado a cada token recebido (token: string) => void
 * @param {function} [params.onDone] - Callback acionado quando o fluxo termina com sucesso () => void
 * @param {function} [params.onError] - Callback acionado em caso de erro (err: Error) => void
 * @param {AbortSignal} [params.signal] - Signal do AbortController para cancelamento
 * @returns {Promise<string>} - Retorna o texto completo acumulado
 */
export async function streamChatMessage({
  message,
  historico = [],
  carContext = null,
  onChunk,
  onDone,
  onError,
  signal
}) {
  const payload = {
    mensagem: message,
    historico,
    car_context: carContext
  };

  let accumulatedText = '';

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      let errDetail = '';
      try {
        const errJson = await response.json();
        errDetail = errJson.detail || errJson.message || '';
      } catch {
        // Corpo não é JSON
      }
      throw new ApiError(
        errDetail || `Erro ao consultar assistente (${response.status})`,
        response.status
      );
    }

    if (!response.body) {
      throw new Error('ReadableStream não suportado pelo navegador.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let lineBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      lineBuffer += decoder.decode(value, { stream: true });
      const lines = lineBuffer.split('\n');
      // Mantém a última linha incompleta no buffer
      lineBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const rawData = trimmed.slice(5).trim();
        if (rawData === '[DONE]') {
          onDone?.();
          return accumulatedText;
        }

        try {
          const parsed = JSON.parse(rawData);
          const token = parsed.token;
          if (token) {
            accumulatedText += token;
            onChunk?.(token);
          }
        } catch {
          // Ignora chunk malformado
        }
      }
    }

    onDone?.();
    return accumulatedText;

  } catch (error) {
    if (signal?.aborted || error?.name === 'AbortError') {
      // Cancelamento intencional pelo usuário
      onDone?.();
      return accumulatedText;
    }

    onError?.(error);
    throw error;
  }
}

/**
 * Envia uma mensagem usando o endpoint síncrono tradicional '/api/chat'.
 *
 * @param {object} params
 * @param {string} params.message
 * @param {Array} [params.historico=[]]
 * @param {object|null} [params.carContext=null]
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<string>}
 */
export async function sendChatMessage({ message, historico = [], carContext = null, signal }) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mensagem: message,
      historico,
      car_context: carContext
    }),
    signal
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new ApiError(
      errData.detail || 'Não foi possível obter resposta do consultor IA.',
      response.status
    );
  }

  const data = await response.json();
  return data.resposta || '';
}

export default {
  streamChatMessage,
  sendChatMessage
};
