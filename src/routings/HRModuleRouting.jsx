import React from "react";
import { Route } from "react-router-dom";
import UsersList from "../hr/UsersList";
import UserApprovals from "../hr/UserApprovals";
import Services from "../hr/Services";
import Rating from "../hr/Rating";

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
