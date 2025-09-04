import React from "react";
import Projects from "../operation/projects/Projects";
import { Route } from "react-router-dom";

const OperationModuleRouting = () => {
  return (
    <>
      <Route path="operation/project" element={<Projects />} />
    </>
  );
};

export default OperationModuleRouting;
