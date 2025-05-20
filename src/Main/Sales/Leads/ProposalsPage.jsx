import React, { useCallback, useEffect, useState } from "react";
import TableOutlet from "../../../components/design/TableOutlet";
import MainHeading from "../../../components/design/MainHeading";
import { Input, Typography } from "antd";
import { Icon } from "@iconify/react";
import TableScalaton from "../../../components/TableScalaton";
import SomethingWrong from "../../../components/usefulThings/SomethingWrong";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllProposalByUserIdForManager } from "../../../Toolkit/Slices/LeadSlice";
import OverFlowText from "../../../components/OverFlowText";
import dayjs from "dayjs";
const { Text } = Typography;

const ProposalsPage = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const proposalList = useSelector((state) => state.leads.proposalList);
  const proposalLoading = useSelector((state) => state.leads.proposalLoading);
  const totalCount = useSelector((state) => state.leads.proposalCount);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(
      getAllProposalByUserIdForManager({ id: userid, ...paginationData })
    );
  }, [dispatch, userid]);

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 80,
      fixed: "left",
    },
    {
      datIndex: "productName",
      title: "Product name",
      width: 250,
      fixed: "left",
      render: (_, data) => <Text>{data?.productName}</Text>,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
    },
    {
      dataIndex: "createDate",
      title: "Created date",
      render: (_, data) => dayjs(data?.createDate).format("YYYY-MM-DD"),
    },
    {
      dataIndexL: "unitName",
      title: "Unit name",
    },
    {
      datIndex: "panNo",
      title: "Pan no.",
    },
    {
      datIndex: "gstNo",
      title: "Gst no.",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
    {
      datIndex: "companyAge",
      title: "Company age",
    },
    {
      datIndex: "orderNumber",
      title: "Order number",
    },
    {
      dataIndex: "primaryContact",
      title: "Pcont. name",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.name}</OverFlowText>
      ),
    },
    {
      dataIndex: "primaryContactEmail",
      title: "Pcont. email",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.emails}</OverFlowText>
      ),
    },
    {
      dataIndex: "primaryContactCont",
      title: "Pcont. contact",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.contactNo}</OverFlowText>
      ),
    },
    {
      dataIndex: "primaryContactWhats",
      title: "Pcont. whatsapp",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.whatsappNo}</OverFlowText>
      ),
    },
    {
      dataIndex: "secondaryContact",
      title: "Scont. name",
      render: (_, data) => (
        <OverFlowText>{data?.secondaryContact?.name}</OverFlowText>
      ),
    },
    {
      dataIndex: "secondaryContactEmail",
      title: "Scont. email",
      render: (_, data) => (
        <OverFlowText>{data?.secondaryContact?.emails}</OverFlowText>
      ),
    },
    {
      dataIndex: "secondaryContactCont",
      title: "Scont. contact",
      render: (_, data) => (
        <OverFlowText>{data?.secondaryContact?.contactNo}</OverFlowText>
      ),
    },
    {
      dataIndex: "secondaryContactWhats",
      title: "Scont. whatsapp",
      render: (_, data) => (
        <OverFlowText>{data?.secondaryContact?.whatsappNo}</OverFlowText>
      ),
    },
    {
      dataIndex: "govermentfees",
      title: "Govt. fee",
    },
    {
      dataIndex: "govermentCode",
      title: "Govt. code",
    },
    {
      dataIndex: "govermentGst",
      title: "Govt. Gst",
    },
    {
      dataIndex: "professionalFees",
      title: "Prof. fee",
    },
    {
      dataIndex: "professionalCode",
      title: "Prof. code",
    },
    {
      dataIndex: "profesionalGst",
      title: "Prof. Gst",
    },
    {
      dataIndex: "serviceCharge",
      title: "Service charges",
    },
    {
      dataIndex: "serviceCode",
      title: "Service code",
    },
    {
      dataIndex: "serviceGst",
      title: "Service Gst",
    },
    {
      dataIndex: "otherFees",
      title: "Other fee",
    },
    {
      dataIndex: "otherCode",
      title: "Other code",
    },
    {
      dataIndex: "otherGst",
      title: "Other Gst",
    },
    {
      dataIndex: "invoiceNote",
      title: "Invoice note",
    },
    {
      datIndex: "address",
      title: "Address",
    },
    {
      datIndex: "city",
      title: "City",
    },
    {
      dataIndex: "country",
      title: "Country",
    },
  ];

  useEffect(() => {
    setFilteredData(proposalList);
  }, [proposalList]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(getAllProposalByUserIdForManager({ id: userid, page: dataPage, size }));
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch]
  );

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = proposalList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };
  return (
    <TableOutlet>
      <MainHeading data={`All proposal`} />
      <div className="flex-verti-center-hori-start mt-2">
        <Input
          value={searchText}
          size="small"
          onChange={handleSearch}
          style={{ width: "220px" }}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
      </div>
      <div className="mt-3">
        {proposalLoading === "pending" && <TableScalaton />}
        {proposalLoading === "rejected" && <SomethingWrong />}
        {proposalList && proposalLoading === "success" && (
          <CommonTable
            data={filteredData}
            columns={columns}
            scroll={{ y: 500, x: 4000 }}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            pagination={true}
            totalCount={totalCount}
            handlePagination={handlePagination}
          />
        )}
      </div>
    </TableOutlet>
  );
};

export default ProposalsPage;
