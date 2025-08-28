import {Flex, Input, Typography } from "antd";
import  { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllInFlowList,
} from "../../../Toolkit/Slices/AccountSlice";
const { Text } = Typography;

const InFlow = () => {

  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const inFlowList = useSelector((state) => state.account.inFlowList);

  useEffect(() => {
    dispatch(getAllInFlowList());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(inFlowList);
  }, [inFlowList]);



  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = inFlowList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
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
        <Text className="heading-text">In flow</Text>
      </Flex>

      <Flex justify="space-between" align="center" className="vouchers-header">
        <Input
          prefix={<Icon icon="fluent:search-24-regular" />}
          value={searchText}
          size="small"
          onChange={handleSearch}
          placeholder="search"
          style={{ width: "25%" }}
        />
      </Flex>
      <CommonTable
        data={filteredData}
        columns={columns}
        scroll={{ y: "70vh" }}
      />
    </Flex>
  );
};

export default InFlow;
