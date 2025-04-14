import {
  Button,
  DatePicker,
  Divider,
  Drawer,
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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addServingCompanyUnit,
  getAllCompanyType,
  getAllConsultantCompaniesById,
  getAllServingGstCompany,
  getConsultantCompanies,
  getServingCompanyData,
  updateServingCompany,
} from "../../../Toolkit/Slices/CompanySlice";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
import MainHeading from "../../../components/design/MainHeading";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import { getHighestPriorityRole } from "../../Common/Commons";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../../Toolkit/Slices/IndustrySlice";
import { getClientDesiginationList } from "../../../Toolkit/Slices/SettingSlice";
import {
  getAllContactDetails,
  getCompanyDetailsByGst,
  searchCompaniesForCompany,
} from "../../../Toolkit/Slices/LeadSlice";
import {
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
  panNumberExistOrNot,
} from "../../../Toolkit/Slices/CommonSlice";
import dayjs from "dayjs";
import ServingCompanyMainDetails from "./ServingCompanyMainDetails";
const { Text } = Typography;

const ConsultantCompanyPage = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const [form] = Form.useForm();
  const { userid, companyId } = useParams();
  const consultantCompaniesList = useSelector(
    (state) => state.company.consultantCompaniesList
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
  const seachCompniesList = useSelector(
    (state) => state.leads.seachCompniesList
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [gstMand, setGstMand] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isToggel, setIsToggel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchDetail, setSearchDetail] = useState({
    searchText: "",
    userId: userid,
    searchField: "searchNameAndGSt",
  });

  useEffect(() => {
    dispatch(getAllConsultantCompaniesById(companyId));
  }, [dispatch, companyId]);

  useEffect(() => {
    setFilteredData(consultantCompaniesList);
  }, [consultantCompaniesList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = consultantCompaniesList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

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

  const validatePan = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("PAN number is required"));
    }
    if (!/^[A-Z0-9]+$/.test(value)) {
      return Promise.reject(new Error("Invalid PAN format"));
    }
    if (value.length !== 10) {
      return Promise.reject(new Error("PAN number must be 10 characters"));
    }

    return dispatch(panNumberExistOrNot(value))
      .then((response) => {
        if (response.payload === true) {
          return Promise.reject(new Error("PAN number already exist"));
        }
        return Promise.resolve();
      })
      .catch(() => Promise.reject(new Error("Error checking PAN number")));
  };

  const copyBillingToShipping = (e) => {
    if (e) {
      const values = form.getFieldsValue();
      form.setFieldsValue({
        servingSecondaryAddress: values.servingAddress,
        servingSecondaryCountry: values.servingCountry,
        servingSecondaryState: values.servingState,
        servingsecondaryCity: values.servingCity,
        servingSecondaryPinCode: values.servingprimaryPinCode,
      });
    } else {
      form.resetFields([
        "servingSecondaryAddress",
        "servingSecondaryCountry",
        "servingSecondaryState",
        "servingsecondaryCity",
        "servingSecondaryPinCode",
      ]);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleOpenDrawer = ({ companyId, companyOrConsultant }) => {
    dispatch(getServingCompanyData({ companyId, companyOrConsultant }));
    setOpenDrawer(true);
  };

  const handleEditData = (value) => {
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
    dispatch(getAllCompanyType());
    dispatch(getSubIndustryByIndustryId(value?.industry));
    dispatch(getSubSubIndustryBySubIndustryId(value?.subIndustry?.id));
    dispatch(getIndustryDataBySubSubIndustryId(value?.subSubIndustry?.id));
    form.setFieldsValue({
      servingName: value?.companyName,
      servingCompanyType: value?.companyType,
      servingGstNo: value?.gstNo,
      servingEstablishDate: value?.establishDate
        ? dayjs(value?.establishDate)
        : dayjs(),
      industries: value?.industry,
      subIndustry: value?.subIndustry?.id,
      subsubIndustry: value?.subSubIndustry?.id,
      industriesData: value?.industryData?.map((item) => item?.id),
      servingPanNo: value?.panNo,
      servingPrimaryTitle: value?.primaryContact?.title,
      servingContactName: value?.primaryContact?.name,
      servingPrimaryDesignation: value?.primaryContact?.designation,
      servingContactEmails: value?.primaryContact?.emails,
      servingContactNo: value?.primaryContact?.contactNo,
      servingContactWhatsappNo: value?.primaryContact?.whatsappNo,
      servingAddress: value?.address,
      servingCountry: value?.country,
      servingState: value?.state,
      servingCity: value?.city,
      servingprimaryPinCode: value?.pinCode,
      servingSecondaryTitle: value?.secondaryContact?.title,
      servingSecondaryContactName: value?.secondaryContact?.name,
      servingSecondaryDesignation: value?.secondaryContact?.designation,
      servingSecondaryContactEmails: value?.secondaryContact?.emails,
      servingSecondaryContactName: value?.secondaryContact?.contactNo,
      servingSecondaryContactWhatsappNo: value?.secondaryContact?.whatsappNo,
      servingSecondaryAddress: value?.secAddress,
      servingSecondaryCountry: value?.seCountry,
      servingSecondaryState: value?.secState,
      servingsecondaryCity: value?.secCity,
      servingSecondaryPinCode: value?.secPinCode,
    });
    setOpenModal(true);
    setEditData(value);
  };

  const columns = [
    {
      dataIndex: "companyId",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
      fixed: "left",
      render: (_, props) => (
        <OverFlowText
          linkText={true}
          to={`/erp/${userid}/sales/newcompanies/${companyId}/newConsultantCompanies/${props?.companyId}/${props?.companyOrConsultant}/consultantGst`}
        >
          {props?.companyName}
        </OverFlowText>
      ),
    },
    {
      dataIndex: "age",
      title: "Company age",
      render: (_, props) => <ColComp data={props?.age} />,
    },
    {
      dataIndex: "assignee",
      title: "Assignee",
      render: (_, props) => <ColComp data={props?.assigneeName} />,
    },
    {
      dataIndex: "gstNo",
      title: "GST number",
      checked: false,
      render: (_, props) => <ColComp data={props?.gstNo} />,
    },
    {
      dataIndex: "gstType",
      title: "GST type",
      checked: false,
      render: (_, props) => <ColComp data={props?.gstType?.name} />,
    },

    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            dataIndex: "clientName",
            title: "Client name",
          },
          {
            dataIndex: "clientContactEmail",
            title: "Client email",
          },
          {
            dataIndex: "clientContactNo",
            title: "Client contact",
          },
          {
            dataIndex: "primaryContact",
            title: "Primary contact name",
            render: (_, props) => (
              <ColComp data={props?.primaryContact?.name} />
            ),
          },
          {
            dataIndex: "primaryContact",
            title: "Primary designation",
            render: (_, props) => (
              <ColComp data={props?.primaryContact?.designation} />
            ),
          },
          {
            dataIndex: "primaryContact",
            title: "Primary contact no.",
            render: (_, props) => (
              <ColComp data={props?.primaryContact?.contactNo} />
            ),
          },
          {
            dataIndex: "primaryContact",
            title: "Primary contact email",
            render: (_, props) => (
              <ColComp data={props?.primaryContact?.emails} />
            ),
          },
          {
            dataIndex: "secondaryContact",
            title: "Secondary contact name",
            render: (_, props) => (
              <ColComp data={props?.secondaryContact?.name} />
            ),
          },
          {
            dataIndex: "secondaryContact",
            title: "Secondary contact designation",
            render: (_, props) => (
              <ColComp data={props?.secondaryContact?.designation} />
            ),
          },
          {
            dataIndex: "secondaryContact",
            title: "Secondary contact no.",
            render: (_, props) => (
              <ColComp data={props?.secondaryContact?.contactNo} />
            ),
          },
          {
            dataIndex: "secondaryContact",
            title: "Secondary contact email",
            render: (_, props) => (
              <ColComp data={props?.secondaryContact?.emails} />
            ),
          },
        ]
      : []),
    {
      dataIndex: "city",
      title: "City",
      checked: false,
      render: (_, props) => <ColComp data={props?.city} />,
    },
    {
      dataIndex: "state",
      title: "State",
      checked: false,
      render: (_, props) => <ColComp data={props?.state} />,
    },

    {
      dataIndex: "country",
      title: "Country",
      checked: false,
      render: (_, props) => <ColComp data={props?.country} />,
    },
    {
      dataIndex: "secAddress",
      title: "Secondary address",
      checked: false,
      render: (_, props) => <OverFlowText>{props?.secAddress}</OverFlowText>,
    },
    {
      dataIndex: "secCity",
      title: "Secondary city",
      checked: false,
      render: (_, props) => <ColComp data={props?.secCity} />,
    },
    {
      dataIndex: "secState",
      title: "Secondary state",
      checked: false,
      render: (_, props) => <ColComp data={props?.secState} />,
    },
    {
      dataIndex: "seCountry",
      title: "Secondary country",
      checked: false,
      render: (_, props) => <ColComp data={props?.seCountry} />,
    },
    {
      dataIndex: "seCountry",
      title: "View",
      checked: false,
      render: (_, props) => (
        <Button onClick={() => handleOpenDrawer(props)}>View</Button>
      ),
    },
    {
      dataIndex: "edit",
      title: "Edit",
      checked: false,
      render: (_, props) => (
        <Button onClick={() => handleEditData(props)}>Edit</Button>
      ),
    },
  ];

  const handleSearchCompanies = () => {
    dispatch(searchCompaniesForCompany(searchDetail)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setOpenDropdown(true);
      }
    });
  };

  const handleButtonClick = useCallback(() => {
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
    dispatch(getAllCompanyType());
    setOpenModal(true);
  }, []);

  const handleMoveToUnits = (data) => {
    navigate(`/erp/${userid}/sales/newcompanies/${data?.companyId}/details`);
  };

  const handleFinish = (values) => {
    if (editData) {
      dispatch(
        updateServingCompany({
          companyId,
          servingCompanyId: editData?.companyId,
          ...values,
          primaryContactId: editData?.primaryContact?.id,
          secondaryContactId: editData?.secondaryContact?.id,
        })
      )
        .then((res) => {
          if (res.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Company update added successfully !.",
            });
            setOpenModal(false);
            form.resetFields();
            setEditData(null);
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    } else {
      dispatch(addServingCompanyUnit({ companyId, ...values }))
        .then((res) => {
          if (res.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Company unit added successfully !.",
            });
            setOpenModal(false);
            form.resetFields();
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
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <MainHeading data={`Serving company list`} />
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
          <Button onClick={handleButtonClick} type="primary">
            Add serving company
          </Button>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh", x: 4500 }}
          rowKey={(record) => record?.id}
        />
      </Flex>
      <Modal
        title={
          <Flex align="center">
            {isToggel && (
              <Button
                size="small"
                type="text"
                onClick={() => {
                  setIsToggel((prev) => !prev);
                  // dispatch(handleReset());
                  // form.resetFields();
                }}
              >
                <Icon
                  icon="fluent:arrow-left-16-filled"
                  width="16"
                  height="16"
                />
              </Button>
            )}
            {false ? "Edit serving company details" : "Add serving company"}
          </Flex>
        }
        width={"60%"}
        centered
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: "70vh", overflow: "auto" }}
          scrollToFirstError
          onFinish={handleFinish}
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
                  label="Select main industry"
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
                      option.label.toLowerCase().includes(input.toLowerCase())
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
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(e) => {
                      dispatch(getSubSubIndustryBySubIndustryId(e));
                      form.resetFields(["subsubIndustry", "industriesData"]);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Select category"
                  name="subsubIndustry"
                  rules={[
                    {
                      required: true,
                      message: "please select the category",
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
                      message: "please select the business activiy",
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
                  label="Serving company pan number"
                  name="servingPanNo"
                  rules={[{ validator: validatePan }]}
                  validateTrigger="onBlur"
                >
                  <Input maxLength={10} />
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
                      option.label.toLowerCase().includes(input.toLowerCase())
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
                      option.label.toLowerCase().includes(input.toLowerCase())
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
                    onChange={(e, x) => dispatch(getAllCitiesByStateId(x?.id))}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="City"
                  name="servingCity"
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
                  label="PinCode"
                  name="servingprimaryPinCode"
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
                      option.label.toLowerCase().includes(input.toLowerCase())
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
                  name="servingSecondaryContactNo"
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
              <Form.Item label="Same as primary address" layout="horizontal">
                <Switch size="small" onChange={copyBillingToShipping} />
              </Form.Item>
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
                    onChange={(e, x) => dispatch(getAllCitiesByStateId(x?.id))}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
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
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item label="PinCode" name="servingSecondaryPinCode">
                  <Input />
                </Form.Item>
              </div>
            </>
          )}
        </Form>
      </Modal>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        closeIcon={null}
        width={"80%"}
      >
        <ServingCompanyMainDetails />
      </Drawer>
    </>
  );
};

export default ConsultantCompanyPage;
