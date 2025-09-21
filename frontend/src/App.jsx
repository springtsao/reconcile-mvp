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
        <button onClic
