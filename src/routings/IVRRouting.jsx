import React from "react";
import { Route } from "react-router-dom";
import IVR from "../quality/IVR";
import IVRReport from "../quality/IVRReport";

const IVRRouting = () => {
  return (
    <>
      <Route path="quality/ivr" element={<IVR />} />
      <Route path="quality/report" element={<IVRReport />} />
    </>
  );
};

export default IVRRouting;
