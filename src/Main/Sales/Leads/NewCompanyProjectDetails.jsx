import { Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import CommonTable from "../../../components/CommonTable";
const { Text } = Typography;

const NewCompanyProjectDetails = () => {
  const compProject = useSelector((state) => state.company.compProject);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);


  console.log('kjdhgkjgjgkj',compProject)

  useEffect(() => {
    setFilteredData(compProject);
  }, [compProject]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = compProject?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "projectId",
      title: "Id",
      width: 80,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
      fixed: "left",
    },
    {
      dataIndex: "projectName",
      title: "Project name",
      render: (_, props) => <ColComp data={props?.projectName} />,
    },
    {
      dataIndex: "client",
      title: "Client name",
      render: (_, props) => <ColComp data={props?.client?.name} />,
    },

    {
      dataIndex: "clientEmail",
      title: "Client email",
      checked: false,
      render: (_, props) => <ColComp data={props?.client?.emails} />,
    },
    {
      dataIndex: "contactNo",
      title: "Contact no.",
      checked: false,
      render: (_, props) => <ColComp data={props?.client?.contactNo} />,
    },
    {
      dataIndex: "pAddress",
      title: "P. address",
      checked: false,
      render: (_, props) => <ColComp data={props?.pAddress} />,
    },
    {
      dataIndex: "pState",
      title: "State",
      checked: false,
      render: (_, props) => <ColComp data={props?.pState} />,
    },

    {
      dataIndex: "pCountry",
      title: "Country",
      checked: false,
      render: (_, props) => <ColComp data={props?.pCountry} />,
    },
    {
      dataIndex: "sAddress",
      title: "S.address",
      checked: false,
      render: (_, props) => <OverFlowText>{props?.sAddress}</OverFlowText>,
    },
    {
      dataIndex: "sCity",
      title: "S. city",
      render: (_, props) => <ColComp data={props?.sCity} />,
    },
    {
      dataIndex: "sState",
      title: "S. state",
      render: (_, props) => <ColComp data={props?.sState} />,
    },
    {
      dataIndex: "sCountry",
      title: "S. country",
      render: (_, props) => <ColComp data={props?.sCountry} />,
    },
  ];
  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Projects list</Text>
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
          scroll={{ y: "69vh",x:1500 }}
          rowKey={(record) => record?.projectId}
        />
      </Flex>
    </>
  );
};

export default NewCompanyProjectDetails;
