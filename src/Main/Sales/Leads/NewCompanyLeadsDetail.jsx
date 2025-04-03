import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import { Flex, Input, Typography } from "antd";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
const { Text } = Typography;

const NewCompanyLeadsDetail = () => {
  const companyLeads = useSelector((state) => state.company.compLeads);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(companyLeads);
  }, [companyLeads]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = companyLeads?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "leadId",
      title: "Id",
      width: 80,
    },
    {
      dataIndex: "leadName",
      title: "Lead name",
      fixed: "left",
      render: (_, props) => <OverFlowText>{props?.leadName}</OverFlowText>,
    },
    {
      dataIndex: "client",
      title: "Client name",
      render: (_, props) => <ColComp data={props?.client} />,
    },

    {
      dataIndex: "email",
      title: "Email",
      checked: false,
      render: (_, props) => <ColComp data={props?.email} />,
    },
    {
      dataIndex: "assigneeName",
      title: "Assignee name",
      checked: false,
      render: (_, props) => <ColComp data={props?.assigneeName} />,
    },
    {
      dataIndex: "assigneeEmail",
      title: "Assignee email",
      checked: false,
      render: (_, props) => <ColComp data={props?.assigneeEmail} />,
    },
    
    {
      dataIndex: "description",
      title: "Description",
      checked: false,
      render: (_, props) => <OverFlowText>{props?.description}</OverFlowText>,
    },
  ];
  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Leads list</Text>
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
          scroll={{ y: "69vh", x: 1500 }}
          rowKey={(record) => record?.leadId}
        />
      </Flex>
    </>
  );
};

export default NewCompanyLeadsDetail;
