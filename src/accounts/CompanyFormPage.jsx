import { Tab, Tabs } from "@heroui/react";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const CompanyFormPage = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("companyForm");
  const handleSelect = (e) => {
    navigate(e);
    setSelectedKey(e);
  };
  return (
    <div>
      <Tabs
        aria-label="Tabs variants"
        variant={"bordered"}
        selectedKey={selectedKey}
        onSelectionChange={handleSelect}
      >
        <Tab key="companyForm" title="Company form" />
        <Tab key="companies" title="Companies" />
      </Tabs>
      <Outlet />
    </div>
  );
};

export default CompanyFormPage;
