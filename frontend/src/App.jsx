import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    item: "T-Shirt",
    account_last5: "",
    shipping: "郵局",
    status: "尚未匯款",
  });

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders/`);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      name: "",
      phone: "",
      item: "T-Shirt",
      account_last5: "",
      shipping: "郵局",
      status: "尚未匯款",
    });
    fetchOrders();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const handleUpdate = async (id, newStatus) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">對帳系統</h1>

      {/* 表單 */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          placeholder="姓名"
          className="border p-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="電話"
          className="border p-2 w-full"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        {/* 訂購項目 下拉選單 */}
        <select
          className="border p-2 w-full"
          value={form.item}
          onChange={(e) => setForm({ ...form, item: e.target.value })}
        >
          <option>T-Shirt</option>
          <option>Bag</option>
          <option>Notebook</option>
          <option>Other</option>
        </select>

        <input
          placeholder="帳號後五碼"
          className="border p-2 w-full"
          value={form.account_last5}
          onChange={(e) => setForm({ ...form, account_last5: e.target.value })}
        />

        {/* 寄送方式 下拉選單 */}
        <select
          className="border p-2 w-full"
          value={form.shipping}
          onChange={(e) => setForm({ ...form, shipping: e.target.value })}
        >
          <option>郵局</option>
          <option>黑貓宅急便</option>
          <option>7-11店到店</option>
          <option>面交</option>
        </select>

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          新增訂單
        </button>
      </form>

      {/* 訂單列表 */}
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="border p-3 flex justify-between items-center"
          >
            <div>
              <p>
                <strong>{order.name}</strong> ({order.phone})
              </p>
              <p>
                {order.item} | {order.account_last5} | {order.shipping} |{" "}
                <span className="font-semibold">{order.status}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={order.status}
                onChange={(e) => handleUpdate(order.id, e.target.value)}
                className="border p-1"
              >
                <option>尚未匯款</option>
                <option>已對帳</option>
                <option>已交貨</option>
              </select>
              <button
                onClick={() => handleDelete(order.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                刪除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
