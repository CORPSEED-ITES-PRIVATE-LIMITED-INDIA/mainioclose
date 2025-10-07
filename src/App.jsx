import { Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";
import Login from "./login/Login";
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

function App() {
  return (
    <AliveScope>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />

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

            {/* HR */}
            {HRModuleRouting()}

            {/*Operations */}
            {OperationModuleRouting()}

            {/* Others */}
            <Route path="users" element={<Users />} />
            <Route path="users/:currentUserId/userHistory" element={<UserHistory />} />
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
