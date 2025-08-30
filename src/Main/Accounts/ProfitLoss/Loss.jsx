import { DatePicker, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllLossList } from "../../../Toolkit/Slices/AccountSlice";
import dayjs from "dayjs";
import { rangePresets } from "../../Common/Commons";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const Loss = () => {
  const dispatch = useDispatch();
  const [searchLossText, setLossSearchText] = useState("");
  const [lossFilteredData, setLossFilteredData] = useState([]);
  const lossList = useSelector((state) => state.account.lossList);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(2, "month").format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  useEffect(() => {
    dispatch(getAllLossList(dateRange));
  }, [dispatch,dateRange]);

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
        data={lossFilteredData}
        columns={columns}
        scroll={{ y: "70vh", x: 800 }}
      />
    </Flex>
  );
};

export default Loss;
