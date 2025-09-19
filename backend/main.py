from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Field, Session, create_engine, select
from fastapi.responses import StreamingResponse
from typing import Optional, List
import csv, io, os

app = FastAPI()

# 使用 Render 提供的 DATABASE_URL（如果有），否則用 SQLite
db_url = os.getenv("DATABASE_URL", "sqlite:///database.db")
engine = create_engine(db_url)

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    items: str
    account_last5: str
    shipping: str
    status: str = "尚未匯款"
    amount: Optional[float] = None
    remark: Optional[str] = None

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

@app.post("/orders/", response_model=Order)
def create_order(order: Order, session: Session = Depends(get_session)):
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@app.get("/orders/", response_model=List[Order])
def list_orders(session: Session = Depends(get_session)):
    return session.exec(select(Order)).all()

@app.put("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, order: Order, session: Session = Depends(get_session)):
    db_order = session.get(Order, order_id)
    for key, value in order.dict(exclude_unset=True).items():
        setattr(db_order, key, value)
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, session: Session = Depends(get_session)):
    db_order = session.get(Order, order_id)
    session.delete(db_order)
    session.commit()
    return {"ok": True}

@app.get("/orders/export/csv")
def export_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","姓名","電話","購買項目","帳號後五碼","寄送方式","狀態","金額","備註"])
    for o in orders:
        writer.writerow([o.id, o.name, o.phone, o.items, o.account_last5, o.shipping, o.status, o.amount, o.remark])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=orders.csv"})
