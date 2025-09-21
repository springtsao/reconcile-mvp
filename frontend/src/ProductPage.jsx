import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [newProd, setNewProd] = useState({ name: "", price: "", stock: "" });

  useEffect(() => {
    fetch(`${API_URL}/products`).then(r => r.json()).then(setProducts);
  }, []);

  const handleAdd = async () => {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProd),
    });
    const data = await res.json();
    setProducts([...products, data]);
    setNewProd({ name: "", price: "", stock: "" });
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    setProducts(products.filter(p => p.id !== id));
  };

  const handleEdit = async (id, updated) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    setProducts(products.map(p => (p.id === id ? data : p)));
  };

  const exportCSV = () => {
    const header = ["商品","價格","庫存"];
    const rows = products.map(p => [p.name, p.price, p.stock]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">商品管理</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input placeholder="商品名稱" value={newProd.name}
          onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
          className="p-2 border rounded"/>
        <input placeholder="價格" type="number" value={newProd.price}
          onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
          className="p-2 border rounded"/>
        <input placeholder="庫存" type="number" value={newProd.stock}
          onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
          className="p-2 border rounded"/>
      </div>
      <button onClick={handleAdd} className="bg-green-500 text-white px-4 py-2 rounded">新增商品</button>
      <button onClick={exportCSV} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">匯出 CSV</button>

      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th>商品</th><th>價格</th><th>庫存</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border">
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => handleDelete(p.id)} className="text-red-500">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
