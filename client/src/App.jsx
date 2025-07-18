// Main application component
import { useEffect, useState } from "react";
import BugForm from "@/components/BugForm";
import BugList from "@/components/BugList";
import { getBugs, createBug, updateBug, deleteBug } from "@/lib/api";

export default function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBug, setEditingBug] = useState(null);

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const data = await getBugs();
      setBugs(data);
    } catch (err) {
      console.error("Error fetching bugs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleCreate = async (formData) => {
    try {
      await createBug(formData);
      await fetchBugs();
    } catch (err) {
      console.error("Error creating bug:", err.message);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await updateBug(id, formData);
      await fetchBugs();
      setEditingBug(null);
    } catch (err) {
      console.error("Error updating bug:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBug(id);
      await fetchBugs();
    } catch (err) {
      console.error("Error deleting bug:", err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🐞 Bug Tracker</h1>

      <BugForm
        key={editingBug?._id || "new"}
        onSubmit={editingBug ? (data) => handleUpdate(editingBug._id, data) : handleCreate}
        initialData={editingBug}
      />

      <BugList
        bugs={bugs}
        loading={loading}
        onDelete={handleDelete}
        onEdit={setEditingBug}
      />
    </div>
  );
}
