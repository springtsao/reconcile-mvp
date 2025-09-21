import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // 載入資料
  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products/`);
    setProducts(await res.json());
  };
  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders/`);
    setOrders(await res.json());
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  return (
    <AppContext.Provider value={{ products, setProducts, fetchProducts, orders, setOrders, fetchOrders }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

// ------------------
// 商品管理頁
// ------------------
const ProductsPage = () => {
  const { products, fetchProducts } = useApp();
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  const addProduct = async () => {
    await fetch(`${API_URL}/products/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    setNewProduct({ name: "", price: "", stock: "" });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div>
      <h2>📦 商品管理</h2>
      <input placeholder="商品名稱" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
      <input placeholder="價格" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} />
      <input placeholder="庫存" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} />
      <button onClick={addProduct}>新增商品</button>

      <table border="1" style={{ marginTop: "1rem", width: "100%" }}>
        <thead>
          <tr><th>ID</th><th>商品名稱</th><th>價格</th><th>庫存</th><th>操作</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td><button onClick={() => deleteProduct(p.id)}>🗑️ 刪除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ------------------
// 訂單管理頁
// ------------------
const OrdersPage = () => {
  const { products, orders, fetchOrders } = useApp();
  const [newOrder, setNewOrder] = useState({ customer_name: "", phone: "", product_id: "", quantity: 1, bank_last5: "", shipping: "", status: "尚未匯款" });

  const addOrder = async () => {
    await fetch(`${API_URL}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    setNewOrder({ customer_name: "", phone: "", product_id: "", quantity: 1, bank_last5: "", shipping: "", status: "尚未匯款" });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const selectedProduct = products.find(p => p.id == newOrder.product_id);
  const totalAmount = selectedProduct ? selectedProduct.price * newOrder.quantity : 0;

  return (
    <div>
      <h2>📝 訂單管理</h2>
      <input placeholder="姓名" value={newOrder.customer_name} onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })} />
      <input placeholder="電話" value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} />
      <select value={newOrder.product_id} onChange={(e) => setNewOrder({ ...newOrder, product_id: e.target.value })}>
        <option value="">選擇商品</option>
        {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
      </select>
      <input type="number" min="1" value={newOrder.quantity} onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })} />
      <input placeholder="帳號後五碼" value={newOrder.bank_last5} onChange={(e) => setNewOrder({ ...newOrder, bank_last5: e.target.value })} />
      <input placeholder="寄送方式" value={newOrder.shipping} onChange={(e) => setNewOrder({ ...newOrder, shipping: e.target.value })} />
      <select value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}>
        <option>尚未匯款</option>
        <option>已對帳</option>
        <option>已交貨</option>
      </select>
      <p>總金額：{totalAmount}</p>
      <button onClick={addOrder}>新增訂單</button>

      <table border="1" style={{ marginTop: "1rem", width: "100%" }}>
        <thead>
          <tr><th>ID</th><th>姓名</th><th>電話</th><th>商品</th><th>數量</th><th>金額</th><th>帳號後五碼</th><th>寄送方式</th><th>狀態</th><th>操作</th></tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const product = products.find(p => p.id === o.product_id);
            return (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.phone}</td>
                <td>{product ? product.name : "N/A"}</td>
                <td>{o.quantity}</td>
                <td>{o.amount}</td>
                <td>{o.bank_last5}</td>
                <td>{o.shipping}</td>
                <td>{o.status}</td>
                <td><button onClick={() => deleteOrder(o.id)}>🗑️ 刪除</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ------------------
// 主應用程式
// ------------------
export default function App() {
  return (
    <Router>
      <AppProvider>
        <nav>
          <Link to="/orders">訂單管理</Link> | <Link to="/products">商品管理</Link>
        </nav>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="*" element={<OrdersPage />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}
