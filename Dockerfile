# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js for building frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy project files
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN ./node_modules/.bin/vite build

# Move built frontend to backend static files
RUN mkdir -p /app/backend/static && cp -r dist/* /app/backend/static/

# Set work directory back to backend
WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && gunicorn inventory_project.wsgi:application --bind 0.0.0.0:8000"]
