FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Node for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Copy full project
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN chmod +x ./node_modules/.bin/vite && npx vite build

# Copy built frontend to Django static dir
RUN mkdir -p /app/backend/static && cp -r dist/* /app/backend/static/

# Collect static files for whitenoise
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn inventory_project.wsgi:application --bind 0.0.0.0:8000"]
