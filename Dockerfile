# Docker file for building the FastAPI application with Firestore and FastAPI

# Base image
FROM python:3.9-slim

# Set metadata labels
LABEL version="1.0"
LABEL description="SRE AI Agent - Intelligent SRE Assistant"
LABEL org.opencontainers.image.title="SRE AI Agent"
LABEL org.opencontainers.image.description="AI-powered SRE assistant using FastAPI and Firestore"

# Working Directory
WORKDIR /app

# Install System Dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Port
EXPOSE 8080

# Run the Server
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}"]
