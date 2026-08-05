import { BellRing, PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, useParams } from "react-router-dom";
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
  legalNavItems,
  navItems,
  operationEmpItems,
  operationNavItems,
  procurementItems,
  qualityNavItems,
  salesNavItems,
} from "./NavItems";
import { useDispatch, useSelector } from "react-redux";
import {
  getAutomationStatus,
  handleToggleAutomation,
} from "../toolkit/slices/authSlice";
import BackButton from "../components/BackButton";
import NotificationBell from "../components/NotificationBell";

const getNavItemsByDepartment = (department, admin) => {
  if (admin) return navItems;

  const trimmed = department?.trim()?.toLowerCase();

  const items = {
    sales: salesNavItems,
    "quality team": qualityNavItems,
    accounts: accountNavItems,
    procurement: procurementItems,
    "human resource": hrItems,

    crt: operationNavItems,
    legal: legalNavItems,
    technical: operationNavItems,
    liaisoning: operationNavItems,

    operations: operationEmpItems,
    "liasoning test": operationEmpItems,
    "crt test": operationEmpItems,
  };

  return items[trimmed];
};

const Layoutpage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const user = useSelector((state) => state.auth.currentUser);
  const automationStatus = useSelector((state) => state.auth.automationStatus);
  const { userId } = useParams();

  const adminRole = userRole.includes("ADMIN");
  const department = useSelector(
    (state) => state?.auth?.getDepartmentDetail?.department,
  );

  const departmentsdfgsd = useSelector(
    (state) => state?.auth?.getDepartmentDetail,
  );

  console.log("departmentsdfgsd ----->    ", departmentsdfgsd);
  const pathname = location.pathname;
  const segments = pathname.split("/");
  const userIndex = segments.indexOf("erp");
  const afterUserId = segments.slice(userIndex + 2);
  const [collapsed, setCollapsed] = useState(false);

  console.log("users ----->    ", userRole, department, user);

  // useEffect(() => {
  //   dispatch(getAutomationStatus());
  // }, [dispatch]);

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
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-neutral-900 overflow-hidden">
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar
          items={getNavItemsByDepartment(department, adminRole)}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          className="hidden lg:flex"
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="sticky top-0 z-30 dark:bg-black dark:text-white bg-white h-11 shrink-0 border-b border-gray-200 dark:border-white/10 px-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <BackButton fallback={`/erp/${userId}/dashboard`} />
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={() => setCollapsed(!collapsed)}
                className="min-w-7 w-7 h-7"
              >
                <PanelLeft color="gray" className="h-4 w-4" />
              </Button>
              <Breadcrumbs isDisabled size="sm" className="min-w-0">
                {afterUserId?.map((item) => (
                  <BreadcrumbItem key={item} className="capitalize text-[12.5px]">
                    {item}
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* <Badge color="danger" content={5} shape="circle">
                <Button size="sm" variant="light" isIconOnly>
                  <BellRing className="text-gray-500 " />
                </Button>
              </Badge> */}
              {/* {adminRole && (
                <Switch
                  size="sm"
                  isSelected={automationStatus?.status}
                  onValueChange={handleChangeAutoOnOff}
                />
              )} */}

              <NotificationBell userId={userId} />
              <ThemeSwitch />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-3 py-2.5 text-neutral-700 dark:text-white">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layoutpage;
