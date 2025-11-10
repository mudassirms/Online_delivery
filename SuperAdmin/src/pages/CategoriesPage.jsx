import  { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/superadminApi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", image: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
    setLoading(false);
  };

  const handleAdd = async () => {
    const res = await createCategory(newCategory);
    setCategories([...categories, res.data]);
    setNewCategory({ name: "", image: "" });
  };

  const handleDelete = async (id) => {
    await deleteCategory(id);
    setCategories(categories.filter((c) => c.id !== id));
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Categories</h1>
      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="Name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Image URL" value={newCategory.image} onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })} className="border p-2 rounded" />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-2 border">{cat.name}</td>
              <td className="p-2 border">{cat.image}</td>
              <td className="p-2 border">
                <button onClick={() => handleDelete(cat.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
