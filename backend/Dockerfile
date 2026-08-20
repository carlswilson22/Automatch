FROM python:3.11-slim

WORKDIR /app

# Copy requirements file first to bypass cache when it changes
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Run the seed script before starting the server
# (We use a shell script block as CMD so it executes seeding then starts)
CMD python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
