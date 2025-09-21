from fastapi import FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
from fastapi.responses import StreamingResponse
import io

app = FastAPI()

# -------------------------------
# Middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ 上線後可限定網域
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# DB Model
# -------------------------------
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    product: str
    account_last5: str
    shipping_method: str
    status: str
    created_at: Optional[str] = Field(default=None)


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class ShippingMethod(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class Status(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


sqlite_url = "sqlite:///database.db"
engine = create_engine(sqlite_url, echo=True)
SQLModel.metadata.create_all(engine)

# -------------------------------
# Pydantic Schemas
# -------------------------------
class OrderUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    product: Optional[str] = None
    account_last5: Optional[str] = None
    shipping_method: Optional[str] = None
    status: Optional[str] = None

# -------------------------------
# Order CRUD
# -------------------------------
@app.get("/orders", response_model=List[Order])
def list_orders(
    name: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = Query("created_at"),
    order: str = Query("desc"),
):
    with Session(engine) as session:
        stmt = select(Order)

        if name:
            stmt = stmt.where(Order.name.contains(name))
        if status:
            stmt = stmt.where(Order.status == status)

        if sort == "created_at":
            stmt = stmt.order_by(Order.created_at.desc() if order == "desc" else Order.created_at)

        return session.exec(stmt).all()


@app.post("/orders", response_model=Order)
def create_order(order: Order):
    with Session(engine) as session:
        session.add(order)
        session.commit()
        session.refresh(order)
        return order


@app.patch("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, data: OrderUpdate):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        for key, value in data.dict(exclude_unset=True).items():
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
        return {"ok": True}

# -------------------------------
# Product CRUD
# -------------------------------
@app.get("/products", response_model=List[Product])
def list_products():
    with Session(engine) as session:
        return session.exec(select(Product)).all()


@app.post("/products", response_model=Product)
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
        return {"ok": True}

# -------------------------------
# Shipping CRUD
# -------------------------------
@app.get("/shipping-methods", response_model=List[ShippingMethod])
def list_shipping_methods():
    with Session(engine) as session:
        return session.exec(select(ShippingMethod)).all()


@app.post("/shipping-methods", response_model=ShippingMethod)
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
        return {"ok": True}

# -------------------------------
# Status CRUD
# -------------------------------
@app.get("/statuses", response_model=List[Status])
def list_statuses():
    with Session(engine) as session:
        return session.exec(select(Status)).all()


@app.post("/statuses", response_model=Status)
def add_status(status: Status):
    with Session(engine) as session:
        session.add(status)
        session.commit()
        session.refresh(status)
        return status


@app.delete("/statuses/{status_id}")
def delete_status(status_id: int):
    with Session(engine) as session:
        status = session.get(Status, status_id)
        if not status:
            raise HTTPException(status_code=404, detail="Status not found")
        session.delete(status)
        session.commit()
        return {"ok": True}

# -------------------------------
# Export CSV
# -------------------------------
@app.get("/orders/export")
def export_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "name", "phone", "product", "account_last5", "shipping_method", "status", "created_at"])
        for o in orders:
            writer.writerow([o.id, o.name, o.phone, o.product, o.account_last5, o.shipping_method, o.status, o.created_at])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=orders.csv"})
