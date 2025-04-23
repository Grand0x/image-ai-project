FROM python:3.11-slim
WORKDIR /app
COPY ./app /app/app
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir transformers torch fastapi uvicorn
CMD ["uvicorn", "app.worker:app", "--host", "0.0.0.0", "--port", "5000"]