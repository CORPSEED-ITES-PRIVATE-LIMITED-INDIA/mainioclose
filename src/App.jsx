import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layoutpage from "./Layout/Layoutpage";
import AdminDashboards from "./dashboards/AdminDashboards";
import Leads from "./sales/Leads";
import Company from "./sales/Company";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layoutpage />}>
        <Route path="dashboard" element={<AdminDashboards/>}  />
        <Route path="sales">
          <Route path="/sales/leads" element={<Leads/>}  />
          <Route path="/sales/company" element={<Company/>}  />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
