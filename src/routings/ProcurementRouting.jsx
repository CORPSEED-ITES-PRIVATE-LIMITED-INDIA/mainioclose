import React from "react";
import { Route } from "react-router-dom";
import VendorRequests from "../vendor-request/VendorRequests";
import VendorPayments from "../accounts/VendorPayments";
import VendorRequestDetail from "../vendor-request/VendorRequestDetail";

const ProcurementRouting = () => {
  return (
    <>
      <Route path="procurement/vendors-requests" element={<VendorRequests />} />
      <Route path="procurement/vendors-requests/:requestId/:leadId/requestDetail" element={<VendorRequestDetail />} />
      <Route path="procurement/vendors-payments" element={<VendorPayments />} />
    </>
  );
};

export default ProcurementRouting;
