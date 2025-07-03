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
  Tooltip,
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
  getCompanyByUnitId,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  formatGSTInput,
  formatPANInput,
  getHighestPriorityRole,
  gstRegex,
  panRegex,
} from "../../Common/Commons";
import ColComp from "../../../components/small/ColComp";
import CompanyHistory from "../company/CompanyHistory";
import {
  getAllCompanyType,
  getAllGstTypeByCompanyTypeId,
  getBusinessTypeByGstTypeId,
  getCompanyAction,
  updateCompanyAssignee,
  updateCompanyDetails,
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
  getAllCitiesByStateName,
  getAllCountries,
  getAllSecondaryCitiesBySecondaryStateName,
  getAllSecondaryCountries,
  getAllSecondaryStatesBySecondaryCountryName,
  getAllStatesByCountryId,
  getAllStatesByCountryName,
  handleReset,
} from "../../../Toolkit/Slices/CommonSlice";
import dayjs from "dayjs";
const { Text } = Typography;

const NewCompany = () => {
  const [form] = Form.useForm();
  const { userid } = useParams();
  const dispatch = useDispatch();
  const allUsers = useSelector((state) => state.user.allUsers);
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const newCompaniesList = useSelector((state) => state.leads.newCompaniesList);
  const allIndustry = useSelector((state) => state.industry.allMainIndustry);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const countryList = useSelector((state) => state.common.countriesList);
  const secondaryCountryList = useSelector(
    (state) => state.common.secondaryCountriesList
  );
  const statesList = useSelector((state) => state.common.statesList);
  const secondaryStateList = useSelector(
    (state) => state.common.secondaryStateList
  );
  const citiesList = useSelector((state) => state.common.citiesList);
  const secondaryCitiesList = useSelector(
    (state) => state.common.secondaryCitiesList
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList
  );
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
  const [gstMand, setGstMand] = useState({ gst: false, pan: false });
  const [presentAggrement, setPresentAggrement] = useState(false);
  const [ndaPresent, setNdaPresent] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filterUserId, setFilterUserId] = useState("");
  const [editData, setEditData] = useState(null);
  const [typeStatus, setTypeStatus] = useState("all");
  const [rating, setRating] = useState("all");
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
    setFilteredData(newCompaniesList);
  }, [newCompaniesList]);

  useEffect(() => {
    dispatch(
      getAllNewCompanies({
        userId: userid,
        page: paginationData?.page,
        size: paginationData?.size,
        type: typeStatus,
        filterUserId,
        rating,
      })
    );
  }, [dispatch, userid]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllNewCompanies({
          userId: userid,
          page: dataPage,
          size: size,
          filterUserId: filterUserId,
          type: typeStatus,
          rating,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [userid, dispatch, filterUserId, typeStatus, rating]
  );

  const filterCompanyBasedOnUser = useCallback(
    (x, e) => {
      if (e) {
        dispatch(
          getAllNewCompanies({
            userId: userid,
            page: paginationData?.page,
            size: paginationData?.size,
            type: x === "type" ? e : typeStatus,
            filterUserId: x === "user" ? e : filterUserId,
            rating: x === "rating" ? e : rating,
          })
        );
        if (x === "user") {
          setFilterUserId(e);
        } else if (x === "rating") {
          setRating(e);
        } else {
          setTypeStatus(e);
        }
      }
    },
    [paginationData, dispatch, filterUserId, typeStatus]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = newCompaniesList?.filter((item) =>
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
                filterUserId,
                rating,
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
    [dispatch, paginationData, filterUserId, rating]
  );

  const validateGSTWithState = (_, value) => {
    const stateName = form.getFieldValue("state");
    const selectedState = statesList.find((s) => s.name === stateName);

    console.log("fdvdsjbvjksdb", selectedState, value);

    if (!value || !gstRegex.test(value)) {
      return Promise.reject("Invalid GST Number");
    }

    if (selectedState && value.slice(0, 2) !== selectedState.gstCode) {
      return Promise.reject("GST code does not match selected state");
    }

    return Promise.resolve();
  };

  const validateStateWithGST = (_, value) => {
    const gstNumber = form.getFieldValue("gstNo");
    const selectedState = statesList.find((s) => s.id === value);

    console.log("fdvdsjbvjksdb", selectedState, value);

    if (selectedState && gstNumber.slice(0, 2) !== selectedState.gstCode) {
      return Promise.reject("GST code does not match selected state");
    }

    return Promise.resolve();
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  function getFileName(file) {
    if (file) {
      let temp = file?.split("/");
      return temp[temp?.length - 1];
    }
  }

  const handleUpdateCompany = (data) => {
    setEditData(data);
    dispatch(getCompanyByUnitId(data?.companyId)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        dispatch(getAllMainIndustry());
        dispatch(getAllCompanyType());
        dispatch(getClientDesiginationList());
        dispatch(getAllContactDetails());
        dispatch(getAllCountries());
        dispatch(getAllSecondaryCountries());
        let compData = resp?.payload;
        dispatch(getSubIndustryByIndustryId(compData?.industry?.id));
        dispatch(getSubSubIndustryBySubIndustryId(compData?.subIndustry?.id));
        dispatch(
          getIndustryDataBySubSubIndustryId(compData?.subSubIndustry?.id)
        );
        dispatch(getAllStatesByCountryName(compData?.country));
        dispatch(
          getAllSecondaryStatesBySecondaryCountryName(compData?.sCountry)
        );
        dispatch(getAllCitiesByStateName(compData?.state));
        dispatch(getAllSecondaryCitiesBySecondaryStateName(compData?.sState));
        dispatch(getAllGstTypeByCompanyTypeId(compData?.companyType));
        dispatch(getBusinessTypeByGstTypeId(compData?.gstType));
        form.setFieldsValue({
          companyName: compData?.companyName,
          companyType: compData?.companyType,
          gstType: compData?.gstType,
          businessType: compData?.bussinessType,
          gstNo: compData?.gstNo,
          panNo: compData?.panNo,
          establishDate: dayjs(compData?.establishDate),
          assigneeId: compData?.assigneeId,
          industryId: compData?.industry?.id,
          subIndustryId: compData?.subIndustry?.id,
          subsubIndustryId: compData?.subSubIndustry?.id,
          industrydataId: compData?.industryData?.map((item) => item?.id),
          gstDocuments: [
            {
              uid: "-1",
              name: getFileName(compData?.gstDoc),
              status: "done",
              response: compData?.gstDoc,
            },
          ],
          rating: compData?.rating,
          paymentTerm: compData?.paymentTerm,
          aggrementPresent: compData?.aggrementPresent,
          aggrement: [
            {
              uid: "-2",
              name: getFileName(compData?.aggrement),
              status: "done",
              response: compData?.aggrement,
            },
          ],
          ndaPresent: compData?.ndaPresent,
          nda: [
            {
              uid: "-3",
              name: getFileName(compData?.nda),
              status: "done",
              response: compData?.nda,
            },
          ],
          primaryTitle: compData?.primaryContact?.title,
          contactName: compData?.primaryContact?.name,
          primaryDesignation: compData?.primaryContact?.clientDesignation?.id,
          contactEmails: compData?.primaryContact?.emails,
          contactNo: compData?.primaryContact?.contactNo,
          contactWhatsappNo: compData?.primaryContact?.whatsappNo,
          secondaryTitle: compData?.secondaryContact?.title,
          secondaryContactName: compData?.secondaryContact?.name,
          secondaryDesignation:
            compData?.secondaryContact?.clientDesignation?.id,
          secondaryContactEmails:
            compData?.secondaryContact?.secondaryContactEmails,
          secondaryContactNo: compData?.secondaryContact?.contactNo,
          secondaryContactWhatsappNo: compData?.secondaryContact?.whatsappNo,
          address: compData?.address,
          country: compData?.country,
          state: compData?.state,
          city: compData?.city,
          primaryPinCode: compData?.primaryPinCode,
          secondaryAddress: compData?.sAddress,
          secondaryCountry: compData?.sCountry,
          secondaryState: compData?.sState,
          secondaryCity: compData?.sCity,
          secondaryPinCode: compData?.secondaryPinCode,
        });
      }
    });
    setOpenModal(true);
  };

  const columns = [
    {
      dataIndex: "companyId",
      title: "Id",
      fixed: "left",
      width: 50,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
      fixed: "left",
      render: (_, props) => (
        <Flex align="center" gap={12}>
          <div style={{ minWidth: "25px" }}>
            <Tooltip title={props?.rating}>
              <Icon
                icon="carbon:badge"
                width="24"
                height="24"
                style={{
                  color:
                    props?.rating === "Gold"
                      ? "#FFD700"
                      : props?.rating === "Silver"
                      ? "#C0C0C0"
                      : "#CD7F32",
                }}
              />
            </Tooltip>
          </div>
          <OverFlowText
            linkText={true}
            to={
              props?.consultantOrCompany
                ? `/erp/${userid}/sales/newcompanies/${props?.companyId}/newConsultantCompanies`
                : `/erp/${userid}/sales/newcompanies/${props?.companyId}/newCompaniesUnit`
            }
          >
            {props?.companyName}
          </OverFlowText>
        </Flex>
      ),
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
      dataIndex: "History",
      title: "Company history",
      render: (_, props) => <CompanyHistory companyId={props.companyId} />,
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, props) => (
        <Button onClick={() => handleUpdateCompany(props)}>Edit</Button>
      ),
    },
  ];

  const handleEditFinish = (values) => {
    values.id = editData?.companyId;
    values.updatedBy = userid;
    values.gstDocuments = values.gstDocuments?.[0]?.response;
    values.aggrement = values.aggrement?.[0]?.response;
    values.nda = values.nda?.[0]?.response;
    dispatch(updateCompanyDetails(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Company updated successfully !." });
          dispatch(
            getAllNewCompanies({
              userId: userid,
              page: paginationData?.page,
              size: paginationData?.size,
              type: typeStatus,
              filterUserId,
              rating,
            })
          );
          setEditData(null);
          setOpenModal(false);
          form.resetFields();
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <>
      <Flex vertical>
        <Flex className="vouchers-header">
          <MainHeading data={`New companies`} />
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="marginBottom8px"
        >
          <Flex gap={8} style={{ width: "40%" }}>
            <Input
              prefix={<Icon icon="fluent:search-24-regular" />}
              value={searchText}
              onChange={handleSearch}
              placeholder="Search"
            />
            <Select
              style={{ width: "40%" }}
              options={[
                { label: "All", value: "all" },
                { label: "Company", value: "company" },
                { label: "Consultant", value: "consultant" },
              ]}
              value={typeStatus}
              onChange={(e) => filterCompanyBasedOnUser("type", e)}
            />
            <Select
              style={{ width: "200px" }}
              options={[
                { label: "All", value: "all" },
                { label: "Gold", value: "Gold" },
                { label: "Silver", value: "Silver" },
                { label: "Bronze", value: "Bronze" },
              ]}
              value={rating}
              onChange={(e) => filterCompanyBasedOnUser("rating", e)}
            />
          </Flex>
          {getHighestPriorityRole(currentRoles) === "ADMIN" && (
            <Select
              showSearch
              allowClear
              style={{ width: "250px" }}
              placeholder="Filter out companies"
              value={filterUserId === "" ? null : filterUserId}
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
              onChange={(e) => filterCompanyBasedOnUser("user", e)}
              onClear={() => {
                dispatch(
                  getAllNewCompanies({
                    userId: userid,
                    page: paginationData?.page,
                    size: paginationData?.size,
                    type: typeStatus,
                    filterUserId: "",
                    rating,
                  })
                );
                setFilterUserId("");
              }}
            />
          )}
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh", x: 2500 }}
          rowKey={(record) => record?.companyId}
          pagination={true}
          page={paginationData?.page}
          pageSize={paginationData?.size}
          totalCount={newCompaniesList?.[0]?.total}
          handlePagination={handlePagination}
        />
      </Flex>

      <Modal
        title={"Edit company details"}
        centered
        width={"60%"}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
        onClose={() => {
          setOpenModal(false);
          form.resetFields();
          dispatch(handleReset());
        }}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ padding: "12px 24px", maxHeight: "75vh", overflow: "auto" }}
          scrollToFirstError
          onFinish={handleEditFinish}
          initialValues={{
            primaryContact: false,
            isUnit: false,
            secondaryContact: false,
            isConsultant: false,
          }}
        >
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "12px 0px",
                borderRadius: 6,
              }}
            >
              <Text className="heading-text">Company info</Text>
              <div className="form-grid-col-2">
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
                  name="bussinessType"
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
                      { validator: validateGSTWithState },
                    ]}
                  >
                    <Input
                      maxLength={15}
                      onChange={(e) => {
                        const formatted = formatGSTInput(e.target.value);
                        form.setFieldsValue({ gstNo: formatted });
                      }}
                    />
                  </Form.Item>
                )}

                {gstMand?.pan && (
                  <Form.Item
                    label="Pan number"
                    name="panNo"
                    rules={[
                      { required: true, message: "please enter pan number" },
                      {
                        validator: (_, value) =>
                          panRegex.test(value)
                            ? Promise.resolve()
                            : Promise.reject("Invalid PAN Number"),
                      },
                    ]}
                  >
                    <Input
                      maxLength={10}
                      onChange={(e) => {
                        const formatted = formatPANInput(e.target.value);
                        form.setFieldsValue({ panNo: formatted });
                      }}
                    />
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
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "12px 0px",
                borderRadius: 6,
              }}
            >
              <Text className="heading-text">Aggrement details</Text>
              <div className="form-grid-col-2">
                <Form.Item
                  label="Rating"
                  name="rating"
                  rules={[
                    {
                      required: true,
                      message: "please give rating for the company",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    options={[
                      { label: "Gold", value: "Gold" },
                      { label: "Silver", value: "Silver" },
                      { label: "Bronze", value: "Bronze" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Payment term"
                  name="paymentTerm"
                  rules={[
                    {
                      required: true,
                      message: "please give payment term for the company",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    options={[
                      { label: "Net 30", value: "Net 30" },
                      { label: "Net 60", value: "Net 60" },
                      { label: "Net 90", value: "Net 90" },
                      { label: "2/10 Net 30", value: "2/10 Net 30" },
                      {
                        label: "EOM (End of Month)",
                        value: "EOM (End of Month)",
                      },
                      {
                        label: "COD (Cash on Delivery)",
                        value: "COD (Cash on Delivery)",
                      },
                      {
                        label: "CIA (Cash in Advance)",
                        value: "CIA (Cash in Advance)",
                      },
                      { label: "Installments", value: "Installments" },
                      { label: "Milestone-based", value: "Milestone-based" },
                      { label: "Due on Receipt", value: "Due on Receipt" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Aggrement"
                  name="aggrementPresent"
                  rules={[
                    { required: true, message: "please select aggrement" },
                  ]}
                >
                  <Select
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={(e) => setPresentAggrement(e)}
                  />
                </Form.Item>

                {presentAggrement && (
                  <Form.Item
                    label="Upload aggrement document"
                    name="aggrement"
                    getValueFromEvent={normFile}
                    valuePropName="fileList"
                    rules={[
                      { required: true, message: "please upload document" },
                    ]}
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
                )}

                <Form.Item
                  label="NDA"
                  name="ndaPresent"
                  rules={[
                    { required: true, message: "please select aggrement" },
                  ]}
                >
                  <Select
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={(e) => setNdaPresent(e)}
                  />
                </Form.Item>

                {ndaPresent && (
                  <Form.Item
                    label="Upload NDA document"
                    name="nda"
                    getValueFromEvent={normFile}
                    valuePropName="fileList"
                    rules={[
                      { required: true, message: "please upload document" },
                    ]}
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
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "12px 0px",
                borderRadius: 6,
              }}
            >
              <Text className="heading-text">Contacts</Text>
              <Divider
                style={{ color: "#cccccc", margin: "8px 0px" }}
                orientation="center"
              >
                Primary contacts
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
                Secondary contact
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
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "12px 0px",
                borderRadius: 6,
              }}
            >
              <Text className="heading-text">Address</Text>

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
                    onChange={(e) => {
                      dispatch(getAllStatesByCountryName(e));
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
                    { required: true, message: "Please select the state" },
                    { validator: validateStateWithGST },
                  ]}
                >
                  <Select
                    showSearch
                    options={statesList?.map((item) => ({
                      label: item.name,
                      value: item.name,
                      gstCode: item.gstCode,
                      stateName: item.name,
                      id: item?.id,
                    }))}
                    onChange={(e) => {
                      dispatch(getAllCitiesByStateName(e));
                      form.resetFields(["city"]);
                      form.validateFields(["state", "gstNo"]).catch(() => {
                        const gstNumber = form.getFieldValue("gstNo");
                        const selectedState = statesList.find(
                          (s) => s.id === e
                        );
                        if (
                          selectedState &&
                          gstNumber &&
                          gstNumber.slice(0, 2) !== selectedState.gstCode
                        ) {
                          form.setFields([
                            {
                              name: "gstNo",
                              errors: [
                                "GST number does not match selected state",
                              ],
                            },
                            {
                              name: "state",
                              errors: [
                                "Selected state does not match GST number",
                              ],
                            },
                          ]);
                        }
                      });
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
                      secondaryCountryList?.length > 0
                        ? secondaryCountryList?.map((item) => ({
                            label: item?.name,
                            value: item?.name,
                            id: item?.id,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      dispatch(getAllSecondaryStatesBySecondaryCountryName(e));
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
                      secondaryStateList?.length > 0
                        ? secondaryStateList?.map((item) => ({
                            label: item?.name,
                            value: item?.name,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e) =>
                      dispatch(getAllSecondaryCitiesBySecondaryStateName(e))
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item label="City" name="secondaryCity">
                  <Select
                    showSearch
                    options={
                      secondaryCitiesList?.length > 0
                        ? secondaryCitiesList?.map((item) => ({
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
            </div>
          </>
        </Form>
      </Modal>
    </>
  );
};

export default NewCompany;
