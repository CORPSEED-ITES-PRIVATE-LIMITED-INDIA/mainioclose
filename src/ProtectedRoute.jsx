import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { logoutFun } from "./toolkit/slices/authSlice";

const ProtectedRoute = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { currentUser, isAuth } = useSelector((state) => state.auth);

  const invalidUser =
    !isAuth || !currentUser?.id || userId !== String(currentUser.id);

  useEffect(() => {
    if (invalidUser) {
      dispatch(logoutFun());
    }
  }, [invalidUser, dispatch]);

  if (invalidUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
