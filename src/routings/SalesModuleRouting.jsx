import { lazy } from "react";
import { Route } from "react-router-dom";
import { KeepAlive } from "react-activation";
// eslint-disable-next-line no-unused-vars -- pre-existing unused import, left as-is
import Projects from "../sales/leads/Projects";
// Leads is the single most-visited page in the app (kept alive via
// KeepAlive above) - kept eager, like Layoutpage/ProtectedRoute, so it
// never pays a first-visit chunk-fetch/cold-transform delay.
import Leads from "../sales/leads/Leads";
const LeadDetail = lazy(() => import("../sales/leads/LeadDetail"));
const LeadHistory = lazy(() => import("../sales/leads/LeadHistory"));
const Company = lazy(() => import("../sales/company/Company"));
const CompanyGstList = lazy(() => import("../sales/company/CompanyGstList"));
const CompanyUnits = lazy(() => import("../sales/company/CompanyUnits"));
const CompanyUnitDetails = lazy(
  () => import("../sales/company/CompanyUnitDetails"),
);
const Estimate = lazy(() => import("../sales/estimate/Estimate"));
const AllProposal = lazy(() => import("../sales/proposal/AllProposal"));
const DiscountedEstimate = lazy(
  () => import("../sales/leads/DiscountedEstimate"),
);
const AutoHistory = lazy(() => import("../sales/leads/AutoHistory"));
const ServingCompanies = lazy(() => import("../sales/leads/ServingCompanies"));
const LeadTask = lazy(() => import("../sales/leads/LeadTask"));
const LeadInfo = lazy(() => import("../sales/leads/LeadInfo"));
const CreateCompanyForm = lazy(
  () => import("../sales/company/CreateCompanyForm"),
);
const Vendors = lazy(() => import("../sales/vendors/Vendors"));
const LeadResearch = lazy(() => import("../sales/leads/LeadResearch"));
const Proposal = lazy(() => import("../sales/proposal/Proposal"));
const LeadEstimate = lazy(() => import("../sales/leads/LeadEstimate"));
const AutomationStatus = lazy(() => import("../sales/leads/AutomationStatus"));
const SalesReport = lazy(() => import("../sales/leads/SalesReport"));
const AllTasks = lazy(() => import("../sales/leads/AllTasks"));
const CreateLeadCompanyForm = lazy(
  () => import("../sales/company/CreateLeadCompanyForm"),
);
const CompanyForm = lazy(() => import("../accounts/CompanyForm"));
const UnitDetails = lazy(() => import("../sales/company/UnitDetails"));
const CompanyProjects = lazy(() => import("../sales/company/CompanyProjects"));
const CompanyLeads = lazy(() => import("../sales/company/CompanyLeads"));
const ChildLead = lazy(() => import("../sales/leads/ChildLead"));
const LeadEstimates = lazy(
  () => import("../sales/leads/leadEstimate/LeadEstimates"),
);
const AllInvoice = lazy(() => import("../accounts/organization/AllInvoice"));
const ServicePaymentTerm = lazy(
  () => import("../sales/leads/ServicePaymentTerm"),
);
const SalesUnbill = lazy(() => import("../sales/unbill/SalesUnbill"));
const InvoicesByUnbilled = lazy(
  () => import("../accounts/organization/InvoicesByUnbilled"),
);
const SalesProject = lazy(() => import("../sales/projects/SalesProject"));
const SalesPOPayment = lazy(() => import("../sales/payment/SalesPOPayment"));
const SalesAdvanceInvoice = lazy(
  () => import("../sales/invoice/SalesAdvanceInvoice"),
);

const SalesModuleRouting = () => {
  return (
    <>
      <Route
        path="sales/allTask"
        element={
          <KeepAlive>
            <AllTasks />
          </KeepAlive>
        }
      />
      <Route path="sales/allTask/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="research" element={<LeadResearch />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        <Route path="paymentTerm" element={<ServicePaymentTerm />} />
      </Route>
      <Route
        path="sales/leads"
        element={
          <KeepAlive>
            <Leads />
          </KeepAlive>
        }
      />
      <Route
        path="sales/leads/:parentLeadId/childLeads"
        element={<ChildLead />}
      />
      <Route
        path="sales/leads/:parentLeadId/childLeads/:leadId"
        element={<LeadDetail />}
      >
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="procurementResearch" element={<Vendors />} />
        <Route path="technicalResearch" element={<LeadResearch />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        <Route path="paymentTerm" element={<ServicePaymentTerm />} />
      </Route>

      <Route path="sales/leads/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="procurementResearch" element={<Vendors />} />
        <Route path="technicalResearch" element={<LeadResearch />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        <Route path="paymentTerm" element={<ServicePaymentTerm />} />
      </Route>
      <Route path="sales/leads/:leadId/leadHistory" element={<LeadHistory />} />
      <Route path="sales/leads/:leadId/leadTasks" element={<LeadTask />} />
      <Route path="sales/company" element={<Company />} />
      <Route
        path="sales/company/:companyId/gstDetails"
        element={<CompanyGstList />}
      />
      <Route
        path="sales/company/:companyId/gstDetails/:unitId/projects"
        element={<CompanyProjects />}
      />
      <Route
        path="sales/company/:companyId/gstDetails/leads"
        element={<CompanyLeads />}
      />
      <Route
        path="sales/company/:companyId/gstDetails/:stateName/companyUnits"
        element={<CompanyUnits />}
      />
      <Route
        path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId"
        element={<CompanyUnitDetails />}
      >
        <Route index path="unitDetails" element={<UnitDetails />} />
        <Route path="companyProjects" element={<CompanyProjects />} />
        <Route path="companyLeads" element={<CompanyLeads />} />
      </Route>

      <Route
        path="sales/company/:companyId/gstDetails/leads/:leadId"
        element={<LeadDetail />}
      >
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="procurementResearch" element={<Vendors />} />
        <Route path="technicalResearch" element={<LeadResearch />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        <Route path="paymentTerm" element={<ServicePaymentTerm />} />
      </Route>

      <Route
        path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId/companyLeads/:leadId"
        element={<LeadDetail />}
      >
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="procurementResearch" element={<Vendors />} />
        <Route path="technicalResearch" element={<LeadResearch />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        <Route path="paymentTerm" element={<ServicePaymentTerm />} />
      </Route>
      <Route path="sales/leadForm" element={<CompanyForm />} />
      <Route path="sales/estimate" element={<Estimate />} />
      <Route path="sales/allInvoice" element={<AllInvoice />} />
      <Route path="sales/proposal" element={<AllProposal />} />
      <Route path="sales/unbilled" element={<SalesUnbill />} />
      <Route
        path="sales/unbilled/:unbilledId/invoices"
        element={<InvoicesByUnbilled />}
      />
      <Route path="sales/discountedEstimate" element={<DiscountedEstimate />} />
      <Route path="sales/autoHistory" element={<AutoHistory />} />
      <Route path="sales/salesReport" element={<SalesReport />} />
      <Route path="sales/automationReport" element={<AutomationStatus />} />
      <Route path="sales/autoHistory/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="procurementResearch" element={<Vendors />} />
        <Route path="technicalResearch" element={<LeadResearch />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        <Route path="paymentTerm" element={<ServicePaymentTerm />} />
      </Route>
      <Route path="sales/advanceTaxInvoice" element={<SalesAdvanceInvoice />} />
      <Route path="sales/poPayments" element={<SalesPOPayment />} />
      <Route path="sales/projects" element={<SalesProject />} />
      <Route path="sales/servingCompanies" element={<ServingCompanies />} />
    </>
  );
};

export default SalesModuleRouting;
