import { DatePicker, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllProfitList } from "../../../Toolkit/Slices/AccountSlice";
import dayjs from "dayjs";
import { rangePresets } from "../../Common/Commons";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const Profit = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const profitList = useSelector((state) => state.account.profitList?.data);
  // const  = useSelector((state) => state.account.profitList);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(2, "month").format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  useEffect(() => {
    dispatch(getAllProfitList(dateRange));
  }, [dispatch, dateRange]);

  useEffect(() => {
    setFilteredData(profitList);
  }, [profitList]);

  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = profitList?.filter((item) =>
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
    <Flex vertical gap={12}>
      <Flex className="vouchers-header">
        <Text className="heading-text">Profit</Text>
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
        scroll={{ y: "70vh", x: 800 }}
      />
    </Flex>
  );
};

export default Profit;
