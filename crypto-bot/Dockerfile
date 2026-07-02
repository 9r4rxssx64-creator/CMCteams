# Conteneur du bot crypto — pour hébergement cloud (Railway, Render, VPS…)
# Les clés API sont fournies par les VARIABLES D'ENVIRONNEMENT de l'hébergeur,
# jamais copiées dans l'image (aucun .env n'est embarqué).
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py ./

# Sortie non bufferisée -> les logs apparaissent en direct dans le dashboard
ENV PYTHONUNBUFFERED=1

CMD ["python", "bot.py"]
