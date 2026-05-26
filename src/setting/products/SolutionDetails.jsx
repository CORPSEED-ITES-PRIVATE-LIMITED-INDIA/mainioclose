import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RoundedTabs from "../../components/RoundedTabs";

const SolutionDetails = () => {
  const path = useLocation();
  const navigate = useNavigate();
  const pathKey = path?.pathname?.split("/");
  const details = useSelector((state) => state.setting.singleProductDetail);

  const [selectedKey, setSelectedKey] = useState("solutionPrice");

  useEffect(() => {
    setSelectedKey(pathKey[pathKey?.length - 1]);
  }, []);

  const handleSelect = (key) => {
    navigate(key);
    setSelectedKey(key);
  };

  const tabs = [
    { id: "solutionPrice", label: "Price" },
    { id: "documents", label: "Documents" },
    { id: "milestones", label: "Milestones" },
    { id: "serviceDetails", label: "Service Details" },
  ];

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 my-2">
        <h1 className="text-xl font-medium">{details?.productName}</h1>
      </div>
      <RoundedTabs tabs={tabs} value={selectedKey} onChange={handleSelect} />
      <Outlet />
    </div>
  );
};

export default SolutionDetails;
