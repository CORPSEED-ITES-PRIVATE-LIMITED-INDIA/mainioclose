import { DatePicker, Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllDailyBookRecord,
  getAllTrailBalance,
} from "../../../Toolkit/Slices/AccountSlice";
import dayjs from "dayjs";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const TrailBalance = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const trailBalanceList = useSelector(
    (state) => state.account.trailBalanceList
  );

  useEffect(() => {
    dispatch(getAllTrailBalance());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(trailBalanceList);
  }, [trailBalanceList]);

  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = trailBalanceList?.filter((item) =>
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
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Trail balance</Text>
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="vouchers-header"
        >
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
          scroll={{ y: "70vh", x: 800 }}
        />
      </Flex>
    </>
  );
};

export default TrailBalance;
