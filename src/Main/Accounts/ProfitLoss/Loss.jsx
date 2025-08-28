import { Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLossList,
} from "../../../Toolkit/Slices/AccountSlice";
const { Text } = Typography;

const Loss = () => {
  const dispatch = useDispatch();
  const [searchLossText, setLossSearchText] = useState("");
  const [lossFilteredData, setLossFilteredData] = useState([]);
  const lossList = useSelector((state) => state.account.lossList);


  useEffect(() => {
    dispatch(getAllLossList());
  }, [dispatch]);


  useEffect(() => {
    setLossFilteredData(lossList);
  }, [lossList]);


  const handleLossSearch = (e) => {
    const value = e.target.value?.trim();
    setLossSearchText(value);
    const filtered = lossList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setLossFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "groupName",
      title: "Group name",
      fixed: "left",
    },
    {
      dataIndex: "totalCredit",
      title: "Total credit",
    },
    {
      dataIndex: "totalDebit",
      title: "Total debit",
    },
    {
      dataIndex: "totalAmount",
      title: "Total amount",
    },
  ];
  return (
    <Flex vertical gap={12}>
      <Flex className="vouchers-header">
        <Text className="heading-text">Loss</Text>
      </Flex>

      <Flex justify="space-between" align="center" className="vouchers-header">
        <Input
          prefix={<Icon icon="fluent:search-24-regular" />}
          value={searchLossText}
          size="small"
          onChange={handleLossSearch}
          placeholder="search"
          style={{ width: "25%" }}
        />
      </Flex>
      <CommonTable
        data={lossFilteredData}
        columns={columns}
        scroll={{ y: "70vh", x: 800 }}
      />
    </Flex>
  );
};

export default Loss;
