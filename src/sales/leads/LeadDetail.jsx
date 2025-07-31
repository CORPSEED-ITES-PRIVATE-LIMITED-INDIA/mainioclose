import { Tab, Tabs } from "@heroui/react";
import React, { useEffect } from "react";
import LeadInfo from "./LeadInfo";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";
import CreateCompanyForm from "../company/CreateCompanyForm";

const LeadDetail = () => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const leadData = useSelector((state) => state.leads.singleLeadData);

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
  }, [dispatch]);

  let tabs = [
    {
      id: "details",
      label: "Details",
      content: <LeadInfo leadData={leadData} />,
    },
    {
      id: "activities",
      label: "Activities",
      content:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      id: "company",
      label: "Company",
      content: <CreateCompanyForm leadData={leadData} />,
    },
    {
      id: "vendors",
      label: "Vendors",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: "proposal",
      label: "Proposal",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: "estimate",
      label: "Estimate",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];
  return (
    <div>
      <h1 className="mb-1 text-xl font-medium">{leadData?.leadName}</h1>
      <Tabs aria-label="Dynamic tabs" items={tabs}>
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {item?.content}
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default LeadDetail;
