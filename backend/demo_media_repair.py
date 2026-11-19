"""Reparo explícito, idempotente e reversível do vídeo demonstrativo inválido."""
from sqlalchemy import text

def plan_repairs(connection):
    rows=connection.execute(text("SELECT id, video_url FROM cars WHERE id=:id AND video_url=:old"),
        {"id":"sc-005","old":"/videos/pericial/sc-005-pericial.mp4"}).mappings()
    return [{"id":row["id"],"before":row["video_url"],"after":None} for row in rows]

def apply_repairs(connection,entries):
    for entry in entries:
        result=connection.execute(text("UPDATE cars SET video_url=NULL WHERE id=:id AND video_url=:before"),entry)
        if result.rowcount!=1:raise RuntimeError("Vínculo de mídia alterado; nenhuma atualização concorrente será sobrescrita")
    return len(entries)

def rollback_repairs(connection,entries):
    for entry in entries:
        result=connection.execute(text("UPDATE cars SET video_url=:before WHERE id=:id AND video_url IS NULL"),entry)
        if result.rowcount!=1:raise RuntimeError("Vínculo de mídia alterado; restauração interrompida")
    return len(entries)
