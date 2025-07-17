import { DatePicker, Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllDailyBookRecord } from "../../../Toolkit/Slices/AccountSlice";
import dayjs from "dayjs";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const DailyBook = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const dailybookList = useSelector((state) => state.account.dailybookList);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    dispatch(getAllDailyBookRecord(dateRange));
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(dailybookList?.result);
  }, [dailybookList]);

  const handleSearch = (e) => {
    const value = e.target.value?.trim();
    setSearchText(value);
    const filtered = dailybookList?.result?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
      fixed:'left'
    },
    {
      dataIndex: "ledgerName",
      title: "Ledger name",
      fixed:'left'
    },
    {
      dataIndex: "companyName",
      title: "Company name",
    },
    {
      dataIndex: "voucherType",
      title: "Voucher type",
      render: (_, data) => <Text>{data?.voucherType?.name}</Text>,
    },
    {
      dataIndex: "paymentType",
      title: "Payment type",
    },
    {
      dataIndex: "date",
      title: "Date",
      render: (_, data) => (
        <Text>{dayjs(data?.createDate).format("DD-MM-YYYY")}</Text>
      ),
    },
    {
      dataIndex: "debitAmount",
      title: "Debit amount (Inwards Qty)",
    },
    {
      dataIndex: "creditAmount",
      title: "Credit amount (Outwards Qty)",
    },
  ];

  const handleSetDate = (dates, dateStrings) => {
    if (dates) {
      dispatch(
        getAllDailyBookRecord({
          startDate: dateStrings[0],
          endDate: dateStrings[1],
        })
      );
      setDateRange((prev) => ({
        ...prev,
        startDate: dateStrings[0],
        endDate: dateStrings[1],
      }));
    }
  };

  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Daily book</Text>
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
          <Flex gap={32} align="center">
            <Flex gap={4}>
              <Text className="text-heading" type="secondary">Total amount</Text>
              <Text className="text-heading">:</Text>
              <Text className="text-heading" strong>{dailybookList?.totalAmount}</Text>
            </Flex>
            <Flex gap={4}>
              <Text className="text-heading" type="secondary">Total credit</Text>
              <Text className="text-heading">:</Text>
              <Text className="text-heading" strong>{dailybookList?.totalCredit}</Text>
            </Flex>
            <Flex gap={4}>
              <Text className="text-heading" type="secondary">Total debit</Text>
              <Text className="text-heading">:</Text>
              <Text className="text-heading" strong>{dailybookList?.totalDebit}</Text>
            </Flex>
            <RangePicker
              showTime={{ format: "HH:mm" }}
              placement="bottomRight"
              format="YYYY-MM-DD HH:mm"
              value={[
                dateRange?.startDate ? dayjs(dateRange?.startDate) : "",
                dateRange?.endDate ? dayjs(dateRange?.endDate) : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={handleSetDate}
            />
          </Flex>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh", x: 1500 }}
        />
      </Flex>
    </>
  );
};

export default DailyBook;
