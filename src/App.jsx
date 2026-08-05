import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { AliveScope } from "react-activation";

// Layout/route-guard shells stay eager — they wrap every page, so lazily
// splitting them would just add a Suspense flash on every navigation.
import ProtectedRoute from "./ProtectedRoute";
import Layoutpage from "./layouts/Layoutpage";
import LoadingSpinner from "./components/LoadingSpinner";

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
import { restoreSession } from "./toolkit/slices/authSlice";

const HomePage = lazy(() => import("./home/HomePage"));
const Login = lazy(() => import("./login/Login"));
const ForgotPassword = lazy(() => import("./login/ForgotPassword"));
const Otp = lazy(() => import("./login/Otp"));
const Users = lazy(() => import("./users/Users"));
const UserHistory = lazy(() => import("./users/UserHistory"));
const UserManagerApproval = lazy(() => import("./users/UserManagerApproval"));
const DeactiveUserList = lazy(() => import("./users/DeactiveUserList"));
const EstimatePreview = lazy(() => import("./components/EstimatePreview"));
const VendorPaymentApproval = lazy(
  () => import("./admin/VendorPaymentApproval"),
);
const DiscountedEstimateApproval = lazy(
  () => import("./admin/DiscountedEstimateApproval"),
);
const UserMailConfig = lazy(() => import("./users/UserMailConfig"));
const OperationsLegal = lazy(() => import("./legal/OperationsLegal"));
const ProcurementVendors = lazy(() => import("./legal/ProcurementVendors"));
const CompanyDocuments = lazy(() => import("./legal/CompanyDocuments"));
const PaymentVerification = lazy(() => import("./legal/PaymentVerification"));
const AdminVendorRestrictionApproval = lazy(
  () => import("./admin/AdminVendorRestrictionApproval"),
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <AliveScope>
      <Suspense fallback={<LoadingSpinner />}>
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
                path="users/usersMailConfig"
                element={<UserMailConfig />}
              />
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
              <Route
                path="admin/vendorRestrictions"
                element={<AdminVendorRestrictionApproval />}
              />

              {ProcurementRouting()}
              {ERPSettingRouting()}

              <Route
                path="legal/operationsRequests"
                element={<OperationsLegal />}
              />
              <Route path="legal/vendors" element={<ProcurementVendors />} />
              <Route
                path="legal/companyDocuments"
                element={<CompanyDocuments />}
              />
              <Route
                path="legal/paymentVerification"
                element={<PaymentVerification />}
              />
            </Route>
          </Route>

          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        </Routes>
      </Suspense>
    </AliveScope>
  );
}

export default App;
