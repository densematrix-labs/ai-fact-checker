from typing import Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db_session
from app.models.token import DeviceUsage, GenerationToken

FREE_TRIAL_LIMIT = 1


async def get_free_trial_status(device_id: str) -> Tuple[bool, int]:
    """Check if device has free trial available."""
    async with get_db_session() as session:
        result = await session.execute(
            select(DeviceUsage).where(DeviceUsage.device_id == device_id)
        )
        usage = result.scalar_one_or_none()
        
        if usage is None:
            return True, FREE_TRIAL_LIMIT
        
        remaining = max(0, FREE_TRIAL_LIMIT - usage.usage_count)
        return remaining > 0, remaining


async def check_and_consume_token(device_id: str) -> Tuple[bool, str]:
    """Check if user can make a request and consume a token if available."""
    async with get_db_session() as session:
        # Check for paid tokens first
        result = await session.execute(
            select(GenerationToken)
            .where(GenerationToken.device_id == device_id)
            .where(GenerationToken.remaining > 0)
            .order_by(GenerationToken.created_at.asc())
        )
        token = result.scalar_one_or_none()
        
        if token:
            token.remaining -= 1
            await session.commit()
            return True, "paid_token"
        
        # Check free trial
        result = await session.execute(
            select(DeviceUsage).where(DeviceUsage.device_id == device_id)
        )
        usage = result.scalar_one_or_none()
        
        if usage is None:
            # First time user - grant free trial
            usage = DeviceUsage(device_id=device_id, usage_count=1)
            session.add(usage)
            await session.commit()
            return True, "free_trial"
        
        if usage.usage_count < FREE_TRIAL_LIMIT:
            usage.usage_count += 1
            await session.commit()
            return True, "free_trial"
        
        return False, "No tokens remaining. Please purchase more."


async def add_tokens(device_id: str, amount: int, product_sku: str, transaction_id: str) -> int:
    """Add tokens to a device after payment."""
    async with get_db_session() as session:
        token = GenerationToken(
            device_id=device_id,
            total=amount,
            remaining=amount,
            product_sku=product_sku,
            transaction_id=transaction_id
        )
        session.add(token)
        await session.commit()
        return amount


async def get_token_balance(device_id: str) -> int:
    """Get total remaining tokens for a device."""
    async with get_db_session() as session:
        result = await session.execute(
            select(GenerationToken)
            .where(GenerationToken.device_id == device_id)
            .where(GenerationToken.remaining > 0)
        )
        tokens = result.scalars().all()
        return sum(t.remaining for t in tokens)
