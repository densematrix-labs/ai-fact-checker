from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class DeviceUsage(Base):
    __tablename__ = "device_usage"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(255), unique=True, nullable=False, index=True)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class GenerationToken(Base):
    __tablename__ = "generation_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(255), nullable=False, index=True)
    total = Column(Integer, nullable=False)
    remaining = Column(Integer, nullable=False)
    product_sku = Column(String(100), nullable=False)
    transaction_id = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String(255), unique=True, nullable=False)
    device_id = Column(String(255), nullable=False)
    product_id = Column(String(255), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
