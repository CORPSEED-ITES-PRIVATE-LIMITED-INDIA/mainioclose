import { lazy } from "react";
import React from "react";
import { Route } from "react-router-dom";
const UsersList = lazy(() => import("../hr/UsersList"));
const UserApprovals = lazy(() => import("../hr/UserApprovals"));
const Services = lazy(() => import("../hr/Services"));
const Rating = lazy(() => import("../hr/Rating"));

const HRModuleRouting = () => {
  return (
    <>
      <Route path="hr/usersList" element={<UsersList />} />
      <Route path="hr/usersApprovalList" element={<UserApprovals />} />
      <Route path="hr/services" element={<Services />} />
      <Route path="hr/services/:serviceId/rating" element={<Rating />} />
    </>
  );
};

export default HRModuleRouting;
