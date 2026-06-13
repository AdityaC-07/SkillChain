FROM python:3.11-slim

WORKDIR /app

# Install system deps for Pillow, python-magic
RUN apt-get update && apt-get install -y \
    libmagic1 libglib2.0-0 libsm6 libxext6 build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download HuggingFace model during build
RUN python -c "from transformers import pipeline; pipeline('image-classification', model='microsoft/resnet-50')"

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
