import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DotIcon from "../../components/DotIcon";
import RoundedTabs from "../../components/RoundedTabs";

const LeadDetail = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const pathKey = path?.pathname?.split("/");

  const leadData = useSelector((state) => state.leads.singleLeadData);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );

  const [selectedKey, setSelectedKey] = useState("leadEstimate");

  useEffect(() => {
    setSelectedKey(pathKey[pathKey?.length - 1]);
  }, []);

  const handleSelect = (key) => {
    navigate(key);
    setSelectedKey(key);
  };
  

  const tabs =
    (department === "Quality Team" || "Temp Admin") && !adminRole
      ? [
          { id: "leadDetail", label: "Details" },
          { id: "leadHistory", label: "Lead history" },
        ]
      : [
          { id: "leadDetail", label: "Details" },
          { id: "childLead", label: "Child lead" },
          { id: "basicCompany", label: "Basic company" },
          { id: "companyForm", label: "Company" },
          { id: "leadCompanyForm", label: "Lead company" },
          { id: "vendors", label: "Vendors" },
          { id: "proposal", label: "Proposal" },
          { id: "leadEstimate", label: "Estimate" },
          { id: "leadEstimates", label: "Estimates" },
          { id: "leadTasks", label: "Tasks" },
          { id: "leadHistory", label: "Lead history" },
        ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center">
        {leadData?.originalName ? (
          <DotIcon margin="0px 4px 0px 2px" color="red" />
        ) : (
          <DotIcon margin="0px 4px 0px 2px" color="green" />
        )}

        <div className="flex items-center gap-1">
          <h2 className="text-lg font-medium">
            {leadData?.originalName || "NA"}
          </h2>
          {leadData?.count !== undefined && (
            <p className="font-medium">{`(${leadData.count})`}</p>
          )}
        </div>
      </div>

      {/* Rounded Button Tabs */}
      <RoundedTabs tabs={tabs} value={selectedKey} onChange={handleSelect} />

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default LeadDetail;
