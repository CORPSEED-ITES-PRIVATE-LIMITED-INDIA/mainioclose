import { Tab, Tabs } from "@heroui/react";
import React, { useEffect } from "react";
import LeadInfo from "./LeadInfo";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";

const LeadDetail = () => {
  const dispatch=useDispatch()
  const {leadId,userId}=useParams()
  const leadData=useSelector((state)=>state.leads.singleLeadData)

  useEffect(()=>{
    dispatch(getSingleLeadDataByLeadId({leadId,userId}))
  },[dispatch])
  
  let tabs = [
    {
      id: "1",
      label: "Details",
      content: <LeadInfo leadData={leadData} />,
    },
    {
      id: "2",
      label: "Activities",
      content:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      id: "3",
      label: "Vendors",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: "4",
      label: "Proposal",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      id: "5",
      label: "Estimate",
      content:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];
  return (
    <div >
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
