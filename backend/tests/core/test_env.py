import os

from app.core import env


def test_load_backend_env_defaults_to_dev_file_when_present(monkeypatch, tmp_path):
    dev_env_file = tmp_path / ".env.dev"
    dev_env_file.write_text("DATABASE_URL=sqlite:///../sqlite.db\n", encoding="utf-8")

    monkeypatch.delenv("APP_ENV", raising=False)
    monkeypatch.delenv("ENV", raising=False)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setattr(env, "DEV_ENV_FILE", dev_env_file)
    monkeypatch.setattr(env, "DEFAULT_ENV_FILE", tmp_path / ".env")
    monkeypatch.setattr(env, "TEST_ENV_FILE", tmp_path / ".env.test")

    env.load_backend_env.cache_clear()

    assert env.get_app_env() == "development"

    env.load_backend_env()

    assert os.getenv("DATABASE_URL") == "sqlite:///../sqlite.db"

    env.load_backend_env.cache_clear()
