from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# 允許前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# 資料結構
# ==========================
class Product(BaseModel):
    id: int
    name: str
    price: int
    stock: int

class ProductCreate(BaseModel):
    name: str
    price: int
    stock: int

class Order(BaseModel):
    id: int
    name: str
    phone: str
    product_id: int
    product_name: str
    quantity: int
    account: str
    delivery: str
    status: str = "尚未匯款"

class OrderCreate(BaseModel):
    name: str
    phone: str
    product_id: int
    quantity: int
    account: str
    delivery: str

# ==========================
# 假資料存放
# ==========================
products: List[Product] = []
orders: List[Order] = []
product_counter = 1
order_counter = 1

# ==========================
# 商品管理 API
# ==========================
@app.get("/products", response_model=List[Product])
def get_products():
    return sorted(products, key=lambda p: p.id)

@app.post("/products", response_model=Product)
def create_product(product: ProductCreate):
    global product_counter
    new_product = Product(
        id=product_counter,
        name=product.name,
        price=product.price,
        stock=product.stock
    )
    products.append(new_product)
    product_counter += 1
    return new_product

@app.patch("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product: ProductCreate):
    for p in products:
        if p.id == product_id:
            p.name = product.name
            p.price = product.price
            p.stock = product.stock
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    global products
    products = [p for p in products if p.id != product_id]
    return {"message": "Product deleted"}

# ==========================
# 訂單管理 API
# ==========================
@app.get("/orders", response_model=List[Order])
def get_orders():
    return sorted(orders, key=lambda o: o.id)

@app.post("/orders", response_model=Order)
def create_order(order: OrderCreate):
    global order_counter
    product = next((p for p in products if p.id == order.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if order.quantity > product.stock:
        raise HTTPException(status_code=400, detail="庫存不足")

    # 扣庫存
    product.stock -= order.quantity

    new_order = Order(
        id=order_counter,
        name=order.name,
        phone=order.phone,
        product_id=order.product_id,
        product_name=product.name,
        quantity=order.quantity,
        account=order.account,
        delivery=order.delivery,
        status="尚未匯款"
    )
    orders.append(new_order)
    order_counter += 1
    return new_order

@app.patch("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, updated: OrderCreate):
    for o in orders:
        if o.id == order_id:
            product = next((p for p in products if p.id == updated.product_id), None)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            o.name = updated.name
            o.phone = updated.phone
            o.product_id = updated.product_id
            o.product_name = product.name
            o.quantity = updated.quantity
            o.account = updated.account
            o.delivery = updated.delivery
            return o
    raise HTTPException(status_code=404, detail="Order not found")

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    global orders
    orders = [o for o in orders if o.id != order_id]
    return {"message": "Order deleted"}
