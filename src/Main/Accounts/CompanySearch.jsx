import React, { useState } from "react";
import CommonTable from "../../components/CommonTable";
import { searchCompaniesForAccountTeam } from "../../Toolkit/Slices/CompanySlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Input, Select, Space } from "antd";
import ColComp from "../../components/small/ColComp";
import OverFlowText from "../../components/OverFlowText";
import { Icon } from "@iconify/react";
import MainHeading from "../../components/design/MainHeading";

const CompanySearch = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const companiesList = useSelector(
    (state) => state.company.companiesSearchListForAccTeam
  );
  const [searchDetail, setSearchDetail] = useState({
    fieldSearch: "name",
    userId: userid,
    searchNameAndGSt: "",
  });

  const handleSearchCompany = () => {
    dispatch(searchCompaniesForAccountTeam(searchDetail));
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
        <OverFlowText linkText={true} to={`${props?.companyId}/details`}>
          {props?.companyName}
        </OverFlowText>
      ),
    },

    {
      dataIndex: "gstNo",
      title: "GST number",
      render: (_, props) => <ColComp data={props?.gstNo} />,
    },
    {
      dataIndex: "gstType",
      title: "GST type",
      render: (_, props) => <ColComp data={props?.gstType} />,
    },
    {
      dataIndex: "city",
      title: "City",
      render: (_, props) => <ColComp data={props?.city} />,
    },
    {
      dataIndex: "state",
      title: "State",
      render: (_, props) => <ColComp data={props?.state} />,
    },

    {
      dataIndex: "country",
      title: "Country",
      render: (_, props) => <ColComp data={props?.country} />,
    },
    {
      dataIndex: "secAddress",
      title: "Secondary address",
      render: (_, props) => <OverFlowText>{props?.secAddress}</OverFlowText>,
    },
    {
      dataIndex: "secCity",
      title: "Secondary city",
      render: (_, props) => <ColComp data={props?.secCity} />,
    },
    {
      dataIndex: "secState",
      title: "Secondary state",
      render: (_, props) => <ColComp data={props?.secState} />,
    },
    {
      dataIndex: "seCountry",
      title: "Secondary country",
      render: (_, props) => <ColComp data={props?.seCountry} />,
    },
  ];

  return (
    <>
      <MainHeading data={`Company search`} />
      <div
        className="flex-verti-center-hori-start mt-2"
        style={{ margin: "6px 0px" }}
      >
        <Space.Compact>
          <Input
            placeholder="Search"
            value={searchDetail?.searchNameAndGSt}
            allowClear
            onClear={() =>
              dispatch(
                searchCompaniesForAccountTeam({
                  searchNameAndGSt: "",
                  userId: userid,
                  fieldSearch: "name",
                })
              )
            }
            prefix={<Icon icon="fluent:search-24-regular" />}
            onChange={(e) =>
              setSearchDetail((prev) => ({
                ...prev,
                searchNameAndGSt: e.target.value,
              }))
            }
            onPressEnter={handleSearchCompany}
          />
          <Select
            value={searchDetail?.fieldSearch}
            options={[
              { label: "Name", value: "name" },
              { label: "Email", value: "email" },
              { label: "GST no.", value: "gstNo" },
              { label: "Contact no.", value: "contactNo" },
            ]}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchCompany();
              }
            }}
            onChange={(e) =>
              setSearchDetail((prev) => ({ ...prev, fieldSearch: e }))
            }
          />
        </Space.Compact>
      </div>
      <CommonTable
        data={companiesList}
        columns={columns}
        scroll={{ x: 1500, y: "63vh" }}
        rowKey={(record) => record?.companyId}
      />
    </>
  );
};

export default CompanySearch;
