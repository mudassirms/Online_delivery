import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";
import ProductModal from "../components/ProductModal";

export default function StoreProducts() {
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/catalog/stores/${storeId}/products`);
      setProducts(res.data);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Products for Store {storeId}</h1>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => { setEditingProduct(null); setModalOpen(true); }}
      >
        Add Product
      </button>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Price</th><th>Available</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.available ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => { setEditingProduct(p); setModalOpen(true); }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          storeId={storeId}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); fetchProducts(); }}
        />
      )}
    </Layout>
  );
}
