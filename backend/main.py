from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Optional, List
import csv
from fastapi.responses import StreamingResponse
import io

# --------------------
# DB Model
# --------------------
class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: int


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    phone: str
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    amount: float
    bank_last5: str
    shipping: str
    status: str = "尚未匯款"


# --------------------
# Setup
# --------------------
app = FastAPI()
engine = create_engine("sqlite:///database.db")
SQLModel.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發時先允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# Product APIs
# --------------------
@app.post("/products/", response_model=Product)
def create_product(product: Product):
    with Session(engine) as session:
        session.add(product)
        session.commit()
        session.refresh(product)
        return product


@app.get("/products/", response_model=List[Product])
def list_products():
    with Session(engine) as session:
        products = session.exec(select(Product).order_by(Product.id)).all()
        return products


@app.patch("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product: Product):
    with Session(engine) as session:
        db_product = session.get(Product, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        update_data = product.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        session.add(db_product)
        session.commit()
        session.refresh(db_product)
        return db_product


@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        session.delete(product)
        session.commit()
        return {"ok": True}


# --------------------
# Order APIs
# --------------------
@app.post("/orders/", response_model=Order)
def create_order(order: Order):
    with Session(engine) as session:
        product = session.get(Product, order.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.stock < order.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock")

        order.amount = product.price * order.quantity
        product.stock -= order.quantity

        session.add(order)
        session.add(product)
        session.commit()
        session.refresh(order)
        return order


@app.get("/orders/", response_model=List[Order])
def list_orders(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("id")
):
    with Session(engine) as session:
        query = select(Order)
        if search:
            query = query.where(Order.customer_name.contains(search))
        if status:
            query = query.where(Order.status == status)
        if sort_by == "created":
            query = query.order_by(Order.id.desc())
        else:
            query = query.order_by(Order.id)

        orders = session.exec(query).all()
        return orders


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


@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        session.delete(order)
        session.commit()
        return {"ok": True}


# --------------------
# Export CSV
# --------------------
@app.get("/orders/export/csv")
def export_orders_csv():
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Customer", "Phone", "Product ID", "Quantity", "Amount", "Bank Last5", "Shipping", "Status"])
    for o in orders:
        writer.writerow([o.id, o.customer_name, o.phone, o.product_id, o.quantity, o.amount, o.bank_last5, o.shipping, o.status])

    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=orders.csv"})
