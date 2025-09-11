import { Route } from "react-router-dom";
import AdminDashboards from "../dashboards/AdminDashboards";
import LeadDashboardDetail from "../dashboards/LeadDashboardDetail";

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
      <Route path="sales/dashboard" element={<AdminDashboards />} />
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
