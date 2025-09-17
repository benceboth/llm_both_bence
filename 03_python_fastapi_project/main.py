from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, create_tables, get_db


class ProductDTO(BaseModel):
  name: str
  price: float
  description: str | None = None
  stock: int


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Template"}

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@app.get("/products", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products

@app.post("/products", response_model=ProductResponse)
async def create_product(product: ProductDTO, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.name == product.name))
    db_product = result.first()

    if db_product:
        raise HTTPException(status_code=400, detail="Product with this name already registered")

    db_product = Product(name = product.name, price = product.price, description = product.description, stock = product.stock)
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductDTO, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = await db.execute(
        select(Product).filter(Product.name == product.name, Product.id != product_id)
    )
    
    db_product.name = product.name
    db_product.price = product.price
    db_product.description = product.description
    db_product.stock = product.stock
    
    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(db_product)
    await db.commit()
    return {"message": "Product deleted successfully"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)