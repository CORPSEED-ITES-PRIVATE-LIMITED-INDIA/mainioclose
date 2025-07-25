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
              path: "sales",
              children: [
                { path: "leads", element: <Leads /> },
                { path: "leads/:leadId/leadDetail", element: <LeadDetail /> },
                { path: "leads/:leadId/leadHistory", element: <LeadHistory /> },
                { path: "company", element: <Company /> },
              ],
            },
            {
              path: "users",
              element: <Users />,
            },
            {
              path: "settings",
              children: [
                { path: "status", element: <LeadStatus /> },
                { path: "products", element: <LeadProducts /> },
                { path: "products/:productId/productDetail", element: <ProductDetails /> },
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
