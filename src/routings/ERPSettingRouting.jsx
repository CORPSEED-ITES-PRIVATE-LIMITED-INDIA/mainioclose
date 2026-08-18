import { lazy } from "react";
import React from "react";
import { Route } from "react-router-dom";
import CompanyDocuments from "../setting/company/CompanyDocuments";
const LeadStatus = lazy(() => import("../setting/status/LeadStatus"));
const LeadComments = lazy(() => import("../setting/comments/LeadComments"));
const IpAddress = lazy(() => import("../setting/ipaddress/IpAddress"));
const OperationsSettings = lazy(
  () => import("../operation/Settings/OperationsSettings"),
);
const Slug = lazy(() => import("../setting/slug/Slug"));
const Urls = lazy(() => import("../setting/urls/Urls"));
const Department = lazy(() => import("../setting/department/Department"));
const Designation = lazy(() => import("../setting/designation/Designation"));
const ProcurementCategory = lazy(
  () => import("../setting/procurement/ProcurementCategory"),
);
const ProcurementSubCategory = lazy(
  () => import("../setting/procurement/ProcurementSubCategory"),
);
const BusinessArrangement = lazy(
  () => import("../setting/products/BusinessArrangement"),
);
const ProductCategory = lazy(
  () => import("../setting/products/ProductCategory"),
);
const ProductSubCategory = lazy(
  () => import("../setting/products/ProductSubCategory"),
);
const TemplatesAndEmailBody = lazy(
  () => import("../setting/proposalAndTemplates/TemplatesAndEmailBody"),
);
const ApplicantTypes = lazy(
  () => import("../setting/applicantType/ApplicantTypes"),
);
const Solutions = lazy(() => import("../setting/products/Solutions"));
const SolutionDetails = lazy(
  () => import("../setting/products/SolutionDetails"),
);
const SolutionPrice = lazy(() => import("../setting/products/SolutionPrice"));
const ProductDocument = lazy(
  () => import("../setting/products/ProductDocument"),
);
const ProductMilestones = lazy(
  () => import("../setting/products/ProductMilestones"),
);
const ProposalMenu = lazy(
  () => import("../setting/proposalAndBrouchers/menu/ProposalMenu"),
);
const ProposalCategory = lazy(
  () => import("../setting/proposalAndBrouchers/category/ProposalCategory"),
);
const ProposalSubCategory = lazy(
  () =>
    import("../setting/proposalAndBrouchers/subCategory/ProposalSubCategory"),
);
const ProposalService = lazy(
  () => import("../setting/proposalAndBrouchers/service/ProposalService"),
);
const ProductServiceDetails = lazy(
  () => import("../setting/products/ProductServiceDetails"),
);
const PaymentTems = lazy(() => import("../setting/paymentTerm/PaymentTems"));
const CountryData = lazy(() => import("../setting/country/CountryData"));
const StateData = lazy(() => import("../setting/country/StateData"));
const CityData = lazy(() => import("../setting/country/CityData"));

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
        <Route path="serviceDetails" element={<ProductServiceDetails />} />
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
      <Route path="settings/country" element={<CountryData />} />
      <Route path="settings/companyDocs" element={<CompanyDocuments />} />
      <Route
        path="settings/country/state/:countryName"
        element={<StateData />}
      />
      <Route
        path="settings/country/state/:stateName/city/:stateName"
        element={<CityData />}
      />
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
      <Route
        path="settings/menu/:menuId/category/:categoryId/subcategory/:subcategoryId/service"
        element={<ProposalService />}
      />

      {/* <Route path="settings/ckEditorTokens" element={<CkEditorToken />} /> */}
      <Route path="settings/paymentTerms" element={<PaymentTems />} />
    </>
  );
};

export default ERPSettingRouting;
