FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOME=/home/user

WORKDIR /app

# Install system runtime dependencies for OpenCV, PyMuPDF, and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU first to avoid heavy CUDA bloat
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install application dependencies from backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and assets into container
COPY backend/ .

# Set up user and permissions for Hugging Face Spaces (runs as UID 1000)
RUN useradd -m -u 1000 user || true
RUN mkdir -p storage/local models/cache && chown -R 1000:1000 /app

USER 1000

EXPOSE 8000

# Start Uvicorn on port 8000 (2 workers utilize Hugging Face's 2 vCPUs and 16 GB RAM)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
