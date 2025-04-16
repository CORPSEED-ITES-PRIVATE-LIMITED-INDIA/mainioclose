import { Card, Col, Divider, Flex, Input, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import MainHeading from "../../../components/design/MainHeading";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
const { Title, Text } = Typography;

const ServingCompanyMainDetails = () => {
  const companyDetailByUnitId = useSelector(
    (state) => state.company.singleServingCompanyData
  );

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(companyDetailByUnitId);
  }, [companyDetailByUnitId]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = companyDetailByUnitId?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "companyId",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
      fixed: "left",
    },
    {
      dataIndex: "gstNo",
      title: "GST number",
      checked: false,
      render: (_, props) => <ColComp data={props?.gstNo} />,
    },
    {
      dataIndex: "gstType",
      title: "GST type",
      checked: false,
      render: (_, props) => <ColComp data={props?.gstType} />,
    },
    {
      dataIndex: "primaryContact",
      title: "Primary name",
      render: (_, props) => <ColComp data={props?.primaryContact?.name} />,
    },
    {
      dataIndex: "primaryContact",
      title: "Primary designation",
      render: (_, props) => (
        <ColComp data={props?.primaryContact?.designation} />
      ),
    },
    {
      dataIndex: "primaryContact",
      title: "Primary email",
      render: (_, props) => <ColComp data={props?.primaryContact?.emails} />,
    },
    {
      dataIndex: "primaryContact",
      title: "Primary no.",
      render: (_, props) => <ColComp data={props?.primaryContact?.contactNo} />,
    },
    {
      dataIndex: "secondaryContact",
      title: "Secondary name",
      render: (_, props) => <ColComp data={props?.secondaryContact?.name} />,
    },
    {
      dataIndex: "secondaryContact",
      title: "Secondary designation",
      render: (_, props) => (
        <ColComp data={props?.secondaryContact?.designation} />
      ),
    },
    {
      dataIndex: "secondaryContact",
      title: "Secondary email",
      render: (_, props) => <ColComp data={props?.secondaryContact?.emails} />,
    },
    {
      dataIndex: "secondaryContact",
      title: "Secondary no.",
      render: (_, props) => (
        <ColComp data={props?.secondaryContact?.contactNo} />
      ),
    },
    {
      dataIndex: "address",
      title: "Address",
      checked: false,
      render: (_, props) => <OverFlowText>{props?.address}</OverFlowText>,
    },
    {
      dataIndex: "city",
      title: "City",
      checked: false,
      render: (_, props) => <ColComp data={props?.city} />,
    },
    {
      dataIndex: "state",
      title: "State",
      checked: false,
      render: (_, props) => <ColComp data={props?.state} />,
    },

    {
      dataIndex: "country",
      title: "Country",
      checked: false,
      render: (_, props) => <ColComp data={props?.country} />,
    },
    {
      dataIndex: "secAddress",
      title: "Secondary address",
      checked: false,
      render: (_, props) => <OverFlowText>{props?.secondaryAddress}</OverFlowText>,
    },
    {
      dataIndex: "secCity",
      title: "Secondary city",
      checked: false,
      render: (_, props) => <ColComp data={props?.secondaryCity} />,
    },
    {
      dataIndex: "secState",
      title: "Secondary state",
      checked: false,
      render: (_, props) => <ColComp data={props?.secondaryState} />,
    },
    {
      dataIndex: "seCountry",
      title: "Secondary country",
      checked: false,
      render: (_, props) => <ColComp data={props?.secondaryCountry} />,
    },
  ];

  return (
    <Flex vertical gap={12}>
      <Flex className="vouchers-header">
        <MainHeading data={`Serving company units`} />
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
        scroll={{ y: "69vh", x: 3500 }}
        rowKey={(record) => record?.companyId}
      />
    </Flex>
  );
};

export default ServingCompanyMainDetails;
