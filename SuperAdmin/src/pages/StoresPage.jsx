import { useEffect, useState } from "react";
import { getStores, getCategories, getUsersWithStores } from "../api/superadminApi";

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

  const getStatusClass = (store) => {
    // Assuming store.is_open is a boolean or 0/1
    if (store.is_open) return "bg-green-500 text-white font-bold px-2 py-1 rounded";
    else return "bg-red-500 text-white font-bold px-2 py-1 rounded";
  };

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
                  {store.is_open ? "Open" : "Closed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
