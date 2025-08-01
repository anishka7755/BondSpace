import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/adminApi";

export default function MatchManagement() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMatches = () => {
    setLoading(true);
    api
      .get("/admin/matches")
      .then((res) => setMatches(res.data))
      .catch(() => setError("Failed to fetch matches"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Match Management</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border px-2 py-1">User 1</th>
              <th className="border px-2 py-1">User 2</th>
              <th className="border px-2 py-1">Matched On</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No matches found.
                </td>
              </tr>
            )}
            {matches.map((m) => (
              <tr key={m._id} className="hover:bg-gray-100">
                <td className="border px-2 py-1">
                  {m.user1Id
                    ? `${m.user1Id.firstName} ${m.user1Id.lastName} (${m.user1Id.email})`
                    : "Unknown"}
                </td>
                <td className="border px-2 py-1">
                  {m.user2Id
                    ? `${m.user2Id.firstName} ${m.user2Id.lastName} (${m.user2Id.email})`
                    : "Unknown"}
                </td>
                <td className="border px-2 py-1">
                  {new Date(m.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
