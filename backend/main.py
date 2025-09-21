from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List

# Database setup
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

# Models
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    item: str
    quantity: int
    account_last5: str
    shipping: str
    status: str = "尚未匯款"
    amount: float

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: int

# Init app
app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB helpers
def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Orders CRUD
@app.get("/orders", response_model=List[Order])
def list_orders(session: Session = Depends(get_session)):
    statement = select(Order).order_by(Order.id)
    return session.exec(statement).all()

@app.post("/orders", response_model=Order)
def create_order(order: Order, session: Session = Depends(get_session)):
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@app.patch("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, new_data: Order, session: Session = Depends(get_session)):
    db_order = session.get(Order, order_id)
    if not db_order:
        return {"error": "Order not found"}
    for field, value in new_data.dict(exclude_unset=True).items():
        setattr(db_order, field, value)
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        return {"error": "Order not found"}
    session.delete(order)
    session.commit()
    return {"ok": True}

# Products CRUD
@app.get("/products", response_model=List[Product])
def list_products(session: Session = Depends(get_session)):
    statement = select(Product).order_by(Product.id)
    return session.exec(statement).all()

@app.post("/products", response_model=Product)
def create_product(product: Product, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@app.patch("/products/{product_id}", response_model=Product)
def update_product(product_id: int, new_data: Product, session: Session = Depends(get_session)):
    db_product = session.get(Product, product_id)
    if not db_product:
        return {"error": "Product not found"}
    for field, value in new_data.dict(exclude_unset=True).items():
        setattr(db_product, field, value)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        return {"error": "Product not found"}
    session.delete(product)
    session.commit()
    return {"ok": True}
