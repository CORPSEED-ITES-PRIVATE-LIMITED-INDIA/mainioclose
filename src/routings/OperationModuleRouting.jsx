import { Route } from "react-router-dom";
import OperationsSettings from "../operation/Settings/OperationsSettings";
import UserMapWithProduct from "../operation/Settings/UserMapWithProduct";
import CRTModule from "../operation/crt/CRTModule";
import LegalModule from "../operation/legal/LegalModule";
import LiaisoningModule from "../operation/liaisoning/LiaisoningModule";
import FilingModule from "../operation/filing/FilingModule";
import CertificationModule from "../operation/certification/CertificationModule";
import ProjectDetails from "../operation/projects/projectDetails";
import Milestone from "../operation/Settings/Milestone";

const OperationModuleRouting = () => {
  return (
    <>
      <Route path="operation/crt" element={<CRTModule />} />
      <Route
        path="operation/crt/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route path="operation/filing" element={<FilingModule />} />
      <Route
        path="operation/filing/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route path="operation/legal" element={<LegalModule />} />
      <Route
        path="operation/legal/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route path="operation/liaisoning" element={<LiaisoningModule />} />
      <Route
        path="operation/liaisoning/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route path="operation/certification" element={<CertificationModule />} />
      <Route
        path="operation/certification/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route path="operation/settings" element={<OperationsSettings />}>
        <Route path="userMap" element={<UserMapWithProduct />} />
        <Route path="milestones" element={<Milestone />} />
      </Route>
    </>
  );
};

export default OperationModuleRouting;
