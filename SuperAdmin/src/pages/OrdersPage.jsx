import { useEffect, useState } from "react";
import { getOrders, patchOrder, deleteOrder } from "../api/superadminApi";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await getOrders();
    setOrders(res.data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, status) => {
    await patchOrder(orderId, { status });
    fetchOrders();
  };

  const handleDelete = async (orderId) => {
    await deleteOrder(orderId);
    fetchOrders();
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Orders</h1>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Order</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-2 border">{order.order_title}</td>
              <td className="p-2 border">{order.user?.name || "N/A"}</td>
              <td className="p-2 border">{order.status}</td>
              <td className="p-2 border flex gap-2">
                <button onClick={() => handleStatusChange(order.id, "completed")} className="bg-green-500 text-white px-2 py-1 rounded">Complete</button>
                <button onClick={() => handleDelete(order.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
