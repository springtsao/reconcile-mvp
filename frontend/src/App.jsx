import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    const res = await fetch(`${API_URL}/items`);
    setItems(await res.json());
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders?search=${search}`);
    setOrders(await res.json());
  };

  useEffect(() => {
    fetchItems();
    fetchOrders();
  }, [search]);

  const createOrder = async () => {
    if (!customer || !selectedItem) return alert("請輸入完整資料");
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, item_id: selectedItem, quantity }),
    });
    setCustomer("");
    setQuantity(1);
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const createItem = async (name, price, stock) => {
    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, stock }),
    });
    fetchItems();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>對帳系統 MVP</h1>

      <h2>新增訂單</h2>
      <input placeholder="客戶姓名" value={customer} onChange={(e) => setCustomer(e.target.value)} />
      <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
        <option value="">選擇商品</option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}（${i.price}）
          </option>
        ))}
      </select>
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <button onClick={createOrder}>送出</button>

      <h2>搜尋訂單</h2>
      <input placeholder="輸入姓名或商品" value={search} onChange={(e) => setSearch(e.target.value)} />

      <h2>訂單列表</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th><th>客戶</th><th>商品</th><th>數量</th><th>金額</th><th>狀態</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer}</td>
              <td>{o.item_id}</td>
              <td>{o.quantity}</td>
              <td>{o.total}</td>
              <td>{o.status}</td>
              <td>
                <button onClick={() => deleteOrder(o.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <a href={`${API_URL}/orders/export`}><button>匯出 CSV</button></a>

      <h2>商品管理</h2>
      <input id="itemName" placeholder="名稱" />
      <input id="itemPrice" type="number" placeholder="單價" />
      <input id="itemStock" type="number" placeholder="庫存" />
      <button onClick={() => {
        const name = document.getElementById("itemName").value;
        const price = Number(document.getElementById("itemPrice").value);
        const stock = Number(document.getElementById("itemStock").value);
        createItem(name, price, stock);
      }}>新增商品</button>

      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.id}. {i.name} - ${i.price}（庫存 {i.stock}）
          </li>
        ))}
      </ul>
    </div>
  );
}
