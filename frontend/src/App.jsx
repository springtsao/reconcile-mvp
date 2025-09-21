import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 匯出 CSV 工具
const exportToCSV = (data, filename) => {
  const csvContent = [
    Object.keys(data[0]).join(","), // 標題
    ...data.map(row => Object.values(row).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ---------------- 訂單管理 ----------------
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    item: "",
    quantity: 1,
    shipping_method: "郵寄",
    status: "尚未匯款"
  });

  useEffect(() => {
    fetch(`${API_URL}/orders`).then(r => r.json()).then(setOrders);
    fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);
  }, []);

  const refreshOrders = () => fetch(`${API_URL}/orders`).then(r => r.json()).then(setOrders);

  const handleSubmit = async () => {
    const product = products.find(p => p.name === newOrder.item);
    const price = product ? product.price * newOrder.quantity : 0;

    const orderData = { ...newOrder, price };
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    refreshOrders();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    refreshOrders();
  };

  const handleEdit = async (id, updated) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    refreshOrders();
  };

  const filteredOrders = orders.filter(
    o => o.customer_name.includes(search) || o.item.includes(search)
  );

  return (
    <div>
      <h2>新增訂單</h2>
      <input
        placeholder="客戶姓名"
        value={newOrder.customer_name}
        onChange={e => setNewOrder({ ...newOrder, customer_name: e.target.value })}
      />
      <select
        value={newOrder.item}
        onChange={e => setNewOrder({ ...newOrder, item: e.target.value })}
      >
        <option value="">選擇商品</option>
        {products.map(p => (
          <option key={p.id} value={p.name}>
            {p.name} (${p.price})
          </option>
        ))}
      </select>
      <input
        type="number"
        value={newOrder.quantity}
        onChange={e => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
      />
      <button onClick={handleSubmit}>送出</button>

      <h2>搜尋訂單</h2>
      <input
        placeholder="輸入姓名或商品"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <h2>訂單列表</h2>
      <button onClick={() => exportToCSV(orders, "orders.csv")}>📥 匯出 CSV</button>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>客戶</th><th>商品</th><th>數量</th><th>金額</th><th>狀態</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name}</td>
              <td>{o.item}</td>
              <td>{o.quantity}</td>
              <td>{o.price}</td>
              <td>
                <select
                  value={o.status}
                  onChange={e => handleEdit(o.id, { ...o, status: e.target.value })}
                >
                  <option>尚未匯款</option>
                  <option>已對帳</option>
                  <option>已交貨</option>
                  <option>待出貨</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleEdit(o.id, { ...o, quantity: o.quantity + 1 })}>✏️</button>
                <button onClick={() => handleDelete(o.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- 商品管理 ----------------
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0 });

  useEffect(() => {
    fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);
  }, []);

  const refreshProducts = () => fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);

  const handleAddProduct = async () => {
    await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    refreshProducts();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    refreshProducts();
  };

  const handleEdit = async (id, updated) => {
    await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    refreshProducts();
  };

  return (
    <div>
      <h2>商品管理</h2>
      <input
        placeholder="名稱"
        value={newProduct.name}
        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="價格"
        value={newProduct.price}
        onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
      />
      <input
        type="number"
        placeholder="庫存"
        value={newProduct.stock}
        onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
      />
      <button onClick={handleAddProduct}>新增商品</button>
      <button onClick={() => exportToCSV(products, "products.csv")}>📥 匯出 CSV</button>

      <table border="1">
        <thead>
          <tr><th>ID</th><th>商品</th><th>價格</th><th>庫存</th><th>操作</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>
                <input
                  type="number"
                  value={p.price}
                  onChange={e => handleEdit(p.id, { ...p, price: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={p.stock}
                  onChange={e => handleEdit(p.id, { ...p, stock: Number(e.target.value) })}
                />
              </td>
              <td>
                <button onClick={() => handleDelete(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- 主應用 ----------------
export default function App() {
  return (
    <Router>
      <h1>對帳系統</h1>
      <nav>
        <Link to="/orders"><button>訂單管理</button></Link>
        <Link to="/products"><button>商品管理</button></Link>
      </nav>
      <Routes>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </Router>
  );
}
