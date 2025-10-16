import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders for this store/admin
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/catalog/orders"); // backend should filter for admin/store orders
      setOrders(res.data);
    } catch (e) {
      console.warn("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/catalog/orders/${id}`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch (e) {
      console.warn("Failed to update status", e);
    }
  };

  // Delete an order
  const deleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await api.delete(`/catalog/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      console.warn("Failed to delete order", e);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Store Orders</h1>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Products</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.user?.name || "N/A"}</td>
                <td className="p-2">
                  {order.items?.map((i) => (
                    <div key={i.id}>
                      {i.quantity}× {i.product?.name || i.product_id}
                    </div>
                  ))}
                </td>
                <td className="p-2">₹{order.total_price}</td>
                <td className="p-2">{order.status}</td>
                <td className="p-2 flex gap-2">
                  {order.status !== "accepted" && (
                    <button
                      onClick={() => updateStatus(order.id, "accepted")}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Accept
                    </button>
                  )}
                  {order.status !== "completed" && (
                    <button
                      onClick={() => updateStatus(order.id, "completed")}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                  )}
                  {order.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(order.id, "rejected")}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
