import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

let server, Card;
before(async () => {
  server = await createServer({ envFile: false, server: { middlewareMode: true }, ssr: { noExternal: ['framer-motion'] }, appType: 'custom', logLevel: 'silent' });
  Card = (await server.ssrLoadModule('/src/components/vehicle/LaudoFeedbackCard.jsx')).default;
});
after(async () => { await server?.close(); });

test('laudo não exibe afirmações visuais legadas e permite ampliar a miniatura', async () => {
  let view;
  const yoloFeedback = {
    cross_check_status: 'Concordante',
    imagens_inspecionadas: [{ id: 1, titulo: 'Longarina', status_peca: 'Conforme',
      classe_detectada: 'estrutura íntegra', confianca: '92%', detalhe: 'sem avarias',
      thumbnail_b64: 'data:image/jpeg;base64,YQ==' }],
  };
  await act(async () => { view = TestRenderer.create(React.createElement(Card, {
    feedback: { veredito: 'Não avaliado' },
    iaFeedback: { classificacao_geral: 'COM_ATENCAO', pontos_atencao_riscos: [], resumo_executivo: 'Revisão manual' },
    yoloFeedback,
  })); });
  const output = () => JSON.stringify(view.toJSON());
  assert.match(output(), /Análise visual inconclusiva/);
  assert.match(output(), /Nenhum apontamento listado/);
  for (const phrase of ['Concordante', '92%', 'Conforme', 'Longarina', 'estrutura íntegra', 'Nenhum risco detectado']) {
    assert.ok(!output().includes(phrase), phrase);
  }
  const button = view.root.findAllByType('button').find(node => node.findAllByType('img').length > 0);
  assert.ok(button);
  await act(async () => { button.props.onClick(); });
  assert.match(output(), /Imagem para conferência manual/);
  assert.equal(view.root.findAllByType('img').length, 2);
  await act(async () => { view.root.findByProps({ 'aria-label': 'Fechar imagem' }).props.onClick(); });
  await act(async () => { view.unmount(); });
});

test('falha de extração não é apresentada como aprovação ou divergência', async () => {
  let view;
  await act(async () => { view = TestRenderer.create(React.createElement(Card, {
    feedback: { veredito: 'Não avaliado' },
    iaFeedback: { classificacao_geral: 'COM_ATENCAO', pontos_atencao_riscos: [] },
    yoloFeedback: { cross_check_status: 'Inconclusivo', imagens_inspecionadas: [] },
  })); });
  const output = JSON.stringify(view.toJSON());
  assert.match(output, /Nenhuma imagem disponível/);
  assert.match(output, /Análise visual inconclusiva/);
  assert.doesNotMatch(output, /Concordante|Divergência Apontada|Nenhum risco detectado/);
  await act(async () => { view.unmount(); });
});
