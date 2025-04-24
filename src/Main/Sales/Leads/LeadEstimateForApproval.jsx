import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import {
  getAllCitiesByStateId,
  getAllStatesByCountryId,
} from "../../../Toolkit/Slices/CommonSlice";
import { useParams } from "react-router-dom";
import { maskEmail, maskMobileNumber } from "../../Common/Commons";
import { getAllCompanyUnits } from "../../../Toolkit/Slices/CompanySlice";
import {
  createEstimateForApprovals,
  getAllContactDetailsById,
  searchCompaniesForCompany,
} from "../../../Toolkit/Slices/LeadSlice";
const { Text } = Typography;

const LeadEstimateForApproval = ({ leadid }) => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const productData = useSelector((state) => state.leads.productDataByLeadName);
  const contactList = useSelector(
    (state) => state?.leads?.contactListByCompanyId
  );
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const seachCompniesList = useSelector(
    (state) => state.leads.seachCompniesList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allCompanyUnits = useSelector((state) => state.company.allCompanyUnits);
  const details = useSelector((state) => state.leads.estimateDetail);
  const estimateDetailLoading = useSelector(
    (state) => state.leads.estimateDetailLoading
  );
  const companyDetails = useSelector(
    (state) => state?.leads?.companyDetailsById
  );

  const [seachFields, setSearchFields] = useState({
    searchText: "",
    userId: userid,
    searchField: "searchNameAndGSt",
  });

  const [productFees, setProductFees] = useState({
    professionalFees: 0,
    serviceCharge: 0,
    otherFees: 0,
    govermentfees: 0,
    profesionalGst: 0,
    serviceGst: 0,
    govermentGst: 0,
    otherGst: 0,
  });
  const [openSelectDd, setOpenSelectDd] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    productData?.productAmount?.forEach((item) => {
      if (item?.name === "Government") {
        form.setFieldsValue({
          govermentfees: item?.fees,
          govermentCode: item?.hsnNo,
          govermentGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          govermentfees: item?.fees,
          govermentGst: item?.taxAmount,
        }));
      }
      if (item?.name === "Professional fees") {
        form.setFieldsValue({
          professionalFees: item?.fees,
          professionalCode: item?.hsnNo,
          profesionalGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          professionalFees: item?.fees,
          profesionalGst: item?.taxAmount,
        }));
      }
      if (item?.name === "Service charges") {
        form.setFieldsValue({
          serviceCharge: item?.fees,
          serviceCode: item?.hsnNo,
          serviceGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          serviceCharge: item?.fees,
          serviceGst: item?.taxAmount,
        }));
      }

      if (item?.name === "Other fees") {
        form.setFieldsValue({
          otherFees: item?.fees,
          otherCode: item?.hsnNo,
          otherGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          otherFees: item?.fees,
          otherGst: item?.taxAmount,
        }));
      }
    });
  }, [productData, form]);

  // useEffect(() => {
  //   dispatch(getAllCountries());
  //   dispatch(getAllCompanyType());
  // }, [dispatch]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    if (Object.keys(companyDetails) > 0) {
      form.setFieldsValue({
        companyId: companyDetails?.name,
        isUnit: companyDetails?.isUnit,
        isConsultant: companyDetails?.isConsultant,
      });
    }
  }, [companyDetails, form]);

  const handleFinish = (values) => {
    values.leadId = leadid;
    values.companyId = companyId;
    values.productId = productData?.id;
    values.gstDocuments = values.gstDocuments?.[0]?.response;
    dispatch(createEstimateForApprovals(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Estimate created successfully !.",
          });
          setOpenModal(false);
          form.resetFields();
          setCompanyId(null);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <>
      <Button
        type="link"
        style={{ marginBottom: "12px" }}
        onClick={() => setOpenModal(true)}
      >
        Want to create estimate less than give amount ? click here
      </Button>
      <Modal
        title="Create estimate"
        width={"50%"}
        centered
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCancel={() => setOpenModal(false)}
        okText="Submit"
        onOk={()=>form.submit()}
      >
        <Flex
          vertical
          style={{
            maxHeight: "70vh",
            overflow: "auto",
            marginTop: "24px",
            padding: 8,
          }}
        >
          <Flex vertical gap={4} style={{ marginBottom: "12px" }}>
            <Text style={{ fontSize: 14 }}>Seach for companies </Text>
            <Space.Compact>
              <Select
                style={{ width: "20%" }}
                options={[
                  { label: "GST", value: "gstNumber" },
                  { label: "Name", value: "searchNameAndGSt" },
                  { label: "Contact no.", value: "contactNumber" },
                  { label: "Email", value: "contactEmail" },
                ]}
                value={seachFields?.searchField}
                onChange={(e) =>
                  setSearchFields((prev) => ({ ...prev, searchField: e }))
                }
              />
              <Select
                showSearch
                style={{ width: "80%" }}
                placeholder="Search companies ..."
                options={
                  seachCompniesList?.length > 0
                    ? seachCompniesList?.map((item) => ({
                        label: item?.companyName,
                        value: item?.companyId,
                      }))
                    : []
                }
                onChange={(e) => {
                  setSearchFields((prev) => ({ ...prev, searchText: e }));
                  dispatch(getAllCompanyUnits(e));
                  dispatch(getAllContactDetailsById(e));
                  setCompanyId(e);
                }}
                open={openSelectDd}
                value={seachFields?.searchText}
                onSearch={(e) =>
                  setSearchFields((prev) => ({ ...prev, searchText: e }))
                }
                onDropdownVisibleChange={(e) => setOpenSelectDd(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("aslkdjfkjsdbajbdfasbdfjb", e);
                    dispatch(searchCompaniesForCompany(seachFields)).then(
                      (resp) => {
                        if (resp.meta.requestStatus === "fulfilled") {
                          setOpenSelectDd(true);
                        }
                      }
                    );
                  }
                }}
              />
            </Space.Compact>
          </Flex>
          <Form
            form={form}
            layout="vertical"
            scrollToFirstError
            initialValues={{
              cc: [""],
              isConsultant: false,
            }}
            onFinish={handleFinish}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Form.Item
                label="Select company unit"
                name="companyName"
                rules={[
                  { required: true, message: "please enter the company name" },
                ]}
              >
                <Select
                  showSearch
                  options={
                    allCompanyUnits?.length > 0
                      ? allCompanyUnits?.map((item) => ({
                          label: item?.companyName,
                          value: item?.id,
                          ...item,
                        }))
                      : []
                  }
                  onChange={(e, compUnit) => {
                    form.setFieldsValue({
                      gstType: compUnit?.gstType,
                      gstNo: compUnit?.gstNo,
                      companyAge: compUnit?.companyAge,
                      address: compUnit?.address,
                      city: compUnit?.city,
                      country: compUnit?.country,
                      state: compUnit?.state,
                      primaryContact: compUnit?.primaryContact,
                      panNo: compUnit?.panNo,
                      primaryContact: compUnit?.primaryContact?.id,
                      secondaryContact: compUnit?.secondaryContact?.id,
                      assigneeId: compUnit?.assignee?.id,
                      primaryPinCode: compUnit?.primaryPinCode,
                      secondaryAddress: compUnit?.sAddress,
                      secondaryCity: compUnit?.sCity,
                      secondaryState: compUnit?.sState,
                      secondaryCountry: compUnit?.sCountry,
                      secondaryPinCode: compUnit?.secondaryPinCode,
                    });
                  }}
                />
              </Form.Item>
              <Form.Item label="GST type" name="gstType">
                <Select
                  showSearch
                  allowClear
                  options={[
                    { label: "Registered", value: "Registered" },
                    { label: "Unregisterded", value: "Unregistered" },
                    { label: "SE2", value: "SE2" },
                    { label: "International", value: "International" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="GST number" name="gstNo">
                <Input />
              </Form.Item>
            </div>
            <Form.List name="cc">
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      {...(index === 0
                        ? { label: "Email", required: true }
                        : {})}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Please input email",
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder="example@xyz.com" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button
                          size="small"
                          style={{ margin: "0px 4px" }}
                          onClick={() => remove(field.name)}
                          danger
                        >
                          <Icon icon="fluent:delete-24-regular" /> Delete
                        </Button>
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()}>
                      Add Cc
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Form.Item
                label="Pan number"
                name="panNo"
                rules={[{ required: true, message: "please enter pan number" }]}
              >
                <Input maxLength={10} />
              </Form.Item>

              <Form.Item label="Company age" name="companyAge">
                <Input />
              </Form.Item>

              <Form.Item
                label="GST documents"
                name="gstDocuments"
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
            <Flex vertical>
              <Flex justify="space-between">
                <Text className="heading-text">Contacts</Text>
                {/* <Button onClick={() => setOpenModal(true)}>
                  Add new contact
                </Button> */}
              </Flex>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <Form.Item
                  label="Primary contacts"
                  name="primaryContact"
                  rules={[
                    {
                      required: true,
                      message: "please select primary contacts",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    options={
                      contactList?.length > 0
                        ? contactList?.map((item) => ({
                            label: `${maskEmail(
                              item?.email
                            )} || ${maskMobileNumber(item?.contactNo)} `,
                            value: item?.id,
                            email: item?.email,
                            contact: item?.contactNo,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option?.email
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase()) ||
                      option?.contact
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="Secondary contacts"
                  name="secondaryContact"
                  rules={[
                    {
                      required: true,
                      message: "please select secondary contacts",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    options={
                      contactList?.length > 0
                        ? contactList?.map((item) => ({
                            label: `${maskEmail(
                              item?.email
                            )} || ${maskMobileNumber(item?.contactNo)} `,
                            value: item?.id,
                            email: item?.email,
                            contact: item?.contactNo,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option?.email
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase()) ||
                      option?.contact
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase())
                    }
                  />
                </Form.Item>
              </div>
            </Flex>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "46% 25% 25%",
                gridTemplateRows: "repeat(4, auto)",
                gap: "16px",
              }}
            >
              {productData?.productAmount?.map((ele) => {
                if (ele?.name === "Professional fees") {
                  return (
                    <>
                      <Form.Item
                        label="Professional fees"
                        name="professionalFees"
                        layout="horizontal"
                        rules={[
                          {
                            required: true,
                            message: "Please give professional fees",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="professionalCode"
                        rules={[
                          {
                            required: true,
                            message: "please provide HSN number",
                          },
                        ]}
                      >
                        <Input placeholder="Hsn number" />
                      </Form.Item>
                      <Form.Item name="profesionalGst">
                        <Input
                          placeholder="Gst %"
                          disabled={
                            productFees?.profesionalGst == 0 ? false : true
                          }
                        />
                      </Form.Item>
                    </>
                  );
                }

                if (ele?.name === "Service charges") {
                  return (
                    <>
                      <Form.Item
                        label="Service charges"
                        name="serviceCharge"
                        layout="horizontal"
                        rules={[
                          {
                            required: true,
                            message: "please give service charges",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="serviceCode"
                        rules={[
                          { required: true, message: "please give HSN number" },
                        ]}
                      >
                        <Input placeholder="HSN number" />
                      </Form.Item>
                      <Form.Item name="serviceGst">
                        <Input
                          placeholder="Gst %"
                          disabled={
                            productFees?.serviceGst === 0 ? false : true
                          }
                        />
                      </Form.Item>
                    </>
                  );
                }

                if (ele?.name === "Government") {
                  return (
                    <>
                      <Form.Item
                        label="Government fees"
                        name="govermentfees"
                        layout="horizontal"
                        rules={[
                          { required: true, message: "please give govt. fees" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="govermentCode"
                        rules={[
                          { required: true, message: "please give HSN number" },
                        ]}
                      >
                        <Input placeholder="HSN number" />
                      </Form.Item>
                      <Form.Item name="govermentGst">
                        <Input
                          placeholder="Gst %"
                          disabled={
                            productFees?.govermentGst === 0 ? false : true
                          }
                        />
                      </Form.Item>
                    </>
                  );
                }

                if (ele?.name === "Other fees") {
                  return (
                    <>
                      <Form.Item
                        label="Other fees"
                        name="otherFees"
                        layout="horizontal"
                        rules={[
                          {
                            required: true,
                            message: "please give other fees charges",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="otherCode"
                        rules={[
                          { required: true, message: "please give HSN number" },
                        ]}
                      >
                        <Input placeholder="HSN number" />
                      </Form.Item>
                      <Form.Item name="otherGst">
                        <Input
                          placeholder="Gst %"
                          disabled={productFees?.otherGst === 0 ? false : true}
                        />
                      </Form.Item>
                    </>
                  );
                }

                return null;
              })}
            </div>
            <Form.Item
              label="Select sales person name"
              name="assigneeId"
              rules={[
                { required: true, message: "please select sales person" },
              ]}
            >
              <Select
                options={
                  leadUserNew?.length > 0
                    ? leadUserNew?.map((ele) => ({
                        label: ele?.fullName,
                        value: ele?.id,
                      }))
                    : []
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Form.Item
                label="Order number"
                name="orderNumber"
                rules={[
                  { required: true, message: "please give order number" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Purchase date"
                name="purchaseDate"
                rules={[{ required: true, message: "please select date" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                label="Invoice notes"
                name="invoiceNote"
                rules={[
                  { required: true, message: "please write invoice notes" },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                label="Remarks For Operation"
                name="remarksForOption"
                rules={[{ required: true, message: "please write remarks" }]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "please enter address" }]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item label="Country" name="country">
                <Select
                  showSearch
                  options={
                    countryList?.length > 0
                      ? countryList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                          id: item?.id,
                        }))
                      : []
                  }
                  onChange={(e, x) => {
                    dispatch(getAllStatesByCountryId(x?.id));
                  }}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item label="State" name="state">
                <Select
                  showSearch
                  options={
                    statesList?.length > 0
                      ? statesList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                          id: item?.id,
                        }))
                      : []
                  }
                  onChange={(e, x) => dispatch(getAllCitiesByStateId(x?.id))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item label="City" name="city">
                <Select
                  showSearch
                  options={
                    citiesList?.length > 0
                      ? citiesList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                        }))
                      : []
                  }
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>{" "}
              <Form.Item
                label="Pin code"
                name="primaryPinCode"
                rules={[{ required: true, message: "please enter pincode" }]}
              >
                <Input />
              </Form.Item>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Form.Item
                label="Secondary address"
                name="secondaryAddress"
                rules={[
                  { required: true, message: "please enter secondary address" },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item label="Country" name="secondaryCountry">
                <Select
                  showSearch
                  options={
                    countryList?.length > 0
                      ? countryList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                          id: item?.id,
                        }))
                      : []
                  }
                  onChange={(e, x) => {
                    dispatch(getAllStatesByCountryId(x?.id));
                  }}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item label="State" name="secondaryState">
                <Select
                  showSearch
                  options={
                    statesList?.length > 0
                      ? statesList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                          id: item?.id,
                        }))
                      : []
                  }
                  onChange={(e, x) => dispatch(getAllCitiesByStateId(x?.id))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item label="City" name="secondaryCity">
                <Select
                  showSearch
                  options={
                    citiesList?.length > 0
                      ? citiesList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                        }))
                      : []
                  }
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item
                label="Secondary address pincode"
                name="secondaryPinCode"
                rules={[
                  { required: true, message: "please enter secondary pincode" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Remark"
                name="remarksForOption"
                rules={[{ required: true, message: "please give the remark" }]}
              >
                <Input.TextArea />
              </Form.Item>
            </div>
          </Form>
        </Flex>
      </Modal>
    </>
  );
};

export default LeadEstimateForApproval;
