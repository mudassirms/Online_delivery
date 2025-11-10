import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const DISPLAY_TZ = "Asia/Kolkata";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    stores: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contact_number, setContactNumber] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const storeRes = await api.get("/catalog/stores/my");
        let totalOrders = 0,
          totalProducts = 0;

        try {
          const statsRes = await api.get("/catalog/stats");
          totalOrders = statsRes?.data?.totalOrders || 0;
          totalProducts = statsRes?.data?.totalProducts || 0;
        } catch {}

        const categoriesRes = await api.get("/catalog/categories");
        setCategories(categoriesRes.data);

        setStats({
          stores: storeRes.data,
          totalOrders,
          totalProducts,
        });
      } catch (e) {
        console.warn("Error fetching dashboard data:", e);
        if (e.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const parseTimeToTz = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.trim()) return null;

    const formats = ["HH:mm:ss", "HH:mm", "hh:mm A"];
    const today = dayjs().tz(DISPLAY_TZ).format("YYYY-MM-DD");

    for (let fmt of formats) {
      const parsed = dayjs.tz(`${today} ${timeStr}`, `${"YYYY-MM-DD"} ${fmt}`, DISPLAY_TZ);
      if (parsed.isValid()) return parsed;
    }

    const fallback = dayjs.tz(`${today}T${timeStr}`, DISPLAY_TZ);
    return fallback.isValid() ? fallback : null;
  };

  const isStoreOpenNow = (store) => {
    if (!store?.open_time || !store?.close_time) return false;

    const now = dayjs().tz(DISPLAY_TZ);
    const open = parseTimeToTz(store.open_time);
    const close = parseTimeToTz(store.close_time);

    if (!open || !close) return false;

    if (close.isSame(open) || close.isBefore(open)) {
      const closeNextDay = close.add(1, "day");
      return now.isBetween(open, closeNextDay, null, "[)");
    }

    return now.isBetween(open, close, null, "[)");
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "";
    const formats = ["HH:mm:ss", "HH:mm", "hh:mm A"];
    for (let fmt of formats) {
      const parsed = dayjs(timeStr, fmt);
      if (parsed.isValid()) return parsed.format("hh:mm A");
    }
    const tzParsed = parseTimeToTz(timeStr);
    return tzParsed ? tzParsed.format("hh:mm A") : timeStr;
  };

  const handleAddStore = async () => {
    if (!storeName || !categoryId)
      return alert("Please provide store name and category.");

    try {
      const res = await api.post("/catalog/stores", {
        name: storeName,
        image: storeImage,
        contact_number,
        category_id: parseInt(categoryId),
        open_time: openTime || null,
        close_time: closeTime || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });

      setStats((prev) => ({
        ...prev,
        stores: [...prev.stores, res.data],
      }));

      setShowModal(false);
      setStoreName("");
      setStoreImage("");
      setContactNumber("");
      setCategoryId("");
      setOpenTime("");
      setCloseTime("");
      setLatitude("");
      setLongitude("");

      alert("Store added successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add store. Try again.");
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        console.error(err);
        alert("Failed to fetch location. Please allow location access.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      <Layout>
        {loading ? (
          <div className="text-center mt-12 text-lg text-gray-400 animate-pulse">
            Loading dashboard...
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 rounded-2xl shadow-xl hover:scale-105 transform transition">
                <h2 className="text-lg font-semibold mb-2 text-white">
                  Total Orders
                </h2>
                <p className="text-3xl font-bold text-white">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-700 to-teal-800 p-6 rounded-2xl shadow-xl hover:scale-105 transform transition">
                <h2 className="text-lg font-semibold mb-2 text-white">
                  Total Products
                </h2>
                <p className="text-3xl font-bold text-white">
                  {stats.totalProducts}
                </p>
              </div>
            </div>

            {/* Admin’s Stores */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Your Stores</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
              >
                + Add Store
              </button>
            </div>

            {stats.stores.length === 0 ? (
              <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-xl">
                <p className="text-gray-400 mb-4">
                  You don’t have any stores yet.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Add Store
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.stores.map((store) => {
                  const openNow = isStoreOpenNow(store);
                  return (
                    <div
                      key={store.id}
                      className="bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                    >
                      <img
                        src={store.image || "https://via.placeholder.com/300x200"}
                        alt={store.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {store.name}
                          </h3>
                          <div
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              openNow
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {openNow ? "Open" : "Closed"}
                          </div>
                        </div>

                        <p className="text-sm text-gray-300">
                          Category ID: {store.category_id}
                        </p>

                        {store.open_time && store.close_time && (
                          <p className="text-sm text-gray-400 mt-1">
                            ⏰ {formatDisplayTime(store.open_time)} -{" "}
                            {formatDisplayTime(store.close_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Store Modal */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl w-96 relative">
                  <h2 className="text-2xl font-bold mb-4 text-white">
                    Add Store
                  </h2>

                  <input
                    type="text"
                    placeholder="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <input
                    type="text"
                    placeholder="Store Image URL (optional)"
                    value={storeImage}
                    onChange={(e) => setStoreImage(e.target.value)}
                    className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <input
                    type="text"
                    placeholder="Contact Number (optional)"
                    value={contact_number}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-3 border border-gray-700 rounded-xl mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {/* Location Section */}
                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-gray-300">
                      Store Location
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        readOnly
                        value={
                          latitude && longitude
                            ? `${latitude}, ${longitude}`
                            : "Not set"
                        }
                        className="flex-1 p-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="px-3 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition"
                      >
                        📍 Get Location
                      </button>
                    </div>
                  </div>

                  {/* Time Inputs */}
                  <div className="flex justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm mb-1 text-gray-300">
                        Open Time
                      </label>
                      <input
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full p-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-1 text-gray-300">
                        Close Time
                      </label>
                      <input
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full p-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddStore}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                    >
                      Add Store
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Layout>
    </div>
  );
}
