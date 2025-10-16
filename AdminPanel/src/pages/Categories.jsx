import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/catalog/categories");
        setCategories(res.data);
      } catch (e) {
        console.warn(e);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id} className="p-2 border-b">
            {cat.name}
          </li>
        ))}
      </ul>
    </Layout>
  );
}
