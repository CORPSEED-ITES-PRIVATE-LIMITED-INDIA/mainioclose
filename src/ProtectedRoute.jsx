import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {


  // Fallback to localStorage if Redux user is not available
  const localUserDetails = localStorage.getItem("userDetail");
  const userFromStorage = localUserDetails ? JSON.parse(localUserDetails) : null;

  // Use Redux user if available, otherwise fallback to localStorage user
  const user = userFromStorage;
  const userId = user?.id;
  const userRoles = user?.roles || [];

  // Redirect to login if not authenticated or no userId
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles (if specified)
//   if (allowedRoles.length > 0 && !userRoles.some((role) => allowedRoles.includes(role))) {
//     return <Navigate to="/unauthorized" replace />;
//   }

  // Render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
