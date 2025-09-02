import React from "react";
import { Route } from "react-router-dom";
import Industries from "../industry/Industries";
import SubIndustries from "../industry/SubIndustries";
import Categories from "../industry/Categories";
import BusinessActivity from "../industry/BusinessActivity";

const IndustryModuleRouting = () => {
  return (
    <>
      <Route path="industry/industries" element={<Industries />} />
      <Route path="industry/subindustries" element={<SubIndustries />} />
      <Route path="industry/categories" element={<Categories />} />
      <Route path="industry/businessActivity" element={<BusinessActivity />} />
    </>
  );
};

export default IndustryModuleRouting;
