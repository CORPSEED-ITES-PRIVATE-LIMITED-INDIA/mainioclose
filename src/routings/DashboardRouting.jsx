import { lazy } from "react";
import { Route } from "react-router-dom";
const AdminDashboards = lazy(() => import("../dashboards/AdminDashboards"));
const LeadDashboardDetail = lazy(
  () => import("../dashboards/LeadDashboardDetail"),
);
const AccountsDashboard = lazy(
  () => import("../dashboards/accounts/AccountsDashboard"),
);
const SalesDashboard = lazy(() => import("../dashboards/sales/SalesDashboard"));
const OperationsDashboard = lazy(
  () => import("../dashboards/operations/OperationsDashboard"),
);

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
      <Route path="operation/dashboard" element={<OperationsDashboard />} />
    </>
  );
};

export default DashboardRouting;
