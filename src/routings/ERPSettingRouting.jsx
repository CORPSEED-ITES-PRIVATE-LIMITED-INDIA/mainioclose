import React from "react";
import { Route } from "react-router-dom";
import LeadStatus from "../setting/status/LeadStatus";
import LeadComments from "../setting/comments/LeadComments";
import IpAddress from "../setting/ipaddress/IpAddress";
import OperationsSettings from "../operation/Settings/OperationsSettings";
import Slug from "../setting/slug/Slug";
import Urls from "../setting/urls/Urls";
import Department from "../setting/department/Department";
import Designation from "../setting/designation/Designation";
import ProcurementCategory from "../setting/procurement/ProcurementCategory";
import ProcurementSubCategory from "../setting/procurement/ProcurementSubCategory";
import BusinessArrangement from "../setting/products/BusinessArrangement";
import ProductCategory from "../setting/products/ProductCategory";
import ProductSubCategory from "../setting/products/ProductSubCategory";
import TemplatesAndEmailBody from "../setting/proposalAndTemplates/TemplatesAndEmailBody";
import ApplicantTypes from "../setting/applicantType/ApplicantTypes";
import Solutions from "../setting/products/Solutions";
import SolutionDetails from "../setting/products/SolutionDetails";
import SolutionPrice from "../setting/products/SolutionPrice";
import ProductDocument from "../setting/products/ProductDocument";
import ProductMilestones from "../setting/products/ProductMilestones";
import CkEditorToken from "../setting/ckEditorToken/CkEditorToken";
import ProposalMenu from "../setting/proposalAndBrouchers/menu/ProposalMenu";
import ProposalCategory from "../setting/proposalAndBrouchers/category/ProposalCategory";
import ProposalSubCategory from "../setting/proposalAndBrouchers/subCategory/ProposalSubCategory";

const ERPSettingRouting = () => {
  return (
    <>
      <Route
        path="settings/operations"
        element={<OperationsSettings />}
      ></Route>
      <Route path="settings/status" element={<LeadStatus />} />
      <Route path="settings/solutions" element={<Solutions />} />
      <Route
        path="settings/solutions/:solutionId/detail"
        element={<SolutionDetails />}
      >
        <Route index path="solutionPrice" element={<SolutionPrice />} />
        <Route path="documents" element={<ProductDocument />} />
        <Route path="milestones" element={<ProductMilestones />} />
        <Route />
      </Route>
      <Route
        path="settings/solutions/:solutionId/businessArrangement"
        element={<BusinessArrangement />}
      />
      <Route
        path="settings/solutions/:solutionId/businessArrangement/:businessArrangmentId/productCategory"
        element={<ProductCategory />}
      />
      <Route
        path="settings/solutions/:solutionId/businessArrangement/:businessArrangmentId/productCategory/:categoryId/subCategory"
        element={<ProductSubCategory />}
      />
      <Route path="settings/comments" element={<LeadComments />} />
      <Route path="settings/ipAddress" element={<IpAddress />} />
      <Route path="settings/slug" element={<Slug />} />
      <Route path="settings/applicantType" element={<ApplicantTypes />} />
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
      <Route
        path="settings/proposalTemplate"
        element={<TemplatesAndEmailBody />}
      />
      <Route path="settings/menu" element={<ProposalMenu />} />
      <Route
        path="settings/menu/:menuId/category"
        element={<ProposalCategory />}
      />
      <Route
        path="settings/menu/:menuId/category/:categoryId/subcategory"
        element={<ProposalSubCategory />}
      />

      <Route path="settings/ckEditorTokens" element={<CkEditorToken />} />
    </>
  );
};

export default ERPSettingRouting;
