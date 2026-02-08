from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import fact_check, health, tokens, payment
from app.metrics import metrics_router

app = FastAPI(
    title="AI Fact Checker API",
    description="AI-powered fact checking and misinformation analysis",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(fact_check.router, prefix="/api/v1", tags=["Fact Check"])
app.include_router(tokens.router, prefix="/api/v1", tags=["Tokens"])
app.include_router(payment.router, prefix="/api/v1", tags=["Payment"])
app.include_router(metrics_router, tags=["Metrics"])
