import React from "react";
import { Route } from "react-router-dom";
import VendorRequests from "../vendor-request/VendorRequests";
import VendorPayments from "../accounts/VendorPayments";

const ProcurementRouting = () => {
  return (
    <>
      <Route path="vendors-requests" element={<VendorRequests />} />
      <Route path="vendors-payments" element={<VendorPayments />} />
    </>
  );
};

export default ProcurementRouting;
