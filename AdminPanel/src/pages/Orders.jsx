import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 STRONG Alarm Sound (plays 3 times)
  const playSound = () => {
    try {
      const audio = new Audio("/sounds/order.mp3");
      audio.volume = 1.0;

      // Play 3 times like a siren
      audio.play();
      setTimeout(() => audio.play(), 1200);
      setTimeout(() => audio.play(), 2400);
    } catch (err) {
      console.warn("Audio play failed:", err);
    }
  };

  // 🔔 Browser notification popup
  const showBrowserNotification = (count) => {
    if (!("Notification" in window)) return;

    const text = `${count} new order${count > 1 ? "s" : ""} received!`;

    if (Notification.permission === "granted") {
      new Notification("🛒 New Order Alert!", {
        body: text,
        icon: "/favicon.ico",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("🛒 New Order Alert!", {
            body: text,
            icon: "/favicon.ico",
          });
        }
      });
    }
  };

  // 📳 Phone vibration support
  const vibratePhone = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 200, 300]);
    }
  };

  // 🧠 Fetch orders
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

  // Run first time
  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔁 Poll every 15 sec
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/catalog/orders");
        const newOrders = res.data;

        // Find only new ones
        const newOnes = newOrders.filter(
          (o) => !orders.some((x) => x.id === o.id)
        );

        if (newOnes.length > 0) {
          // Trigger all notifications
          playSound();
          vibratePhone();
          showBrowserNotification(newOnes.length);

          toast.success(
            `🛒 ${newOnes.length} new order${
              newOnes.length > 1 ? "s" : ""
            } received!`,
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

  // Update status
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
      toast.error("Failed to update order status");
    }
  };

  // Delete order
  const deleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await api.delete(`/catalog/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));

      toast.success("Order deleted successfully");
    } catch (e) {
      toast.error("Failed to delete order");
    }
  };

  // ⏱ Format date
  const formatDateTime = (value) => {
    if (!value) return "N/A";

    try {
      const s = String(value).trim();

      if (/^\d+$/.test(s)) {
        const epoch = s.length === 10 ? Number(s) * 1000 : Number(s);
        return dayjs(epoch).format("DD MMM YYYY, hh:mm A");
      }

      return dayjs(s).format("DD MMM YYYY, hh:mm A");
    } catch (e) {
      return "Invalid date";
    }
  };

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
        <p className="text-center text-gray-400 mt-10">No orders placed yet.</p>
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
            className={`${
              order.status === "cancelled"
                ? "bg-red-900/20"
                : "bg-gray-900"
            } border border-gray-700 rounded-2xl p-6 shadow-lg text-gray-200`}
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
                    : order.status === "cancelled"
                    ? "bg-red-500/80 text-white"
                    : "bg-gray-700/80 text-white"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-gray-300">
              <div>
                <span className="font-medium text-gray-100">
                  Placed At:{" "}
                </span>
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

            {/* Price */}
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
                <span className="font-medium text-gray-100">
                  Delivery Fee:{" "}
                </span>
                ₹{order.delivery_fee?.toFixed(2)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {order.status !== "accepted" &&
                order.status !== "cancelled" && (
                  <button
                    onClick={() => updateStatus(order.id, "accepted")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Accept
                  </button>
                )}

              {order.status !== "completed" &&
                order.status !== "cancelled" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Complete
                  </button>
                )}

              {order.status !== "rejected" &&
                order.status !== "cancelled" && (
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
