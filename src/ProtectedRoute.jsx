import { useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";

const ProtectedRoute = () => {
  const { userId } = useParams();
  const { currentUser, isAuth } = useSelector((state) => state.auth);

  // Redirect only — never tear the session down from here. The guard runs on
  // the first render of every reload, and a logout dispatched at that point
  // wipes a session that was perfectly valid.
  if (!isAuth || !currentUser?.id || userId !== String(currentUser.id)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
