import {Tabs } from "antd";
import Profit from "./Profit";
import Loss from "./Loss";

const ProfitLoss = () => {


  return (
    <Tabs
      items={[
        { label: "Profit", key: "profit", children: <Profit /> },
        { label: "Loss", key: "loss", children: <Loss /> },
      ]}
    />
  );
};

export default ProfitLoss;
