import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { AliveScope } from "react-activation";

import HomePage from "./home/HomePage";
import Login from "./login/Login";
import ForgotPassword from "./login/ForgotPassword";
import Otp from "./login/Otp";
import ProtectedRoute from "./ProtectedRoute";
import Layoutpage from "./layouts/Layoutpage";
import Users from "./users/Users";
import SalesModuleRouting from "./routings/SalesModuleRouting";
import IndustryModuleRouting from "./routings/IndustryModuleRouting";
import HRModuleRouting from "./routings/HRModuleRouting";
import ERPSettingRouting from "./routings/ERPSettingRouting";
import DashboardRouting from "./routings/DashboardRouting";
import OperationModuleRouting from "./routings/OperationModuleRouting";
import {
  accountLoginModuleRouting,
  AccountsModuleRouting,
} from "./routings/AccountsModuleRouting";
import ProcurementRouting from "./routings/ProcurementRouting";
import QualityRouting from "./routings/QualityRouting";
import UserHistory from "./users/UserHistory";
import UserManagerApproval from "./users/UserManagerApproval";
import DeactiveUserList from "./users/DeactiveUserList";
import EstimatePreview from "./components/EstimatePreview";
import VendorPaymentApproval from "./admin/VendorPaymentApproval";
import DiscountedEstimateApproval from "./admin/DiscountedEstimateApproval";
import { restoreSession } from "./toolkit/slices/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <AliveScope>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/:email/otp" element={<Otp />} />
        <Route
          path="/:leadId/:uuid/estimate-preview"
          element={<EstimatePreview />}
        />

        <Route path="/erp" element={<ProtectedRoute />}>
          <Route path=":userId" element={<Layoutpage />}>
            {DashboardRouting()}
            {SalesModuleRouting()}
            {IndustryModuleRouting()}
            {AccountsModuleRouting()}
            {accountLoginModuleRouting()}
            {QualityRouting()}
            {HRModuleRouting()}
            {OperationModuleRouting()}

            <Route path="users/usersList" element={<Users />} />
            <Route
              path="users/deactiveUsersList"
              element={<DeactiveUserList />}
            />
            <Route
              path="users/approvalList"
              element={<UserManagerApproval />}
            />
            <Route
              path="users/usersList/:currentUserId/userHistory"
              element={<UserHistory />}
            />
            <Route
              path="admin/vendorPaymentApproval"
              element={<VendorPaymentApproval />}
            />
            <Route
              path="admin/discountedEstimate"
              element={<DiscountedEstimateApproval />}
            />

            {ProcurementRouting()}
            {ERPSettingRouting()}
          </Route>
        </Route>

        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
    </AliveScope>
  );
}

export default App;
