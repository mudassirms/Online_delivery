import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/catalog/orders");
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

  const deleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/catalog/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      console.warn("Failed to delete order", e);
    }
  };

  if (loading)
    return (
      <Layout>
        <p className="text-center text-lg mt-10 text-gray-300 animate-pulse">
          Loading orders...
        </p>
      </Layout>
    );

  if (orders.length === 0)
    return (
      <Layout>
        <p className="text-center text-gray-400 mt-10">
          No orders placed yet.
        </p>
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8 text-cyan-400 drop-shadow-md">
        Store Orders
      </h1>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg text-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg text-cyan-400">
                Order #{order.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  order.status === "accepted"
                    ? "bg-blue-600/80 text-white"
                    : order.status === "completed"
                    ? "bg-green-600/80 text-white"
                    : order.status === "rejected"
                    ? "bg-red-600/80 text-white"
                    : "bg-gray-700/80 text-white"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="mb-3 text-gray-300">
              <span className="font-medium text-gray-100">Customer: </span>
              {order.user?.name || "N/A"}
            </div>
            <div className="mb-3 text-gray-300">
              <span className="font-medium text-gray-100">Address: </span>
              {order.address?.address_line || "N/A"}
            </div>

            <div className="mb-3 text-gray-300">
              <span className="font-medium text-gray-100">Products: </span>
              <div className="ml-2 mt-1 space-y-1">
                {order.items?.map((i) => (
                  <div key={i.id} className="text-sm text-gray-400">
                    {i.quantity} × {i.product?.name || i.product_id}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5 text-gray-300">
              <span className="font-medium text-gray-100">Total: </span>
              ₹{order.total_price}
            </div>

            <div className="flex flex-wrap gap-3">
              {order.status !== "accepted" && (
                <button
                  onClick={() => updateStatus(order.id, "accepted")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Accept
                </button>
              )}
              {order.status !== "completed" && (
                <button
                  onClick={() => updateStatus(order.id, "completed")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Complete
                </button>
              )}
              {order.status !== "rejected" && (
                <button
                  onClick={() => updateStatus(order.id, "rejected")}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => deleteOrder(order.id)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
