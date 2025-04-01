import { Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAllConsultantCompaniesById,
  getConsultantCompanies,
} from "../../../Toolkit/Slices/CompanySlice";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
import MainHeading from "../../../components/design/MainHeading";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import { getHighestPriorityRole } from "../../Common/Commons";
const { Text } = Typography;

const ConsultantCompanyPage = () => {
  const dispatch = useDispatch();
  const { userid, companyId } = useParams();
  const consultantCompaniesList = useSelector(
    (state) => state.company.consultantCompaniesList
  );
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getAllConsultantCompaniesById(companyId));
  }, [dispatch, companyId]);

  useEffect(() => {
    setFilteredData(consultantCompaniesList);
  }, [consultantCompaniesList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = consultantCompaniesList?.result?.filter((item) =>
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
        <OverFlowText
          linkText={true}
          to={`/erp/${userid}/sales/newcompanies/${companyId}/newConsultantCompanies/${props?.companyId}/consultantGst`}
        >
          {props?.companyName}
        </OverFlowText>
      ),
    },
    {
      dataIndex: "assignee",
      title: "Assignee",
      render: (_, props) => <ColComp data={props?.assignee?.fullName} />,
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

    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            dataIndex: "clientContactEmail",
            title: "Client email",
          },
          {
            dataIndex: "clientContactNo",
            title: "Client contact",
          },
        ]
      : []),
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
          <MainHeading data={`Consultant company list`} />
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="vouchers-header"
        >
          <Input
            prefix={<Icon icon="fluent:search-24-regular" />}
            value={searchText}
            onChange={handleSearch}
            placeholder="search"
            style={{ width: "25%" }}
          />
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh" }}
          rowKey={(record) => record?.id}
        />
      </Flex>
    </>
  );
};

export default ConsultantCompanyPage;
