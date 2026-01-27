import { Routes, Route } from "react-router-dom";
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
import { AliveScope } from "react-activation";
import ProcurementRouting from "./routings/ProcurementRouting";
import QualityRouting from "./routings/QualityRouting";
import UserHistory from "./users/UserHistory";
import UserManagerApproval from "./users/UserManagerApproval";
import DeactiveUserList from "./users/DeactiveUserList";
import EstimatePreview from "./components/EstimatePreview";
import VendorPaymentApproval from "./admin/VendorPaymentApproval";
import DiscountedEstimateApproval from "./admin/DiscountedEstimateApproval";
import TempAdminRouting from "./routings/TempAdminRouting";

function App() {
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
            {/*Dashboard */}
            {DashboardRouting()}

            {/* Sales */}
            {SalesModuleRouting()}

            {/* Industry */}
            {IndustryModuleRouting()}

            {/* Accounts */}
            {AccountsModuleRouting()}

            {accountLoginModuleRouting()}

            {/* IVR */}
            {QualityRouting()}

            {/* Temp Admin routing */}
            {TempAdminRouting()}

            {/* HR */}
            {HRModuleRouting()}

            {/*Operations */}
            {OperationModuleRouting()}

            {/* Others */}
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

            {/* Settings */}
            {ERPSettingRouting()}
          </Route>
        </Route>

        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
    </AliveScope>
  );
}

export default App;
