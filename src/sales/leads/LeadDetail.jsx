import { Tab, Tabs } from "@heroui/react";
import { Dot } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const LeadDetail = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const pathKey = path?.pathname?.split("/");
  const leadData = useSelector((state) => state.leads.singleLeadData);
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
      id: "leadDetail",
      label: "Details",
    },
    {
      id: "companyForm",
      label: "Company",
    },
    {
      id: "leadCompanyForm",
      label: "Lead company",
    },
    {
      id: "vendors",
      label: "Vendors",
    },
    {
      id: "proposal",
      label: "Proposal",
    },
    {
      id: "leadEstimate",
      label: "Estimate",
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        {leadData?.originalName ? (
          <Dot className="h-8 w-8" color="red" />
        ) : (
          <Dot className="h-8 w-8" color="green" />
        )}

        <h1 className="mb-1 text-xl font-medium">
          {leadData?.originalName ? leadData?.originalName : "NA"}
        </h1>
      </div>
      <Tabs
        aria-label="Dynamic tabs"
        items={tabs}
        selectedKey={selectedKey}
        onSelectionChange={handleSelect}
      >
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {item?.content}
          </Tab>
        )}
      </Tabs>
      <Outlet />
    </div>
  );
};

export default LeadDetail;
