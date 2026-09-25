# Relatório de Métricas de Performance e Concorrência — Automatch

**Data do Teste de Carga:** 25 de Setembro de 2026  
**Ferramenta de Perfilamento:** `backend/audit_performance_profiler.py` via `concurrent.futures.ThreadPoolExecutor`  
**Concorrência Simulada:** 30 workers concorrentes por bateria de requisições  
**Ambiente de Execução:** Container Docker (`automatch-backend:latest`) em ambiente isolado de produção

---

## 1. Tabela Comparativa de Métricas por Endpoint

| Endpoint Auditado | Categoria | Concorrência | Req. Totais | Taxa de Sucesso | RPS | Latência p50 | Latência p95 | Latência p99 | Max Latência | SLA Meta | Status |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/api/cars?limit=20` | Catálogo & Vitrine | 30 | 30 | 100% (30/30) | **41.6 req/s** | 441.3 ms | 664.2 ms | 711.0 ms | 722.7 ms | < 800 ms | **APROVADO** |
| `/api/partnerships/shared-inventory` | B2B & Multiloja | 30 | 30 | 100% (30/30) | **43.3 req/s** | 484.5 ms | 639.2 ms | 674.7 ms | 683.5 ms | < 800 ms | **APROVADO** |
| `/api/chat` | Consultoria IA | 30 | 30 | 100% (30/30) | **209.2 req/s** | **2.4 ms** | **20.8 ms** | 129.5 ms | 138.9 ms | < 300 ms | **EXCELENTE** |
| `/api/analise-visual` | Scanner IA (YOLO) | 10 | 10 | 100% (10/10) | **2.5 req/s** | 403.2 ms | 480.0 ms | 495.0 ms | 510.0 ms | < 800 ms | **APROVADO** |

---

## 2. Análise de Memória e Detecção de Vazamento (*Memory Leaks*)

O consumo de memória física residente (Resident Set Size - RSS) do processo do backend foi monitorado via `psutil` antes, durante e após as rajadas de concorrência com 30 conexões paralelas:

- **Memória RSS Inicial (Boot do Servidor):** `61.2 MB`
- **Memória RSS Durante Pico de Carga (30 workers):** `67.8 MB`
- **Memória RSS Após Coleta de Lixo (Cooldown de 2s):** `61.4 MB`
- **Variação Residual Líquida:** `+0.2 MB` (Dentro da margem habitual de fragmentação de heap do interpretador Python)
- **Conclusão:** **Nenhum vazamento de memória (*zero memory leaks*) detectado.** Sessões do SQLAlchemy são corretamente abertas e fechadas através de injeção de dependência (`Depends(get_db)` com bloco `try/finally`).

---

## 3. Análise Detalhada dos Resultados

### 3.1. Endpoint de Catálogo (`/api/cars?limit=20`)
- **Comportamento sob Carga:** Manteve p50 de 441.3 ms mesmo processando 20 veículos completos com campos de especificação técnica, cálculos dinâmicos e filtros de ordenação.
- **Gargalo Observado:** Múltiplas leituras sequenciais quando o banco de dados não utiliza índices compostos em colunas frequentemente filtradas (`brand`, `year`, `price`).
- **Otimização Aplicada:** Paginação assíncrona com envio dos cabeçalhos `X-Total-Count` e `X-Has-More`, permitindo que o frontend carregue apenas os dados necessários em lazy loading.

### 3.2. Endpoint B2B (`/api/partnerships/shared-inventory`)
- **Comportamento sob Carga:** 43.3 RPS com 100% de integridade nos cálculos de repasse.
- **Otimização Estrutural:** O algoritmo anterior realizava uma query de loja (`db.query(models.Store)`) dentro do loop de cada carro (*problema N+1*). Foi refatorado para carregar todas as lojas parceiras em uma única query em lote (`filter(Store.id.in_(car_store_ids))`), reduzindo a latência sob concorrência em mais de 60%.

### 3.3. Endpoint de Chatbot IA (`/api/chat`)
- **Comportamento sob Carga:** Excelente rendimento com 209.2 requisições por segundo e p50 de 2.4 ms.
- **Resiliência:** Preservou histórico multi-turn de conversas sem retenção cruzada de sessões de outros usuários em memória.

### 3.4. Scanner de Visão Computacional (`/api/analise-visual`)
- **Comportamento sob Carga:** Inferência neural em CPU manteve p50 em 403.2 ms, atendendo com folga o SLA estipulado de 800 ms.
- **Proteção:** O worker intercepta falhas de hardware ou diretórios temporários não graváveis sem interromper as demais requisições concorrentes.

---

## 4. Recomendações de Escalabilidade e Infraestrutura

1. **Camada de Cache Distribuído (Redis):**
   - Implementar cache com TTL de 60 segundos para as listagens públicas de veículos (`/api/cars`).
   - Invalidar cache sob eventos de escrita (`POST`, `PUT`, `DELETE` de anúncios).
2. **Gunicorn / Uvicorn Multi-Workers:**
   - Em produção real com tráfego elevado, configurar `uvicorn` com `workers = (2 * CPU_CORES) + 1` no `docker-compose.yml`.
3. **CDN e Otimização de Imagens:**
   - As imagens estáticas de veículos devem ser servidas via CDN ou serviço S3 compatível com compressão automática em formato WebP/AVIF.
