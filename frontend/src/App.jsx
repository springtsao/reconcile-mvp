import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    product: "",
    account_last5: "",
    shipping_method: "",
    status: "尚未匯款",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // 載入資料
  useEffect(() => {
    fetchOrders();
    fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);
    fetch(`${API_URL}/shipping-methods`).then(r => r.json()).then(setShippingMethods);
    fetch(`${API_URL}/statuses`).then(r => r.json()).then(setStatuses);
  }, []);

  const fetchOrders = () => {
    let url = `${API_URL}/orders`;
    const params = [];
    if (search) params.push(`name=${search}`);
    if (filterStatus) params.push(`status=${filterStatus}`);
    if (params.length) url += "?" + params.join("&");
    fetch(url).then(r => r.json()).then(setOrders);
  };

  // 新增或更新訂單
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${API_URL}/orders/${editingId}` : `${API_URL}/orders`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", product: "", account_last5: "", shipping_method: "", status: "尚未匯款" });
    setEditingId(null);
    fetchOrders();
  };

  // 編輯訂單
  const handleEdit = (order) => {
    setForm(order);
    setEditingId(order.id);
  };

  // 刪除訂單
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  // 新增下拉選項
  const addOption = async (type) => {
    const name = prompt(`輸入新的 ${type === "product" ? "商品" : type === "shipping" ? "寄送方式" : "狀態"}`);
    if (!name) return;
    let url = "";
    if (type === "product") url = `${API_URL}/products`;
    if (type === "shipping") url = `${API_URL}/shipping-methods`;
    if (type === "status") url = `${API_URL}/statuses`;
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (type === "product") fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);
    if (type === "shipping") fetch(`${API_URL}/shipping-methods`).then(r => r.json()).then(setShippingMethods);
    if (type === "status") fetch(`${API_URL}/statuses`).then(r => r.json()).then(setStatuses);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">對帳系統</h1>

      {/* 搜尋 + 篩選 + 匯出 */}
      <div className="flex gap-4 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋姓名" className="border p-1" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border p-1">
          <option value="">全部狀態</option>
          {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <button onClick={fetchOrders} className="bg-blue-500 text-white px-3 py-1 rounded">搜尋</button>
        <a href={`${API_URL}/orders/export`} className="bg-green-500 text-white px-3 py-1 rounded">匯出 CSV</a>
      </div>

      {/* 表單 */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="姓名" required className="border p-1 block" />
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="電話" required className="border p-1 block" />

        <div className="flex gap-2">
          <select value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} required className="border p-1 flex-1">
            <option value="">選擇商品</option>
            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <button type="button" onClick={() => addOption("product")} className="bg-gray-200 px-2">＋</button>
        </div>

        <input value={form.account_last5} onChange={e => setForm({ ...form, account_last5: e.target.value })} placeholder="帳號後五碼" required className="border p-1 block" />

        <div className="flex gap-2">
          <select value={form.shipping_method} onChange={e => setForm({ ...form, shipping_method: e.target.value })} required className="border p-1 flex-1">
            <option value="">選擇寄送方式</option>
            {shippingMethods.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <button type="button" onClick={() => addOption("shipping")} className="bg-gray-200 px-2">＋</button>
        </div>

        <div className="flex gap-2">
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required className="border p-1 flex-1">
            {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <button type="button" onClick={() => addOption("status")} className="bg-gray-200 px-2">＋</button>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">{editingId ? "更新訂單" : "新增訂單"}</button>
      </form>

      {/* 訂單表格 */}
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
          {orders.map(o => (
            <tr key={o.id}>
              <td className="border px-2">{o.name}</td>
              <td className="border px-2">{o.phone}</td>
              <td className="border px-2">{o.product}</td>
              <td className="border px-2">{o.account_last5}</td>
              <td className="border px-2">{o.shipping_method}</td>
              <td className="border px-2">{o.status}</td>
              <td className="border px-2 space-x-2">
                <button onClick={() => handleEdit(o)} className="text-blue-500">✏️</button>
                <button onClick={() => handleDelete(o.id)} className="text-red-500">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
