from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from config import settings
from database import CartItem, Product, create_tables, get_db


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


class CartItemDTO(BaseModel):
    product_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    quantity: int
    product: ProductResponse

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

@app.get("/cart/items", response_model=List[CartItemResponse])
async def get_cart_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).options(joinedload(CartItem.product)))
    cart_items = result.scalars().all()
    return cart_items

@app.post("/cart/items", response_model=CartItemResponse)
async def add_to_cart(cart_item: CartItemDTO, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    result = await db.execute(select(CartItem).filter(CartItem.product_id == cart_item.product_id))
    db_cart_item = result.scalar_one_or_none()

    if db_cart_item:
        db_cart_item.quantity += cart_item.quantity
    else:
        db_cart_item = CartItem(product_id=cart_item.product_id, quantity=cart_item.quantity)
        db.add(db_cart_item)

    product.stock -= cart_item.quantity

    await db.commit()
    await db.refresh(db_cart_item)
    
    result = await db.execute(select(CartItem).options(joinedload(CartItem.product)).filter(CartItem.id == db_cart_item.id))
    db_cart_item = result.scalar_one_or_none()

    return db_cart_item

@app.delete("/cart/items/{item_id}")
async def remove_from_cart(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).filter(CartItem.id == item_id))
    db_cart_item = result.scalar_one_or_none()

    if not db_cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    result = await db.execute(select(Product).filter(Product.id == db_cart_item.product_id))
    product = result.scalar_one_or_none()

    if product:
        product.stock += db_cart_item.quantity

    await db.delete(db_cart_item)
    await db.commit()
    return {"message": "Item removed from cart"}

@app.put("/cart/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(item_id: int, quantity: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).filter(CartItem.id == item_id))
    db_cart_item = result.scalar_one_or_none()

    if not db_cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    result = await db.execute(select(Product).filter(Product.id == db_cart_item.product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    stock_diff = quantity - db_cart_item.quantity

    if product.stock < stock_diff:
        raise HTTPException(status_code=400, detail="Not enough stock")

    product.stock -= stock_diff
    db_cart_item.quantity = quantity

    await db.commit()
    await db.refresh(db_cart_item)
    
    result = await db.execute(select(CartItem).options(joinedload(CartItem.product)).filter(CartItem.id == db_cart_item.id))
    db_cart_item = result.scalar_one_or_none()

    return db_cart_item

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
