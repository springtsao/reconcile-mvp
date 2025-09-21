import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ----------------- 訂單管理 -----------------
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/orders`).then(res => res.json()).then(setOrders);
    fetch(`${API_URL}/products`).then(res => res.json()).then(setProducts);
  }, []);

  const addOrder = async () => {
    if (!customer || !selectedProduct) return alert("請填完整");
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customer,
        item: selectedProduct,
        quantity: Number(quantity),
      }),
    });
    setCustomer("");
    setQuantity(1);
    fetch(`${API_URL}/orders`).then(res => res.json()).then(setOrders);
  };

  return (
    <div>
      <h2>新增訂單</h2>
      <input placeholder="客戶姓名" value={customer} onChange={e => setCustomer(e.target.value)} />
      <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
        <option value="">選擇商品</option>
        {products.map(p => (
          <option key={p.id} value={p.name}>
            {p.name} (${p.price})
          </option>
        ))}
      </select>
      <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
      <button onClick={addOrder}>送出</button>

      <h2>訂單列表</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>客戶</th><th>商品</th><th>數量</th><th>金額</th><th>狀態</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.customer_name}</td><td>{o.item}</td>
              <td>{o.quantity}</td><td>{o.price}</td><td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ----------------- 商品管理 -----------------
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/products`).then(res => res.json()).then(setProducts);
  }, []);

  const addProduct = async () => {
    if (!name || !price || !stock) return alert("請填完整");
    await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), stock: Number(stock) }),
    });
    setName("");
    setPrice("");
    setStock("");
    fetch(`${API_URL}/products`).then(res => res.json()).then(setProducts);
  };

  return (
    <div>
      <h2>商品管理</h2>
      <input placeholder="名稱" value={name} onChange={e => setName(e.target.value)} />
      <input type="number" placeholder="價格" value={price} onChange={e => setPrice(e.target.value)} />
      <input type="number" placeholder="庫存" value={stock} onChange={e => setStock(e.target.value)} />
      <button onClick={addProduct}>新增商品</button>

      <h3>商品列表</h3>
      <table border="1">
        <thead>
          <tr><th>ID</th><th>商品</th><th>價格</th><th>庫存</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.name}</td><td>{p.price}</td><td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ----------------- 主程式 -----------------
export default function App() {
  return (
    <Router>
      <div>
        <h1>對帳系統 MVP</h1>
        <nav>
          <Link to="/orders">訂單管理</Link> | <Link to="/products">商品管理</Link>
        </nav>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
    </Router>
  );
}
