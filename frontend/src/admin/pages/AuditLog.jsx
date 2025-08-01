import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/adminApi";

export default function AuditLog() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({}); // Track expanded rows by _id

  useEffect(() => {
    api
      .get("/admin/auditlogs")
      .then((res) => setAudits(res.data))
      .catch((err) => {
        console.error("Failed to fetch audit logs:", err);
        setError("Failed to load audit logs.");
        setAudits([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Toggle row expansion to show/hide details
  const toggleDetails = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Render details in a user-friendly key-value list
  const renderDetails = (details) =>
    Object.entries(details).map(([key, value]) => (
      <div key={key} className="mb-1">
        <span className="font-medium capitalize">
          {key.replace(/([A-Z])/g, " $1")}:{" "}
        </span>
        <span>
          {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
        </span>
      </div>
    ));

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Audit Logs
      </h2>

      {loading && <div>Loading audit logs...</div>}

      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && audits.length === 0 && (
        <div>No audit logs found.</div>
      )}

      {!loading && !error && audits.length > 0 && (
        <table className="min-w-full bg-white shadow rounded-xl overflow-hidden dark:bg-gray-900">
          <thead>
            <tr>
              <th className="py-2 px-4">Timestamp</th>
              <th className="py-2 px-4">Admin Email</th>
              <th className="py-2 px-4">Action</th>
              <th className="py-2 px-4">Collection</th>
              <th className="py-2 px-4">Doc ID</th>
              <th className="py-2 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <React.Fragment key={a._id}>
                <tr className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                  <td className="py-2 px-4">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">
                    {a.adminId?.email || "Unknown Admin"}
                  </td>
                  <td className="py-2 px-4">{a.action}</td>
                  <td className="py-2 px-4">{a.collectionName}</td>
                  <td className="py-2 px-4">{a.documentId}</td>
                  <td className="py-2 px-4">
                    {a.details ? (
                      <button
                        onClick={() => toggleDetails(a._id)}
                        className="text-blue-600 hover:underline focus:outline-none"
                        aria-expanded={!!expandedRows[a._id]}
                        aria-controls={`details-${a._id}`}
                        type="button"
                      >
                        {expandedRows[a._id] ? "Hide Details" : "Show Details"}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                {expandedRows[a._id] && a.details && (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm"
                    >
                      {renderDetails(a.details)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
