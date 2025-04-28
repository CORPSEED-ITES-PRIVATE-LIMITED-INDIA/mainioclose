import React, { useEffect, useState } from "react";
import { Flex, Input, Select } from "antd";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getAllEstimateForApproval,
  getEstimateListByUserId,
} from "../../Toolkit/Slices/LeadSlice";
import ColComp from "../../components/small/ColComp";
import OverFlowText from "../../components/OverFlowText";
import TableOutlet from "../../components/design/TableOutlet";
import MainHeading from "../../components/design/MainHeading";
import CommonTable from "../../components/CommonTable";

const DiscountedEstimates = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const estimateListByUser = useSelector(
    (state) => state.leads.estimateListByUser
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [typeStatus, setTypeStatus] = useState("initiated");

  useEffect(() => {
    setFilteredData(estimateListByUser);
  }, [estimateListByUser]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = estimateListByUser?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    dispatch(getEstimateListByUserId({ userId: userid, status: typeStatus }));
  }, [dispatch, typeStatus, userid]);

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 50,
      fixed: "left",
    },
    {
      dataIndex: "productName",
      title: "Product name",
      fixed: "left",
    },
    {
      dataIndex: "companyId",
      title: "Company id",
    },
    {
      dataIndex: "companyName",
      title: "Company name",
    },
    {
      dataIndex: "panNo",
      title: "Pan number",
    },
    {
      dataIndex: "gstNo",
      title: "GST number",
    },
    {
      title: "Company age",
      dataIndex: "companyAge",
      render: (_, data) => <ColComp data={data?.age} />,
    },

    {
      title: "Assignee",
      dataIndex: "assignee",
      render: (info) => <ColComp data={info?.fullName} />,
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (_, value) => <OverFlowText>{value?.address}</OverFlowText>,
    },
    {
      title: "City",
      dataIndex: "city",
      render: (_, data) => <ColComp data={data?.city} />,
    },
    {
      title: "State",
      dataIndex: "state",
      render: (_, data) => <ColComp data={data?.state} />,
    },
    {
      title: "Country",
      dataIndex: "country",
      render: (_, data) => <ColComp data={data?.country} />,
    },
    {
      title: "Pin code",
      dataIndex: "primaryPinCode",
      render: (_, data) => <ColComp data={data?.primaryPinCode} />,
    },
    {
      title: "Secondary address",
      dataIndex: "secondaryAddress",
      render: (_, value) => (
        <OverFlowText>{value?.secondaryAddress}</OverFlowText>
      ),
    },
    {
      title: "Secondary city",
      dataIndex: "secondaryCity",
      render: (_, data) => <ColComp data={data?.secondaryCity} />,
    },
    {
      title: "Secondary state",
      dataIndex: "secondaryState",
      render: (_, data) => <ColComp data={data?.secondaryState} />,
    },
    {
      title: "Secondary country",
      dataIndex: "secondaryCountry",
      render: (_, data) => <ColComp data={data?.secondaryCountry} />,
    },
    {
      title: "Secondary pin",
      dataIndex: "secondaryPinCode",
      render: (_, data) => <ColComp data={data?.secondaryPinCode} />,
    },
    {
      dataIndex: "paymentDate",
      title: "Payment date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      dataIndex: "docPersent",
      title: "Document %",
    },
    {
      dataIndex: "filingPersent",
      title: "Filing %",
    },
    {
      dataIndex: "liasoningPersent",
      title: "Liasoning %",
    },
    {
      dataIndex: "certificatePersent",
      title: "Certificate %",
    },
    {
      dataIndex: "tdsPresent",
      title: "TDS present",
      render: (info) => (info ? "Yes" : "No"),
    },
    {
      dataIndex: "tdsAmount",
      title: "TDS amount",
    },
    {
      dataIndex: "tdsPercent",
      title: "TDS %",
    },
    {
      dataIndex: "tdsAmount",
      title: "TDS amount",
    },
    {
      dataIndex: "govermentfees",
      title: "Govt fee",
    },
    {
      dataIndex: "govermentGst",
      title: "Govt gst %",
    },
    {
      dataIndex: "govermentGstPercent",
      title: "Govt gst amount",
    },
    {
      dataIndex: "professionalFees",
      title: "Professional fee",
    },
    {
      dataIndex: "profesionalGst",
      title: "Professional gst %",
    },
    {
      dataIndex: "professionalGstPercent",
      title: "Professional gst amount",
      width: 250,
    },
    {
      dataIndex: "serviceCharge",
      title: "Service charge",
    },
    {
      dataIndex: "serviceGst",
      title: "Service gst %",
    },
    {
      dataIndex: "serviceGstPercent",
      title: "Service gst amount",
    },
    {
      dataIndex: "otherFees",
      title: "Other fee",
    },
    {
      dataIndex: "otherGst",
      title: "Other gst %",
    },
    {
      dataIndex: "otherGstPercent",
      title: "Other gst amount",
    },
    {
      dataIndex: "totalAmount",
      title: "Total amount",
    },
    {
      dataIndex: "approveDate",
      title: "Approved date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      dataIndex: "purchaseNumber",
      title: "Purchase number",
    },
    {
      dataIndex: "purchaseDate",
      title: "Purchase date",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    {
      dataIndex: "paymentTerm",
      title: "Payment term",
    },
    {
      dataIndex: "remarksForOption",
      title: "Remark",
    },
  ];

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"Estimate approvals"} />
      </div>
      <Flex vertical>
        <Flex gap={8} className="marginBottom8px">
          <Input
            prefix={<Icon icon="fluent:search-24-regular" />}
            value={searchText}
            size="small"
            onChange={handleSearch}
            placeholder="search"
            style={{ width: "25%" }}
          />
          <Select
            style={{ width: "20%" }}
            showSearch
            value={typeStatus}
            options={[
              { label: "Initiated", value: "initiated" },
              { label: "Approved", value: "approved" },
              { label: "Disapproved", value: "disapproved" },
            ]}
            onChange={(e) => {
              setTypeStatus(e);
            }}
          />
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ x: 8000, y: "67vh" }}
          rowSelection={true}
          rowKey={(record) => record?.id}
        />
      </Flex>
    </TableOutlet>
  );
};

export default DiscountedEstimates;
