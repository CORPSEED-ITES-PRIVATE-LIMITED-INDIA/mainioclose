import React from "react";
import { Route } from "react-router-dom";
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
import Projects from "../operation/projects/Projects";
import ServingCompanies from "../sales/leads/ServingCompanies";
import LeadTask from "../sales/leads/LeadTask";
import LeadInfo from "../sales/leads/LeadInfo";
import CreateCompanyForm from "../sales/company/CreateCompanyForm";
import Vendors from "../sales/vendors/vendors";
import Proposal from "../sales/proposal/Proposal";
import LeadEstimate from "../sales/leads/LeadEstimate";

const SalesModuleRouting = () => {
  return (
    <>
      <Route path="sales/leads" element={<Leads />} />
      <Route path="sales/leads/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
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
        path="sales/company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId/unitDetails"
        element={<CompanyUnitDetails />}
      />
      <Route path="sales/estimate" element={<Estimate />} />
      <Route path="sales/proposal" element={<AllProposal />} />
      <Route path="sales/discountedEstimate" element={<DiscountedEstimate />} />
      <Route path="sales/autoHistory" element={<AutoHistory />} />
      <Route
        path="sales/autoHistory/:leadId/leadDetail"
        element={<LeadDetail />}
      />
      <Route path="sales/projects" element={<Projects />} />
      <Route path="sales/servingCompanies" element={<ServingCompanies />} />
    </>
  );
};

export default SalesModuleRouting;
