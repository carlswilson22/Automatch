/**
 * Centralized API Client — Automatch
 *
 * Princípios Arquiteturais:
 * 1. Timeout único e configurável (padrão 10.000ms), eliminando magic numbers de 1.2s.
 * 2. Cancelamento gracioso via AbortController combinável.
 * 3. Tratamento padronizado de status HTTP e mensagens em português.
 * 4. Retry com backoff exponencial exclusivamente para GETs idempotentes.
 * 5. Eliminação de fallback silencioso: dados de exemplo permitidos APENAS se
 *    VITE_ENABLE_DEMO_DATA === 'true' (desenvolvimento/demonstração). Em produção,
 *    erros reais são propagados para renderização de feedback e botão "Tentar novamente".
 */

export const DEFAULT_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Determina se o modo demonstração/fallback local está ativo via variável de ambiente.
 * NUNCA ativo em produção.
 */
export function isDemoModeEnabled() {
  return import.meta.env?.VITE_ENABLE_DEMO_DATA === 'true';
}

/**
 * Traduz erros HTTP em mensagens amigáveis em português.
 */
function translateErrorMessage(status, fallbackDetail = '') {
  if (fallbackDetail && typeof fallbackDetail === 'string' && fallbackDetail.trim().length > 0) {
    return fallbackDetail;
  }
  switch (status) {
    case 400: return 'Requisição inválida. Verifique os dados informados.';
    case 401: return 'Sessão expirada ou não autenticada. Faça login novamente.';
    case 403: return 'Acesso não autorizado para esta funcionalidade.';
    case 404: return 'Registro ou recurso não encontrado.';
    case 409: return 'Conflito de dados no sistema.';
    case 422: return 'Dados informados não puderam ser processados.';
    case 429: return 'Muitas requisições. Aguarde alguns instantes.';
    case 500: return 'Erro interno nos servidores da Automatch.';
    case 502:
    case 503:
    case 504: return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
    default: return 'Falha na comunicação com o servidor.';
  }
}

/**
 * Executa requisição HTTP com timeout, tratamento de erro e retries em GETs.
 *
 * @param {string} endpoint URL relativa ou absoluta (ex: '/api/cars')
 * @param {object} options Opções padrão de fetch (method, headers, body, signal, etc.)
 * @param {object} config Configurações avançadas ({ timeoutMs, retries, retryDelayMs })
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}, config = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = method === 'GET' ? (config.retries ?? 1) : 0;
  const initialRetryDelay = config.retryDelayMs ?? 400;

  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort(new Error('TIMEOUT'));
    }, timeoutMs);

    // Chaining de signal externo se fornecido pelo chamador
    let cleanupSignalListener = null;
    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timer);
        throw new ApiError('Operação cancelada pelo usuário.', 0);
      }
      const onExternalAbort = () => controller.abort(options.signal.reason);
      options.signal.addEventListener('abort', onExternalAbort);
      cleanupSignalListener = () => options.signal.removeEventListener('abort', onExternalAbort);
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timer);
      if (cleanupSignalListener) cleanupSignalListener();

      if (!response.ok) {
        let errData = null;
        try {
          errData = await response.json();
        } catch {
          // Response body não era JSON
        }
        const detail = errData?.detail || errData?.message || '';
        const msg = translateErrorMessage(response.status, detail);

        // Se for erro temporário de servidor (502, 503, 504) em GET, tenta retry
        if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
          attempt++;
          await new Promise(r => setTimeout(r, initialRetryDelay * Math.pow(2, attempt - 1)));
          continue;
        }

        throw new ApiError(msg, response.status, errData);
      }

      // 204 No Content
      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();

    } catch (err) {
      clearTimeout(timer);
      if (cleanupSignalListener) cleanupSignalListener();

      if (err instanceof ApiError) {
        throw err;
      }

      // Trata Abort por timeout
      const isTimeout = err?.name === 'AbortError' || err?.message === 'TIMEOUT' || controller.signal.aborted;
      const isUserCancel = options.signal?.aborted;

      if (isUserCancel) {
        throw new ApiError('Operação cancelada.', 0);
      }

      if (isTimeout && attempt < maxRetries) {
        attempt++;
        await new Promise(r => setTimeout(r, initialRetryDelay * Math.pow(2, attempt - 1)));
        continue;
      }

      if (isTimeout) {
        throw new ApiError('O servidor demorou muito para responder. Tente novamente.', 408);
      }

      if (attempt < maxRetries) {
        attempt++;
        await new Promise(r => setTimeout(r, initialRetryDelay * Math.pow(2, attempt - 1)));
        continue;
      }

      throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão.', 0);
    }
  }
}

/**
 * Helpers convenientes para métodos HTTP comuns.
 */
export const api = {
  get: (url, options = {}, config = {}) => apiRequest(url, { ...options, method: 'GET' }, config),
  post: (url, body, options = {}, config = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(url, {
      ...options,
      method: 'POST',
      headers: isFormData ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined)
    }, config);
  },
  put: (url, body, options = {}, config = {}) => {
    const isFormData = body instanceof FormData;
    return apiRequest(url, {
      ...options,
      method: 'PUT',
      headers: isFormData ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined)
    }, config);
  },
  delete: (url, options = {}, config = {}) => apiRequest(url, { ...options, method: 'DELETE' }, config)
};

export default api;
