import { BellRing, PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Badge, BreadcrumbItem, Breadcrumbs, Button } from "@heroui/react";
import { ThemeSwitch } from "../components/theme-switch";

const navItems = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    url: "dashboard",
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
      { title: "Estimate", icon: "", url: "sales/estimate", key: "estimate" },
      {
        title: "Discounted Estimate",
        icon: "",
        url: "sales/discountedEstimate",
        key: "discountedEstimate",
      },
      { title: "Projects", icon: "", url: "sales/projects", key: "projects" },
      {
        title: "Serving Companies",
        icon: "",
        url: "sales/servingCompanies",
        key: "servingCompanies",
      },
    ],
  },
  {
    title: "Accounts",
    icon: "HandCoins",
    url: "/accounts",
    key: "accounts",
    children: [
      {
        title: "Organization",
        icon: "",
        url: "accounts/organizations",
        key: "organizations",
      },
      {
        title: "Company home",
        icon: "",
        url: "accounts/companyhome",
        key: "companyhome",
      },
      {
        title: "Company approvals",
        icon: "",
        url: "accounts/companyApprovals",
        key: "companyApprovals",
      },
      {
        title: "Payment approvals",
        icon: "",
        url: "accounts/paymentApprovals",
        key: "paymentApprovals",
      },
    ],
  },
  {
    title: "HR",
    icon: "SquareUserRound",
    url: "/hr",
    key: "hr",
    children: [
      { title: "Users list", icon: "", url: "hr/usersList", key: "usersList" },
      {
        title: "Users approval list",
        icon: "",
        url: "hr/usersApprovalList",
        key: "usersApprovalList",
      },
      { title: "Services", icon: "", url: "hr/services", key: "services" },
    ],
  },
  {
    title: "Quality",
    icon: "FlaskConical",
    url: "/quality",
    key: "quality",
    children: [
      { title: "IVR", icon: "", url: "quality/ivr", key: "ivr" },
      { title: "Report", icon: "", url: "quality/report", key: "report" },
    ],
  },
  {
    title: "Users",
    icon: "User2",
    url: "users",
    key: "users",
  },
  {
    title: "Vendor's",
    icon: "SquareUserRound",
    url: "vendors-requests",
    key: "vendors-requests",
  },
  {
    title: "Settings",
    icon: "Settings",
    url: "/settings",
    key: "settings",
    children: [
      { title: "Status", icon: "", url: "settings/status", key: "status" },
      {
        title: "Products",
        icon: "",
        url: "settings/products",
        key: "products",
      },
      {
        title: "Comments",
        icon: "",
        url: "settings/comments",
        key: "comments",
      },
      {
        title: "IP",
        icon: "",
        url: "settings/ipAddress",
        key: "ipAddress",
      },
    ],
  },
];

const Layoutpage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const segments = pathname.split("/");
  const userIndex = segments.indexOf("erp");
  const afterUserId = segments.slice(userIndex + 2);
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
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={() => setCollapsed(!collapsed)}
                className="w-1"
              >
                <PanelLeft color="gray" className="h-4 w-4" />
              </Button>
              <Breadcrumbs isDisabled>
                {afterUserId?.map((item) => (
                  <BreadcrumbItem key={item} className="capitalize">
                    {item}
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </div>
            <div className="flex items-center gap-4">
              <Badge color="danger" content={5} shape="circle">
                <Button size="sm" variant="light" isIconOnly>
                  <BellRing className="text-gray-500 " />
                </Button>
              </Badge>
              <ThemeSwitch />
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
