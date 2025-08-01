import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/adminApi";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "",
    floor: "",
    window: false,
  });
  const [editingRoomId, setEditingRoomId] = useState(null);

  const fetchRooms = () => {
    setLoading(true);
    setError("");
    api
      .get("/admin/rooms")
      .then((res) => setRooms(res.data))
      .catch(() => setError("Failed to fetch rooms"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (editingRoomId) {
      // Update room
      api
        .patch(`/admin/rooms/${editingRoomId}`, formData)
        .then((res) => {
          setRooms(rooms.map((r) => (r._id === editingRoomId ? res.data : r)));
          resetForm();
        })
        .catch(() => setError("Failed to update room"));
    } else {
      // Create room
      api
        .post("/admin/rooms", formData)
        .then((res) => {
          setRooms([res.data, ...rooms]);
          resetForm();
        })
        .catch(() => setError("Failed to create room"));
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      type: "",
      floor: "",
      window: false,
    });
    setEditingRoomId(null);
  };

  const handleEditClick = (room) => {
    setEditingRoomId(room._id);
    setFormData({
      roomNumber: room.roomNumber || "",
      type: room.type || "",
      floor: room.floor || "",
      window: room.window || false,
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    api
      .delete(`/admin/rooms/${id}`)
      .then(() => setRooms(rooms.filter((r) => r._id !== id)))
      .catch(() => setError("Failed to delete room"));
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Room Management</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-2 max-w-md">
        <input
          name="roomNumber"
          placeholder="Room Number"
          value={formData.roomNumber}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="type"
          placeholder="Type (e.g. Single, Double)"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="floor"
          placeholder="Floor"
          value={formData.floor}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="window"
            checked={formData.window}
            onChange={handleInputChange}
          />
          <span>Window</span>
        </label>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingRoomId ? "Update Room" : "Add Room"}
        </button>
        {editingRoomId && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Room Number</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Floor</th>
              <th className="border px-2 py-1">Window</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r._id} className="hover:bg-gray-100">
                <td className="border px-2 py-1">{r.roomNumber}</td>
                <td className="border px-2 py-1">{r.type}</td>
                <td className="border px-2 py-1">{r.floor}</td>
                <td className="border px-2 py-1">{r.window ? "Yes" : "No"}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    onClick={() => handleEditClick(r)}
                    className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
