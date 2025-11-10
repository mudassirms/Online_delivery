import { useEffect, useState } from "react";
import { getDeliverySettings, updateDeliverySettings } from "../api/superadminApi";

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await getDeliverySettings();
    setSettings(res.data);
    setLoading(false);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSave = async () => {
    await updateDeliverySettings(settings);
    alert("Delivery settings updated!");
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Delivery Settings</h1>
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        {Object.keys(settings).map((key) => (
          <div key={key}>
            <label className="block font-medium">{key.replace(/_/g, " ")}</label>
            <input type="number" name={key} value={settings[key]} onChange={handleChange} className="border p-2 rounded w-full"/>
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
    </div>
  );
}
