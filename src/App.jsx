import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layoutpage from "./Layout/Layoutpage";
import Company from "./sales/Company";
import Leads from "./sales/leads/Leads";
import ProtectedRoute from "./ProtectedRoute";
import { Provider } from "react-redux";
import HomePage from "./home/HomePage";
import Login from "./login/Login";
import { ToastProvider } from "@heroui/react";
import { store } from "./toolkit/store";

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
                { path: "company", element: <Company /> },
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
