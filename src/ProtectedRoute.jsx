import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { logoutFun } from "./toolkit/slices/authSlice";

const ProtectedRoute = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { currentUser, isAuth } = useSelector((state) => state.auth);

  if (!isAuth || !currentUser?.id) {
    dispatch(logoutFun());
    return <Navigate to="/login" replace />;
  }

  if (userId !== String(currentUser.id)) {
    dispatch(logoutFun());
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
