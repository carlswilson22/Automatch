"""Experimentos locais de transferência de aprendizagem; nunca ativa pesos na API."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil

def prepare_dataset(manifest, project, synthetic, output):
    """Validate inputs before creating a new, never-reused dataset."""
    dataset_dir = output / "dataset"
    config_file = output / "dataset.yaml"
    if dataset_dir.exists() or config_file.exists():
        raise ValueError("Saida de dataset ja existe; escolha outra pasta")
    if manifest.get("classes") != ["avaria"]:
        raise ValueError("O experimento exige a unica classe avaria")
    seen_hashes = {}
    seen_groups = {}
    counts = {"train": 0, "val": 0}
    prepared = []
    for index, item in enumerate(manifest["entries"]):
        split = item["split"]
        if split not in counts:
            raise ValueError("Split inesperado")
        if item["origin"] not in ("project", "synthetic"):
            raise ValueError("Origem de imagem inesperada")
        if not isinstance(item["group"], str) or not item["group"].strip():
            raise ValueError("Grupo de veiculo obrigatorio")
        base = (project if item["origin"] == "project" else synthetic).resolve()
        source = (base / item["source"]).resolve()
        if not source.is_relative_to(base):
            raise ValueError("Imagem fora da pasta de origem")
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if digest != item["sha256"]:
            raise ValueError(f"Imagem modificada: {item['source']}")
        for key, seen in [(digest, seen_hashes), (item["group"], seen_groups)]:
            if key in seen and seen[key] != split:
                raise ValueError("Vazamento entre treino e validacao")
            seen[key] = split
        labels = []
        for x1, y1, x2, y2 in item["boxes"]:
            if not (0 <= x1 < x2 <= 1 and 0 <= y1 < y2 <= 1):
                raise ValueError("Caixa fora da imagem")
            labels.append(f"0 {(x1+x2)/2:.6f} {(y1+y2)/2:.6f} {x2-x1:.6f} {y2-y1:.6f}")
        prepared.append((index, source, split, labels))
        counts[split] += 1

    dataset_dir.mkdir(parents=True, exist_ok=False)
    for index, source, split, labels in prepared:
        name = f"{index:03d}"
        image_dir = dataset_dir / "images" / split
        label_dir = dataset_dir / "labels" / split
        image_dir.mkdir(parents=True, exist_ok=True)
        label_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, image_dir / (name + source.suffix))
        (label_dir / (name + ".txt")).write_text("\n".join(labels), encoding="utf8")
    config = {"path": str(dataset_dir), "train": "images/train", "val": "images/val", "names": manifest["classes"]}
    with config_file.open("x", encoding="utf8") as stream:
        json.dump(config, stream)
    return config_file, counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--synthetic", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--weights", type=Path, required=True)
    args = parser.parse_args()
    if not args.weights.is_file():
        parser.error("Pesos locais obrigatórios; não há download automático")
    if args.output.resolve().is_relative_to(args.project.resolve()):
        parser.error("Artefatos de treino devem ficar fora do repositório")
    args.output.mkdir(parents=True, exist_ok=True)
    for name in ("dataset", "dataset.yaml", "runs", "results.json"):
        if (args.output / name).exists():
            parser.error(f"Saida ja contem {name}; escolha outra pasta")
    results_file = args.output / "results.json"
    # Reserve the result file exclusively; failed runs must also be preserved.
    with results_file.open("x", encoding="utf8") as stream:
        json.dump({"experimental": True, "status": "starting"}, stream)
    base_weight_sha256 = hashlib.sha256(args.weights.read_bytes()).hexdigest()
    manifest = json.loads((args.project / "docs/damage-training-manifest.json").read_text(encoding="utf8"))
    data, counts = prepare_dataset(manifest, args.project, args.synthetic, args.output)
    os.environ.update(YOLO_AUTOINSTALL="false", YOLO_OFFLINE="true", YOLO_CONFIG_DIR="/tmp/yolo", WANDB_DISABLED="true")
    import sys
    sys.path.insert(0, "/experiment/compat")
    import torch
    from ultralytics import YOLO, settings
    import ultralytics.data.utils as data_utils
    # Sem baixar fontes ou pesos auxiliares em um experimento isolado.
    data_utils.check_font = lambda *a, **k: None
    settings.update({"sync": False, "wandb": False, "mlflow": False, "clearml": False, "comet": False, "tensorboard": False})
    torch.set_num_threads(2)
    experiments = [
        {"name": "frozen-10-compatible", "freeze": 10, "epochs": 10, "seed": 11},
        {"name": "full-10-compatible", "freeze": 0, "epochs": 10, "seed": 11},
        {"name": "full-30-compatible", "freeze": 0, "epochs": 30, "seed": 29},
    ]
    results = []
    for config in experiments:
        model = YOLO(str(args.weights))
        try:
            metrics = model.train(data=str(data), project=str(args.output / "runs"),
                name=config["name"], exist_ok=False, epochs=config["epochs"], freeze=config["freeze"],
                seed=config["seed"], device="cpu", imgsz=416, batch=2, workers=0,
                amp=False, plots=False, cache=False, deterministic=True, patience=0,
                optimizer="AdamW", lr0=0.001, mosaic=0, mixup=0, degrees=0, translate=0.05,
                scale=0.1, fliplr=0.5, verbose=False, save=True)
            # Resolve the checkpoint from the trainer's actual save directory.
            weights = Path(model.trainer.best)
            if not weights.resolve().is_relative_to((args.output / "runs").resolve()):
                raise ValueError("Checkpoint fora da pasta de execucao")
            # Validação por veículo não visto; limiares varridos pelas métricas nativas, sem calibrar a UI.
            row = {**config, "status": "completed", "metrics": {k: float(v) for k,v in metrics.results_dict.items()},
                "weight_sha256": hashlib.sha256(weights.read_bytes()).hexdigest(), "weights": str(weights)}
        except Exception as error:
            row = {**config, "status": "failed", "error": type(error).__name__ + ": " + str(error)}
        results.append(row)
        results_file.write_text(json.dumps({"experimental": True, "counts": counts,
            "base_weight_sha256": base_weight_sha256,
            "limitation": "Tiny provisional dataset; no expert review or independent test set. Never deploy.",
            "experiments": results}, indent=2), encoding="utf8")
        print(json.dumps(row), flush=True)
    if not all(r["status"] == "completed" for r in results):
        raise SystemExit(1)

if __name__ == "__main__":
    main()
