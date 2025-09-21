import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0 });
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    phone: "",
    account_last5: "",
    shipping_method: "",
    status: "尚未匯款",
    items: []
  });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeTab, setActiveTab] = useState("orders"); // tabs: products, orders, reports
  const [salesReport, setSalesReport] = useState(null);

  // =====================
  // API 呼叫
  // =====================
  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    setProducts(await res.json());
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    setOrders(await res.json());
  };

  const fetchSalesReport = async () => {
    const res = await fetch(`${API_URL}/reports/sales`);
    setSalesReport(await res.json());
  };

  const exportCSV = () => {
    window.open(`${API_URL}/reports/export`, "_blank");
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // =====================
  // 商品 CRUD
  // =====================
  const addProduct = async () => {
    await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    setNewProduct({ name: "", price: 0, stock: 0 });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  // =====================
  // 訂單 CRUD
  // =====================
  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product_id: "", quantity: 1 }],
    });
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;

    // 自動更新小計
    if (field === "product_id" || field === "quantity") {
      const product = products.find((p) => p.id === Number(updatedItems[index].product_id));
      if (product) {
        updatedItems[index].price = product.price;
        updatedItems[index].subtotal = product.price * updatedItems[index].quantity;
      }
    }

    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const createOrder = async () => {
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    setNewOrder({
      customer_name: "",
      phone: "",
      account_last5: "",
      shipping_method: "",
      status: "尚未匯款",
      items: [],
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const updateOrderStatus = async (id, status) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  // =====================
  // UI Tabs
  // =====================
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">🧾 對帳系統</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button onClick={() => setActiveTab("products")} className={activeTab === "products" ? "font-bold" : ""}>
          商品管理
        </button>
        <button onClick={() => setActiveTab("orders")} className={activeTab === "orders" ? "font-bold" : ""}>
          訂單管理
        </button>
        <button onClick={() => { setActiveTab("reports"); fetchSalesReport(); }} className={activeTab === "reports" ? "font-bold" : ""}>
          報表
        </button>
      </div>

      {/* 商品管理 */}
      {activeTab === "products" && (
        <section className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">商品管理</h2>
          <div className="flex gap-2 mb-2">
            <input
              placeholder="商品名稱"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="border p-1"
            />
            <input
              type="number"
              placeholder="單價"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              className="border p-1 w-20"
            />
            <input
              type="number"
              placeholder="庫存"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              className="border p-1 w-20"
            />
            <button onClick={addProduct} className="bg-green-500 text-white px-2 rounded">新增</button>
          </div>
          <ul>
            {products.map((p) => (
              <li key={p.id} className="flex justify-between border-b py-1">
                {p.name} - ${p.price} (庫存: {p.stock})
                <button onClick={() => deleteProduct(p.id)} className="text-red-500">🗑️</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 訂單管理 */}
      {activeTab === "orders" && (
        <section className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">新增訂單</h2>
          <div className="space-y-2">
            <input placeholder="姓名" value={newOrder.customer_name} onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })} className="border p-1 w-full" />
            <input placeholder="電話" value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} className="border p-1 w-full" />
            <input placeholder="帳號後五碼" value={newOrder.account_last5} onChange={(e) => setNewOrder({ ...newOrder, account_last5: e.target.value })} className="border p-1 w-full" />
            <input placeholder="寄送方式" value={newOrder.shipping_method} onChange={(e) => setNewOrder({ ...newOrder, shipping_method: e.target.value })} className="border p-1 w-full" />

            <h3 className="font-semibold">訂購項目</h3>
            {newOrder.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <select
                  value={item.product_id}
                  onChange={(e) => updateOrderItem(idx, "product_id", e.target.value)}
                  className="border p-1"
                >
                  <option value="">選擇商品</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateOrderItem(idx, "quantity", Number(e.target.value))}
                  className="border p-1 w-20"
                />
                <span>小計: ${item.subtotal || 0}</span>
              </div>
            ))}
            <button onClick={addOrderItem} className="bg-blue-500 text-white px-2 rounded">+ 加商品</button>

            <button onClick={createOrder} className="bg-green-600 text-white px-3 py-1 rounded mt-2">建立訂單</button>
          </div>

          <h2 className="text-xl font-semibold mt-6 mb-2">訂單列表</h2>
          <input placeholder="搜尋姓名" value={search} onChange={(e) => setSearch(e.target.value)} className="border p-1 mb-2 w-full" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-1 mb-2 w-full">
            <option value="">全部狀態</option>
            <option value="尚未匯款">尚未匯款</option>
            <option value="已對帳">已對帳</option>
            <option value="已交貨">已交貨</option>
          </select>
          <ul>
            {orders
              .filter((o) => o.order.customer_name.includes(search))
              .filter((o) => (filterStatus ? o.order.status === filterStatus : true))
              .map((o) => (
                <li key={o.order.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <span>{o.order.customer_name} ({o.order.phone}) - 狀態: {o.order.status} - 總額: ${o.order.total_amount}</span>
                    <div className="space-x-2">
                      <select
                        value={o.order.status}
                        onChange={(e) => updateOrderStatus(o.order.id, e.target.value)}
                        className="border p-1"
                      >
                        <option value="尚未匯款">尚未匯款</option>
                        <option value="已對帳">已對帳</option>
                        <option value="已交貨">已交貨</option>
                      </select>
                      <button onClick={() => deleteOrder(o.order.id)} className="text-red-500">🗑️</button>
                    </div>
                  </div>
                  <ul className="ml-4 text-sm">
                    {o.items.map((i) => (
                      <li key={i.id}>{products.find(p => p.id === i.product_id)?.name || "商品已刪除"} x {i.quantity} = ${i.subtotal}</li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* 報表 */}
      {activeTab === "reports" && (
        <section className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">報表</h2>
          <button onClick={fetchSalesReport} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">重新整理統計</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded">匯出 CSV</button>

          {salesReport && (
            <div className="mt-4">
              <h3 className="font-semibold">銷售統計</h3>
              <p>總訂單數: {salesReport.total_orders}</p>
              <p>總銷售額: ${salesReport.total_sales}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
