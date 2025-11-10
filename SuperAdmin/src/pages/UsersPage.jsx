import { useEffect, useState } from "react";
import { getUsersWithStores } from "../api/superadminApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsersWithStores();
      setUsers(res.data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-orange-400 text-white font-bold";
      case "store_owner":
        return "bg-blue-400 text-white font-bold";
      case "user":
        return "bg-gray-400 text-white font-bold";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">User Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className={`p-2 border text-center ${getRoleClass(user.role)}`}>
                {user.role || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
