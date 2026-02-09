import json
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
from typing import Optional
from app.config import get_settings
from app.services.token_service import add_tokens
from app.metrics import payment_success, payment_revenue
from app.database import get_db_session
from app.models.token import PaymentTransaction
import httpx

router = APIRouter()

# Product configurations
PRODUCTS = {
    "basic": {"tokens": 3, "price_cents": 799},
    "standard": {"tokens": 10, "price_cents": 1999},
}


class CheckoutRequest(BaseModel):
    product_id: str
    device_id: str
    success_url: str
    cancel_url: str


@router.post("/checkout/create")
async def create_checkout(request: CheckoutRequest):
    """Create a Creem checkout session."""
    settings = get_settings()
    
    if not settings.CREEM_API_KEY:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    # Parse product IDs from settings
    try:
        product_ids = json.loads(settings.CREEM_PRODUCT_IDS)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid product configuration")
    
    creem_product_id = product_ids.get(request.product_id)
    if not creem_product_id:
        raise HTTPException(status_code=400, detail=f"Unknown product: {request.product_id}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.creem.io/v1/checkouts",
            headers={
                "x-api-key": settings.CREEM_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "product_id": creem_product_id,
                "success_url": request.success_url,
                "request_id": f"{request.device_id}_{request.product_id}",
                "metadata": {
                    "device_id": request.device_id,
                    "product_sku": request.product_id
                }
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create checkout")
        
        data = response.json()
        return {"checkout_url": data.get("checkout_url")}


@router.post("/webhook/creem")
async def creem_webhook(
    request: Request,
    creem_signature: Optional[str] = Header(None, alias="creem-signature")
):
    """Handle Creem payment webhooks."""
    settings = get_settings()
    
    body = await request.body()
    
    # Verify signature
    if settings.CREEM_WEBHOOK_SECRET and creem_signature:
        expected = hmac.new(
            settings.CREEM_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected, creem_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    data = await request.json()
    event_type = data.get("type")
    
    if event_type == "checkout.completed":
        checkout = data.get("object", {})
        metadata = checkout.get("metadata", {})
        
        device_id = metadata.get("device_id")
        product_sku = metadata.get("product_sku")
        transaction_id = checkout.get("id")
        amount_cents = checkout.get("amount", 0)
        
        if device_id and product_sku and transaction_id:
            product = PRODUCTS.get(product_sku)
            if product:
                # Add tokens
                await add_tokens(device_id, product["tokens"], product_sku, transaction_id)
                
                # Record transaction
                async with get_db_session() as session:
                    txn = PaymentTransaction(
                        transaction_id=transaction_id,
                        device_id=device_id,
                        product_id=product_sku,
                        amount_cents=amount_cents,
                        status="completed"
                    )
                    session.add(txn)
                    await session.commit()
                
                # Update metrics
                payment_success.labels(tool="fact-checker", product_sku=product_sku).inc()
                payment_revenue.labels(tool="fact-checker").inc(amount_cents)
    
    return {"status": "ok"}


@router.get("/products")
async def get_products():
    """Get available products."""
    return {
        "products": [
            {
                "id": "basic",
                "name": "3 Checks",
                "tokens": 3,
                "price": "$7.99",
                "price_cents": 799
            },
            {
                "id": "standard", 
                "name": "10 Checks",
                "tokens": 10,
                "price": "$19.99",
                "price_cents": 1999,
                "popular": True
            }
        ]
    }
