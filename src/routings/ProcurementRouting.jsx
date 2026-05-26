import React from "react";
import { Route } from "react-router-dom";
import VendorRequests from "../vendor-request/VendorRequests";
import VendorRequestDetail from "../vendor-request/VendorRequestDetail";
import VendorPaymentForProcurement from "../vendor-request/VendorsPaymentForProcurement";
import VendorEstimate from "../vendor-request/VendorEstimate";
import VendorPaymentHistory from "../vendor-request/VendorPaymentHistory";
import ProjectDetails from "../operation/projects/ProjectDetails";
import ProjectActivities from "../operation/projects/ProjectActivities";
import Projects from "../operation/projects/Projects";
import Vendors from "../vendor-request/Vendors";

const ProcurementRouting = () => {
  return (
    <>
      <Route path="procurement/vendorList" element={<Vendors />} />
      <Route path="procurement/vendors-requests" element={<VendorRequests />} />
      <Route
        path="procurement/vendors-requests/:requestId/:leadId/requestDetail"
        element={<VendorRequestDetail />}
      />
      <Route
        path="procurement/vendors-payments"
        element={<VendorPaymentForProcurement />}
      />
      <Route
        path="procurement/vendors-payments/:paymentId/paymentHistory"
        element={<VendorPaymentHistory />}
      />
      <Route
        path="procurement/vendors-estimates"
        element={<VendorEstimate />}
      />
      <Route path="procurement/projects" element={<Projects />} />
      <Route
        path="procurement/projects/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route
        path="procurement/projects/:projectId/projectDetail/activities"
        element={<ProjectActivities />}
      />
    </>
  );
};

export default ProcurementRouting;
