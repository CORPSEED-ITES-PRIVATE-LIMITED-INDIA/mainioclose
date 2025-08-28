import { Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOutFlowList,
} from "../../../Toolkit/Slices/AccountSlice";
const { Text } = Typography;

const OutFlow = () => {
  const dispatch = useDispatch();
  const [searchOutText, setOutSearchText] = useState("");
  const [outFilteredData, setOutFilteredData] = useState([]);
  const outFlowList = useSelector((state) => state.account.outFlowList);

  useEffect(() => {
    dispatch(getAllOutFlowList());
  }, [dispatch]);

  useEffect(() => {
    setOutFilteredData(outFlowList);
  }, [outFlowList]);


  const handleOutSearch = (e) => {
    const value = e.target.value?.trim();
    setOutSearchText(value);
    const filtered = outFlowList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setOutFilteredData(filtered);
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
    <Flex vertical gap={12} style={{ width: "100%" }}>
      <Flex className="vouchers-header">
        <Text className="heading-text">Out flow</Text>
      </Flex>

      <Flex justify="space-between" align="center" className="vouchers-header">
        <Input
          prefix={<Icon icon="fluent:search-24-regular" />}
          value={searchOutText}
          size="small"
          onChange={handleOutSearch}
          placeholder="search"
          style={{ width: "25%" }}
        />
      </Flex>
      <CommonTable
        data={outFilteredData}
        columns={columns}
        scroll={{ y: "70vh" }}
      />
    </Flex>
  );
};

export default OutFlow;
