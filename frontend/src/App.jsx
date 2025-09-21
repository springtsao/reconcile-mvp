import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ customer_name: "", item: "", quantity: 1, price: 0, status: "尚未匯款" });
  const [newItem, setNewItem] = useState({ name: "", price: 0, stock: 0 });

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    setOrders(await res.json());
  };

  const fetchItems = async () => {
    const res = await fetch(`${API_URL}/items`);
    setItems(await res.json());
  };

  useEffect(() => {
    fetchOrders();
    fetchItems();
  }, []);

  const addOrder = async () => {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      fetchOrders();
    } else {
      alert("新增訂單失敗");
    }
  };

  const deleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const addItem = async () => {
    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      fetchItems();
      setNewItem({ name: "", price: 0, stock: 0 });
    } else {
      alert("新增商品失敗");
    }
  };

  const deleteItem = async (id) => {
    await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const exportCSV = () => {
    window.location.href = `${API_URL}/orders/export`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 訂單區 */}
      <div>
        <h2 className="text-xl font-bold">新增訂單</h2>
        <input placeholder="客戶姓名" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        <select value={form.item} onChange={(e) => {
          const selected = items.find(i => i.name === e.target.value);
          setForm({ ...form, item: e.target.value, price: selected ? selected.price : 0 });
        }}>
          <option value="">選擇商品</option>
          {items.map(i => <option key={i.id} value={i.name}>{i.name} (${i.price})</option>)}
        </select>
        <input type="number" placeholder="數量" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        <div>總金額：{form.quantity * form.price} 元</div>
        <button onClick={addOrder}>送出</button>
      </div>

      {/* 訂單列表 */}
      <div>
        <h2 className="text-xl font-bold">訂單列表</h2>
        <button onClick={exportCSV}>📥 匯出 CSV</button>
        <ul>
          {orders.map(o => (
            <li key={o.id}>
              {o.customer_name} - {o.item} x {o.quantity} = {o.price * o.quantity} 元 [{o.status}]
              <button onClick={() => deleteOrder(o.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>

      {/* 商品管理 */}
      <div>
        <h2 className="text-xl font-bold">商品管理</h2>
        <input placeholder="名稱" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
        <input type="number" placeholder="單價" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} />
        <input type="number" placeholder="庫存" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })} />
        <button onClick={addItem}>新增商品</button>
        <ul>
          {items.map(i => (
            <li key={i.id}>
              {i.name} - ${i.price} (庫存: {i.stock})
              <button onClick={() => deleteItem(i.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
