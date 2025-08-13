import { Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";
import Login from "./login/Login";
import ProtectedRoute from "./ProtectedRoute";
import Layoutpage from "./layouts/Layoutpage";
import AdminDashboards from "./dashboards/AdminDashboards";
import Leads from "./sales/leads/Leads";
import LeadDetail from "./sales/leads/LeadDetail";
import LeadHistory from "./sales/leads/LeadHistory";
import Company from "./sales/company/Company";
import CompanyGstList from "./sales/company/CompanyGstList";
import CompanyUnits from "./sales/company/CompanyUnits";
import CompanyUnitDetails from "./sales/company/CompanyUnitDetails";
import Estimate from "./sales/estimate/Estimate";
import DiscountedEstimate from "./sales/leads/DiscountedEstimate";
import Projects from "./sales/leads/Projects";
import ServingCompanies from "./sales/leads/ServingCompanies";
import CompanyApprovals from "./accounts/CompanyApprovals";
import PaymentApprovals from "./accounts/PaymentApprovals";
import UsersList from "./hr/UsersList";
import UserApprovals from "./hr/UserApprovals";
import Services from "./hr/Services";
import Rating from "./hr/Rating";
import Users from "./users/Users";
import VendorRequests from "./vendor-request/VendorRequests";
import LeadStatus from "./setting/status/LeadStatus";
import LeadProducts from "./setting/products/LeadProducts";
import ProductDetails from "./setting/products/ProductDetails";
import LeadComments from "./setting/comments/LeadComments";
import IpAddress from "./setting/ipaddress/IpAddress";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/erp" element={<ProtectedRoute />}>
        <Route path=":userId" element={<Layoutpage />}>
          
          <Route path="dashboard" element={<AdminDashboards />} />
          
          {/* Sales */}
          <Route path="sales/leads" element={<Leads />} />
          <Route path="sales/leads/:leadId/leadDetail" element={<LeadDetail />} />
          <Route path="sales/leads/:leadId/leadHistory" element={<LeadHistory />} />
          <Route path="sales/company" element={<Company />} />
          <Route path="sales/company/:companyId/gstDetails" element={<CompanyGstList />} />
          <Route path="sales/company/:companyId/gstDetails/:stateName/companyUnits" element={<CompanyUnits />} />
          <Route path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId/unitDetails" element={<CompanyUnitDetails />} />
          <Route path="sales/estimate" element={<Estimate />} />
          <Route path="sales/discountedEstimate" element={<DiscountedEstimate />} />
          <Route path="sales/projects" element={<Projects />} />
          <Route path="sales/servingCompanies" element={<ServingCompanies />} />
          
          {/* Accounts */}
          <Route path="accounts/companyApprovals" element={<CompanyApprovals />} />
          <Route path="accounts/paymentApprovals" element={<PaymentApprovals />} />
          
          {/* HR */}
          <Route path="hr/usersList" element={<UsersList />} />
          <Route path="hr/usersApprovalList" element={<UserApprovals />} />
          <Route path="hr/services" element={<Services />} />
          <Route path="hr/services/:serviceId/rating" element={<Rating />} />
          
          {/* Others */}
          <Route path="users" element={<Users />} />
          <Route path="vendors-requests" element={<VendorRequests />} />
          
          {/* Settings */}
          <Route path="settings/status" element={<LeadStatus />} />
          <Route path="settings/products" element={<LeadProducts />} />
          <Route path="settings/products/:productId/productDetail" element={<ProductDetails />} />
          <Route path="settings/comments" element={<LeadComments />} />
          <Route path="settings/ipAddress" element={<IpAddress />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
    </Routes>
  );
}

export default App;
