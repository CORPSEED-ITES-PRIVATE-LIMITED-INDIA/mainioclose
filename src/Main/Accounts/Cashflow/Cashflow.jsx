import { Tabs, Typography } from "antd";
import InFlow from "./InFlow";
import OutFlow from "./OutFlow";
const { Title } = Typography;

const Cashflow = () => {
  return (
    <Tabs
      items={[
        { label: "Inflow", key: "inflow", children: <InFlow /> },
        { label: "Outflow", key: "outflow", children: <OutFlow /> },
      ]}
    />
  );
};

export default Cashflow;
