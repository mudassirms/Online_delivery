import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";
import toast, { Toaster } from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 Function to play notification sound
  const playSound = () => {
    try {
      const audio = new Audio("/sounds/new-order.mp3");
      audio.play();
    } catch (err) {
      console.warn("Audio play failed:", err);
    }
  };

  // 🔔 Browser push notification
  const showBrowserNotification = (count) => {
    if (!("Notification" in window)) return;

    const message = `${count} new order${count > 1 ? "s" : ""} received!`;

    if (Notification.permission === "granted") {
      new Notification("🛒 New Order Alert", {
        body: message,
        icon: "/favicon.ico",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("🛒 New Order Alert", {
            body: message,
            icon: "/favicon.ico",
          });
        }
      });
    }
  };

  // 🧠 Initial order fetch
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get("/catalog/orders");
      setOrders(res.data);
    } catch (e) {
      console.warn("Failed to fetch orders", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 🧭 Fetch once on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔁 Poll every 15 seconds for updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/catalog/orders");
        const newOrders = res.data;

        // Find newly arrived orders
        const newOnes = newOrders.filter(
          (o) => !orders.some((existing) => existing.id === o.id)
        );

        if (newOnes.length > 0) {
          // Show notifications
          playSound();
          showBrowserNotification(newOnes.length);
          toast.success(
            `🛒 ${newOnes.length} new order${newOnes.length > 1 ? "s" : ""} received!`,
            { duration: 4000, position: "top-right" }
          );
        }

        setOrders(newOrders);
      } catch (e) {
        console.warn("Failed to fetch orders", e);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [orders]);

  // 🟩 Update order status
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/catalog/orders/${id}`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      toast.success(`Order marked as ${status}`, {
        position: "bottom-right",
      });
    } catch (e) {
      console.warn("Failed to update status", e);
      toast.error("Failed to update order status");
    }
  };

  // 🟥 Delete order
  const deleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/catalog/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted successfully");
    } catch (e) {
      console.warn("Failed to delete order", e);
      toast.error("Failed to delete order");
    }
  };

  // 🕒 Format timestamp
  const formatDateTime = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A";

  if (loading)
    return (
      <Layout>
        <Toaster />
        <p className="text-center text-lg mt-10 text-gray-300 animate-pulse">
          Loading orders...
        </p>
      </Layout>
    );

  if (!orders.length)
    return (
      <Layout>
        <Toaster />
        <p className="text-center text-gray-400 mt-10">
          No orders placed yet.
        </p>
      </Layout>
    );

  return (
    <Layout>
      <Toaster />
      <h1 className="text-3xl font-bold mb-8 text-cyan-400 drop-shadow-md">
        Store Orders
      </h1>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg text-gray-200"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg text-cyan-400">
                {order.order_title || `Order #${order.id}`}
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

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-gray-300">
              <div>
                <span className="font-medium text-gray-100">Placed At: </span>
                {formatDateTime(order.created_at || order.createdAt)}
              </div>
              <div>
                <span className="font-medium text-gray-100">Customer: </span>
                {order.user?.name || "N/A"}
              </div>
              <div>
                <span className="font-medium text-gray-100">Phone: </span>
                {order.contact_number ? (
                  <a
                    href={`tel:${order.contact_number}`}
                    className="text-cyan-400 hover:underline"
                  >
                    {order.contact_number}
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
              <div>
                <span className="font-medium text-gray-100">Address: </span>
                {order.address?.address_line || "N/A"}
              </div>
              <div>
                <span className="font-medium text-gray-100">Store: </span>
                {order.store_name || "N/A"}
              </div>
            </div>

            {/* Products */}
            <div className="mb-4 text-gray-300">
              <span className="font-medium text-gray-100">Products: </span>
              <div className="ml-2 mt-1 space-y-1">
                {order.items?.map((i) => (
                  <div key={i.id} className="text-sm text-gray-400">
                    {i.quantity} × {i.product?.name || i.product_id}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="mb-5 text-gray-200 space-y-1">
              <div>
                <span className="font-medium text-gray-100">Total Paid: </span>
                ₹{order.total_price?.toFixed(2)}
              </div>
              <div>
                <span className="font-medium text-gray-100">
                  Store Earnings:{" "}
                </span>
                ₹{order.store_earnings?.toFixed(2)}
              </div>
              <div>
                <span className="font-medium text-gray-100">Delivery Fee: </span>
                ₹{order.delivery_fee?.toFixed(2)}
              </div>
            </div>

            {/* Actions */}
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
                className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-gray-600"
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
