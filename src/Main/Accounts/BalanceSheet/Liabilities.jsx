import { Button, DatePicker, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBalanceSheetLiabilities,
  getAllInFlowList,
} from "../../../Toolkit/Slices/AccountSlice";
import { rangePresets } from "../../Common/Commons";
import dayjs from "dayjs";
import { CSVLink } from "react-csv";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const Liabilities = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const balanceSheetLiabilitiesList = useSelector(
    (state) => state.account.balanceSheetLiabilitiesList
  );
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(2, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    dispatch(getAllBalanceSheetLiabilities(dateRange));
  }, [dispatch, dateRange]);

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

  const exportData = balanceSheetLiabilitiesList?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));

  const headers = ["Group name", "Total credit", "Total debit", "Total amount"];

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
        <Flex gap={6}>
          <CSVLink
            className="text-white"
            data={exportData}
            headers={headers}
            filename={"liabilities.csv"}
          >
            <Button>
              <Icon
                icon="fluent:arrow-upload-16-filled"
                height={BTN_ICON_HEIGHT}
                width={BTN_ICON_WIDTH}
              />{" "}
              Export
            </Button>
          </CSVLink>
          <RangePicker
            size="small"
            allowClear={true}
            presets={rangePresets}
            value={[
              dateRange?.startDate ? dayjs(dateRange?.startDate) : "",
              dateRange?.endDate ? dayjs(dateRange?.endDate) : "",
            ]}
            disabledDate={(current) =>
              current && current > dayjs().endOf("day")
            }
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
