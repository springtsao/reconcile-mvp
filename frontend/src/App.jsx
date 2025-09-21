import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// --- Context (全域狀態管理) ---
const DataContext = createContext();
const useData = () => useContext(DataContext);

function DataProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    setOrders(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    setProducts(await res.json());
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  return (
    <DataContext.Provider value={{ orders, products, fetchOrders, fetchProducts }}>
      {children}
    </DataContext.Provider>
  );
}

// --- 訂單管理頁 ---
function OrdersPage() {
  const { orders, products, fetchOrders } = useData();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    item: "",
    quantity: 1,
    account_last5: "",
    shipping: "",
    status: "尚未匯款",
    amount: 0,
  });

  const handleSubmit = async () => {
    const product = products.find((p) => p.name === form.item);
    const newOrder = { ...form, amount: (product?.price || 0) * form.quantity };
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    fetchOrders();
    setForm({ ...form, name: "", phone: "", item: "", quantity: 1, account_last5: "", shipping: "", amount: 0 });
  };

  const deleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  return (
    <div>
      <h2>訂單管理</h2>
      <div>
        <input placeholder="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="電話" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
          <option value="">選擇商品</option>
          {products.map((p) => (
            <option key={p.id} value={p.name}>{p.name} (${p.price})</option>
          ))}
        </select>
        <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        <input placeholder="帳號後五碼" value={form.account_last5} onChange={(e) => setForm({ ...form, account_last5: e.target.value })} />
        <input placeholder="寄送方式" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} />
        <button onClick={handleSubmit}>新增訂單</button>
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>姓名</th>
            <th>電話</th>
            <th>商品</th>
            <th>數量</th>
            <th>金額</th>
            <th>帳號後五碼</th>
            <th>寄送</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td>{o.phone}</td>
              <td>{o.item}</td>
              <td>{o.quantity}</td>
              <td>{o.amount}</td>
              <td>{o.account_last5}</td>
              <td>{o.shipping}</td>
              <td>{o.status}</td>
              <td><button onClick={() => deleteOrder(o.id)}>🗑️ 刪除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- 商品管理頁 ---
function ProductsPage() {
  const { products, fetchProducts } = useData();
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0 });

  const addProduct = async () => {
    await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    fetchProducts();
    setNewProduct({ name: "", price: 0, stock: 0 });
  };

  const deleteProduct = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div>
      <h2>商品管理</h2>
      <input placeholder="名稱" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
      <input type="number" placeholder="價格" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
      <input type="number" placeholder="庫存" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} />
      <button onClick={addProduct}>新增商品</button>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>商品</th>
            <th>價格</th>
            <th>庫存</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td><button onClick={() => deleteProduct(p.id)}>🗑️ 刪除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- 主應用 ---
export default function App() {
  return (
    <DataProvider>
      <Router>
        <h1>對帳系統 MVP</h1>
        <nav>
          <Link to="/orders"><button>訂單管理</button></Link>
          <Link to="/products"><button>商品管理</button></Link>
        </nav>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}
