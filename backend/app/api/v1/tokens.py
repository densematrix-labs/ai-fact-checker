from fastapi import APIRouter, Header
from typing import Optional
from app.services.token_service import get_token_balance, get_free_trial_status

router = APIRouter()


@router.get("/tokens/balance")
async def get_balance(
    x_device_id: Optional[str] = Header(None, alias="X-Device-Id")
):
    """Get token balance for a device."""
    device_id = x_device_id or "anonymous"
    
    paid_tokens = await get_token_balance(device_id)
    has_trial, trial_remaining = await get_free_trial_status(device_id)
    
    return {
        "device_id": device_id,
        "paid_tokens": paid_tokens,
        "free_trial_remaining": trial_remaining if has_trial else 0,
        "total_available": paid_tokens + (trial_remaining if has_trial else 0)
    }
