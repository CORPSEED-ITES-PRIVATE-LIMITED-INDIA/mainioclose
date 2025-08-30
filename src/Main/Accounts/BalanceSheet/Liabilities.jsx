import { DatePicker, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllBalanceSheetLiabilities, getAllInFlowList } from "../../../Toolkit/Slices/AccountSlice";
import { rangePresets } from "../../Common/Commons";
import dayjs from "dayjs";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const Liabilities = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const balanceSheetLiabilitiesList = useSelector((state) => state.account.balanceSheetLiabilitiesList);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(2, "month").format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  useEffect(() => {
    dispatch(getAllBalanceSheetLiabilities(dateRange));
  }, [dispatch,dateRange]);

  useEffect(() => {
    setFilteredData(balanceSheetLiabilitiesList);
  }, [balanceSheetLiabilitiesList]);

  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = balanceSheetLiabilitiesList?.filter((item) =>
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
      <Flex className="vouchers-header" justify="space-between">
        <Text className="heading-text">Liabilities</Text>
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
        <RangePicker
          size="small"
          allowClear={true}
          presets={rangePresets}
          value={[
            dateRange?.startDate ? dayjs(dateRange?.startDate) : "",
            dateRange?.endDate ? dayjs(dateRange?.endDate) : "",
          ]}
          disabledDate={(current) => current && current > dayjs().endOf("day")}
          onChange={(dates, dateStrings) => {
            if (dates) {
              setDateRange((prev) => ({
                ...prev,
                startDate: dateStrings[0],
                endDate: dateStrings[1],
              }));
            }
          }}
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

export default Liabilities;
