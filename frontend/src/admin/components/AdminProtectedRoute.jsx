import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getToken } from "../../utils/authHelpers";

const AdminProtectedRoutes = ({ children }) => {
  const user = getStoredUser();
  const token = getToken();

  if (!user || !token || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoutes;
