// Gerado por scripts/sync_pericial_timeline.py; SHA256 a6491839ebb2eefc3ce89904f733d97fc23cfe2a17a7f94d85c183a3c839929f
export const pericialTimeline = {
  "schema_version": 1,
  "duration": 20,
  "fps": 24,
  "upload_duration_tolerance": 0.9,
  "summary": "0–5 s: frente; 5–15 s: laterais; 15–20 s: traseira.",
  "checkpoints": [
    {
      "start": 0,
      "end": 5,
      "title": "Frente",
      "detail": "Observe a frente, o capô, os faróis e o para-choque. O vídeo não certifica a condição das peças.",
      "color": "emerald"
    },
    {
      "start": 5,
      "end": 15,
      "title": "Laterais",
      "detail": "De 5 a 10 s, lateral A; de 10 a 15 s, lateral B. Observe portas, painéis e rodas.",
      "color": "cyan"
    },
    {
      "start": 15,
      "end": 20,
      "title": "Traseira",
      "detail": "Observe a traseira, as lanternas e o para-choque. Confirme os detalhes em uma vistoria presencial.",
      "color": "blue"
    }
  ],
  "shots": [
    {
      "start": 0,
      "end": 5,
      "view": "front",
      "angle": 0
    },
    {
      "start": 5,
      "end": 10,
      "view": "side_a",
      "angle": 90
    },
    {
      "start": 10,
      "end": 15,
      "view": "side_b",
      "angle": 270
    },
    {
      "start": 15,
      "end": 20,
      "view": "rear",
      "angle": 180
    }
  ]
};
export const VIDEO_DURATION = pericialTimeline.duration;
export const VIDEO_SUMMARY = pericialTimeline.summary;
export const CHECKPOINTS = pericialTimeline.checkpoints;
