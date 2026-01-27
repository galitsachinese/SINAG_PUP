// src/Components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const BASE_PATH = '/pup-sinag';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem('token');
  const userRole = (localStorage.getItem('role') || '').toLowerCase();

  // 🚫 Not Logged In
  if (!token || !userRole) {
    return <Navigate to={BASE_PATH} replace />;
  }

  // 🚫 Logged In but Unauthorized Role
  const isRoleAllowed = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!isRoleAllowed) {
    return <Navigate to={BASE_PATH} replace />;
  }

  // ✅ Access Granted
  return children;
}
