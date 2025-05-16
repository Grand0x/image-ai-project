FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement requirements.txt pour tirer parti du cache Docker
COPY requirements.txt /app/

# Installer les dépendances
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste de l'application
COPY ./app /app/app

# Exposer le port utilisé par le service
EXPOSE 5000

# Commande pour démarrer le service
CMD ["uvicorn", "app.worker:app", "--host", "0.0.0.0", "--port", "5000"]
