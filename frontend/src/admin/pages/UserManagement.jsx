import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/adminApi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For edit form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    // add other fields as needed
  });
  const [editingUserId, setEditingUserId] = useState(null);

  // For user details modal
  const [detailsUser, setDetailsUser] = useState(null);

  // Fetch all users
  const fetchUsers = () => {
    setLoading(true);
    setError("");
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to fetch users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input changes for edit form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit update user (only update, no create)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (editingUserId) {
      // Update user
      api
        .patch(`/admin/users/${editingUserId}`, formData)
        .then((res) => {
          setUsers(users.map((u) => (u._id === editingUserId ? res.data : u)));
          resetForm();
        })
        .catch(() => setError("Failed to update user"));
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
    });
    setEditingUserId(null);
  };

  // Edit button click
  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });
  };

  // Delete user
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    api
      .delete(`/admin/users/${id}`)
      .then(() => setUsers(users.filter((u) => u._id !== id)))
      .catch(() => setError("Failed to delete user"));
  };

  // Details button click opens modal
  const handleDetailsClick = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user._id}`);
      setDetailsUser(res.data);
    } catch (err) {
      alert("Failed to load user details");
    }
  };

  // Close details modal
  const closeDetailsModal = () => {
    setDetailsUser(null);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* EDIT FORM - only shown if editing */}
      {editingUserId && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2 max-w-md">
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update User
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Onboarding Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-100">
                <td className="border px-2 py-1 text-xs">{u._id}</td>
                <td className="border px-2 py-1">
                  {u.firstName} {u.lastName}
                </td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">
                  {u.onboarding?.status || "N/A"}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    onClick={() => handleDetailsClick(u)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleEditClick(u)}
                    className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Details Modal */}
{detailsUser && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={closeDetailsModal}
  >
    <div
      className="bg-white rounded p-6 max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4">
        {detailsUser.firstName} {detailsUser.lastName} - Details
      </h2>

      {/* Display user preferences from onboarding.answers */}
      <div className="mb-4">
        <strong>Email:</strong> {detailsUser.email} <br />
        <strong>Onboarding Status:</strong> {detailsUser.onboarding?.status || "N/A"} <br />
        {detailsUser.onboarding?.answers && Object.keys(detailsUser.onboarding.answers).length > 0 ? (
          <>
            <strong>Preferences:</strong>
            <ul className="list-disc ml-5">
              {Object.entries(detailsUser.onboarding.answers).map(([key, value]) => (
                <li key={key}>
                  {key}: {String(value)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No preferences available.</p>
        )}
      </div>

      <button
        onClick={closeDetailsModal}
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Close
      </button>
    </div>
  </div>
)}

    </AdminLayout>
  );
}
