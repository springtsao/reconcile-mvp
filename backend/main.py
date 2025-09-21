from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List
import uvicorn

# =========================================================
# Database models
# =========================================================

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    item: str
    quantity: int
    price: float
    shipping_method: str
    status: str = "尚未匯款"

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: int

# =========================================================
# Database setup
# =========================================================

DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# =========================================================
# FastAPI app
# =========================================================

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ 建議之後換成你的 Vercel 網址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# Orders Endpoints
# =========================================================

@app.get("/orders", response_model=List[Order])
def get_orders():
    with Session(engine) as session:
        return session.exec(select(Order)).all()

@app.post("/orders", response_model=Order)
def create_order(order: Order):
    with Session(engine) as session:
        session.add(order)
        session.commit()
        session.refresh(order)
        return order

@app.patch("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, order_data: Order):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order.customer_name = order_data.customer_name
        order.item = order_data.item
        order.quantity = order_data.quantity
        order.price = order_data.price
        order.shipping_method = order_data.shipping_method
        order.status = order_data.status
        session.add(order)
        session.commit()
        session.refresh(order)
        return order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        session.delete(order)
        session.commit()
        return {"message": "Order deleted successfully"}

# =========================================================
# Products Endpoints
# =========================================================

@app.get("/products", response_model=List[Product])
def get_products():
    with Session(engine) as session:
        return session.exec(select(Product)).all()

@app.post("/products", response_model=Product)
def create_product(product: Product):
    with Session(engine) as session:
        session.add(product)
        session.commit()
        session.refresh(product)
        return product

@app.patch("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product_data: Product):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        product.name = product_data.name
        product.price = product_data.price
        product.stock = product_data.stock
        session.add(product)
        session.commit()
        session.refresh(product)
        return product

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        session.delete(product)
        session.commit()
        return {"message": "Product deleted successfully"}

# =========================================================
# Run locally (for debug)
# =========================================================

if __name__ == "__main__":
    create_db_and_tables()
    uvicorn.run(app, host="0.0.0.0", port=8000)
