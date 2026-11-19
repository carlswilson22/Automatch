"""Repara subpapéis de contas comuns sem alterar a conta, loja ou papel.

A conexão é fornecida pelo chamador. O manifesto anterior permite rollback
com verificação de concorrência; não contém senha, e-mail ou nome.
"""
from sqlalchemy import text

def plan_repairs(connection):
    rows = connection.execute(text(
        "SELECT id, role, sub_role, store_id FROM users "
        "WHERE role = 'comum' AND sub_role IS NOT NULL ORDER BY id"
    )).mappings()
    return [
        {"id": row["id"], "before": dict(row),
         "after": {**dict(row), "sub_role": None}}
        for row in rows
    ]

def apply_repairs(connection, entries):
    for entry in entries:
        before = entry["before"]
        result = connection.execute(text(
            "UPDATE users SET sub_role = NULL "
            "WHERE id = :id AND role = 'comum' AND sub_role = :sub_role "
            "AND (store_id = :store_id OR (store_id IS NULL AND :store_id IS NULL))"
        ), before)
        if result.rowcount != 1:
            raise RuntimeError("O perfil mudou desde o planejamento; transação cancelada.")
    return len(entries)

def rollback_repairs(connection, entries):
    for entry in entries:
        before = entry["before"]
        result = connection.execute(text(
            "UPDATE users SET sub_role = :sub_role "
            "WHERE id = :id AND role = 'comum' AND sub_role IS NULL "
            "AND (store_id = :store_id OR (store_id IS NULL AND :store_id IS NULL))"
        ), before)
        if result.rowcount != 1:
            raise RuntimeError("O perfil mudou após o reparo; rollback cancelado.")
    return len(entries)
