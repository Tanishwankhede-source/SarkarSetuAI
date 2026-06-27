"""create initial schema

Revision ID: 0001_create_initial_schema
Revises: 
Create Date: 2026-06-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    op.create_table(
        'citizens',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('phone', sa.String(length=15), nullable=False, unique=True),
        sa.Column('phone_verified', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('language_pref', sa.String(length=5), server_default=sa.text("'en'")),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
        sa.Column('last_active', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
    )

    op.create_table(
        'citizen_profiles',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('citizen_id', sa.UUID(), sa.ForeignKey('citizens.id', ondelete='CASCADE'), nullable=True, unique=True),
        sa.Column('full_name', sa.String(length=100)),
        sa.Column('age', sa.Integer()),
        sa.Column('gender', sa.String(length=10)),
        sa.Column('state', sa.String(length=50)),
        sa.Column('district', sa.String(length=50)),
        sa.Column('annual_income', sa.Integer()),
        sa.Column('bpl_card', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('ration_card_type', sa.String(length=10)),
        sa.Column('occupation', sa.String(length=50)),
        sa.Column('employment_status', sa.String(length=20)),
        sa.Column('land_area_acres', sa.Numeric(6, 2), server_default=sa.text('0')),
        sa.Column('house_type', sa.String(length=20)),
        sa.Column('has_bank_account', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('has_jan_dhan', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('caste_category', sa.String(length=10)),
        sa.Column('disability_status', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('disability_type', sa.String(length=50)),
        sa.Column('disability_percent', sa.Integer(), server_default=sa.text('0')),
        sa.Column('family_size', sa.Integer(), server_default=sa.text('1')),
        sa.Column('marital_status', sa.String(length=20)),
        sa.Column('num_children', sa.Integer(), server_default=sa.text('0')),
        sa.Column('children_ages', sa.ARRAY(sa.Integer())),
        sa.Column('education_level', sa.String(length=30)),
        sa.Column('currently_studying', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')),
        sa.Column('confidence_score', sa.Numeric(3, 2), server_default=sa.text('0.50')),
        sa.Column('twin_version', sa.Integer(), server_default=sa.text('1')),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
    )

    op.create_table(
        'life_events',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('citizen_id', sa.UUID(), sa.ForeignKey('citizens.id')),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('event_date', sa.Date(), nullable=False),
        sa.Column('details', sa.JSON()),
        sa.Column('source', sa.String(length=20), server_default=sa.text("'citizen_reported'")),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
    )

    op.create_table(
        'schemes',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('slug', sa.String(length=100), nullable=False, unique=True),
        sa.Column('name_en', sa.String(length=200), nullable=False),
        sa.Column('name_hi', sa.String(length=200)),
        sa.Column('category', sa.String(length=30), nullable=False),
        sa.Column('ministry', sa.String(length=100)),
        sa.Column('level', sa.String(length=10), server_default=sa.text("'central'")),
        sa.Column('state', sa.String(length=50)),
        sa.Column('description_en', sa.Text()),
        sa.Column('eligibility_criteria', sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column('required_documents', sa.JSON(), server_default=sa.text("'[]'")),
        sa.Column('benefit_description', sa.Text()),
        sa.Column('benefit_value_annual', sa.Integer(), server_default=sa.text('0')),
        sa.Column('benefit_type', sa.String(length=30)),
        sa.Column('application_url', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('TRUE')),
        sa.Column('launched_date', sa.Date()),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
    )

    op.create_table(
        'citizen_benefits',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('citizen_id', sa.UUID(), sa.ForeignKey('citizens.id')),
        sa.Column('scheme_id', sa.UUID(), sa.ForeignKey('schemes.id')),
        sa.Column('status', sa.String(length=20), server_default=sa.text("'discovered'")),
        sa.Column('eligibility_score', sa.Numeric(3, 2)),
        sa.Column('eligibility_reasons', sa.JSON(), server_default=sa.text("'[]'")),
        sa.Column('eligible_since', sa.Date()),
        sa.Column('is_missed', sa.Boolean(), server_default=sa.text('FALSE')),
        sa.Column('missed_months', sa.Integer(), server_default=sa.text('0')),
        sa.Column('missed_value_est', sa.Integer(), server_default=sa.text('0')),
        sa.Column('discovered_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
        sa.Column('applied_at', sa.TIMESTAMP()),
        sa.Column('application_ref', sa.String(length=100)),
        sa.Column('application_data', sa.JSON(), server_default=sa.text("'{}'")),
        sa.Column('documents_submitted', sa.JSON(), server_default=sa.text("'[]'")),
        sa.Column('approved_at', sa.TIMESTAMP()),
        sa.Column('rejected_at', sa.TIMESTAMP()),
        sa.Column('rejection_reason', sa.Text()),
        sa.Column('appeal_generated', sa.Boolean(), server_default=sa.text('FALSE')),
        sa.UniqueConstraint('citizen_id', 'scheme_id')
    )

    op.create_table(
        'agent_executions',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('citizen_id', sa.UUID(), sa.ForeignKey('citizens.id')),
        sa.Column('agent_name', sa.String(length=50), nullable=False),
        sa.Column('triggered_by', sa.String(length=30)),
        sa.Column('status', sa.String(length=15), server_default=sa.text("'running'")),
        sa.Column('input_summary', sa.Text()),
        sa.Column('output_summary', sa.Text()),
        sa.Column('reasoning_log', sa.Text()),
        sa.Column('tool_calls', sa.JSON(), server_default=sa.text("'[]'")),
        sa.Column('started_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
        sa.Column('completed_at', sa.TIMESTAMP()),
        sa.Column('duration_ms', sa.Integer()),
        sa.Column('error_message', sa.Text()),
    )

    op.create_table(
        'welfare_gaps',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('state', sa.String(length=50)),
        sa.Column('district', sa.String(length=50)),
        sa.Column('scheme_id', sa.UUID(), sa.ForeignKey('schemes.id')),
        sa.Column('total_eligible', sa.Integer(), server_default=sa.text('0')),
        sa.Column('total_enrolled', sa.Integer(), server_default=sa.text('0')),
        sa.Column('enrollment_rate', sa.Numeric(5, 2), server_default=sa.text('0')),
        sa.Column('coverage_gap', sa.Integer(), server_default=sa.text('0')),
        sa.Column('primary_barrier', sa.String(length=50)),
        sa.Column('estimated_gap_value', sa.BigInteger(), server_default=sa.text('0')),
        sa.Column('gap_severity', sa.String(length=10)),
        sa.Column('last_calculated', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
    )

    op.create_index('idx_cb_citizen', 'citizen_benefits', ['citizen_id'])
    op.create_index('idx_cb_missed', 'citizen_benefits', ['citizen_id', 'is_missed'])
    op.create_index('idx_ae_citizen', 'agent_executions', ['citizen_id', 'started_at'])
    op.create_index('idx_schemes_category', 'schemes', ['category', 'is_active'])


def downgrade() -> None:
    op.drop_index('idx_schemes_category', table_name='schemes')
    op.drop_index('idx_ae_citizen', table_name='agent_executions')
    op.drop_index('idx_cb_missed', table_name='citizen_benefits')
    op.drop_index('idx_cb_citizen', table_name='citizen_benefits')
    op.drop_table('welfare_gaps')
    op.drop_table('agent_executions')
    op.drop_table('citizen_benefits')
    op.drop_table('schemes')
    op.drop_table('life_events')
    op.drop_table('citizen_profiles')
    op.drop_table('citizens')
