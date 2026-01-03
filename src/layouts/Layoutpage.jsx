import { BellRing, PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  addToast,
  Badge,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Switch,
} from "@heroui/react";
import { ThemeSwitch } from "../components/theme-switch";
import {
  accountNavItems,
  hrItems,
  navItems,
  procurementItems,
  qualityNavItems,
  salesNavItems,
} from "./NavItems";
import { useDispatch, useSelector } from "react-redux";
import {
  getAutomationStatus,
  handleToggleAutomation,
} from "../toolkit/slices/authSlice";

const getNavItemsByDepartment = (department, admin) => {
  if (admin) return navItems;
  const trimmed = department.trim();
  const items = {
    Sales: salesNavItems,
    "Quality Team": qualityNavItems,
    Accounts: accountNavItems,
    Procurement: procurementItems,
    HR: hrItems,
    NA: navItems,
  };
  return items[trimmed] || navItems;
};

const Layoutpage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const automationStatus = useSelector((state) => state.auth.automationStatus);
  const adminRole = userRole.includes("ADMIN");
  const department = useSelector(
    (state) => state?.auth?.getDepartmentDetail?.department
  );
  const pathname = location.pathname;
  const segments = pathname.split("/");
  const userIndex = segments.indexOf("erp");
  const afterUserId = segments.slice(userIndex + 2);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    dispatch(getAutomationStatus());
  }, [dispatch]);

  const handleChangeAutoOnOff = (checked) => {
    dispatch(handleToggleAutomation())
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Auto status updated successfully",
            color: "success",
          });
          dispatch(getAutomationStatus());
        } else {
          addToast({ title: "Failed to update auto status", color: "danger" });
        }
      })
      .catch((err) => {
        addToast({ title: "Failed to update auto status", color: "danger" });
      });
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar
          items={getNavItemsByDepartment(department, adminRole)}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          className="hidden lg:flex"
        />
        <main className={collapsed ? "w-[96%]" : "lg:w-[85%] 2xl:w-[87%]"}>
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
              {/* <Badge color="danger" content={5} shape="circle">
                <Button size="sm" variant="light" isIconOnly>
                  <BellRing className="text-gray-500 " />
                </Button>
              </Badge> */}
              {adminRole && (
                <Switch
                  size="sm"
                  isSelected={automationStatus?.status}
                  onValueChange={handleChangeAutoOnOff}
                />
              )}

              <ThemeSwitch />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-2 py-0 h-full text-neutral-700 dark:text-white shadow">
            <Outlet />
          </main>
        </main>
      </div>
    </div>
  );
};

export default Layoutpage;
