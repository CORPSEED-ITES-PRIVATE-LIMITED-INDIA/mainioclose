import { Route } from "react-router-dom";
import AdminDashboards from "../dashboards/AdminDashboards";
import LeadDashboardDetail from "../dashboards/LeadDashboardDetail";

const DashboardRouting = () => {
  return (
    <>
      <Route path="dashboard" element={<AdminDashboards />} />
      <Route path="dashboard/:monthDate/leadData" element={<LeadDashboardDetail />} />
    </>
  );
};

export default DashboardRouting;
