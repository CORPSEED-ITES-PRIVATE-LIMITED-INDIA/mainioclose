import React, { useCallback, useEffect, useState } from "react";
import TableOutlet from "../../../components/design/TableOutlet";
import MainHeading from "../../../components/design/MainHeading";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Row,
  Select,
  Switch,
  Typography,
  Upload,
} from "antd";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllEstimateByUserId, getTotalCountOfEstimate } from "../../../Toolkit/Slices/LeadSlice";
import OverFlowText from "../../../components/OverFlowText";
import TableScalaton from "../../../components/TableScalaton";
import SomethingWrong from "../../../components/usefulThings/SomethingWrong";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createPaymentRegister,
  createPurchaseOrder,
  getPaymentDetailListByEstimateId,
} from "../../../Toolkit/Slices/AccountSlice";
import { getAllUrlList } from "../../../Toolkit/Slices/LeadUrlSlice";
import { paymentTermDays } from "../../Common/Commons";
const { Text, Title } = Typography;

const EstimatePage = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const estimateList = useSelector((state) => state.leads.estimateList);
  const estimateLoading = useSelector((state) => state.leads.estimateLoading);
  const estimateCount = useSelector((state) => state.leads.totalEstimateCount);
  const paymentList = useSelector((state) => state.account.paymentList);
  const allLeadUrl = useSelector((prev) => prev?.leadurls.allUrlList);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [estimateData, setEstimateData] = useState(null);
  const [isMilestone, setIsMilestone] = useState(false);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });
  const [paymentType, setPaymentType] = useState("Payment register");
  const [gstsAmount, setGstsAmount] = useState({
    govermentGstPercent: 0,
    profesionalGstPercent: 0,
    serviceGstPercent: 0,
    otherGstPercent: 0,
  });

  useEffect(() => {
    dispatch(getAllEstimateByUserId(userid));
    dispatch(getTotalCountOfEstimate(userid))
  }, [dispatch, userid]);

  useEffect(() => {
    dispatch(getAllUrlList());
  }, [dispatch]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSetData = (data) => {
    setOpenModal(true);
    setEstimateData(data);
    form.setFieldsValue({
      serviceName: data?.productName,
      profesionalGst: data?.profesionalGst ? data?.profesionalGst : 0,
      companyName: data?.companyName,
      govermentGst: data?.govermentGst ? data?.govermentGst : 0,
      serviceGst: data?.serviceGst ? data?.serviceGst : 0,
      otherGst: data?.otherGst ? data?.otherGst : 0,
    });
  };

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
      dataIndex: "panNo",
      title: "Pan no.",
    },
    {
      dataIndex: "gstNo",
      title: "Gst no.",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
    {
      dataIndex: "companyAge",
      title: "Company age",
    },
    {
      dataIndex: "orderNumber",
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
    {
      dataIndex: "paymentRegistration",
      title: "Payment registration",
      fixed: "right",
      render: (_, data) => (
        <Button
          size="small"
          onClick={() => {
            handleSetData(data);
            dispatch(getPaymentDetailListByEstimateId(data?.id));
            console.log("dshajsdhaskljdasdj", data);
          }}
        >
          Add
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setFilteredData(estimateList);
  }, [estimateList]);

  const handlePagination = useCallback((dataPage, size) => {
    //   dispatch(getProjectAction({ id: currUserId, page: dataPage, size }));
    setPaginationData({ size: size, page: dataPage });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = estimateList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleValuesChange = (_, allValues) => {
    const {
      professionalFees = 0,
      profesionalGst = 0,
      govermentfees = 0,
      govermentGst = 0,
      serviceCharge = 0,
      serviceGst = 0,
      otherFees = 0,
      otherGst = 0,
    } = allValues;
    const professionalGstAmount = (professionalFees * profesionalGst) / 100;
    const professionalTotal = professionalFees + professionalGstAmount;
    const governmentGstAmount = (govermentfees * govermentGst) / 100;
    const governmentTotal = govermentfees + governmentGstAmount;
    const serviceGstAmount = (serviceCharge * serviceGst) / 100;
    const serviceTotal = serviceCharge + serviceGstAmount;
    const otherGstAmount = (otherFees * otherGst) / 100;
    const otherTotal = otherFees + otherGstAmount;
    const totalAmount =
      professionalTotal + governmentTotal + serviceTotal + otherTotal;
    form.setFieldsValue({ totalAmount });
    setGstsAmount((prev) => ({
      ...prev,
      serviceGstPercent: serviceGstAmount,
      otherGstPercent: otherGstAmount,
      govermentGstPercent: governmentGstAmount,
      profesionalGstPercent: professionalGstAmount,
    }));
  };

  const handleSubmit = useCallback(
    (values) => {
      if (paymentType === "Purchase order") {
        values.purchaseAttach = values?.purchaseAttach?.map(
          (item) => item?.response
        );
        let obj = {
          ...values,
          createdById: userid,
          leadId: estimateData?.leadId,
          estimateId: estimateData?.id,
        };
        dispatch(createPurchaseOrder(obj))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Purchase order created successfully !.",
              });
              setOpenModal(false);
              form.resetFields();
              setEstimateData(null);
            } else {
              notification.error({ message: "Something went wrong !." });
            }
          })
          .catch(() =>
            notification.error({ message: "Something went wrong !." })
          );
      } else if (paymentType === "Payment register") {
        values.doc = values?.doc?.map((item) => item?.response);
        let obj = { ...values, ...gstsAmount, estimateId: estimateData?.id };
        dispatch(createPaymentRegister(obj))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Payment registered successfully !.",
              });
              setOpenModal(false);
              form.resetFields();
              setEstimateData(null);
            } else {
              notification.error({ message: "Something went wrong !." });
            }
          })
          .catch(() =>
            notification.error({ message: "Something went wrong !." })
          );
      }
    },
    [form, dispatch, estimateData, gstsAmount]
  );

  return (
    <>
      <TableOutlet>
        <MainHeading data={`All estimate`} />
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
          {estimateLoading === "pending" && <TableScalaton />}
          {estimateLoading === "rejected" && <SomethingWrong />}
          {estimateList && estimateLoading === "success" && (
            <CommonTable
              data={filteredData}
              columns={columns}
              scroll={{ y: "65vh", x: 5000 }}
              page={paginationData?.page}
              pageSize={paginationData?.size}
              pagination={true}
              totalCount={estimateCount}
              handlePagination={handlePagination}
            />
          )}
        </div>
      </TableOutlet>
      <Modal
        title="Add payment details"
        open={openModal}
        centered
        width={"50%"}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          style={{ maxHeight: "80vh", overflow: "auto" }}
          onValuesChange={handleValuesChange}
          onFinish={handleSubmit}
          initialValues={{ tdsPresent: false }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              label="Payment type"
              name="paymentType"
              rules={[
                { required: true, message: "Please select payment type" },
              ]}
            >
              <Select
                onChange={(e) =>
                  e === "Milestone"
                    ? setIsMilestone(true)
                    : setIsMilestone(false)
                }
                options={[
                  { label: "Fully", value: "Fully" },
                  { label: "Partial", value: "Partial" },
                  { label: "Milestone", value: "Milestone" },
                ]}
              />
            </Form.Item>
            {isMilestone && (
              <Form.Item
                label="Document"
                name="docPersent"
                rules={[
                  { required: true, message: "please enter document percent" },
                ]}
              >
                <Input
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>
            )}
            {isMilestone && (
              <Form.Item
                label="Filing"
                name="filingPersent"
                rules={[
                  { required: true, message: "please enter filing percent" },
                ]}
              >
                <Input
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>
            )}
            {isMilestone && (
              <Form.Item
                label="Liasoning"
                name="liasoningPersent"
                rules={[
                  { required: true, message: "please enter liasoning percent" },
                ]}
              >
                <Input
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>
            )}
            {isMilestone && (
              <Form.Item
                label="Certificate"
                name="certificatePersent"
                rules={[
                  {
                    required: true,
                    message: "please enter certificate percent",
                  },
                ]}
              >
                <Input
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>
            )}
          </div>

          <div
            style={{
              marginTop: 24,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "0px 12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Title level={5}>Total paid amount</Title>
              {paymentList?.map((item, idx) => (
                <Text key={`paym${idx}`}>
                  Payment {idx + 1} : {item?.totalAmount}
                </Text>
              ))}
            </div>

            <Title level={5}>Total amount : {estimateData?.totalAmount}</Title>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item>
              <Select
                value={paymentType}
                options={[
                  { label: "Purchase order", value: "Purchase order" },
                  { label: "Payment register", value: "Payment register" },
                ]}
                onChange={(e) => setPaymentType(e)}
              />
            </Form.Item>
          </div>

          {paymentType === "Purchase order" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label="PO number"
                name="purchaseNumber"
                rules={[{ required: true, message: "Please enter PO number " }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Service name"
                name="serviceName"
                rules={[
                  { required: true, message: "please enter service name." },
                ]}
              >
                <Select
                  showSearch
                  options={allLeadUrl?.map((item) => ({
                    label: item?.urlsName,
                    value: item?.urlsName,
                  }))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                label="Document attachement"
                name="purchaseAttach"
                getValueFromEvent={normFile}
                valuePropName="fileList"
              >
                <Upload
                  action="/leadService/api/v1/upload/uploadimageToFileSystem"
                  listType="text"
                  multiple={true}
                >
                  <Button size="small">
                    <Icon icon="fluent:arrow-upload-20-filled" />
                    Upload
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Approved date"
                name="approveDate"
                rules={[
                  {
                    required: true,
                    message: "please enter approved date.",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Payment term" name="paymentTerm">
                <Select
                  options={paymentTermDays?.map((item) => ({
                    label: item,
                    value: item,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Comment"
                name="comment"
                rules={[
                  {
                    required: true,
                    message: "please give comment .",
                  },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
            </div>
          ) : (
            <div
              div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label="Company name"
                name="companyName"
                rules={[
                  { required: true, message: "please enter company name." },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Service name"
                name="serviceName"
                rules={[
                  { required: true, message: "please enter service name." },
                ]}
              >
                <Select
                  disabled
                  showSearch
                  options={allLeadUrl?.map((item) => ({
                    label: item?.urlsName,
                    value: item?.urlsName,
                  }))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                label="Transaction id"
                name="transactionId"
                rules={[
                  {
                    required: true,
                    message: "please enter transaction id.",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Estimate number"
                name="estimateNo"
                rules={[
                  {
                    required: true,
                    message: "please enter estimate number.",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Billing quantity"
                name="billingQuantity"
                rules={[
                  {
                    required: true,
                    message: "please enter billing quantity",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Flex>
                <Form.Item
                  label="TDS present"
                  name="tdsPresent"
                  rules={[
                    {
                      required: true,
                      message: "please enter tds present.",
                    },
                  ]}
                >
                  <Switch size="small" />
                </Form.Item>

                <Form.Item
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.tdsPresent !== currentValues.tdsPresent
                  }
                  noStyle
                >
                  {({ getFieldValue }) => (
                    <>
                      {getFieldValue("tdsPresent") && (
                        <>
                          <Form.Item
                            label="TDS percent"
                            name="tdsPercent"
                            rules={[
                              {
                                required: true,
                                message: "please enter tds percent.",
                              },
                            ]}
                          >
                            <Input
                              suffix={
                                <Icon icon="material-symbols-light:percent" />
                              }
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}
                </Form.Item>
              </Flex>
              <Form.Item
                label="Professional fees"
                name="professionalFees"
                rules={[
                  {
                    required: true,
                    message: "please enter professional fees.",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  controls={false}
                  prefix={
                    <Icon icon="material-symbols:currency-rupee-rounded" />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Professional gst"
                name="profesionalGst"
                rules={[
                  {
                    required: true,
                    message: "please enter professional gst",
                  },
                ]}
              >
                <InputNumber
                  disabled
                  style={{ width: "100%" }}
                  controls={false}
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>
              <Form.Item
                label="Government fees"
                name="govermentfees"
                rules={[
                  {
                    required: true,
                    message: "please enter government fees.",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  controls={false}
                  prefix={
                    <Icon icon="material-symbols:currency-rupee-rounded" />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Government gst"
                name="govermentGst"
                rules={[
                  {
                    required: true,
                    message: "please enter government gst",
                  },
                ]}
              >
                <InputNumber
                  disabled
                  style={{ width: "100%" }}
                  controls={false}
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>

              <Form.Item
                label="Service charge"
                name="serviceCharge"
                rules={[
                  {
                    required: true,
                    message: "please enter service charge.",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  controls={false}
                  prefix={
                    <Icon icon="material-symbols:currency-rupee-rounded" />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Service gst"
                name="serviceGst"
                rules={[
                  {
                    required: true,
                    message: "please enter service gst.",
                  },
                ]}
              >
                <InputNumber
                  disabled
                  style={{ width: "100%" }}
                  controls={false}
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>

              <Form.Item
                label="Other fees"
                name="otherFees"
                rules={[{ required: true, message: "please enter other fees" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  controls={false}
                  prefix={
                    <Icon icon="material-symbols:currency-rupee-rounded" />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Other gst"
                name="otherGst"
                rules={[
                  {
                    required: true,
                    message: "please enter other gst.",
                  },
                ]}
              >
                <InputNumber
                  disabled
                  style={{ width: "100%" }}
                  controls={false}
                  suffix={<Icon icon="material-symbols-light:percent" />}
                />
              </Form.Item>

              <Form.Item
                label="Total amount"
                name="totalAmount"
                rules={[
                  {
                    required: true,
                    message: "please enter all fees mentioned above",
                  },
                ]}
              >
                <InputNumber
                  prefix={
                    <Icon icon="material-symbols:currency-rupee-rounded" />
                  }
                  disabled
                  style={{ width: "100%" }}
                  controls={false}
                />
              </Form.Item>

              <Form.Item
                label="Payment date"
                name="paymentDate"
                rules={[
                  {
                    required: true,
                    message: "please enter payment date.",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Remark"
                name="remark"
                rules={[
                  {
                    required: true,
                    message: "please enter remarks",
                  },
                ]}
              >
                <Input.TextArea />
              </Form.Item>

              <Form.Item
                label="Document attachement"
                name="doc"
                getValueFromEvent={normFile}
                valuePropName="fileList"
              >
                <Upload
                  action="/leadService/api/v1/upload/uploadimageToFileSystem"
                  listType="text"
                  multiple={true}
                >
                  <Button size="small">
                    <Icon icon="fluent:arrow-upload-20-filled" />
                    Upload
                  </Button>
                </Upload>
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default EstimatePage;
