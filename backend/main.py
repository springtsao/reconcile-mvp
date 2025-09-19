from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Field, Session, create_engine, select
from fastapi.responses import StreamingResponse
from typing import Optional, List
import csv, io, os
from fastapi.middleware.cors import CORSMiddleware   # 🔥 新增 CORS 支援

# 建立 FastAPI app
app = FastAPI()

# ✅ 啟用 CORS，允許 Vercel 前端存取
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可以先用 "*"，之後可改成 ["https://reconcile-mvp.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 使用 Render 提供的 DATABASE_URL (如果有)，否則用 SQLite
db_url = os.getenv("DATABASE_URL", "sqlite:///./database.db")
engine = create_engine(db_url)


# --- 定義資料表 ---
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    items: str
    account_last5: str
    shipping: str
    status: str = "尚未匯款"
    amount: Optional[float] = None


# --- 初始化資料庫 ---
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


# --- API ---
@app.post("/orders/")
def create_order(order: Order):
    with Session(engine) as session:
        session.add(order)
        session.commit()
        session.refresh(order)
        return order


@app.get("/orders/", response_model=List[Order])
def read_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
        return orders


@app.get("/export/")
def export_orders():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Name", "Phone", "Items", "Account Last5", "Shipping", "Status", "Amount"])
        for order in orders:
            writer.writerow([
                order.id, order.name, order.phone, order.items,
                order.account_last5, order.shipping, order.status, order.amount
            ])

        output.seek(0)
        return StreamingResponse(
            output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=orders.csv"}
        )
