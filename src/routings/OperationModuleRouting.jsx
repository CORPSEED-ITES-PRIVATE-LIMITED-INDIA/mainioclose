import { Navigate, Route } from "react-router-dom";
import OperationsSettings from "../operation/Settings/OperationsSettings";
import UserMapWithProduct from "../operation/Settings/UserMapWithProduct";
import ProjectDetails from "../operation/projects/ProjectDetails";
import Milestone from "../operation/Settings/Milestone";
import Projects from "../operation/projects/Projects";
import Documents from "../operation/Settings/Documents";
import Departments from "../operation/Settings/Departments";
import ProjectActivities from "../operation/projects/ProjectActivities";
import LegalRequests from "../operation/legal/LegalRequests";
import ProjectPurchaseOrder from "../operation/projects/ProjectPurchaseOrder";
import ProjectPR from "../operation/projects/ProjectPR";

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
