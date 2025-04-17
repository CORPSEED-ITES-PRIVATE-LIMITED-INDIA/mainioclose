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
  Switch,
  Typography,
  Upload,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import OverFlowText from "../../../components/OverFlowText";
import {
  getAllContactDetails,
  getAllLeadUser,
  getAllNewCompanies,
  getCompanyDetailsByGst,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getHighestPriorityRole } from "../../Common/Commons";
import ColComp from "../../../components/small/ColComp";
import CompanyHistory from "../company/CompanyHistory";
import {
  convertServingCompanyToCompany,
  getAllCompanyType,
  getAllServingCompanyList,
  getCompanyAction,
  updateCompanyAssignee,
} from "../../../Toolkit/Slices/CompanySlice";
import { getAllUsers } from "../../../Toolkit/Slices/UsersSlice";
import MainHeading from "../../../components/design/MainHeading";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../../Toolkit/Slices/IndustrySlice";
import { getClientDesiginationList } from "../../../Toolkit/Slices/SettingSlice";
import {
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
  panNumberExistOrNot,
} from "../../../Toolkit/Slices/CommonSlice";
import dayjs from "dayjs";
const { Text } = Typography;

const ServingCompanyPage = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const allUsers = useSelector((state) => state.user.allUsers);
  const allIndustry = useSelector((state) => state.industry.allMainIndustry);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
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
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const servingCompanyList = useSelector(
    (state) => state.company.servingCompanyList
  );
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [typeStatus, setTypeStatus] = useState("initiated");
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isToggel, setIsToggel] = useState(false);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userid));
  }, [userid, dispatch]);

  useEffect(() => {
    setFilteredData(servingCompanyList);
  }, [servingCompanyList]);

  useEffect(() => {
    dispatch(
      getAllServingCompanyList({
        userId: userid,
        page: paginationData?.page,
        size: paginationData?.size,
        status: typeStatus,
      })
    );
  }, [dispatch, userid]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllServingCompanyList({
          userId: userid,
          page: dataPage,
          size: size,
          status: typeStatus,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [userid, dispatch, typeStatus]
  );

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
        secondaryAddress: values.address,
        secondaryCountry: values.country,
        secondaryState: values.state,
        secondaryCity: values.city,
        secondaryPinCode: values.primaryPinCode,
      });
    } else {
      form.resetFields([
        "secondaryAddress",
        "secondaryCountry",
        "secondaryState",
        "secondaryCity",
        "secondaryPinCode",
      ]);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = servingCompanyList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleUpdateAssignee = useCallback(
    (assigneeId, companyId) => {
      let data = {
        companyId: companyId,
        assigneeId: assigneeId,
        currentUserId: userid,
      };
      dispatch(updateCompanyAssignee(data))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Assignee is updated successfully",
            });
            dispatch(
              getAllNewCompanies({
                userId: userid,
                page: paginationData?.page,
                size: paginationData?.size,
                typeStatus,
              })
            );
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
        });
    },
    [dispatch, paginationData, typeStatus]
  );

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
      companyName: value?.companyName,
      companyType: value?.gstType,
      gstNo: value?.gstNo,
      establishDate: value?.establishDate
        ? dayjs(value?.establishDate)
        : dayjs(),
      industryId: value?.industry?.id,
      subIndustryId: value?.subIndustry?.id,
      subsubIndustryId: value?.subSubIndustry?.id,
      industrydataId: value?.industryData?.map((item) => item?.id),
      panNo: value?.panNo,
      primaryTitle: value?.primaryContact?.title,
      contactName: value?.primaryContact?.name,
      primaryDesignation: Number(value?.primaryContact?.designation),
      contactEmails: value?.primaryContact?.emails,
      contactNo: value?.primaryContact?.contactNo,
      contactWhatsappNo: value?.primaryContact?.whatsappNo,
      address: value?.address,
      country: value?.country,
      state: value?.state,
      city: value?.city,
      primaryPinCode: value?.primaryPinCode,
      secondaryTitle: value?.secondaryContact?.title,
      secondaryContactName: value?.secondaryContact?.name,
      secondaryDesignation: Number(value?.secondaryContact?.designation),
      secondaryContactEmails: value?.secondaryContact?.emails,
      secondaryContactNo: value?.secondaryContact?.contactNo,
      secondaryContactWhatsappNo: value?.secondaryContact?.whatsappNo,
      secondaryAddress: value?.secondaryAddress,
      secondaryCountry: value?.secondaryCountry,
      secondaryState: value?.secondaryState,
      secondaryCity: value?.secondaryCity,
      secondaryPinCode: value?.secondaryPinCode,
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
    },
    {
      dataIndex: "consultantOrCompany",
      title: "Company type",
      render: (info) => (info ? <Text>Consultant</Text> : <Text>Company</Text>),
    },
    {
      dataIndex: "age",
      title: "Company age",
    },
    {
      dataIndex: "assignee",
      title: "Assignee",
      render: (_, props) =>
        getHighestPriorityRole(currentRoles) === "ADMIN" ? (
          <Select
            size="small"
            showSearch
            style={{ width: "100%" }}
            value={props?.assigneeId}
            placeholder="select assignee"
            options={
              leadUserNew?.map((ele) => ({
                label: ele?.fullName,
                value: ele?.id,
              })) || []
            }
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(e) => handleUpdateAssignee(e, props?.companyId)}
          />
        ) : (
          <ColComp data={props?.assignee?.fullName} />
        ),
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
      render: (_, props) => <ColComp data={props?.gstType} />,
    },

    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            dataIndex: "clientContactEmail",
            title: "Client email",
          },
          {
            dataIndex: "clientContactNo",
            title: "Client contact",
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
      render: (_, props) => (
        <OverFlowText>{props?.secondaryAddress}</OverFlowText>
      ),
    },
    {
      dataIndex: "secCity",
      title: "Secondary city",
      checked: false,
      render: (_, props) => <ColComp data={props?.secondaryCity} />,
    },
    {
      dataIndex: "secState",
      title: "Secondary state",
      checked: false,
      render: (_, props) => <ColComp data={props?.secondaryState} />,
    },
    {
      dataIndex: "seCountry",
      title: "Secondary country",
      checked: false,
      render: (_, props) => <ColComp data={props?.secondaryCountry} />,
    },
    {
      dataIndex: "convert",
      title: "Convert",
      checked: false,
      render: (_, props) => (
        <Button onClick={() => handleEditData(props)}>
          Convert to company
        </Button>
      ),
    },
  ];

  const handleFinish = (values) => {
    values.gstDocuments = values.gstDocuments?.[0]?.response;
    dispatch(
      convertServingCompanyToCompany({
        assigneeId: userid,
        updatedBy: userid,
        ...values,
      })
    )
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Serving company converted to company successfully",
          });
          form.resetFields();
          setOpenModal(false);
          setEditData(null);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch((err) =>
        notification.error({ message: "Something went wrong !." })
      );
  };

  return (
    <>
      <Flex vertical>
        <Flex className="vouchers-header">
          <MainHeading data={`Serving companies`} />
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="marginBottom8px"
        >
          <Flex gap={8} style={{ width: "30%" }}>
            <Input
              prefix={<Icon icon="fluent:search-24-regular" />}
              value={searchText}
              onChange={handleSearch}
              placeholder="search"
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
                setPaginationData({
                  page: 1,
                  size: 50,
                });
              }}
            />
          </Flex>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh", x: 2000 }}
          rowKey={(record) => record?.companyId}
          pagination={true}
          page={paginationData?.page}
          pageSize={paginationData?.size}
          totalCount={servingCompanyList?.[0]?.total}
          handlePagination={handlePagination}
        />
      </Flex>
      <Modal
        title="Serving company detail"
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
          <>
            <div className="form-grid-col-2">
              <Form.Item
                label="Serving company name"
                name="companyName"
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
                name="companyType"
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
                />
              </Form.Item>

              <Form.Item
                label="Serving company Gst number"
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

              <Form.Item
                label="Serving company pan number"
                name="panNo"
                rules={[{ validator: validatePan }]}
                validateTrigger="onBlur"
              >
                <Input maxLength={10} />
              </Form.Item>

              <Form.Item
                label="Serving company incorporate date"
                name="establishDate"
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
                name="industryId"
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
                    form.resetFields(["subsubIndustryId", "industrydataId"]);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Select category"
                name="subsubIndustryId"
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
                label="Serving company primary address"
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
                name="state"
                rules={[{ required: true, message: "please enter the state" }]}
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
                label="PinCode"
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
            <Form.Item label="Same as primary address" layout="horizontal">
              <Switch size="small" onChange={copyBillingToShipping} />
            </Form.Item>
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
          </>
        </Form>
      </Modal>
    </>
  );
};

export default ServingCompanyPage;
