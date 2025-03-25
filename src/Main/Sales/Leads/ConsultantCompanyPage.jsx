import { Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getConsultantCompanies } from "../../../Toolkit/Slices/CompanySlice";
import CommonTable from "../../../components/CommonTable";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import {Icon} from '@iconify/react'
const {Text}=Typography

const ConsultantCompanyPage = () => {
  const dispatch = useDispatch();
  const { userid, companyId } = useParams();
  const consultantCompaniesList = useSelector(
    (state) => state.company.consultantCompaniesList
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getConsultantCompanies(companyId));
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
      dataIndex: "id",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "name",
      title: "Company name",
      fixed: "left",
    },
    {
      dataIndex: "originalContact",
      title: "Original contact",
    },
    {
      dataIndex: "originalEmail",
      title: "Original email",
    },
  ];
  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <Text className="heading-text">Consultant company list</Text>
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
