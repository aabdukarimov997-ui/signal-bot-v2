FROM python:3.12-slim AS builder

WORKDIR /build

COPY pyproject.toml .
RUN pip install --no-cache-dir --prefix=/install ".[production]"

FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /install /usr/local

RUN groupadd -r botuser && useradd -r -g botuser -d /app botuser \
    && chown -R botuser:botuser /app

COPY . .

ENV PYTHONPATH=/app

USER botuser

ENTRYPOINT ["bash", "/app/entrypoint.sh"]
