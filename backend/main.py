from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
import csv

app = FastAPI()

# CORS 設定，讓 Vercel 前端能連線
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 上線後可以改成你的前端網址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- 資料模型 -----------------
class Product(BaseModel):
    id: int
    name: str
    price: int
    stock: int

class Order(BaseModel):
    id: int
    customer_name: str
    item: str
    quantity: int
    price: int
    status: str
    shipping_method: str

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
def create_product(product: Product):
    global product_id_counter
    product.id = product_id_counter
    product_id_counter += 1
    products.append(product.dict())
    return product

@app.patch("/products/{product_id}")
def update_product(product_id: int, updated: Product):
    for idx, p in enumerate(products):
        if p["id"] == product_id:
            products[idx].update(updated.dict(exclude_unset=True))
            return products[idx]
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    global products
    products = [p for p in products if p["id"] != product_id]
    return {"message": "Deleted"}

@app.get("/products/csv")
def export_products_csv():
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "name", "price", "stock"])
    writer.writeheader()
    writer.writerows(products)
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]),
                             media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=products.csv"})

# ----------------- 訂單管理 -----------------
@app.get("/orders")
def get_orders():
    return orders

@app.post("/orders")
def create_order(order: Order):
    global order_id_counter
    order.id = order_id_counter
    order_id_counter += 1

    # 自動計算金額
    product = next((p for p in products if p["name"] == order.item), None)
    if product:
        order.price = product["price"] * order.quantity
    else:
        order.price = 0

    orders.append(order.dict())
    return order

@app.patch("/orders/{order_id}")
def update_order(order_id: int, updated: Order):
    for idx, o in enumerate(orders):
        if o["id"] == order_id:
            orders[idx].update(updated.dict(exclude_unset=True))
            return orders[idx]
    raise HTTPException(status_code=404, detail="Order not found")

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    global orders
    orders = [o for o in orders if o["id"] != order_id]
    return {"message": "Deleted"}

@app.get("/orders/csv")
def export_orders_csv():
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "customer_name", "item", "quantity", "price", "status", "shipping_method"])
    writer.writeheader()
    writer.writerows(orders)
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]),
                             media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=orders.csv"})
