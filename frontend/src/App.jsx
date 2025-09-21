import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    product: "",
    account_last5: "",
    shipping_method: "",
    status: "尚未匯款",
  });
  const [newProduct, setNewProduct] = useState("");
  const [newShipping, setNewShipping] = useState("");

  // ====================
  // 資料讀取
  // ====================
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchShippingMethods();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    setOrders(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    setProducts(await res.json());
  };

  const fetchShippingMethods = async () => {
    const res = await fetch(`${API_URL}/shipping-methods`);
    setShippingMethods(await res.json());
  };

  // ====================
  // CRUD 操作
  // ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      name: "",
      phone: "",
      product: "",
      account_last5: "",
      shipping_method: "",
      status: "尚未匯款",
    });
    fetchOrders();
  };

  const handleDeleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const addProduct = async () => {
    if (!newProduct) return;
    await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProduct }),
    });
    setNewProduct("");
    fetchProducts();
  };

  const addShippingMethod = async () => {
    if (!newShipping) return;
    await fetch(`${API_URL}/shipping-methods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newShipping }),
    });
    setNewShipping("");
    fetchShippingMethods();
  };

  // ====================
  // UI
  // ====================
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>對帳系統</h1>

      {/* 訂單表單 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="姓名"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="電話"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        {/* 商品選單 */}
        <select
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          required
        >
          <option value="">選擇商品</option>
          {products.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          placeholder="新增商品"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
        />
        <button type="button" onClick={addProduct}>
          加入商品
        </button>

        <input
          placeholder="帳號後五碼"
          value={form.account_last5}
          onChange={(e) => setForm({ ...form, account_last5: e.target.value })}
          required
        />

        {/* 寄送方式選單 */}
        <select
          value={form.shipping_method}
          onChange={(e) =>
            setForm({ ...form, shipping_method: e.target.value })
          }
          required
        >
          <option value="">選擇寄送方式</option>
          {shippingMethods.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          placeholder="新增寄送方式"
          value={newShipping}
          onChange={(e) => setNewShipping(e.target.value)}
        />
        <button type="button" onClick={addShippingMethod}>
          加入寄送方式
        </button>

        <button type="submit">新增訂單</button>
      </form>

      {/* 訂單列表 */}
      <h2>訂單列表</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.name} | {o.phone} | {o.product} | {o.account_last5} |{" "}
            {o.shipping_method} | {o.status}
            <button onClick={() => handleDeleteOrder(o.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
