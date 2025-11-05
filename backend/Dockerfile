# Backend Dockerfile

FROM python:3.11-slim

# Set working directory to the backend root
WORKDIR /backend

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory
COPY .. .

# Set PYTHONPATH to include the backend directory
ENV PYTHONPATH=/backend

EXPOSE 8001

# Run uvicorn pointing to the app.main module
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]