from fastapi import FastAPI, HTTPException
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List

app = FastAPI()

# ====================
# 資料模型
# ====================
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    product: str
    account_last5: str
    shipping_method: str
    status: str = "尚未匯款"

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class ShippingMethod(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

# ====================
# DB 初始化
# ====================
sqlite_url = "sqlite:///database.db"
engine = create_engine(sqlite_url, echo=True)
SQLModel.metadata.create_all(engine)

# ====================
# 訂單 CRUD
# ====================
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

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="訂單不存在")
        session.delete(order)
        session.commit()
        return {"ok": True}

# ====================
# 商品選項 CRUD
# ====================
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

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="商品不存在")
        session.delete(product)
        session.commit()
        return {"ok": True}

# ====================
# 寄送方式 CRUD
# ====================
@app.get("/shipping-methods", response_model=List[ShippingMethod])
def get_shipping_methods():
    with Session(engine) as session:
        return session.exec(select(ShippingMethod)).all()

@app.post("/shipping-methods", response_model=ShippingMethod)
def create_shipping_method(method: ShippingMethod):
    with Session(engine) as session:
        session.add(method)
        session.commit()
        session.refresh(method)
        return method

@app.delete("/shipping-methods/{method_id}")
def delete_shipping_method(method_id: int):
    with Session(engine) as session:
        method = session.get(ShippingMethod, method_id)
        if not method:
            raise HTTPException(status_code=404, detail="寄送方式不存在")
        session.delete(method)
        session.commit()
        return {"ok": True}
