# Use full Python image (not slim) to avoid long build times due to missing system libraries
FROM python:3.11

# Set the working directory
WORKDIR /app

# Install system dependencies required by osmnx and geospatial packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libproj-dev \
    proj-data \
    proj-bin \
    libgeos-dev \
    libgdal-dev \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python packages
COPY requirements.txt . 
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy los_angeles_precomputed_risk1.graphml from backend/data to the container's /app/data folder
COPY backend/data/los_angeles_precomputed_risk1.graphml /app/data/los_angeles_precomputed_risk1.graphml

# Run your app
CMD ["python", "app.py"]
