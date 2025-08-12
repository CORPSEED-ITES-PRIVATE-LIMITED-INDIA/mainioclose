import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layoutpage from "./Layout/Layoutpage";
import Leads from "./sales/leads/Leads";
import ProtectedRoute from "./ProtectedRoute";
import { Provider } from "react-redux";
import HomePage from "./home/HomePage";
import Login from "./login/Login";
import { ToastProvider } from "@heroui/react";
import { store } from "./toolkit/store";
import LeadDetail from "./sales/leads/LeadDetail";
import LeadHistory from "./sales/leads/LeadHistory";
import Company from "./sales/company/Company";
import Users from "./users/Users";
import LeadStatus from "./setting/status/LeadStatus";
import LeadProducts from "./setting/products/LeadProducts";
import LeadComments from "./setting/comments/LeadComments";
import IpAddress from "./setting/ipaddress/IpAddress";
import ProductDetails from "./setting/products/ProductDetails";
import CompanyGstList from "./sales/company/CompanyGstList";
import CompanyUnits from './sales/company/companyUnits';
import CompanyUnitDetails from './sales/company/CompanyUnitDetails';
import DiscountedEstimate from './sales/leads/DiscountedEstimate';
import Projects from './sales/leads/Projects';
import ServingCompanies from './sales/leads/ServingCompanies';
import CompanyApprovals from './accounts/CompanyApprovals';
import PaymentApprovals from './accounts/PaymentApprovals';
import UsersList from './hr/UsersList';
import UserApprovals from './hr/UserApprovals';
import Services from './hr/Services';
import Rating from './hr/Rating';
import AdminDashboards from './dashboards/AdminDashboards';
import Estimate from './sales/estimate/Estimate';
import VendorRequests from './vendor-request/VendorRequests';

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <Login /> },
    {
      path: "/erp",
      element: <ProtectedRoute />,
      children: [
        {
          path: ":userId",
          element: <Layoutpage />,
          children: [
            {
              path:'dashboard',
              element:<AdminDashboards/>
            },
            {
              path: "sales",
              children: [
                { path: "leads", element: <Leads /> },
                { path: "leads/:leadId/leadDetail", element: <LeadDetail /> },
                { path: "leads/:leadId/leadHistory", element: <LeadHistory /> },
                { path: "company", element: <Company /> },
                {
                  path: "company/:companyId/gstDetails",
                  element: <CompanyGstList />,
                },
                {
                  path: "company/:companyId/gstDetails/:stateName/companyUnits",
                  element: <CompanyUnits />,
                },
                {
                  path: "company/:companyId/gstDetails/:stateName/companyUnits/:companyUnitId/unitDetails",
                  element: <CompanyUnitDetails />,
                },
                { path: "estimate", element: <Estimate /> },
                { path: "discountedEstimate", element: <DiscountedEstimate /> },
                { path: "projects", element: <Projects /> },
                { path: "servingCompanies", element: <ServingCompanies /> },
              ],
            },
            {
              path:'accounts',
              children:[
                {
                  path:'companyApprovals',
                  element:<CompanyApprovals/>
                },
                {
                  path:'paymentApprovals',
                  element:<PaymentApprovals/>
                }
              ]
            },
            {
              path:'hr',
              children:[
                {
                  path:'usersList',
                  element:<UsersList/>
                },
                {
                  path:'usersApprovalList',
                  element:<UserApprovals/>
                },
                {
                  path:'services',
                  element:<Services/>
                },
                {
                  path:'services/:serviceId/rating',
                  element:<Rating/>
                },
              ]
            },
            {
              path: "users",
              element: <Users />,
            },
            {
              path: "vendors-requests",
              element: <VendorRequests />,
            },
            {
              path: "settings",
              children: [
                { path: "status", element: <LeadStatus /> },
                { path: "products", element: <LeadProducts /> },
                {
                  path: "products/:productId/productDetail",
                  element: <ProductDetails />,
                },
                { path: "comments", element: <LeadComments /> },
                { path: "ipAddress", element: <IpAddress /> },
              ],
            },
          ],
        },
      ],
    },
    { path: "/unauthorized", element: <div>Unauthorized</div> },
  ]);
  return (
    <Provider store={store}>
      <ToastProvider placement={"top-right"} toastOffset={60} />
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
