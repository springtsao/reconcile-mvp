import { useState, useEffect } from "react";

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

  // 抓取後端資料
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/orders`)
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  // 新增訂單
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
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
  };

  // 刪除訂單
  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
      method: "DELETE",
    });
    setOrders(orders.filter((order) => order.id !== id));
  };

  // 匯出 CSV
  const handleExportCSV = () => {
    const header = ["ID", "姓名", "電話", "項目", "帳號後五碼", "寄送方式", "狀態", "金額"];
    const rows = orders.map(o => [
      o.id,
      o.name,
      o.phone,
      o.items,
      o.account_last5,
      o.shipping,
      o.status,
      o.amount,
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>對帳系統 MVP</h1>

      {/* 新增訂單表單 */}
      <form onSubmit={handleSubmit}>
        <input placeholder="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="電話" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="購買項目" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
        <input placeholder="帳號後五碼" value={form.account_last5} onChange={(e) => setForm({ ...form, account_last5: e.target.value })} />
        <input placeholder="寄送方式" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} />
        <input placeholder="金額" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <button type="submit">新增訂單</button>
      </form>

      <button onClick={handleExportCSV} style={{ marginTop: 10 }}>匯出 CSV</button>

      {/* 訂單列表 */}
      <h2>訂單列表</h2>
      <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>姓名</th>
            <th>電話</th>
            <th>項目</th>
            <th>帳號後五碼</th>
            <th>寄送方式</th>
            <th>狀態</th>
            <th>金額</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td>{o.phone}</td>
              <td>{o.items}</td>
              <td>{o.account_last5}</td>
              <td>{o.shipping}</td>
              <td>{o.status}</td>
              <td>{o.amount}</td>
              <td>
                <button onClick={() => handleDelete(o.id)}>刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
