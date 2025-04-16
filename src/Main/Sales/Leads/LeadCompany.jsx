import {
  Button,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../../Toolkit/Slices/IndustrySlice";
import { getClientDesiginationList } from "../../../Toolkit/Slices/SettingSlice";
import {
  createCompanyForm,
  getAllContactDetails,
  getCompanyByUnitId,
  getCompanyDetailsByGst,
  getContactById,
  searchCompaniesForCompany,
} from "../../../Toolkit/Slices/LeadSlice";
import {
  createNewCompanyInLeads,
  getAllCompanyByStatus,
  getAllCompanyType,
  getAllGstTypeByCompanyTypeId,
  getBusinessTypeByGstTypeId,
  getCompanyDetailsById,
  updateCompanyForm,
} from "../../../Toolkit/Slices/CompanySlice";
import {
  getHighestPriorityRole,
  maskEmail,
  maskMobileNumber,
  playErrorSound,
  playSuccessSound,
} from "../../Common/Commons";
import { getAllUsers } from "../../../Toolkit/Slices/UsersSlice";
import {
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
  handleReset,
} from "../../../Toolkit/Slices/CommonSlice";
import dayjs from "dayjs";
const { Text } = Typography;

const LeadCompany = ({ edit, data }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userid } = useParams();
  const companyDetails = useSelector(
    (state) => state?.leads?.companyDetailsById
  );
  const seachCompniesList = useSelector(
    (state) => state.leads.seachCompniesList
  );
  const allUsers = useSelector((state) => state.user.allUsers);
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList
  );
  const allIndustry = useSelector((state) => state.industry.allMainIndustry);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const subIndustryListById = useSelector(
    (state) => state.industry.subIndustryListByIndustryId
  );
  const subSubIndustryListById = useSelector(
    (state) => state.industry.subSubIndustryListBySubIndustryId
  );
  const industryDataListById = useSelector(
    (state) => state.industry.industryDataListBySubSubIndustryId
  );
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList
  );
  const [isToggel, setIsToggel] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [gstMand, setGstMand] = useState({ gst: false, pan: false });
  const [formLoading, setFormLoading] = useState("");
  const [createFormAs, setCreateFormAs] = useState("company");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchDetail, setSearchDetail] = useState({
    searchText: "",
    userId: userid,
    searchField: "searchNameAndGSt",
  });

  useEffect(() => {
    dispatch(getAllCompanyType());
  }, [dispatch]);

  const handlePanNumberChange = (e) => {
    const value = e.target.value;
    const upperCaseValue = value.toUpperCase();
    const isValid = /^[A-Z0-9]+$/.test(upperCaseValue);
    form.setFieldsValue({ panNo: isValid ? upperCaseValue : value });
  };

  const handleSearchCompanies = () => {
    dispatch(searchCompaniesForCompany(searchDetail)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setOpenDropdown(true);
      }
    });
  };

  const handleButtonClick = useCallback(() => {
    dispatch(getAllUsers());
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
    setOpenModal(true);
  }, [form, data, dispatch, userid]);

  const validateGstNumber = (dispatch) => async (_, value) => {
    if (!value) {
      return Promise.reject(new Error("please enter the GST number"));
    }

    const pattern = /^[a-zA-Z0-9]{15}$/;
    if (!pattern.test(value)) {
      return Promise.reject(
        new Error("please enter 15 digit alphanumeric characters")
      );
    }
    try {
      const resp = await dispatch(getCompanyDetailsByGst(value));
      if (resp.meta.requestStatus === "fulfilled") {
        const temp = resp?.payload;
        if (temp?.length === 0) {
          return Promise.resolve();
        } else {
          return Promise.reject(
            new Error("company already exists with this GST number")
          );
        }
      } else {
        return Promise.reject(new Error("error validating GST"));
      }
    } catch (error) {
      return Promise.reject(new Error("error validating GST"));
    }
  };

  const copyBillingToShipping = () => {
    const values = form.getFieldsValue();
    form.setFieldsValue({
      servingSecondaryAddress: values.servingAddress,
      servingSecondaryCountry: values.servingCountry,
      servingSecondaryState: values.servingState,
      servingsecondaryCity: values.servingCity,
      servingSecondaryPinCode: values.servingprimaryPinCode,
    });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleMoveToUnits = (data) => {
    navigate(`/erp/${userid}/sales/newcompanies/${data?.companyId}/details`);
  };

  const handleFinish = useCallback(
    (values) => {
      values.gstDocuments = values.gstDocuments?.[0]?.response;
      values.leadId = data?.id;
      values.updatedBy = userid;
      dispatch(createNewCompanyInLeads(values))
        .then((response) => {
          console.log("dhgfjghjfdgjdgfdf", response);
          if (response.meta.requestStatus === "fulfilled") {
            setFormLoading("success");

            if (response?.payload?.flag) {
              notification.success({
                message: "Company created successfully.",
              });
              playSuccessSound();
              setOpenModal(false);
              form.resetFields();

              dispatch(handleReset());
            } else {
              notification.error({ message: `${response?.payload?.message}` });
            }
          } else {
            setFormLoading("rejected");
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch((err) => {
          console.log("dhgfjghjfdgjdgfdf   111111", err);
          setFormLoading("rejected");
          notification.error({ message: "Something went wrong !." });
        });
    },
    [companyDetails, dispatch, form]
  );

  return (
    <>
      <Button size="small" type="primary" onClick={handleButtonClick}>
        <Icon icon="fluent:add-24-filled" />
        Add
      </Button>

      <Modal
        title={
          <Flex align="center">
            {isToggel && (
              <Button
                size="small"
                type="text"
                onClick={() => {
                  setIsToggel((prev) => !prev);
                  dispatch(handleReset());
                  form.resetFields();
                }}
              >
                <Icon
                  icon="fluent:arrow-left-16-filled"
                  width="16"
                  height="16"
                />
              </Button>
            )}
            {edit ? "Edit company details" : "Create company"}
          </Flex>
        }
        centered
        width={"60%"}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
          dispatch(handleReset());
        }}
        onClose={() => {
          setOpenModal(false);
          form.resetFields();
          dispatch(handleReset());
        }}
        okText="Submit"
        onOk={() => form.submit()}
        okButtonProps={{
          loading: formLoading === "pending" ? true : false,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ padding: "12px 24px", maxHeight: "75vh", overflow: "auto" }}
          scrollToFirstError
          onFinish={handleFinish}
          initialValues={{
            primaryContact: false,
            isUnit: false,
            secondaryContact: false,
            isConsultant: false,
          }}
        >
          {isToggel ? null : (
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                style={{ width: "75%" }}
                label="Company search"
                name=""
              >
                <Select
                  showSearch
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchCompanies();
                    }
                  }}
                  onSearch={(e) =>
                    setSearchDetail((prev) => ({
                      ...prev,
                      searchText: e,
                    }))
                  }
                  placeholder="Search companies"
                  open={openDropdown}
                  onDropdownVisibleChange={(e) => setOpenDropdown(e)}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          borderTop: "1px solid #f0f0f0",
                        }}
                      >
                        <Button
                          type="primary"
                          onClick={() => setIsToggel((prev) => !prev)}
                        >
                          Add new company
                        </Button>
                      </div>
                    </>
                  )}
                  options={
                    seachCompniesList?.length > 0
                      ? seachCompniesList?.map((item) => ({
                          label: (
                            <Flex justify="space-between" align="center">
                              <Text>{item?.companyName}</Text>
                              <Button
                                size="small"
                                onClick={() => handleMoveToUnits(item)}
                              >
                                Add unit
                              </Button>
                            </Flex>
                          ),
                          value: item?.companyId,
                        }))
                      : []
                  }
                />
              </Form.Item>
              <Form.Item label="." style={{ width: "20%" }}>
                <Select
                  style={{ width: "100px" }}
                  value={searchDetail?.searchField}
                  onChange={(e) =>
                    setSearchDetail((prev) => ({ ...prev, searchField: e }))
                  }
                  options={[
                    { label: "GST", value: "gstNumber" },
                    { label: "Name", value: "searchNameAndGSt" },
                    { label: "Contact no.", value: "contactNumber" },
                    { label: "Email", value: "contactEmail" },
                  ]}
                />
              </Form.Item>
            </Space.Compact>
          )}
          {isToggel && (
            <>
              <div className="form-grid-col-2">
                <Form.Item
                  label="Company type"
                  name="consultantOrCompany"
                  rules={[{ required: true, message: "please select role as" }]}
                >
                  <Select
                    options={[
                      { label: "Consultant", value: "consultant" },
                      { label: "Company", value: "company" },
                    ]}
                    onChange={(e) => setCreateFormAs(e)}
                  />
                </Form.Item>
                <Form.Item
                  label="Company name"
                  name="companyName"
                  rules={[
                    { required: true, message: "please enter company name" },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Company structure"
                  name="companyType"
                  rules={[
                    {
                      required: true,
                      message: "please select the company structure type",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    options={
                      companyTypeList?.length > 0
                        ? companyTypeList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      dispatch(getAllGstTypeByCompanyTypeId(e));
                      form.resetFields(["gstType", "businessType"]);
                      setGstMand({ pan: false, gst: false });
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Gst type"
                  name="gstType"
                  rules={[
                    { required: true, message: "please select the gst type" },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    options={
                      gstTypeList?.gstBussinessType?.length > 0
                        ? gstTypeList?.gstBussinessType?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      dispatch(getBusinessTypeByGstTypeId(e));
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Business type"
                  name="businessType"
                  rules={[
                    {
                      required: true,
                      message: "please select the business type",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    options={
                      businessTypeList?.gstTypePrice?.length > 0
                        ? businessTypeList?.gstTypePrice?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      setGstMand((prev) => ({
                        ...prev,
                        gst: x?.gstPresent,
                        pan: x?.panPresent,
                      }));
                      form.resetFields(["gstNo", "panNo"]);
                    }}
                  />
                </Form.Item>

                {gstMand?.gst && (
                  <Form.Item
                    label="Gst number"
                    name="gstNo"
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                      {
                        validator: validateGstNumber(dispatch),
                      },
                    ]}
                  >
                    <Input maxLength={15} />
                  </Form.Item>
                )}

                {gstMand?.pan && (
                  <Form.Item
                    label="Pan number"
                    name="panNo"
                    rules={[
                      { required: true, message: "please enter pan number" },
                    ]}
                  >
                    <Input maxLength={10} onChange={handlePanNumberChange} />
                  </Form.Item>
                )}

                <Form.Item
                  label="Company incorporate date"
                  name="establishDate"
                  rules={[
                    {
                      required: true,
                      message: "please enter company incorporate date",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Select assignee"
                  name="assigneeId"
                  rules={[
                    { required: true, message: "please select assignee" },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    options={
                      allUsers?.length > 0
                        ? allUsers?.map((item) => ({
                            label: item?.fullName,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Select industry"
                  name="industryId"
                  rules={[
                    { required: true, message: "please select the industry" },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    options={
                      allIndustry?.length > 0
                        ? allIndustry?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(e) => {
                      dispatch(getSubIndustryByIndustryId(e));
                      form.resetFields([
                        "industrydataId",
                        "subsubIndustryId",
                        "subIndustryId",
                      ]);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Select sub-industry"
                  name="subIndustryId"
                  rules={[
                    {
                      required: true,
                      message: "please select the sub industry",
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    options={
                      subIndustryListById?.length > 0
                        ? subIndustryListById?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(e) => {
                      dispatch(getSubSubIndustryBySubIndustryId(e));
                      form.resetFields(["industrydataId", "subsubIndustryId"]);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Select category"
                  name="subsubIndustryId"
                  rules={[
                    {
                      required: true,
                      message: "please select the sub sub industry",
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    options={
                      subSubIndustryListById?.length > 0
                        ? subSubIndustryListById?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(e) => {
                      dispatch(getIndustryDataBySubSubIndustryId(e));
                      form.resetFields(["industrydataId"]);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Select business activity"
                  name="industrydataId"
                  rules={[
                    {
                      required: true,
                      message: "please select the industry data",
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    mode="multiple"
                    maxTagCount="responsive"
                    options={
                      industryDataListById?.length > 0
                        ? industryDataListById?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Upload document"
                  name="gstDocuments"
                  getValueFromEvent={normFile}
                  valuePropName="fileList"
                >
                  <Upload
                    action="/leadService/api/v1/upload/uploadimageToFileSystem"
                    listType="text"
                  >
                    <Button size="small">
                      <Icon icon="fluent:arrow-upload-20-filled" /> Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </div>

              <Divider
                style={{ color: "#cccccc", margin: "8px 0px" }}
                orientation="center"
              >
                Primary details
              </Divider>

              <div className="form-grid-col-2">
                <Form.Item
                  label="Salutation"
                  name="primaryTitle"
                  rules={[
                    {
                      required: true,
                      message: "please select salutation for contact name",
                    },
                  ]}
                >
                  <Select
                    options={[
                      { label: "Master.", value: "master" },
                      { label: "Mr.", value: "mr" },
                      { label: "Mrs.", value: "mrs" },
                      { label: "Miss.", value: "miss" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Contact name"
                  name="contactName"
                  rules={[
                    {
                      required: true,
                      message: "please enter contact person name",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Desigination"
                  name="primaryDesignation"
                  rules={[
                    {
                      required: true,
                      message: "please enter desigination",
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    options={
                      desiginationList?.length > 0
                        ? desiginationList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="contactEmails"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "please enter the email id",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Contact number"
                  name="contactNo"
                  rules={[
                    {
                      required: true,
                      message: "please enter contact number",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Whatsapp number"
                  name="contactWhatsappNo"
                  rules={[
                    {
                      required: true,
                      message: "please enter whatsapp number",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>

              <Divider
                style={{ color: "#cccccc", margin: "8px 0px" }}
                orientation="center"
              >
                Billing address
              </Divider>
              <div className="form-grid-col-2">
                <Form.Item
                  label="Primary address"
                  name="address"
                  rules={[
                    { required: true, message: "please enter the address" },
                  ]}
                >
                  <Input.TextArea />
                </Form.Item>

                <Form.Item
                  label="Country"
                  name="country"
                  rules={[
                    { required: true, message: "please select the country" },
                  ]}
                >
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
                      form.resetFields(["state", "city"]);
                    }}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="State"
                  name="state"
                  rules={[
                    { required: true, message: "please enter the state" },
                  ]}
                >
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
                    onChange={(e, x) => {
                      console.log("jhbfjhbvfkjdfh", e, x);
                      dispatch(getAllCitiesByStateId(x?.id));
                      form.resetFields(["city"]);
                    }}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: "please enter the city" }]}
                >
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
                  label="Pin code"
                  name="primaryPinCode"
                  rules={[{ required: true, message: "please enter pincode" }]}
                >
                  <Input />
                </Form.Item>
              </div>

              <Divider
                style={{ color: "#cccccc", margin: "8px 0px" }}
                orientation="center"
              >
                Secondary details
              </Divider>
              <div className="form-grid-col-2">
                <Form.Item
                  label="Salutation"
                  name="secondaryTitle"
                  rules={[
                    {
                      required: true,
                      message: "please select salutation for contact name ",
                    },
                  ]}
                >
                  <Select
                    options={[
                      { label: "Master.", value: "master" },
                      { label: "Mr.", value: "mr" },
                      { label: "Mrs.", value: "mrs" },
                      { label: "Miss.", value: "miss" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Contact name"
                  name="secondaryContactName"
                  rules={[
                    {
                      required: true,
                      message: "please enter contact person name",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Desigination"
                  name="secondaryDesignation"
                  rules={[
                    {
                      required: true,
                      message: "please enter desigination",
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    options={
                      desiginationList?.length > 0
                        ? desiginationList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="secondaryContactEmails"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "please enter the email id",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Contact number"
                  name="secondaryContactNo"
                  rules={[
                    {
                      required: true,
                      message: "please enter contact number",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Whatsapp number"
                  name="secondaryContactWhatsappNo"
                  rules={[
                    {
                      required: true,
                      message: "please enter whatsapp number",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>
              <Divider
                style={{ color: "#cccccc", margin: "8px 0px" }}
                orientation="center"
              >
                Shipping address
              </Divider>
              <div className="form-grid-col-2">
                <Form.Item label="Address" name="secondaryAddress">
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
                            ...item,
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

                <Form.Item label="PinCode" name="secondaryPinCode">
                  <Input />
                </Form.Item>
              </div>

              <Divider
                style={{ color: "#cccccc", margin: "32px 0px" }}
                orientation="center"
              >
                Serving company details
              </Divider>

              {createFormAs === "consultant" && (
                <>
                  <div className="form-grid-col-2">
                    <Form.Item
                      label="Serving company name"
                      name="servingName"
                      rules={[
                        {
                          required: true,
                          message: "please enter serving company name",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Serving company structure"
                      name="servingCompanyType"
                      rules={[
                        {
                          required: true,
                          message: "please select the company type",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        allowClear
                        options={
                          companyTypeList?.length > 0
                            ? companyTypeList?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                                ...item,
                              }))
                            : []
                        }
                        onChange={(e, x) => setGstMand(x?.gstPresent)}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Serving company Gst number"
                      name="servingGstNo"
                      rules={[
                        {
                          required: true,
                          message: "",
                        },
                        {
                          validator: validateGstNumber(dispatch),
                        },
                      ]}
                    >
                      <Input maxLength={15} />
                    </Form.Item>

                    <Form.Item
                      label="Serving company incorporate date"
                      name="servingEstablishDate"
                      rules={[
                        {
                          required: true,
                          message: "please enter serving company age",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                          current && current > dayjs().endOf("day")
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="Select industry"
                      name="industries"
                      rules={[
                        {
                          required: true,
                          message: "please select the industry",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        options={
                          allIndustry?.length > 0
                            ? allIndustry?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={(e) => {
                          dispatch(getSubIndustryByIndustryId(e));
                          form.resetFields([
                            "industriesData",
                            "subsubIndustry",
                            "subIndustry",
                          ]);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Select sub-industry"
                      name="subIndustry"
                      rules={[
                        {
                          required: true,
                          message: "please select the sub industry",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        options={
                          subIndustryListById?.length > 0
                            ? subIndustryListById?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={(e) => {
                          dispatch(getSubSubIndustryBySubIndustryId(e));
                          form.resetFields([
                            "subsubIndustry",
                            "industriesData",
                          ]);
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Select category"
                      name="subsubIndustry"
                      rules={[
                        {
                          required: true,
                          message: "please select the sub sub industry",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        options={
                          subSubIndustryListById?.length > 0
                            ? subSubIndustryListById?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={(e) => {
                          dispatch(getIndustryDataBySubSubIndustryId(e));
                          form.resetFields(["industriesData"]);
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Select business activity"
                      name="industriesData"
                      rules={[
                        {
                          required: true,
                          message: "please select the industry data",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        mode="multiple"
                        maxTagCount="responsive"
                        options={
                          industryDataListById?.length > 0
                            ? industryDataListById?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="Serving company pan number"
                      name="servingPanNo"
                    >
                      <Input maxLength={10} onChange={handlePanNumberChange} />
                    </Form.Item>

                    <Form.Item
                      label="Upload document"
                      name="servingGstDocuments"
                      getValueFromEvent={normFile}
                      valuePropName="fileList"
                    >
                      <Upload
                        action="/leadService/api/v1/upload/uploadimageToFileSystem"
                        listType="text"
                      >
                        <Button size="small">
                          <Icon icon="fluent:arrow-upload-20-filled" /> Upload
                        </Button>
                      </Upload>
                    </Form.Item>
                  </div>

                  <Divider
                    style={{ color: "#cccccc", margin: "8px 0px" }}
                    orientation="center"
                  >
                    Primary details
                  </Divider>

                  <div className="form-grid-col-2">
                    <Form.Item
                      label="Salutation"
                      name="servingPrimaryTitle"
                      rules={[
                        {
                          required: true,
                          message: "please select salutation for contact name",
                        },
                      ]}
                    >
                      <Select
                        options={[
                          { label: "Master.", value: "master" },
                          { label: "Mr.", value: "mr" },
                          { label: "Mrs.", value: "mrs" },
                          { label: "Miss.", value: "miss" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Contact name"
                      name="servingContactName"
                      rules={[
                        {
                          required: true,
                          message: "please enter contact person name",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Desigination"
                      name="servingPrimaryDesignation"
                      rules={[
                        {
                          required: true,
                          message: "please enter desigination",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        options={
                          desiginationList?.length > 0
                            ? desiginationList?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="servingContactEmails"
                      rules={[
                        {
                          required: true,
                          type: "email",
                          message: "please enter the email id",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Contact number"
                      name="servingContactNo"
                      rules={[
                        {
                          required: true,
                          message: "please enter contact number",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Whatsapp number"
                      name="servingContactWhatsappNo"
                      rules={[
                        {
                          required: true,
                          message: "please enter whatsapp number",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </div>

                  <Divider
                    style={{ color: "#cccccc", margin: "8px 0px" }}
                    orientation="center"
                  >
                    Billing address
                  </Divider>
                  <div className="form-grid-col-2">
                    <Form.Item
                      label="Serving company primary address"
                      name="servingAddress"
                      rules={[
                        { required: true, message: "please enter the address" },
                      ]}
                    >
                      <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                      label="Country"
                      name="servingCountry"
                      rules={[
                        {
                          required: true,
                          message: "please select the country",
                        },
                      ]}
                    >
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
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="State"
                      name="servingState"
                      rules={[
                        { required: true, message: "please enter the state" },
                      ]}
                    >
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
                        onChange={(e, x) =>
                          dispatch(getAllCitiesByStateId(x?.id))
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="City"
                      name="servingCity"
                      rules={[
                        { required: true, message: "please enter the city" },
                      ]}
                    >
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
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="PinCode"
                      name="servingprimaryPinCode"
                      rules={[
                        { required: true, message: "please enter pincode" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </div>

                  <Divider
                    style={{ color: "#cccccc", margin: "8px 0px" }}
                    orientation="center"
                  >
                    Secondary details
                  </Divider>

                  <div className="form-grid-col-2">
                    <Form.Item
                      label="Salutation"
                      name="servingSecondaryTitle"
                      rules={[
                        {
                          required: true,
                          message: "please select salutation for contact name ",
                        },
                      ]}
                    >
                      <Select
                        options={[
                          { label: "Master.", value: "master" },
                          { label: "Mr.", value: "mr" },
                          { label: "Mrs.", value: "mrs" },
                          { label: "Miss.", value: "miss" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Contact name"
                      name="servingSecondaryContactName"
                      rules={[
                        {
                          required: true,
                          message: "please enter contact person name",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Desigination"
                      name="servingSecondaryDesignation"
                      rules={[
                        {
                          required: true,
                          message: "please enter desigination",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        options={
                          desiginationList?.length > 0
                            ? desiginationList?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="servingSecondaryContactEmails"
                      rules={[
                        {
                          required: true,
                          type: "email",
                          message: "please enter the email id",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Contact number"
                      name="servingSecondaryContactName"
                      rules={[
                        {
                          required: true,
                          message: "please enter contact number",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Whatsapp number"
                      name="servingSecondaryContactWhatsappNo"
                      rules={[
                        {
                          required: true,
                          message: "please enter whatsapp number",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </div>
                  <Divider
                    style={{ color: "#cccccc", margin: "8px 0px" }}
                    orientation="center"
                  >
                    Shipping address
                  </Divider>
                  <Button
                    type="primary"
                    onClick={copyBillingToShipping}
                    style={{ marginBottom: "10px" }}
                  >
                    Same as primary address
                  </Button>

                  <div className="form-grid-col-2">
                    <Form.Item label="Address" name="servingSecondaryAddress">
                      <Input.TextArea />
                    </Form.Item>

                    <Form.Item label="Country" name="servingSecondaryCountry">
                      <Select
                        showSearch
                        options={
                          countryList?.length > 0
                            ? countryList?.map((item) => ({
                                label: item?.name,
                                value: item?.name,
                              }))
                            : []
                        }
                        onChange={(e, x) => {
                          dispatch(getAllStatesByCountryId(x?.id));
                        }}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item label="State" name="servingSecondaryState">
                      <Select
                        showSearch
                        options={
                          statesList?.length > 0
                            ? statesList?.map((item) => ({
                                label: item?.name,
                                value: item?.name,
                              }))
                            : []
                        }
                        onChange={(e, x) =>
                          dispatch(getAllCitiesByStateId(x?.id))
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item label="City" name="servingsecondaryCity">
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
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>

                    <Form.Item label="PinCode" name="servingSecondaryPinCode">
                      <Input />
                    </Form.Item>
                  </div>
                </>
              )}
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default LeadCompany;
