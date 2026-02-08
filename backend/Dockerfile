FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app ./app

# Create startup script
RUN echo '#!/bin/bash\n\
python -c "from app.database import Base, engine; import asyncio; asyncio.run(engine.dispose())"\n\
python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8000

CMD ["/bin/bash", "/app/start.sh"]
