import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
const OperationsSettings = lazy(
  () => import("../operation/Settings/OperationsSettings"),
);
const UserMapWithProduct = lazy(
  () => import("../operation/Settings/UserMapWithProduct"),
);
const ProjectDetails = lazy(
  () => import("../operation/projects/ProjectDetails"),
);
const Milestone = lazy(() => import("../operation/Settings/Milestone"));
const Projects = lazy(() => import("../operation/projects/Projects"));
const Documents = lazy(() => import("../operation/Settings/Documents"));
const Departments = lazy(() => import("../operation/Settings/Departments"));
const ProjectActivities = lazy(
  () => import("../operation/projects/ProjectActivities"),
);
const LegalRequests = lazy(() => import("../operation/legal/LegalRequests"));
const ProjectPurchaseOrder = lazy(
  () => import("../operation/projects/ProjectPurchaseOrder"),
);
const ProjectPR = lazy(() => import("../operation/projects/ProjectPR"));
const ManagerApprovals = lazy(
  () => import("../operation/approval/ManagerApprovals"),
);
const Expenses = lazy(() => import("../operation/expenses/Expenses"));

const OperationModuleRouting = () => {
  return (
    <>
      <Route path="operation/projects" element={<Projects />} />
      <Route
        path="operation/projects/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route
        path="operation/projects/:projectId/projectDetail/purchaseOrder"
        element={<ProjectPurchaseOrder />}
      />
      <Route
        path="operation/projects/:projectId/projectDetail/purchaseOrder/:poId/procurementPaymentRequest"
        element={<ProjectPR />}
      />
      <Route
        path="operation/projects/:projectId/projectDetail/activities"
        element={<ProjectActivities />}
      />
      <Route path="operation/legalRequests" element={<LegalRequests />} />
      <Route path="operation/approvals" element={<ManagerApprovals />} />
      <Route path="operation/expenses" element={<Expenses />} />
      <Route path="operation/settings" element={<OperationsSettings />}>
        <Route index element={<Navigate to="userMap" replace />} />
        <Route path="userMap" element={<UserMapWithProduct />} />
        <Route path="milestones" element={<Milestone />} />
        <Route path="allDocuments" element={<Documents />} />
        <Route path="departments" element={<Departments />} />
      </Route>
    </>
  );
};

export default OperationModuleRouting;
