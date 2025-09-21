from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List
import csv, io, os, datetime

app = FastAPI()

# Database
db_url = os.getenv("DATABASE_URL", "sqlite:///database.db")
engine = create_engine(db_url, connect_args={"check_same_thread": False})

# Models
class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: int

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer: str
    item_id: int
    quantity: int
    total: float
    status: str = "尚未匯款"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

SQLModel.metadata.create_all(engine)

# 商品管理
@app.post("/items")
def create_item(item: Item):
    with Session(engine) as session:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

@app.get("/items", response_model=List[Item])
def get_items():
    with Session(engine) as session:
        return session.exec(select(Item)).all()

@app.patch("/items/{item_id}")
def update_item(item_id: int, new_item: Item):
    with Session(engine) as session:
        item = session.get(Item, item_id)
        if not item:
            raise HTTPException(404, "商品不存在")
        item.name = new_item.name or item.name
        item.price = new_item.price or item.price
        item.stock = new_item.stock or item.stock
        session.add(item)
        session.commit()
        return item

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    with Session(engine) as session:
        item = session.get(Item, item_id)
        if not item:
            raise HTTPException(404, "商品不存在")
        session.delete(item)
        session.commit()
        return {"ok": True}

# 訂單管理
@app.post("/orders")
def create_order(order: Order):
    with Session(engine) as session:
        item = session.get(Item, order.item_id)
        if not item:
            raise HTTPException(404, "商品不存在")
        order.total = item.price * order.quantity
        session.add(order)
        session.commit()
        session.refresh(order)
        return order

@app.get("/orders", response_model=List[Order])
def get_orders(
    search: Optional[str] = None,
    sort_by: Optional[str] = Query(None, enum=["created_at", "status"])
):
    with Session(engine) as session:
        query = select(Order)
        if search:
            query = query.where(Order.customer.contains(search))
        if sort_by:
            if sort_by == "created_at":
                query = query.order_by(Order.created_at.desc())
            elif sort_by == "status":
                query = query.order_by(Order.status.asc())
        return session.exec(query).all()

@app.patch("/orders/{order_id}")
def update_order(order_id: int, new_order: Order):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(404, "訂單不存在")
        order.customer = new_order.customer or order.customer
        order.quantity = new_order.quantity or order.quantity
        order.status = new_order.status or order.status
        item = session.get(Item, order.item_id)
        if item:
            order.total = item.price * order.quantity
        session.add(order)
        session.commit()
        return order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(404, "訂單不存在")
        session.delete(order)
        session.commit()
        return {"ok": True}

# 匯出
@app.get("/orders/export")
def export_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Customer", "Item", "Quantity", "Total", "Status", "Created At"])
        for o in orders:
            writer.writerow([o.id, o.customer, o.item_id, o.quantity, o.total, o.status, o.created_at])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=orders.csv"})
