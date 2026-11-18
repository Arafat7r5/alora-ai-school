FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim
WORKDIR /code
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-install-project
COPY app ./app
COPY tests ./tests
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
