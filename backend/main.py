from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List

app = FastAPI()

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可改成指定你的前端網址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫模型
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    item: str
    account_last5: str
    shipping: str
    status: str = "尚未匯款"

# 初始化資料庫
engine = create_engine("sqlite:///orders.db")
SQLModel.metadata.create_all(engine)

# 建立訂單
@app.post("/orders/", response_model=Order)
def create_order(order: Order):
    with Session(engine) as session:
        session.add(order)
        session.commit()
        session.refresh(order)
        return order

# 取得所有訂單
@app.get("/orders/", response_model=List[Order])
def read_orders():
    with Session(engine) as session:
        return session.exec(select(Order)).all()

# 修改訂單
@app.patch("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, order: Order):
    with Session(engine) as session:
        db_order = session.get(Order, order_id)
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        update_data = order.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        session.add(db_order)
        session.commit()
        session.refresh(db_order)
        return db_order

# 刪除訂單
@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    with Session(engine) as session:
        db_order = session.get(Order, order_id)
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        session.delete(db_order)
        session.commit()
        return {"ok": True}
