import { Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";
import Login from "./login/Login";
import ProtectedRoute from "./ProtectedRoute";
import Layoutpage from "./layouts/Layoutpage";
import AdminDashboards from "./dashboards/AdminDashboards";
import Users from "./users/Users";
import VendorRequests from "./vendor-request/VendorRequests";
import AccountsModuleRouting from "./routings/AccountsModuleRouting";
import SalesModuleRouting from "./routings/SalesModuleRouting";
import IndustryModuleRouting from "./routings/IndustryModuleRouting";
import HRModuleRouting from "./routings/HRModuleRouting";
import ERPSettingRouting from "./routings/ERPSettingRouting";
import IVRRouting from "./routings/IVRRouting";
import DashboardRouting from "./routings/DashboardRouting";

function App() {
  return (
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
          {AccountsModuleRouting ()}

          {/* IVR */}
          {IVRRouting ()}

          {/* HR */}
          {HRModuleRouting()} 

          {/* Others */}
          <Route path="users" element={<Users />} />
          <Route path="vendors-requests" element={<VendorRequests />} />

          {/* Settings */}
          {ERPSettingRouting()} 
        </Route>
      </Route>

      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
    </Routes>
  );
}

export default App;
