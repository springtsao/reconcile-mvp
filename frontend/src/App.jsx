import React, { useState } from "react";
import OrderPage from "./OrderPage";
import ProductPage from "./ProductPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">對帳系統</h1>

      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "orders" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          訂單管理
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "products" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          商品管理
        </button>
      </div>

      {activeTab === "orders" ? <OrderPage /> : <ProductPage />}
    </div>
  );
}
