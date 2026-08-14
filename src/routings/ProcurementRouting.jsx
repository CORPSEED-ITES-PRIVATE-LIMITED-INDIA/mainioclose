import { lazy } from "react";
import React from "react";
import { Route } from "react-router-dom";
const VendorRequests = lazy(() => import("../vendor-request/VendorRequests"));
const VendorRequestDetail = lazy(
  () => import("../vendor-request/VendorRequestDetail"),
);
const VendorPaymentForProcurement = lazy(
  () => import("../vendor-request/VendorsPaymentForProcurement"),
);
const VendorEstimate = lazy(() => import("../vendor-request/VendorEstimate"));
const VendorPaymentHistory = lazy(
  () => import("../vendor-request/VendorPaymentHistory"),
);
const ProjectDetails = lazy(
  () => import("../operation/projects/ProjectDetails"),
);
const ProjectPR = lazy(() => import("../operation/projects/ProjectPR"));
const ProcurementPurchaseOrder = lazy(
  () => import("../procurement/ProcurementPurchaseOrder"),
);
const ProjectActivities = lazy(
  () => import("../operation/projects/ProjectActivities"),
);
const Projects = lazy(() => import("../operation/projects/Projects"));
const Vendors = lazy(() => import("../vendor-request/Vendors"));
const ProcurementSolutions = lazy(
  () => import("../procurement/solutions/ProcurementSolutions"),
);
const SolutionOverview = lazy(
  () => import("../procurement/solutions/SolutionOverview"),
);
const ProcuremntSolutionDetailPage = lazy(
  () => import("../procurement/solutions/ProcuremntSolutionDetailPage"),
);
const RequestForQuotation = lazy(
  () => import("../procurement/solutions/RequestForQuotation"),
);
const VendorsData = lazy(() => import("../procurement/solutions/VendorsData"));
const Quote = lazy(() => import("../procurement/solutions/Quote"));
const RFQVendors = lazy(() => import("../procurement/solutions/RFQVendors"));

const ProcurementRouting = () => {
  return (
    <>
      <Route
        path="procurement/vendor-quotations"
        element={<ProcurementSolutions />}
      />
      <Route
        path="procurement/vendor-quotations/:solutionId/detail"
        element={<ProcuremntSolutionDetailPage />}
      >
        <Route index path="overview" element={<SolutionOverview />} />
        <Route path="vendors-data" element={<VendorsData />} />
        <Route path="rfq" element={<RequestForQuotation />} />
        <Route path="rfq/:rfqId/vendors" element={<RFQVendors />} />
        <Route
          path="rfq/:rfqId/vendors/:vendorId/quotations"
          element={<Quote />}
        />
        <Route />
      </Route>
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
      <Route
        path="procurement/purchaseOrders"
        element={<ProcurementPurchaseOrder />}
      />
      <Route
        path="procurement/purchaseOrders/:poId/procurementPaymentRequest"
        element={<ProjectPR />}
      />
    </>
  );
};

export default ProcurementRouting;
