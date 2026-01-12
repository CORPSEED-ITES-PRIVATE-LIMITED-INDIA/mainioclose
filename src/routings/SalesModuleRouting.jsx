import { Route } from "react-router-dom";
import { KeepAlive } from "react-activation";
import Leads from "../sales/leads/Leads";
import LeadDetail from "../sales/leads/LeadDetail";
import LeadHistory from "../sales/leads/LeadHistory";
import Company from "../sales/company/Company";
import CompanyGstList from "../sales/company/CompanyGstList";
import CompanyUnits from "../sales/company/CompanyUnits";
import CompanyUnitDetails from "../sales/company/CompanyUnitDetails";
import Estimate from "../sales/estimate/Estimate";
import AllProposal from "../sales/proposal/AllProposal";
import DiscountedEstimate from "../sales/leads/DiscountedEstimate";
import AutoHistory from "../sales/leads/AutoHistory";
import ServingCompanies from "../sales/leads/ServingCompanies";
import LeadTask from "../sales/leads/LeadTask";
import LeadInfo from "../sales/leads/LeadInfo";
import CreateCompanyForm from "../sales/company/CreateCompanyForm";
import Vendors from "../sales/vendors/Vendors";
import Proposal from "../sales/proposal/Proposal";
import LeadEstimate from "../sales/leads/LeadEstimate";
import AutomationStatus from "../sales/leads/AutomationStatus";
import SalesReport from "../sales/leads/SalesReport";
import AllTasks from "../sales/leads/AllTasks";
import CreateLeadCompanyForm from "../sales/company/CreateLeadCompanyForm";
import CompanyForm from "../accounts/CompanyForm";
import Projects from "../sales/leads/Projects";
import UnitDetails from "../sales/company/UnitDetails";
import CompanyProjects from "../sales/company/CompanyProjects";
import CompanyLeads from "../sales/company/CompanyLeads";
import ChildLead from "../sales/leads/ChildLead";
import LeadEstimates from "../sales/leads/leadEstimate/LeadEstimates";

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
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
      </Route>
      <Route
        path="sales/leads"
        element={
          <KeepAlive>
            <Leads />
          </KeepAlive>
        }
      />
      <Route path="sales/leads/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
      </Route>
      <Route path="sales/leads/:leadId/leadHistory" element={<LeadHistory />} />
      <Route path="sales/leads/:leadId/leadTasks" element={<LeadTask />} />
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
        path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId"
        element={<CompanyUnitDetails />}
      >
        <Route index path="unitDetails" element={<UnitDetails />} />
        <Route path="companyProjects" element={<CompanyProjects />} />
        <Route path="companyLeads" element={<CompanyLeads />} />
      </Route>
      <Route
        path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId/companyLeads/:leadId"
        element={<LeadDetail />}
      >
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
      </Route>
      <Route path="sales/leadForm" element={<CompanyForm />} />
      <Route path="sales/estimate" element={<Estimate />} />
      <Route path="sales/proposal" element={<AllProposal />} />
      <Route path="sales/discountedEstimate" element={<DiscountedEstimate />} />
      <Route path="sales/autoHistory" element={<AutoHistory />} />
      <Route path="sales/salesReport" element={<SalesReport />} />
      <Route path="sales/automationReport" element={<AutomationStatus />} />
      <Route path="sales/autoHistory/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="childLead" element={<ChildLead />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="leadCompanyForm" element={<CreateLeadCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadEstimates" element={<LeadEstimates />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
      </Route>
      <Route path="sales/projects" element={<Projects />} />
      <Route path="sales/servingCompanies" element={<ServingCompanies />} />
    </>
  );
};

export default SalesModuleRouting;
