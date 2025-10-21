from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Import your database URL and models
from backend.database import DATABASE_URL
from backend.models import Base  # Make sure all models are imported in models.py

# Alembic Config object
config = context.config

# Set up Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Use the metadata from your Base
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        {},  # empty config, we provide URL directly
        url=DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

# Choose online/offline mode automatically
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
