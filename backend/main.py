from fastapi import FastAPI, HTTPException
from sqlmodel import SQLModel, Field, Relationship, Session, create_engine, select
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# --------------------
# 資料表模型
# --------------------
class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    price: float
    subtotal: float

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: int
    description: Optional[str] = None

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    phone: str
    account_last5: str
    shipping_method: str
    status: str
    total_amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --------------------
# DB 初始化
# --------------------
engine = create_engine("sqlite:///database.db")

def create_db():
    SQLModel.metadata.create_all(engine)

create_db()

# --------------------
# 商品 API
# --------------------
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
def update_product(product_id: int, data: dict):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        for key, value in data.items():
            setattr(product, key, value)
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
        return {"message": "Product deleted"}

# --------------------
# 訂單 API
# --------------------
@app.get("/orders")
def get_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
        result = []
        for order in orders:
            items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
            result.append({"order": order, "items": items})
        return result

@app.post("/orders")
def create_order(data: dict):
    with Session(engine) as session:
        items_data = data.pop("items", [])
        total_amount = 0
        items = []

        for item in items_data:
            product = session.get(Product, item["product_id"])
            if not product or product.stock < item["quantity"]:
                raise HTTPException(status_code=400, detail="Product not available or out of stock")

            subtotal = product.price * item["quantity"]
            total_amount += subtotal
            product.stock -= item["quantity"]

            items.append(OrderItem(
                product_id=product.id,
                quantity=item["quantity"],
                price=product.price,
                subtotal=subtotal
            ))
            session.add(product)

        order = Order(**data, total_amount=total_amount)
        session.add(order)
        session.commit()
        session.refresh(order)

        for item in items:
            item.order_id = order.id
            session.add(item)

        session.commit()
        return {"order": order, "items": items}

@app.patch("/orders/{order_id}")
def update_order(order_id: int, data: dict):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        for key, value in data.items():
            if hasattr(order, key):
                setattr(order, key, value)

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

        items = session.exec(select(OrderItem).where(OrderItem.order_id == order_id)).all()
        for item in items:
            product = session.get(Product, item.product_id)
            if product:
                product.stock += item.quantity
                session.add(product)
            session.delete(item)

        session.delete(order)
        session.commit()
        return {"message": "Order deleted and stock restored"}
