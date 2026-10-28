# ADR-005: Visualizador Orbital 360° Fotográfico com Perspectiva 3D e Desoneração de GPU

## Título
Renderização tridimensional com CSS transforms acelerados por hardware e eliminação de filtros pesados.

## Status
Aprovado

## Data
27/09/2026

## Contexto
O visualizador 360° original sofria de duas falhas críticas:
1. Troca indevida de modelo de veículo entre quadrantes angulares (exibindo fotos de carros aleatórios).
2. Queda drástica de taxa de quadros (menos de 25 FPS) e superaquecimento da GPU em notebooks e dispositivos móveis decorrente do uso excessivo de filtros contínuos de desfoque gaussiano (`backdrop-blur-md`).

## Decisão
1. **Consistência Visual Estrita**:
   - Algoritmo de resolução de mídias que prioriza fotos angulares dedicadas (`photos360`), galeria real (`gallery`) e a foto principal autêntica do próprio veículo (`car.image`), garantindo que o mesmo veículo seja inspecionado nos 8 ângulos (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°).
2. **Perspectiva 3D Acelerada por Hardware**:
   - Substituição de motores 3D pesados em WebGL por transformações CSS nativas (`perspective(1200px) rotateY(...)`) e iluminação direcional simulada via gradientes translúcidos.
3. **Desoneração da GPU**:
   - Remoção de classes `backdrop-blur` em elementos de renderização contínua (bússola orbital e indicadores de status), substituindo-as por camadas translúcidas opacas (`bg-slate-900/90`).

## Alternativas Consideradas
- **Three.js com Modelagem 3D GLTF**: Descartada devido ao peso do bundle (~600 kB adicionais) e à impossibilidade de obter modelos 3D fiéis para todos os seminovos reais do mercado.
- **Canvas 2D Puro**: Descartada por demandar cálculos manuais complexos de interpolação geométrica que o motor CSS nativo dos navegadores já executa em 60 FPS com aceleração de hardware.

## Consequências
- **Positivas**: Fluidez de 60 FPS cravados em qualquer dispositivo; visualização fidedigna do veículo real inspecionado; redução de 12 kB no chunk do visualizador.
- **Negativas**: Requer a captura e cadastro correto dos ângulos fotográficos pelo anunciante ou concessionária.

## Links Relacionados
- **Componente**: `frontend/src/components/vehicle/Vehicle360Viewer.jsx`
- **Relatório de Sprint 06**: [sprints/sprint-06.md](../../sprints/sprint-06.md)

