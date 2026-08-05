import { lazy } from "react";
import React from "react";
import { Route } from "react-router-dom";
const Industries = lazy(() => import("../industry/Industries"));
const SubIndustries = lazy(() => import("../industry/SubIndustries"));
const Categories = lazy(() => import("../industry/Categories"));
const BusinessActivity = lazy(() => import("../industry/BusinessActivity"));

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
