import { PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    url: "/dashboard",
    key: "dashboard",
  },
  {
    title: "Sales",
    icon: "Briefcase",
    url: "/sales",
    key: "sales",
    children: [
      { title: "Leads", icon: "", url: "sales/leads", key: "leads" },
      { title: "Company", icon: "", url: "sales/company", key: "company" },
    ],
  },
  {
    title: "Users",
    icon: "User",
    url: "users",
    key: "users",
  },
];

const Layoutpage = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={navItems}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <main className="w-full">
          <header className="dark:bg-black dark:text-white bg-white h-[40px] shadow px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-black dark:text-white"
            >
              <PanelLeft color="gray" className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 h-full text-neutral-700 dark:text-white shadow">
            <Outlet />
          </main>
        </main>
      </div>
    </div>
  );
};

export default Layoutpage;
