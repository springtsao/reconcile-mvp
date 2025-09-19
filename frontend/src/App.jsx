import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    items: "",
    amount: "",
    account_last5: "",
    shipping: "",
    status: "尚未匯款",
  });

  // 載入訂單
  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_URL}/orders/`);
      if (!res.ok) throw new Error("載入失敗");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      alert("載入失敗: " + err.message);
    }
  }

  // 新增訂單
  async function addOrder() {
    try {
      const res = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("新增訂單失敗");
      await res.json();
      fetchOrders();
      setForm({
        name: "",
        phone: "",
        items: "",
        amount: "",
        account_last5: "",
        shipping: "",
        status: "尚未匯款",
      });
    } catch (err) {
      alert("請求錯誤: " + err.message);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>對帳系統</h1>

      {/* 表單 */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="姓名"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="電話"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="購買項目"
          value={form.items}
          onChange={(e) => setForm({ ...form, items: e.target.value })}
        />
        <input
          placeholder="金額"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          placeholder="帳號後五碼"
          value={form.account_last5}
          onChange={(e) => setForm({ ...form, account_last5: e.target.value })}
        />
        <input
          placeholder="寄送方式"
          value={form.shipping}
          onChange={(e) => setForm({ ...form, shipping: e.target.value })}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="尚未匯款">尚未匯款</option>
          <option value="已對帳">已對帳</option>
          <option value="已交貨">已交貨</option>
        </select>
        <button onClick={addOrder}>新增訂單</button>
      </div>

      {/* 訂單列表 */}
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>姓名</th>
            <th>電話</th>
            <th>項目</th>
            <th>金額</th>
            <th>帳號後五碼</th>
            <th>寄送方式</th>
            <th>處理進度</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td>{o.phone}</td>
              <td>{o.items}</td>
              <td>{o.amount}</td>
              <td>{o.account_last5}</td>
              <td>{o.shipping}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
