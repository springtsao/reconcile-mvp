import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", product: "", account_last5: "", shipping_method: "", status: "" });
  const [products, setProducts] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // -------------------------------
  // Init
  // -------------------------------
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchShippingMethods();
    fetchStatuses();
  }, []);

  const fetchOrders = async () => {
    let url = `${API_URL}/orders`;
    const params = [];
    if (search) params.push(`name=${search}`);
    if (filterStatus) params.push(`status=${filterStatus}`);
    if (params.length) url += "?" + params.join("&");

    const res = await fetch(url);
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

  const fetchStatuses = async () => {
    const res = await fetch(`${API_URL}/statuses`);
    setStatuses(await res.json());
  };

  // -------------------------------
  // Add / Update Order
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${API_URL}/orders/${editingId}` : `${API_URL}/orders`;
    const body = JSON.stringify(form);

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
    if (res.ok) {
      await fetchOrders();
      setForm({ name: "", phone: "", product: "", account_last5: "", shipping_method: "", status: "" });
      setEditingId(null);
    } else {
      alert("新增/修改失敗");
    }
  };

  const handleEdit = (order) => {
    const { id, created_at, ...rest } = order;
    setForm(rest);
    setEditingId(order.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("確定刪除？")) return;
    const res = await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    if (res.ok) await fetchOrders();
  };

  // -------------------------------
  // Add dynamic options
  // -------------------------------
  const addOption = async (type) => {
    const name = prompt(`輸入新的 ${type}`);
    if (!name) return;
    let url = "";
    if (type === "商品") url = `${API_URL}/products`;
    if (type === "寄送方式") url = `${API_URL}/shipping-methods`;
    if (type === "狀態") url = `${API_URL}/statuses`;

    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (!res.ok) {
      alert("新增失敗");
      return;
    }
    if (type === "商品") fetchProducts();
    if (type === "寄送方式") fetchShippingMethods();
    if (type === "狀態") fetchStatuses();
  };

  // -------------------------------
  // Export CSV
  // -------------------------------
  const exportCSV = () => {
    window.location.href = `${API_URL}/orders/export`;
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">對帳系統</h1>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋姓名" className="border p-2 flex-1" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2">
          <option value="">全部狀態</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <button onClick={fetchOrders} className="bg-blue-500 text-white px-4 py-2 rounded">搜尋</button>
        <button onClick={exportCSV} className="bg-green-500 text-white px-4 py-2 rounded">匯出 CSV</button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 mb-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名" className="border p-2" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="電話" className="border p-2" />
        <div>
          <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="border p-2 w-full">
            <option value="">選擇商品</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => addOption("商品")} className="text-sm text-blue-500">＋新增商品</button>
        </div>
        <input value={form.account_last5} onChange={(e) => setForm({ ...form, account_last5: e.target.value })} placeholder="帳號後五碼" className="border p-2" />
        <div>
          <select value={form.shipping_method} onChange={(e) => setForm({ ...form, shipping_method: e.target.value })} className="border p-2 w-full">
            <option value="">選擇寄送方式</option>
            {shippingMethods.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => addOption("寄送方式")} className="text-sm text-blue-500">＋新增寄送方式</button>
        </div>
        <div>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border p-2 w-full">
            <option value="">選擇狀態</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => addOption("狀態")} className="text-sm text-blue-500">＋新增狀態</button>
        </div>
        <button className="col-span-2 bg-blue-500 text-white px-4 py-2 rounded">{editingId ? "修改訂單" : "新增訂單"}</button>
      </form>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">姓名</th>
            <th className="border p-2">電話</th>
            <th className="border p-2">商品</th>
            <th className="border p-2">帳號後五碼</th>
            <th className="border p-2">寄送方式</th>
            <th className="border p-2">狀態</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="border p-2">{o.name}</td>
              <td className="border p-2">{o.phone}</td>
              <td className="border p-2">{o.product}</td>
              <td className="border p-2">{o.account_last5}</td>
              <td className="border p-2">{o.shipping_method}</td>
              <td className="border p-2">{o.status}</td>
              <td className="border p-2">
                <button onClick={() => handleEdit(o)} className="text-yellow-500 mr-2">✏️</button>
                <button onClick={() => handleDelete(o.id)} className="text-red-500">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
