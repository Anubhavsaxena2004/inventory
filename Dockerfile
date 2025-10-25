# ---------------------
# Base: Python backend
# ---------------------
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---------------------
# Install backend dependencies
# ---------------------
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# ---------------------
# Install Node.js for frontend build
# ---------------------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# ---------------------
# Build frontend
# ---------------------
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of frontend code (after dependencies)
COPY frontend ./

# Run Vite build safely (builds directly to backend/static)
RUN npx vite build

# ---------------------
# Copy backend code and collect static files
# ---------------------
WORKDIR /app/backend
COPY backend ./
RUN python manage.py collectstatic --noinput || true

# ---------------------
# Run Django server
# ---------------------
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && gunicorn inventory_project.wsgi:application --bind 0.0.0.0:8000"]
