import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({
    name: "",
    phone: "",
    product: "",
    quantity: 1,
    account: "",
    shipping: "",
    status: "尚未匯款",
  });

  useEffect(() => {
    fetch(`${API_URL}/orders`).then(r => r.json()).then(setOrders);
    fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);
  }, []);

  const handleAddOrder = async () => {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    const data = await res.json();
    setOrders([...orders, data]);
    setNewOrder({
      name: "",
      phone: "",
      product: "",
      quantity: 1,
      account: "",
      shipping: "",
      status: "尚未匯款",
    });
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleEdit = async (id, updated) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    setOrders(orders.map(o => (o.id === id ? data : o)));
  };

  const exportCSV = () => {
    const header = ["姓名","電話","商品","數量","帳號後五碼","寄送方式","狀態"];
    const rows = orders.map(o => [o.name, o.phone, o.product, o.quantity, o.account, o.shipping, o.status]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">訂單管理</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <input placeholder="姓名" value={newOrder.name}
          onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
          className="p-2 border rounded"/>
        <input placeholder="電話" value={newOrder.phone}
          onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
          className="p-2 border rounded"/>
        <select value={newOrder.product}
          onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
          className="p-2 border rounded">
          <option value="">選擇商品</option>
          {products.map(p => (
            <option key={p.id} value={p.name}>{p.name} (${p.price})</option>
          ))}
        </select>
        <input type="number" placeholder="數量" value={newOrder.quantity}
          onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
          className="p-2 border rounded"/>
        <input placeholder="帳號後五碼" value={newOrder.account}
          onChange={(e) => setNewOrder({ ...newOrder, account: e.target.value })}
          className="p-2 border rounded"/>
        <input placeholder="寄送方式" value={newOrder.shipping}
          onChange={(e) => setNewOrder({ ...newOrder, shipping: e.target.value })}
          className="p-2 border rounded"/>
      </div>
      <button onClick={handleAddOrder} className="bg-green-500 text-white px-4 py-2 rounded">新增訂單</button>
      <button onClick={exportCSV} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">匯出 CSV</button>

      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th>姓名</th><th>電話</th><th>商品</th><th>數量</th>
            <th>帳號</th><th>寄送</th><th>狀態</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border">
              <td>{o.name}</td>
              <td>{o.phone}</td>
              <td>{o.product}</td>
              <td>{o.quantity}</td>
              <td>{o.account}</td>
              <td>{o.shipping}</td>
              <td>{o.status}</td>
              <td>
                <button onClick={() => handleDelete(o.id)} className="text-red-500">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

