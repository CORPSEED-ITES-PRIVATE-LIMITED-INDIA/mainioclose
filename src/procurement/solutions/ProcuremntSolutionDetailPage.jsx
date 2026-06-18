import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RoundedTabs from "../../components/RoundedTabs";
import { getSolutionById } from "../../toolkit/slices/settingSlice";

const ProcuremntSolutionDetailPage = () => {
  const path = useLocation();
  const { solutionId, userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pathKey = path?.pathname?.split("/");
  const solutionName = useSelector((state) => state.setting.solutionName);

  const [selectedKey, setSelectedKey] = useState("overview");

  useEffect(() => {
    dispatch(getSolutionById({ solutionId, userId }));
  }, [solutionId, userId]);

  useEffect(() => {
    setSelectedKey(pathKey[pathKey?.length - 1]);
  }, [pathKey]);

  const handleSelect = (key) => {
    navigate(key);
    setSelectedKey(key);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "vendors-data", label: "Vendor Data" },
    { id: "rfq", label: "RFQ" },
  ];

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 my-2">
        <h1 className="text-xl font-medium">{solutionName}</h1>
      </div>
      <RoundedTabs tabs={tabs} value={selectedKey} onChange={handleSelect} />
      <Outlet />
    </div>
  );
};

export default ProcuremntSolutionDetailPage;
