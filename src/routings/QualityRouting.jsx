import React from "react";
import { Route } from "react-router-dom";
import IVR from "../quality/IVR";
import IVRReport from "../quality/IVRReport";
import Leads from "../sales/leads/Leads";
import LeadDetail from "../sales/leads/LeadDetail";
import LeadInfo from "../sales/leads/LeadInfo";
import CreateCompanyForm from "../sales/company/CreateCompanyForm";
import Vendors from "../sales/vendors/Vendors";
import Proposal from "../sales/proposal/Proposal";
import LeadEstimate from "../sales/leads/LeadEstimate";
import LeadSearch from "../quality/LeadSearch";
import KeepAlive from "react-activation";
import LeadHistory from "../sales/leads/LeadHistory";
import LeadTask from "../sales/leads/LeadTask";

const QualityRouting = () => {
  return (
    <>
      <Route
        path="quality/leads"
        element={
          <KeepAlive>
            <Leads />
          </KeepAlive>
        }
      />
      <Route path="quality/leadsSearch" element={<LeadSearch />} />
      <Route path="quality/leadsSearch/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadTasks" element={<LeadTask />} />
        <Route path="leadHistory" element={<LeadHistory />} />
      </Route>
      <Route path="quality/leads/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadTasks" element={<LeadTask />} />
      </Route>
      <Route path="quality/ivr" element={<IVR />} />
      <Route path="quality/report" element={<IVRReport />} />
      <Route
        path="quality/leads/:leadId/leadHistory"
        element={<LeadHistory />}
      />
    </>
  );
};

export default QualityRouting;
