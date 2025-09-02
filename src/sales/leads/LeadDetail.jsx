import { Tab, Tabs } from "@heroui/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";

const LeadDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const path = useLocation();
  const pathKey = path?.pathname?.split("/");
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const [selectedKey, setSelectedKey] = useState("leadEstimate");

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
  }, [dispatch]);

  useEffect(() => {
    setSelectedKey(pathKey[pathKey?.length-1]);
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
      <h1 className="mb-1 text-xl font-medium">{leadData?.leadName}</h1>
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
