import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Popover,
  Select,
  Table,
  Typography,
} from "antd";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  approveEstimateApproval,
  disApproveEstimateApproval,
  getAllEstimateForApproval,
  getAllEstimateHistory,
} from "../../Toolkit/Slices/LeadSlice";
import OverFlowText from "../../components/OverFlowText";
import ColComp from "../../components/small/ColComp";
import TableOutlet from "../../components/design/TableOutlet";
import CommonTable from "../../components/CommonTable";
import MainHeading from "../../components/design/MainHeading";
const { Text } = Typography;

const EstimateApproval = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const estimateApprovalList = useSelector(
    (state) => state.leads.estimateApprovalList
  );
  const estimateHistoryList = useSelector(
    (state) => state.leads.estimateHistoryList
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
  const [openModal, setOpenModal] = useState(false);
  const [estimateData, setEstimateData] = useState(null);

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
      render: (_, info) => (
        <Button
          onClick={() => {
            setEstimateData(info);
            setOpenModal(true);
            dispatch(
              getAllEstimateHistory({
                estimateId: info?.id,
                name: info?.productName,
                productSubCategoryId: info?.productSubCategoryId || "",
              })
            );
          }}
        >
          Action
        </Button>
      ),
    },
  ];

  const handleFinish = (values) => {
    if (values?.actionType === "approved") {
      dispatch(
        approveEstimateApproval({
          ...values,
          estimateFormId: estimateData?.id,
          userId: userid,
        })
      )
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
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    } else {
      dispatch(
        disApproveEstimateApproval({
          ...values,
          estimateFormId: estimateData?.id,
          userId: userid,
        })
      )
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
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    }
  };

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
          scroll={{ x: 5000, y: "67vh" }}
          rowSelection={true}
          rowKey={(record) => record?.id}
        />
      </Flex>
      <Modal
        width={"50%"}
        title="Estimate approval"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Flex>
          <Flex gap={8} align="center" style={{ margin: "24px 0px" }}>
            <Text className="heading-text" type="secondary">
              Actaul amount
            </Text>
            <Text className="heading-text">:</Text>
            <Text className="heading-text">
              {estimateHistoryList?.originalPrice?.pFees}
            </Text>
          </Flex>
        </Flex>
        <Table
          dataSource={estimateHistoryList?.history}
          columns={ estimateData?.type==='Product'?[
            { title: "Id", dataIndex: "id", width: 50 },
            { title: "Price/kg", dataIndex: "actualPrice" },
            { title: "Total price", dataIndex: "fees" },
            { title: "Quantity", dataIndex: "quantity" },
          ] : [
            { title: "Id", dataIndex: "id", width: 50 },
            { title: "Professional amount", dataIndex: "professionalFees" },
            { title: "Professional code", dataIndex: "profesionalCode" },
            { title: "Professional fees", dataIndex: "professionalFees" },
          ]}
          style={{ marginBottom: 24 }}
          pagination={false}
          scroll={{ y: 350 }}
        />
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Action"
            name="actionType"
            rules={[{ required: true, message: "please select action" }]}
          >
            <Select
              options={[
                { label: "Approved", value: "approved" },
                { label: "Disapproved", value: "disapproved" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ required: true, message: "please enter comment" }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </TableOutlet>
  );
};

export default EstimateApproval;
