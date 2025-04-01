import { Flex, Input } from "antd";
import React, { useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import { Link } from "react-router-dom";

const ConsultantCompanyUnitsPage = () => {
  const dispatch = useDispatch();
  const consultantUnitsList = useSelector(
    (state) => state.company.consultantUnitsList
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);


  useEffect(() => {
    setFilteredData(consultantUnitsList);
  }, [consultantUnitsList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = consultantUnitsList?.result?.filter((item) =>
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
      render: (_, props) => (
        <Link className="link-heading">{props?.companyName}</Link>
      ),
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
      render: (_, props) => <OverFlowText>{props?.secAddress}</OverFlowText>,
    },
    {
      dataIndex: "secCity",
      title: "Secondary city",
      checked: false,
      render: (_, props) => <ColComp data={props?.secCity} />,
    },
    {
      dataIndex: "secState",
      title: "Secondary state",
      checked: false,
      render: (_, props) => <ColComp data={props?.secState} />,
    },
    {
      dataIndex: "seCountry",
      title: "Secondary country",
      checked: false,
      render: (_, props) => <ColComp data={props?.seCountry} />,
    },
  ];
  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <MainHeading data={`Consultant company units`} />
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
          scroll={{ y: "69vh" }}
          rowKey={(record) => record?.parentCompanyId}
        />
      </Flex>
    </>
  );
};

export default ConsultantCompanyUnitsPage;
