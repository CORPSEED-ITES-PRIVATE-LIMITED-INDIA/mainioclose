import { Route } from "react-router-dom";
import AdminDashboards from "../dashboards/AdminDashboards";
import LeadDashboardDetail from "../dashboards/LeadDashboardDetail";
import AccountsDashboard from "../dashboards/accounts/AccountsDashboard";
import SalesDashboard from "../dashboards/sales/SalesDashboard";

const DashboardRouting = () => {
  return (
    <>
      {/* Admin dashboard */}
      <Route path="dashboard" element={<AdminDashboards />} />
      <Route
        path="dashboard/:monthDate/leadData"
        element={<LeadDashboardDetail />}
      />

      {/* Sales dashboard */}
      <Route path="sales/dashboard" element={<SalesDashboard />} />
      <Route
        path="sales/dashboard/:monthDate/leadData"
        element={<LeadDashboardDetail />}
      />

      {/* Account dashboard */}
      <Route path="accounts/dashboard" element={<AccountsDashboard />} />

      {/* Quality dashboard */}
      <Route path="quality/dashboard" element={<AdminDashboards />} />
    </>
  );
};

export default DashboardRouting;
