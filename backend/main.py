from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List
from datetime import datetime
import csv
from fastapi.responses import StreamingResponse
import io

app = FastAPI()

# CORS (允許前端呼叫)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料模型
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    product: str
    account_last5: str
    shipping_method: str
    status: str = "尚未匯款"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class ShippingMethod(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class Status(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


sqlite_url = "sqlite:///./orders.db"
engine = create_engine(sqlite_url, echo=False)
SQLModel.metadata.create_all(engine)


# 工具：取得 DB Session
def get_session():
    with Session(engine) as session:
        yield session


# ========== 訂單 API ==========
@app.post("/orders")
def create_order(order: Order):
    with Session(engine) as session:
        session.add(order)
        session.commit()
        session.refresh(order)
        return order


@app.get("/orders", response_model=List[Order])
def list_orders(
    name: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = "created_at",
    order: str = "desc",
):
    with Session(engine) as session:
        query = select(Order)
        if name:
            query = query.where(Order.name.contains(name))
        if status:
            query = query.where(Order.status == status)
        if sort == "created_at":
            if order == "desc":
                query = query.order_by(Order.created_at.desc())
            else:
                query = query.order_by(Order.created_at.asc())
        results = session.exec(query).all()
        return results


@app.patch("/orders/{order_id}")
def update_order(order_id: int, data: dict):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        for key, value in data.items():
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
        session.delete(order)
        session.commit()
        return {"message": "Order deleted"}


@app.get("/orders/export")
def export_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Phone", "Product", "Account Last5", "Shipping", "Status", "Created At"])
    for o in orders:
        writer.writerow([o.id, o.name, o.phone, o.product, o.account_last5, o.shipping_method, o.status, o.created_at])
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=orders.csv"
    return response


# ========== 商品 API ==========
@app.get("/products", response_model=List[Product])
def list_products():
    with Session(engine) as session:
        return session.exec(select(Product)).all()


@app.post("/products")
def add_product(product: Product):
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
            raise HTTPException(status_code=404, detail="Product not found")
        session.delete(product)
        session.commit()
        return {"message": "Product deleted"}


# ========== 寄送方式 API ==========
@app.get("/shipping-methods", response_model=List[ShippingMethod])
def list_shipping_methods():
    with Session(engine) as session:
        return session.exec(select(ShippingMethod)).all()


@app.post("/shipping-methods")
def add_shipping_method(method: ShippingMethod):
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
            raise HTTPException(status_code=404, detail="Shipping method not found")
        session.delete(method)
        session.commit()
        return {"message": "Shipping method deleted"}


# ========== 狀態 API ==========
@app.get("/statuses", response_model=List[Status])
def list_statuses():
    with Session(engine) as session:
        return session.exec(select(Status)).all()


@app.post("/statuses")
def add_status(status: Status):
    with Session(engine) as session:
        session.add(status)
        session.commit()
        session.refresh(status)
        return status
