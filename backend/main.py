from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# 允許跨域 (Vercel 前端需要呼叫 Render API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- 資料模型 -----------------
class ProductCreate(BaseModel):
    name: str
    price: int
    stock: int

class Product(ProductCreate):
    id: int

class OrderCreate(BaseModel):
    customer_name: str
    item: str
    quantity: int
    status: str = "尚未匯款"
    shipping_method: str = "郵局"

class Order(OrderCreate):
    id: int
    price: int

# ----------------- 模擬資料庫 -----------------
products = []
orders = []
product_id_counter = 1
order_id_counter = 1

# ----------------- 商品管理 -----------------
@app.get("/products")
def get_products():
    return products

@app.post("/products")
def create_product(product: ProductCreate):
    global product_id_counter
    new_product = {
        "id": product_id_counter,
        "name": product.name,
        "price": product.price,
        "stock": product.stock,
    }
    product_id_counter += 1
    products.append(new_product)
    return new_product

# ----------------- 訂單管理 -----------------
@app.get("/orders")
def get_orders():
    return orders

@app.post("/orders")
def create_order(order: OrderCreate):
    global order_id_counter

    product = next((p for p in products if p["name"] == order.item), None)
    if not product:
        raise HTTPException(status_code=400, detail="商品不存在")

    total_price = product["price"] * order.quantity

    new_order = {
        "id": order_id_counter,
        "customer_name": order.customer_name,
        "item": order.item,
        "quantity": order.quantity,
        "price": total_price,
        "status": order.status,
        "shipping_method": order.shipping_method,
    }
    order_id_counter += 1
    orders.append(new_order)
    return new_order
