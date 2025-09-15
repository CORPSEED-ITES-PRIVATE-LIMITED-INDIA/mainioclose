import { DatePicker, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllInFlowList } from "../../../Toolkit/Slices/AccountSlice";
import { rangePresets } from "../../Common/Commons";
import dayjs from "dayjs";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const InFlow = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const inFlowList = useSelector((state) => state.account.inFlowList);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm"),
    endDate: dayjs().format("YYYY-MM-DDTHH:mm"),
  });

  useEffect(() => {
    dispatch(getAllInFlowList(dateRange));
  }, [dispatch, dateRange]);

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
      <Flex className="vouchers-header" justify="space-between">
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
        <RangePicker
          size="small"
          allowClear={true}
          showTime={{ format: "HH:mm" }}
          placement="bottomRight"
          format="YYYY-MM-DD HH:mm"
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

export default InFlow;
