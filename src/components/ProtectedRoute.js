import { Navigate, useParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { userid } = useParams(); // get user ID from the URL
  const userData = JSON.parse(localStorage.getItem("userDetail"));

  // If no user data or ID mismatch, redirect to login
  if (!userData || userData?.id != userid) {
    return <Navigate to="/erp/login" replace />;
  }

  // If everything is okay, render the route
  return children;
};

export default ProtectedRoute;
