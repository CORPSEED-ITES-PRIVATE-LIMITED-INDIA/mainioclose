import { Routes, Route, Navigate } from "react-router-dom";
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
import Organizations from "./accounts/organization/Organizations";
import OrganizationDetail from "./accounts/organization/OrganizationDetail";
import GroupLedger from "./accounts/organization/GroupLedger";
import Group from "./accounts/organization/Group";
import Voucher from "./accounts/organization/Voucher";
import Ledger from "./accounts/organization/Ledger";
import LedgerDetail from "./accounts/organization/LedgerDetail";
import OrganizationEstimate from "./accounts/organization/OrganizationEstimate";
import DailyBook from "./accounts/organization/DailyBook";
import BankStatement from "./accounts/organization/BankStatement";
import PaymentRegister from "./accounts/organization/PaymentRegister";
import AllInvoice from "./accounts/organization/AllInvoice";
import Unbill from "./accounts/organization/Unbill";
import ManageSales from "./accounts/organization/ManageSales";
import TDS from "./accounts/organization/TDS";
import LedgerType from "./accounts/organization/settings/LedgerType";
import VoucherType from "./accounts/organization/settings/VoucherType";
import Statutory from "./accounts/organization/settings/Statutory";
import CompanyFormPage from "./accounts/CompanyFormPage";
import CompanyForm from "./accounts/CompanyForm";
import CompaniesInAccount from "./accounts/CompaniesInAccount";
import IVR from "./quality/IVR";
import IVRReport from "./quality/IVRReport";

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
          <Route
            path="sales/leads/:leadId/leadDetail"
            element={<LeadDetail />}
          />
          <Route
            path="sales/leads/:leadId/leadHistory"
            element={<LeadHistory />}
          />
          <Route path="sales/company" element={<Company />} />
          <Route
            path="sales/company/:companyId/gstDetails"
            element={<CompanyGstList />}
          />
          <Route
            path="sales/company/:companyId/gstDetails/:stateName/companyUnits"
            element={<CompanyUnits />}
          />
          <Route
            path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId/unitDetails"
            element={<CompanyUnitDetails />}
          />
          <Route path="sales/estimate" element={<Estimate />} />
          <Route
            path="sales/discountedEstimate"
            element={<DiscountedEstimate />}
          />
          <Route path="sales/projects" element={<Projects />} />
          <Route path="sales/servingCompanies" element={<ServingCompanies />} />

          {/* Accounts */}
          <Route
            path="accounts/companyApprovals"
            element={<CompanyApprovals />}
          />
          <Route
            path="accounts/paymentApprovals"
            element={<PaymentApprovals />}
          />
          <Route path="accounts/organizations" element={<Organizations />}>
            <Route index element={<OrganizationDetail />} />
            <Route path="group" element={<Group />} />
            <Route
              path="group/:groupId/groupLedger"
              element={<GroupLedger />}
            />
            <Route path="ledger" element={<Ledger />} />
            <Route
              path="ledger/:ledgerId/ledgerDetail"
              element={<LedgerDetail />}
            />
            <Route path="voucher" element={<Voucher />} />
            <Route path="orgEstimate" element={<OrganizationEstimate />} />
            <Route path="dailyBook" element={<DailyBook />} />
            <Route path="bankStatement" element={<BankStatement />} />
            <Route path="paymentRegister" element={<PaymentRegister />} />
            <Route path="allInvoice" element={<AllInvoice />} />
            <Route path="unbilled" element={<Unbill />} />
            <Route path="manageSales" element={<ManageSales />} />
            <Route path="tds" element={<TDS />} />
            <Route
              path="/erp/:userId/accounts/organizations/settings/ledgerType"
              element={<LedgerType />}
            />
            <Route
              path="/erp/:userId/accounts/organizations/settings/voucherType"
              element={<VoucherType />}
            />
            <Route
              path="/erp/:userId/accounts/organizations/settings/statutory"
              element={<Statutory />}
            />
          </Route>

          <Route path="accounts/companyhome" element={<CompanyFormPage />}>
            <Route index element={<Navigate to="companyForm" replace />} />
            <Route path="companyForm" element={<CompanyForm />} />
            <Route path="companies" element={<CompaniesInAccount />} />
          </Route>

          {/* IVR */}
          <Route path="quality/ivr" element={<IVR />} />
          <Route path="quality/report" element={<IVRReport />} />

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
          <Route
            path="settings/products/:productId/productDetail"
            element={<ProductDetails />}
          />
          <Route path="settings/comments" element={<LeadComments />} />
          <Route path="settings/ipAddress" element={<IpAddress />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
    </Routes>
  );
}

export default App;
