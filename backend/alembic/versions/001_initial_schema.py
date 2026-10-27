"""
001_initial_schema.py — Migração inicial do esquema do banco de dados Automatch.

Objetivo e Motivo da Criação:
  - Criado para definir a estrutura inicial das tabelas centrais: lojas (stores),
    veículos do catálogo (cars) e usuários (users) com seus relacionamentos fundamentais.
"""
"""Initial baseline schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-10 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. stores
    op.create_table(
        'stores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('slug', sa.String(), nullable=True),
        sa.Column('logo', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stores_id'), 'stores', ['id'], unique=False)
    op.create_index(op.f('ix_stores_name'), 'stores', ['name'], unique=False)
    op.create_index(op.f('ix_stores_slug'), 'stores', ['slug'], unique=True)

    # 2. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('photo', sa.String(), nullable=True),
        sa.Column('member_since', sa.String(), nullable=True),
        sa.Column('role', sa.String(length=32), nullable=True),
        sa.Column('sub_role', sa.String(length=32), nullable=True),
        sa.Column('store_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_store_id'), 'users', ['store_id'], unique=False)

    # 3. cars
    op.create_table(
        'cars',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('brand', sa.String(), nullable=True),
        sa.Column('model', sa.String(), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('km', sa.Integer(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(), nullable=True),
        sa.Column('color', sa.String(), nullable=True),
        sa.Column('fuel', sa.String(), nullable=True),
        sa.Column('transmission', sa.String(), nullable=True),
        sa.Column('body_type', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('plate', sa.String(), nullable=True),
        sa.Column('fipe_code', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('full_description', sa.Text(), nullable=True),
        sa.Column('tags', sa.String(), nullable=True),
        sa.Column('laudo_status', sa.String(), nullable=True),
        sa.Column('debt_status', sa.String(), nullable=True),
        sa.Column('auction_history', sa.String(), nullable=True),
        sa.Column('fipe_price', sa.Float(), nullable=True),
        sa.Column('auto_price', sa.Float(), nullable=True),
        sa.Column('laudo_url', sa.String(), nullable=True),
        sa.Column('laudo_feedback', sa.Text(), nullable=True),
        sa.Column('original_price', sa.Float(), nullable=True),
        sa.Column('price_history', sa.Text(), nullable=True),
        sa.Column('store_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('compartilhavel', sa.Integer(), nullable=True),
        sa.Column('valor_minimo_repasse', sa.Float(), nullable=True),
        sa.Column('comissao_fixa', sa.Float(), nullable=True),
        sa.Column('observacoes_repasse', sa.Text(), nullable=True),
        sa.Column('status_reserva', sa.String(length=32), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cars_brand'), 'cars', ['brand'], unique=False)
    op.create_index(op.f('ix_cars_compartilhavel'), 'cars', ['compartilhavel'], unique=False)
    op.create_index(op.f('ix_cars_id'), 'cars', ['id'], unique=False)
    op.create_index(op.f('ix_cars_model'), 'cars', ['model'], unique=False)
    op.create_index(op.f('ix_cars_price'), 'cars', ['price'], unique=False)
    op.create_index(op.f('ix_cars_status_reserva'), 'cars', ['status_reserva'], unique=False)
    op.create_index(op.f('ix_cars_store_id'), 'cars', ['store_id'], unique=False)
    op.create_index(op.f('ix_cars_user_id'), 'cars', ['user_id'], unique=False)
    op.create_index(op.f('ix_cars_year'), 'cars', ['year'], unique=False)
    op.create_index('idx_cars_brand_price', 'cars', ['brand', 'price'], unique=False)

    # 4. payment_orders
    op.create_table(
        'payment_orders',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('protocol', sa.String(), nullable=False),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('customer_email', sa.String(), nullable=True),
        sa.Column('item_description', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('payment_method', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payment_orders_id'), 'payment_orders', ['id'], unique=False)
    op.create_index(op.f('ix_payment_orders_protocol'), 'payment_orders', ['protocol'], unique=True)

    # 5. laudo_protocols
    op.create_table(
        'laudo_protocols',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('protocol', sa.String(), nullable=False),
        sa.Column('car_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.Column('snapshot_data', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['car_id'], ['cars.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_laudo_protocols_car_id'), 'laudo_protocols', ['car_id'], unique=False)
    op.create_index(op.f('ix_laudo_protocols_id'), 'laudo_protocols', ['id'], unique=False)
    op.create_index(op.f('ix_laudo_protocols_protocol'), 'laudo_protocols', ['protocol'], unique=True)

    # 6. password_reset_tokens
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('token_hash', sa.String(), nullable=False),
        sa.Column('otp_code', sa.String(length=6), nullable=False),
        sa.Column('expires_at', sa.Float(), nullable=False),
        sa.Column('used', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_password_reset_tokens_user_id'), 'password_reset_tokens', ['user_id'], unique=False)

    # 7. store_partnerships
    op.create_table(
        'store_partnerships',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('requester_store_id', sa.Integer(), nullable=False),
        sa.Column('receiver_store_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=True),
        sa.Column('commission_rate', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('termination_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.Column('activated_at', sa.String(), nullable=True),
        sa.Column('terminated_at', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['receiver_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['requester_store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_store_partnerships_id'), 'store_partnerships', ['id'], unique=False)
    op.create_index(op.f('ix_store_partnerships_receiver_store_id'), 'store_partnerships', ['receiver_store_id'], unique=False)
    op.create_index(op.f('ix_store_partnerships_requester_store_id'), 'store_partnerships', ['requester_store_id'], unique=False)
    op.create_index(op.f('ix_store_partnerships_status'), 'store_partnerships', ['status'], unique=False)

    # 8. car_reservations
    op.create_table(
        'car_reservations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('car_id', sa.String(length=36), nullable=False),
        sa.Column('partnership_id', sa.String(length=36), nullable=True),
        sa.Column('requesting_store_id', sa.Integer(), nullable=False),
        sa.Column('owner_store_id', sa.Integer(), nullable=False),
        sa.Column('seller_user_id', sa.String(length=36), nullable=False),
        sa.Column('proposed_price', sa.Float(), nullable=False),
        sa.Column('client_markup', sa.Float(), nullable=True),
        sa.Column('client_name', sa.String(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.Column('expires_at', sa.Float(), nullable=False),
        sa.Column('closing_requested', sa.Integer(), nullable=True),
        sa.Column('consent_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['car_id'], ['cars.id'], ),
        sa.ForeignKeyConstraint(['owner_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['partnership_id'], ['store_partnerships.id'], ),
        sa.ForeignKeyConstraint(['requesting_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['seller_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_car_reservations_car_id'), 'car_reservations', ['car_id'], unique=False)
    op.create_index(op.f('ix_car_reservations_id'), 'car_reservations', ['id'], unique=False)
    op.create_index(op.f('ix_car_reservations_owner_store_id'), 'car_reservations', ['owner_store_id'], unique=False)
    op.create_index(op.f('ix_car_reservations_partnership_id'), 'car_reservations', ['partnership_id'], unique=False)
    op.create_index(op.f('ix_car_reservations_requesting_store_id'), 'car_reservations', ['requesting_store_id'], unique=False)
    op.create_index(op.f('ix_car_reservations_seller_user_id'), 'car_reservations', ['seller_user_id'], unique=False)
    op.create_index(op.f('ix_car_reservations_status'), 'car_reservations', ['status'], unique=False)

    # 9. partner_transactions
    op.create_table(
        'partner_transactions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('protocol', sa.String(), nullable=False),
        sa.Column('reservation_id', sa.String(length=36), nullable=True),
        sa.Column('car_id', sa.String(length=36), nullable=False),
        sa.Column('selling_store_id', sa.Integer(), nullable=False),
        sa.Column('buying_store_id', sa.Integer(), nullable=False),
        sa.Column('closing_user_id', sa.String(length=36), nullable=True),
        sa.Column('final_price', sa.Float(), nullable=False),
        sa.Column('repasse_piso', sa.Float(), nullable=False),
        sa.Column('markup_amount', sa.Float(), nullable=True),
        sa.Column('commission_amount', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['buying_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['car_id'], ['cars.id'], ),
        sa.ForeignKeyConstraint(['closing_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['reservation_id'], ['car_reservations.id'], ),
        sa.ForeignKeyConstraint(['selling_store_id'], ['stores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_partner_transactions_buying_store_id'), 'partner_transactions', ['buying_store_id'], unique=False)
    op.create_index(op.f('ix_partner_transactions_car_id'), 'partner_transactions', ['car_id'], unique=False)
    op.create_index(op.f('ix_partner_transactions_closing_user_id'), 'partner_transactions', ['closing_user_id'], unique=False)
    op.create_index(op.f('ix_partner_transactions_id'), 'partner_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_partner_transactions_protocol'), 'partner_transactions', ['protocol'], unique=True)
    op.create_index(op.f('ix_partner_transactions_reservation_id'), 'partner_transactions', ['reservation_id'], unique=False)
    op.create_index(op.f('ix_partner_transactions_selling_store_id'), 'partner_transactions', ['selling_store_id'], unique=False)

    # 10. partner_messages
    op.create_table(
        'partner_messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('reservation_id', sa.String(length=36), nullable=False),
        sa.Column('sender_user_id', sa.String(length=36), nullable=False),
        sa.Column('sender_store_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['reservation_id'], ['car_reservations.id'], ),
        sa.ForeignKeyConstraint(['sender_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['sender_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_partner_messages_id'), 'partner_messages', ['id'], unique=False)
    op.create_index(op.f('ix_partner_messages_reservation_id'), 'partner_messages', ['reservation_id'], unique=False)
    op.create_index(op.f('ix_partner_messages_sender_store_id'), 'partner_messages', ['sender_store_id'], unique=False)
    op.create_index(op.f('ix_partner_messages_sender_user_id'), 'partner_messages', ['sender_user_id'], unique=False)

    # 11. partner_reviews
    op.create_table(
        'partner_reviews',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('transaction_id', sa.String(length=36), nullable=True),
        sa.Column('reviewer_store_id', sa.Integer(), nullable=False),
        sa.Column('reviewed_store_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('punctuality_rating', sa.Integer(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['reviewed_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['reviewer_store_id'], ['stores.id'], ),
        sa.ForeignKeyConstraint(['transaction_id'], ['partner_transactions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_partner_reviews_id'), 'partner_reviews', ['id'], unique=False)
    op.create_index(op.f('ix_partner_reviews_reviewed_store_id'), 'partner_reviews', ['reviewed_store_id'], unique=False)
    op.create_index(op.f('ix_partner_reviews_reviewer_store_id'), 'partner_reviews', ['reviewer_store_id'], unique=False)
    op.create_index(op.f('ix_partner_reviews_transaction_id'), 'partner_reviews', ['transaction_id'], unique=False)

    # 12. partnership_audit_logs
    op.create_table(
        'partnership_audit_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_partnership_audit_logs_created_at'), 'partnership_audit_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_partnership_audit_logs_id'), 'partnership_audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_partnership_audit_logs_store_id'), 'partnership_audit_logs', ['store_id'], unique=False)
    op.create_index(op.f('ix_partnership_audit_logs_user_id'), 'partnership_audit_logs', ['user_id'], unique=False)

    # 13. laudo_watchlist
    op.create_table(
        'laudo_watchlist',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('car_id', sa.String(length=36), nullable=True),
        sa.Column('placa', sa.String(), nullable=True),
        sa.Column('last_check', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['car_id'], ['cars.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_laudo_watchlist_car_id'), 'laudo_watchlist', ['car_id'], unique=False)
    op.create_index(op.f('ix_laudo_watchlist_id'), 'laudo_watchlist', ['id'], unique=False)
    op.create_index(op.f('ix_laudo_watchlist_placa'), 'laudo_watchlist', ['placa'], unique=False)


def downgrade() -> None:
    op.drop_table('laudo_watchlist')
    op.drop_table('partnership_audit_logs')
    op.drop_table('partner_reviews')
    op.drop_table('partner_messages')
    op.drop_table('partner_transactions')
    op.drop_table('car_reservations')
    op.drop_table('store_partnerships')
    op.drop_table('password_reset_tokens')
    op.drop_table('laudo_protocols')
    op.drop_table('payment_orders')
    op.drop_table('cars')
    op.drop_table('users')
    op.drop_table('stores')
