import { useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";

const ProtectedRoute = () => {
  const { userId } = useParams();
  const { currentUser, isAuth } = useSelector((state) => state.auth);

  if (!isAuth || !currentUser?.id) {
    return <Navigate to="/login" replace />;
  }
  
  if (userId !== String(currentUser.id)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
