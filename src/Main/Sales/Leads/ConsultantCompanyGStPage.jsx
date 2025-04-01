import { Flex, Input } from "antd";
import React, { useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllConsultantUnitsByStateAndId,
  getAllServingGstCompany,
} from "../../../Toolkit/Slices/CompanySlice";
import { Link, useParams } from "react-router-dom";

const ConsultantCompanyGStPage = () => {
  const dispatch = useDispatch();
  const { userid, consultCompanyId, companyId } = useParams();
  const servingGstCompanyList = useSelector(
    (state) => state.company.servingGstCompanyList
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getAllServingGstCompany(consultCompanyId));
  }, [dispatch, consultCompanyId]);

  useEffect(() => {
    setFilteredData(servingGstCompanyList);
  }, [servingGstCompanyList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = servingGstCompanyList?.result?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "parentCompanyId",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "state",
      title: "State",
      render: (_, props) => (
        <Link
          className="link-heading"
          to={`/erp/${userid}/sales/newcompanies/${companyId}/newConsultantCompanies/${consultCompanyId}/consultantGst/${props?.parentCompanyId}/consultantCompanyUnits`}
          onClick={() =>
            dispatch(
              getAllConsultantUnitsByStateAndId({
                companyId: consultCompanyId,
                companyOrConsultant: "company",
                state: props?.state,
              })
            )
          }
        >
          {props?.state}
        </Link>
      ),
    },

    {
      dataIndex: "gstNo",
      title: "GST number",
    },
  ];

  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <MainHeading data={`Consultant gst list`} />
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

export default ConsultantCompanyGStPage;
