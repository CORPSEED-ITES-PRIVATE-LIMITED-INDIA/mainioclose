import { Tabs, Typography } from "antd";
import Liabilities from "./Liabilities";
import Assets from "./Assets";

const BalanceSheet = () => {
  return (
    <Tabs
      items={[
        { label: "Liabilities", key: "liabilities", children: <Liabilities /> },
        { label: "Assets", key: "assets", children: <Assets /> },
      ]}
    />
  );
};

export default BalanceSheet;
