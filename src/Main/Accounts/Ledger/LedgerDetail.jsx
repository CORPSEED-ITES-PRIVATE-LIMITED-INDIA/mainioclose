import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getVoucherByGroupLedgerId } from "../../../Toolkit/Slices/AccountSlice";
import { useParams } from "react-router-dom";
import { Flex, Input, Typography } from "antd";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
const { Text } = Typography;

const LedgerDetail = () => {
  const dispatch = useDispatch();
  const { ledgerId } = useParams();
  const data = useSelector((state) => state.account.groupVoucherList);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getVoucherByGroupLedgerId(ledgerId));
  }, [ledgerId, dispatch]);

  useEffect(() => {
    setFilteredData(data?.result);
  }, [data]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = data?.result?.filter((item) =>
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
    },
    {
      dataIndex: "ledgerId",
      title: "Ledger id",
      width: 80,
    },
    {
      dataIndex: "ledgerName",
      title: "Name",
    },
    {
      dataIndex: "companyName",
      title: "Company name",
    },
    {
      dataIndex: "ledgerType",
      title: "Ledger type",
      render: (info) => <Text>{info?.name}</Text>,
    },

    {
      dataIndex: "debitAmount",
      title: "Debit amount",
    },
    {
      dataIndex: "creditAmount",
      title: "Credit amount",
    },
    {
      dataIndex: "paymentType",
      title: "Payment type",
    },
  ];

  return (
    <>
      <Flex vertical>
        <Flex className="vouchers-header">
          <Text className="heading-text">Ledger detail list</Text>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <Flex vertical gap={8}>
              <Text>Total amount</Text>
              <Text>{data?.totalAmount}</Text>
            </Flex>
            <Flex vertical gap={8}>
              <Text>Total credit amount</Text>
              <Text>{data?.totalCredit}</Text>
            </Flex>
            <Flex vertical gap={8}>
              <Text>Total debit amount</Text>
              <Text>{data?.totalDebit}</Text>
            </Flex>
          </div>
        </Flex>

        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh" }}
        />
      </Flex>
    </>
  );
};

export default LedgerDetail;
