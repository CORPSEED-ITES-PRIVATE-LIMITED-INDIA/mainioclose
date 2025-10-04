import React from "react";
import { Route } from "react-router-dom";
import LeadStatus from "../setting/status/LeadStatus";
import LeadProducts from "../setting/products/LeadProducts";
import ProductDetails from "../setting/products/ProductDetails";
import LeadComments from "../setting/comments/LeadComments";
import IpAddress from "../setting/ipaddress/IpAddress";
import OperationsSettings from "../operation/Settings/OperationsSettings";
import Slug from "../setting/slug/Slug";
import Urls from "../setting/urls/Urls";
import Department from "../setting/department/Department";
import Designation from "../setting/designation/Designation";
import ProcurementCategory from "../setting/procurement/ProcurementCategory";
import ProcurementSubCategory from "../setting/procurement/ProcurementSubCategory";

const ERPSettingRouting = () => {
  return (
    <>
      <Route
        path="settings/operations"
        element={<OperationsSettings />}
      ></Route>
      <Route path="settings/status" element={<LeadStatus />} />
      <Route path="settings/products" element={<LeadProducts />} />
      <Route
        path="settings/products/:productId/productDetail"
        element={<ProductDetails />}
      />
      <Route path="settings/comments" element={<LeadComments />} />
      <Route path="settings/ipAddress" element={<IpAddress />} />
      <Route path="settings/slug" element={<Slug />} />
      <Route path="settings/urls" element={<Urls />} />
      <Route path="settings/department" element={<Department />} />
      <Route path="settings/designation" element={<Designation />} />
      <Route
        path="settings/procurementCategory"
        element={<ProcurementCategory />}
      />
      <Route
        path="settings/procurementCategory/:categoryId/subcategory"
        element={<ProcurementSubCategory />}
      />
    </>
  );
};

export default ERPSettingRouting;
