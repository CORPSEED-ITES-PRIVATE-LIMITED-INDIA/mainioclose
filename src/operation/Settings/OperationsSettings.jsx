import { Tabs, Tab } from "@heroui/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const SETTINGS_TABS = [
  { key: "userMap", label: "User map" },
  { key: "milestones", label: "Milestones" },
  { key: "allDocuments", label: "Documents" },
  { key: "departments", label: "Departments" },
];

const OperationsSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey =
    SETTINGS_TABS.find((tab) => location.pathname.endsWith(`/${tab.key}`))
      ?.key || "userMap";

  return (
    <div className="w-full flex flex-col gap-3">
      <Tabs
        aria-label="Operation settings sections"
        size="sm"
        variant="underlined"
        color="primary"
        selectedKey={activeKey}
        onSelectionChange={(key) => navigate(key)}
        classNames={{
          tabList:
            "gap-5 w-full relative rounded-none p-0 border-b border-gray-200 dark:border-white/10",
          cursor: "w-full",
          tab: "px-1 h-9",
          tabContent:
            "text-[12.5px] text-default-500 group-data-[selected=true]:text-primary group-data-[selected=true]:font-semibold",
        }}
      >
        {SETTINGS_TABS.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      <Outlet />
    </div>
  );
};

export default OperationsSettings;
