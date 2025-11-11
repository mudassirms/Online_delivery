import { useEffect, useState } from "react";
import { getStores, getCategories, getUsersWithStores } from "../api/superadminApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const DISPLAY_TZ = "Asia/Kolkata";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storeRes, catRes, usersRes] = await Promise.all([
        getStores(),
        getCategories(),
        getUsersWithStores(),
      ]);

      setStores(storeRes.data);
      setCategories(catRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "N/A";
  };

  const getOwnerName = (ownerId) => {
    const user = users.find((u) => u.id === ownerId);
    return user ? user.name : "N/A";
  };

  // -------- OPEN/CLOSED LOGIC ----------
  const parseTimeToTz = (timeStr) => {
    if (!timeStr) return null;
    const today = dayjs().tz(DISPLAY_TZ).format("YYYY-MM-DD");
    const parsed = dayjs.tz(`${today} ${timeStr}`, "YYYY-MM-DD HH:mm:ss", DISPLAY_TZ);
    return parsed.isValid() ? parsed : null;
  };

  const isStoreOpenNow = (store) => {
    if (!store.open_time || !store.close_time) return false;

    const now = dayjs().tz(DISPLAY_TZ);
    const open = parseTimeToTz(store.open_time);
    const close = parseTimeToTz(store.close_time);

    if (!open || !close) return false;

    // handle stores that close after midnight
    if (close.isBefore(open) || close.isSame(open)) {
      const closeNextDay = close.add(1, "day");
      return now.isBetween(open, closeNextDay, null, "[)");
    }

    return now.isBetween(open, close, null, "[)");
  };

  const getStatusClass = (store) => {
    return isStoreOpenNow(store)
      ? "bg-green-500 text-white font-bold px-2 py-1 rounded"
      : "bg-red-500 text-white font-bold px-2 py-1 rounded";
  };
  // -------------------------------------

  if (loading) return <p>Loading stores...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Stores</h1>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id} className="border-t">
              <td className="p-2 border">{store.name}</td>
              <td className="p-2 border">{getCategoryName(store.category_id)}</td>
              <td className="p-2 border">{getOwnerName(store.owner_id)}</td>
              <td className="p-2 border text-center">
                <span className={getStatusClass(store)}>
                  {isStoreOpenNow(store) ? "Open" : "Closed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
