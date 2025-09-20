import { Route } from "react-router-dom";
import AdminDashboards from "../dashboards/AdminDashboards";
import LeadDashboardDetail from "../dashboards/LeadDashboardDetail";
import SalesDashboard from "../dashboards/SalesDashboard";

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
      <Route path="accounts/dashboard" element={<AdminDashboards />} />

      {/* Quality dashboard */}
      <Route path="quality/dashboard" element={<AdminDashboards />} />
    </>
  );
};

export default DashboardRouting;
