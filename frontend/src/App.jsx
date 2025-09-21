import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    product: "",
    account_last5: "",
    shipping_method: "",
    status: "尚未匯款",
  });
  const [products, setProducts] = useState([]); // 商品下拉選單
  const [shippingMethods, setShippingMethods] = useState([]); // 寄送方式下拉選單
  const [loading, setLoading] = useState(false);

  // 讀取訂單 & 下拉選單資料
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchShippingMethods();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const fetchShippingMethods = async () => {
    const res = await fetch(`${API_URL}/shipping-methods`);
    const data = await res.json();
    setShippingMethods(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    setLoading(false);
    fetchOrders();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">對帳系統</h1>

      {/* 新增訂單表單 */}
      <form onSubmit={handleSubmit} className="grid gap-2 mb-6">
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

        {/* 商品下拉選單 */}
        <select
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          required
        >
          <option value="">選擇商品</option>
          {(Array.isArray(products) ? products : []).map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          placeholder="帳號後五碼"
          value={form.account_last5}
          onChange={(e) =>
            setForm({ ...form, account_last5: e.target.value })
          }
          required
        />

        {/* 寄送方式下拉選單 */}
        <select
          value={form.shipping_method}
          onChange={(e) =>
            setForm({ ...form, shipping_method: e.target.value })
          }
          required
        >
          <option value="">選擇寄送方式</option>
          {(Array.isArray(shippingMethods) ? shippingMethods : []).map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="尚未匯款">尚未匯款</option>
          <option value="已對帳">已對帳</option>
          <option value="已交貨">已交貨</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-1 px-3 rounded"
        >
          {loading ? "新增中..." : "新增訂單"}
        </button>
      </form>

      {/* 訂單列表 */}
      <h2 className="text-xl font-semibold mb-2">訂單列表</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">姓名</th>
            <th className="border px-2">電話</th>
            <th className="border px-2">商品</th>
            <th className="border px-2">帳號後五碼</th>
            <th className="border px-2">寄送方式</th>
            <th className="border px-2">狀態</th>
            <th className="border px-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="border px-2">{o.name}</td>
              <td className="border px-2">{o.phone}</td>
              <td className="border px-2">{o.product}</td>
              <td className="border px-2">{o.account_last5}</td>
              <td className="border px-2">{o.shipping_method}</td>
              <td className="border px-2">{o.status}</td>
              <td className="border px-2">
                <button
                  onClick={() => handleDelete(o.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
