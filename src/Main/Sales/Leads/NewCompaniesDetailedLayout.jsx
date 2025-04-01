import { Tabs } from "antd";
import React from "react";
import CompanyDetailPage from "./CompanyDetailPage";
import ConsultantCompanyPage from "./ConsultantCompanyPage";

const NewCompaniesDetailedLayout = () => {

  const items = [
    {
      label: "GST list",
      key: "gstList",
      children: <CompanyDetailPage />,
    },
    {
      label: "Consultant companies",
      key: "consultantCompanies",
      children: <ConsultantCompanyPage />,
    },
  ];
  
  return (
    <>
      <Tabs items={items} />
    </>
  );
};

export default NewCompaniesDetailedLayout;
