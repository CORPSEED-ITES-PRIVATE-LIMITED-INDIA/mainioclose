import { Navigate, Route } from "react-router-dom";
import OperationsSettings from "../operation/Settings/OperationsSettings";
import UserMapWithProduct from "../operation/Settings/UserMapWithProduct";
import ProjectDetails from "../operation/projects/ProjectDetails";
import Milestone from "../operation/Settings/Milestone";
import Projects from "../operation/projects/Projects";

const OperationModuleRouting = () => {
  return (
    <>
      <Route path="operation/projects" element={<Projects />} />
      <Route
        path="operation/projects/:projectId/projectDetail"
        element={<ProjectDetails />}
      />
      <Route path="operation/settings" element={<OperationsSettings />}>
        <Route index element={<Navigate to="userMap" replace />} />
        <Route path="userMap" element={<UserMapWithProduct />} />
        <Route path="milestones" element={<Milestone />} />
      </Route>
    </>
  );
};

export default OperationModuleRouting;
