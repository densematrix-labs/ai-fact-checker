import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_check_claim_validation(client):
    """Test that short claims are rejected."""
    response = await client.post(
        "/api/v1/check",
        json={"claim": "short", "language": "en"},
        headers={"X-Device-Id": "test-device"}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_check_claim_success(client):
    """Test successful fact check with mocked LLM."""
    mock_result = {
        "credibility_score": 75,
        "credibility_level": "medium",
        "summary": "Test summary",
        "key_points": [
            {
                "point": "Test point",
                "assessment": "uncertain",
                "explanation": "Test explanation"
            }
        ],
        "contradictions": [],
        "source_analysis": {
            "likely_origin": "social media",
            "spread_pattern": "viral",
            "red_flags": []
        },
        "disclaimer": "This is a test disclaimer"
    }
    
    with patch("app.api.v1.fact_check.check_and_consume_token", new=AsyncMock(return_value=(True, "free_trial"))):
        with patch("app.api.v1.fact_check.analyze_claim", new=AsyncMock(return_value=mock_result)):
            response = await client.post(
                "/api/v1/check",
                json={
                    "claim": "This is a test claim that is long enough to pass validation",
                    "language": "en"
                },
                headers={"X-Device-Id": "test-device"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["credibility_score"] == 75
            assert data["credibility_level"] == "medium"


@pytest.mark.asyncio
async def test_check_claim_payment_required(client):
    """Test that payment required error is properly formatted."""
    with patch("app.api.v1.fact_check.check_and_consume_token", new=AsyncMock(return_value=(False, "No tokens remaining. Please purchase more."))):
        response = await client.post(
            "/api/v1/check",
            json={
                "claim": "This is a test claim that is long enough to pass validation",
                "language": "en"
            },
            headers={"X-Device-Id": "exhausted-device"}
        )
        
        assert response.status_code == 402
        data = response.json()
        # Verify error detail is properly structured
        detail = data.get("detail")
        if isinstance(detail, dict):
            assert "error" in detail or "message" in detail
        else:
            assert isinstance(detail, str)


@pytest.mark.asyncio
async def test_trial_status(client):
    """Test trial status endpoint."""
    response = await client.get(
        "/api/v1/trial-status",
        headers={"X-Device-Id": "new-device"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "has_free_trial" in data
    assert "remaining_checks" in data
