from fastapi import FastAPI, HTTPException, Response
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
import csv
import io

# ====================
# 資料庫模型
# ====================
class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: int
    category: Optional[str] = None
    description: Optional[str] = None

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    item: str
    quantity: int
    price: float
    status: str

# ====================
# FastAPI 初始化
# ====================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///database.db"
engine = create_engine(DATABASE_URL)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# ====================
# 商品管理 API
# ====================
@app.get("/items", response_model=List[Item])
def get_items():
    with Session(engine) as session:
        return session.exec(select(Item)).all()

@app.post("/items", response_model=Item)
def add_item(item: Item):
    if item.price < 0 or item.stock < 0:
        raise HTTPException(status_code=400, detail="價格與庫存不能小於 0")
    with Session(engine) as session:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    with Session(engine) as session:
        item = session.get(Item, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="找不到商品")
        session.delete(item)
        session.commit()
        return {"ok": True}

# ====================
# 訂單管理 API
# ====================
@app.get("/orders", response_model=List[Order])
def get_orders():
    with Session(engine) as session:
        return session.exec(select(Order)).all()

@app.post("/orders", response_model=Order)
def add_order(order: Order):
    if order.quantity <= 0 or order.price < 0:
        raise HTTPException(status_code=400, detail="數量必須 >0 且價格 >=0")
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
            raise HTTPException(status_code=404, detail="找不到訂單")
        session.delete(order)
        session.commit()
        return {"ok": True}

# ====================
# 匯出訂單 CSV
# ====================
@app.get("/orders/export")
def export_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "客戶姓名", "商品", "數量", "單價", "總金額", "狀態"])
        for o in orders:
            writer.writerow([o.id, o.customer_name, o.item, o.quantity, o.price, o.price * o.quantity, o.status])
        response = Response(content=output.getvalue(), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=orders.csv"
        return response
