import { lazy } from "react";
import React from "react";
import { Route } from "react-router-dom";
import KeepAlive from "react-activation";
// Leads is the single most-visited page in the app - kept eager, like
// Layoutpage/ProtectedRoute, so it never pays a first-visit chunk-fetch/
// cold-transform delay.
import Leads from "../sales/leads/Leads";
const IVR = lazy(() => import("../quality/IVR"));
const IVRReport = lazy(() => import("../quality/IVRReport"));
const LeadDetail = lazy(() => import("../sales/leads/LeadDetail"));
const LeadInfo = lazy(() => import("../sales/leads/LeadInfo"));
const CreateCompanyForm = lazy(
  () => import("../sales/company/CreateCompanyForm"),
);
const Vendors = lazy(() => import("../sales/vendors/Vendors"));
const Proposal = lazy(() => import("../sales/proposal/Proposal"));
const LeadEstimate = lazy(() => import("../sales/leads/LeadEstimate"));
const LeadSearch = lazy(() => import("../quality/LeadSearch"));
const LeadHistory = lazy(() => import("../sales/leads/LeadHistory"));
const LeadTask = lazy(() => import("../sales/leads/LeadTask"));

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
        {/* <Route path="companyForm" element={<CreateCompanyForm />} /> */}
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        {/* <Route path="leadEstimate" element={<LeadEstimate />} /> */}
        {/* <Route path="leadTasks" element={<LeadTask />} /> */}
        <Route path="leadHistory" element={<LeadHistory />} />
      </Route>
      <Route path="quality/leads/:leadId" element={<LeadDetail />}>
        <Route index path="leadDetail" element={<LeadInfo />} />
        <Route path="companyForm" element={<CreateCompanyForm />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="leadEstimate" element={<LeadEstimate />} />
        <Route path="leadHistory" element={<LeadHistory />} />
        {/* <Route path="leadTasks" element={<LeadTask />} /> */}
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
