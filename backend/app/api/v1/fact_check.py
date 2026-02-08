from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.llm_service import analyze_claim
from app.services.token_service import check_and_consume_token, get_free_trial_status
from app.metrics import fact_check_requests, tokens_consumed

router = APIRouter()


class ClaimRequest(BaseModel):
    claim: str = Field(..., min_length=10, max_length=5000, description="The claim to fact-check")
    language: str = Field(default="en", description="Response language code")


class ClaimPoint(BaseModel):
    point: str
    assessment: str  # "likely_true", "uncertain", "likely_false"
    explanation: str


class SourceAnalysis(BaseModel):
    likely_origin: str
    spread_pattern: str
    red_flags: List[str]


class FactCheckResult(BaseModel):
    credibility_score: float = Field(..., ge=0, le=100)
    credibility_level: str  # "high", "medium", "low"
    summary: str
    key_points: List[ClaimPoint]
    contradictions: List[str]
    source_analysis: SourceAnalysis
    disclaimer: str


@router.post("/check", response_model=FactCheckResult)
async def check_claim(
    request: ClaimRequest,
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id")
):
    """Analyze a claim for factual accuracy."""
    device_id = x_device_id or "anonymous"
    
    # Check token availability
    can_use, reason = await check_and_consume_token(device_id)
    if not can_use:
        fact_check_requests.labels(tool="fact-checker", status="payment_required").inc()
        raise HTTPException(
            status_code=402,
            detail={"error": reason, "code": "payment_required"}
        )
    
    try:
        result = await analyze_claim(request.claim, request.language)
        fact_check_requests.labels(tool="fact-checker", status="success").inc()
        tokens_consumed.labels(tool="fact-checker").inc()
        return result
    except Exception as e:
        fact_check_requests.labels(tool="fact-checker", status="error").inc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/trial-status")
async def get_trial_status(
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id")
):
    """Check if device has free trial available."""
    device_id = x_device_id or "anonymous"
    has_trial, remaining = await get_free_trial_status(device_id)
    return {
        "has_free_trial": has_trial,
        "remaining_checks": remaining
    }
