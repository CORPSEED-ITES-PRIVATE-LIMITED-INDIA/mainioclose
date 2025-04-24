import React, { useEffect, useState } from "react";
import { Button, Flex, Form, Input, notification, Popover, Select } from "antd";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  approveEstimateApproval,
  disApproveEstimateApproval,
  getAllEstimateForApproval,
} from "../../Toolkit/Slices/LeadSlice";
import OverFlowText from "../../components/OverFlowText";
import ColComp from "../../components/small/ColComp";
import TableOutlet from "../../components/design/TableOutlet";
import CommonTable from "../../components/CommonTable";
import MainHeading from "../../components/design/MainHeading";

const EstimateApproval = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const estimateApprovalList = useSelector(
    (state) => state.leads.estimateApprovalList
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
  const [typeStatus, setTypeStatus] = useState("initiated");

  useEffect(() => {
    setFilteredData(estimateApprovalList);
  }, [estimateApprovalList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = estimateApprovalList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    dispatch(getAllEstimateForApproval(typeStatus));
  }, [dispatch, typeStatus]);

  const handleApprovedEstimate = (values) => {
    dispatch(approveEstimateApproval({ ...values, userId: userid }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Estimate disapproved successfully !.",
          });
          form1.resetFields();
          dispatch(getAllEstimateForApproval());
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  const handleDisapprovedEstimate = (values) => {
    dispatch(disApproveEstimateApproval({ ...values, userId: userid }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Estimate disapproved successfully !.",
          });
          form2.resetFields();
          dispatch(getAllEstimateForApproval());
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

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
      dataIndex: "remark",
      title: "Remark",
    },
    {
      title: "Approvals",
      dataIndex: "stage",
      render: (_, info) =>
        info?.status === "approved" ? null : info?.status === "disapproved" ? (
          <Flex gap={4}>
            <Popover
              trigger={"click"}
              placement="bottomLeft"
              content={
                <Form
                  form={form1}
                  layout="vertical"
                  onFinish={(values) =>
                    handleApprovedEstimate({
                      ...values,
                      estimateFormId: info?.id,
                    })
                  }
                >
                  <Form.Item
                    label="Comment"
                    name="comment"
                    rules={[
                      { required: true, message: "please enter comment" },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item>
                    <Button htmlType="submit" type="primary">
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              }
              title="Approve estimate"
            >
              <Button>Approve</Button>
            </Popover>
          </Flex>
        ) : (
          <Flex gap={4}>
            <Popover
              trigger={"click"}
              placement="bottomLeft"
              content={
                <Form
                  form={form1}
                  layout="vertical"
                  onFinish={(values) =>
                    handleApprovedEstimate({
                      ...values,
                      estimateFormId: info?.id,
                    })
                  }
                >
                  <Form.Item
                    label="Comment"
                    name="comment"
                    rules={[
                      { required: true, message: "please enter comment" },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item>
                    <Button htmlType="submit" type="primary">
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              }
              title="Approve estimate"
            >
              <Button>Approve</Button>
            </Popover>
            <Popover
              trigger={"click"}
              placement="bottomLeft"
              content={
                <Form
                  form={form2}
                  layout="vertical"
                  onFinish={(values) =>
                    handleDisapprovedEstimate({
                      ...values,
                      estimateFormId: info?.id,
                    })
                  }
                >
                  <Form.Item
                    label="Comment"
                    name="comment"
                    rules={[
                      { required: true, message: "please enter comment" },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item>
                    <Button htmlType="submit" type="primary">
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              }
              title="Disapprove estimate"
            >
              <Button>Disapprove</Button>
            </Popover>
          </Flex>
        ),
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

export default EstimateApproval;
