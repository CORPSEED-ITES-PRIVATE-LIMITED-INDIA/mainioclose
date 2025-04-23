import React, { useEffect, useState } from "react";
import TableOutlet from "../../components/design/TableOutlet";
import MainHeading from "../../components/design/MainHeading";
import { Button, Flex, Input, notification, Select, Table } from "antd";
import CommonTable from "../../components/CommonTable";
import { Icon } from "@iconify/react";
import {
  approvedCompanyInPayment,
  approvedPayment,
  getAllPaymentApprovals,
  getUnusedBankStatement,
  paymentRegisterconfirm,
} from "../../Toolkit/Slices/AccountSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import OverFlowText from "../../components/OverFlowText";
import ColComp from "../../components/small/ColComp";
import dayjs from "dayjs";

const PaymentApproval = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const paymentApprovalList = useSelector(
    (state) => state.account.paymentApprovalList
  );
  const unusedBankStatementList = useSelector(
    (state) => state.account.unusedBankStatementList
  );
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(paymentApprovalList);
  }, [paymentApprovalList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = paymentApprovalList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    dispatch(getAllPaymentApprovals(userid));
    dispatch(getUnusedBankStatement());
  }, [dispatch, userid]);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      fixed: "left",
      width: 80,
    },
    {
      title: "Company name",
      dataIndex: "companyName",
      fixed: "left",
      render: (_, value) => <OverFlowText>{value?.companyName}</OverFlowText>,
    },
    {
      title: "Gst type",
      dataIndex: "gstType",
      render: (_, data) => <ColComp data={data?.gstType} />,
    },
    {
      title: "Gst no.",
      dataIndex: "gstNo",
      render: (_, data) => <ColComp data={data?.gstNo} />,
    },
    {
      title: "Company age",
      dataIndex: "companyAge",
      render: (_, data) => <ColComp data={data?.age} />,
    },

    {
      title: "Assignee",
      dataIndex: "assignee",
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
      title: "Secondary address",
      dataIndex: "secAddress",
      render: (_, value) => <OverFlowText>{value?.secAddress}</OverFlowText>,
    },
    {
      title: "Secondary city",
      dataIndex: "secCity",
      render: (_, data) => <ColComp data={data?.secCity} />,
    },
    {
      title: "Secondary state",
      dataIndex: "secState",
      render: (_, data) => <ColComp data={data?.secState} />,
    },
    {
      title: "Secondary sountry",
      dataIndex: "seCountry",
      render: (_, data) => <ColComp data={data?.seCountry} />,
    },
    {
      title: "Approvals",
      dataIndex: "stage",
      render: (_, info) => (
        <Select
          value={info?.stage}
          options={[
            { label: "Invoiced", value: "Invoiced" },
            { label: "Non-Invoiced", value: "Non-Invoiced" },
          ]}
          onChange={(e) => {
            dispatch(approvedCompanyInPayment({ stage: e, id: info?.id }))
              .then((resp) => {
                if (resp.meta.requestStatus === "fulfilled") {
                  notification.success({
                    message: "Company approved successfully",
                  });
                } else {
                  notification.error({ message: "Something went wrong !." });
                }
              })
              .catch(() =>
                notification.error({ message: "Something went wrong !." })
              );
          }}
        />
      ),
    },
  ];

  const handleApproved = (e, x, data) => {
    if (x?.transaction === data?.transactionId) {
      dispatch(
        approvedPayment({ bankstatementId: e, registerAmountId: data?.id })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Payment approved successfully !.",
            });
            dispatch(
              paymentRegisterconfirm({
                paymentRegisterId: data?.id,
                estimateId: data?.estimateId,
              })
            )
              .then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                  notification.success({
                    message: "Payment approved successfully in V3 !.",
                  });
                } else {
                  notification.error({ message: "Something went wrong !." });
                }
              })
              .catch(() =>
                notification.error({ message: "Something went wrong !." })
              );
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    } else {
      notification.error({
        message: "Payment id and bank register id are not matching",
      });
    }
  };

  const expandedColumns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 50,
      fixed: "left",
    },
    {
      dataIndex: "transactionId",
      title: "Transaction id",
      fixed: "left",
    },
    {
      dataIndex: "companyId",
      title: "Company id",
      fixed: "left",
    },
    {
      dataIndex: "estimateNo",
      title: "Estimate no",
    },
    {
      dataIndex: "serviceName",
      title: "Service name",
    },
    {
      dataIndex: "companyName",
      title: "Company name",
    },
    {
      dataIndex: "billingQuantity",
      title: "Billing quantity",
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
      dataIndex: "remark",
      title: "Remark",
    },
    {
      dataIndex: "approvedPayment",
      title: "Approved payment",
      render: (_, data) => (
        <Select
          disabled={
            data?.status === "initiated" || data?.status === "disapproved"
          }
          style={{ width: "95%" }}
          defaultActiveFirstOption={true}
          defaultValue={0}
          showSearch
          options={[
            { label: "None", value: 0 },
            ...(unusedBankStatementList?.length > 0
              ? unusedBankStatementList?.map((item) => ({
                  label: `${item?.transaction} || ₹ ${item?.leftAmount}`,
                  value: item?.id,
                  ...item,
                }))
              : []),
          ]}
          onSelect={(e, x) => handleApproved(e, x, data)}
        />
      ),
    },
  ];

  const expandedRowRender = (rowData) => {
    console.log("cshvbasjdvajfsdv", rowData);
    return (
      <Table
        dataSource={rowData?.paymentRegister}
        columns={expandedColumns}
        scroll={{ x: 5000, y: "20vh" }}
        pagination={false}
      />
    );
  };

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"Payment approvals"} />
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
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          expandable={{ expandedRowRender }}
          scroll={{ x: 2800, y: "67vh" }}
          rowSelection={true}
          rowKey={(record) => record?.id}
        />
      </Flex>
    </TableOutlet>
  );
};

export default PaymentApproval;
