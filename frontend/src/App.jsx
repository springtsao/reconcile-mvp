import React, { useState, useEffect } from "react";

function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    items: "",
    account_last5: "",
    shipping: "",
    status: "尚未匯款",
    amount: ""
  });

  // 載入訂單
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/orders`)
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => alert("載入失敗: " + err.message));
  }, []);

  // 表單輸入更新
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 新增訂單
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert("新增訂單失敗: " + errorText);
        return;
      }

      const newOrder = await res.json();
      setOrders([...orders, newOrder]);

      setForm({
        name: "",
        phone: "",
        items: "",
        account_last5: "",
        shipping: "",
        status: "尚未匯款",
        amount: ""
      });
    } catch (err) {
      alert("請求錯誤: " + err.message);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">對帳系統</h1>

      {/* 新增訂單表單 */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="姓名" className="border p-2" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="電話" className="border p-2" required />
        <input name="items" value={form.items} onChange={handleChange} placeholder="購買項目" className="border p-2" />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="金額" className="border p-2" />
        <input name="account_last5" value={form.account_last5} onChange={handleChange} placeholder="帳號後五碼" className="border p-2" />
        <input name="shipping" value={form.shipping} onChange={handleChange} placeholder="寄送方式" className="border p-2" />
        <select name="status" value={form.status} onChange={handleChange} className="border p-2">
          <option>尚未匯款</option>
          <option>已對帳</option>
          <option>已交貨</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">新增訂單</button>
      </form>

      {/* 訂單列表 */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">姓名</th>
            <th className="border p-2">電話</th>
            <th className="border p-2">項目</th>
            <th className="border p-2">金額</th>
            <th className="border p-2">帳號後五碼</th>
            <th className="border p-2">寄送方式</th>
            <th className="border p-2">處理進度</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i}>
              <td className="border p-2">{o.name}</td>
              <td className="border p-2">{o.phone}</td>
              <td className="border p-2">{o.items}</td>
              <td className="border p-2">{o.amount}</td>
              <td className="border p-2">{o.account_last5}</td>
              <td className="border p-2">{o.shipping}</td>
              <td className="border p-2">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
