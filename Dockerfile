FROM python:3.12-slim AS builder

WORKDIR /build

COPY pyproject.toml .
RUN pip install --no-cache-dir --prefix=/install .

FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /install /usr/local

RUN groupadd -r botuser && useradd -r -g botuser -d /app botuser \
    && chown -R botuser:botuser /app

COPY . .

USER botuser

EXPOSE 8080

ENTRYPOINT ["bash", "/app/entrypoint.sh"]
