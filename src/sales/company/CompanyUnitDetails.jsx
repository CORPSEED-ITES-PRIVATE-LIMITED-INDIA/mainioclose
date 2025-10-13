import { Tab, Tabs } from "@heroui/react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const CompanyUnitDetails = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const pathKey = path?.pathname?.split("/");
  const [selectedKey, setSelectedKey] = useState("leadEstimate");

  useEffect(() => {
    setSelectedKey(pathKey[pathKey?.length - 1]);
  }, []);

  const handleSelect = (e) => {
    navigate(e);
    setSelectedKey(e);
  };

  let tabs = [
    {
      id: "unitDetails",
      label: "Details",
    },
    {
      id: "companyProjects",
      label: "Company projects",
    },
    {
      id: "companyLeads",
      label: "Company leads",
    },
  ];
  return (
    <div className="flex flex-col gap-1">
      <Tabs
        aria-label="Dynamic tabs"
        items={tabs}
        selectedKey={selectedKey}
        onSelectionChange={handleSelect}
      >
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {item.content}
          </Tab>
        )}
      </Tabs>
      <Outlet />
    </div>
  );
};

export default CompanyUnitDetails;
