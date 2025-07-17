import { ChevronDown, UserCircle2, LogOut, User2, Menu, PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../ThemeSwitcher";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
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
];

const Layoutpage = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="w-full">
          <header className="dark:bg-black dark:text-white bg-white h-[60px] shadow px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-black dark:text-white"
            >
              <PanelLeft color="gray" />
            </button>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-3 hover:bg-gray-200 cursor-pointer px-4 py-1 rounded-md">
                    <User
                      avatarProps={{
                        icon: (
                          <User2 className="w-5 h-5 text-neutral-700 dark:text-white" />
                        ),
                      }}
                      description="Product Designer"
                      name="Jane Doe"
                    />
                    <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-white" />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem>
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-neutral-700 dark:text-white">
                        John Doe
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-gray-400">
                        john.doe@example.com
                      </p>
                    </div>
                  </DropdownItem>
                  <DropdownItem key="new">
                    <div className="flex items-center gap-4 text-neutral-700">
                      <UserCircle2 className="w-5 h-5" /> Profile
                    </div>
                  </DropdownItem>
                  <DropdownItem key="copy">
                    <div className="flex items-center gap-4 text-neutral-700">
                      <LogOut className="w-5 h-5" /> Logout
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
