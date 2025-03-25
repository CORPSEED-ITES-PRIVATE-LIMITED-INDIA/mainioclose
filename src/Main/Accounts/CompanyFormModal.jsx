import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Switch,
  Upload,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCompanyForm,
  getAllContactDetails,
  getCompanyByUnitId,
  getCompanyDetailsByGst,
  getCompanyUnitsById,
  getContactById,
} from "../../Toolkit/Slices/LeadSlice";
import { getAllUsers } from "../../Toolkit/Slices/UsersSlice";
import {
  getAllCompanyByStatus,
  getCompanyDetailsById,
  getCompanyDetailsByLeadId,
  getCompanyExistData,
  updateCompanyForm,
} from "../../Toolkit/Slices/CompanySlice";
import { useParams } from "react-router-dom";
import {
  getHighestPriorityRole,
  maskEmail,
  maskMobileNumber,
  playErrorSound,
  playSuccessSound,
  playWarningSound,
} from "../Common/Commons";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../Toolkit/Slices/IndustrySlice";
import { getClientDesiginationList } from "../../Toolkit/Slices/SettingSlice";

const CompanyFormModal = ({
  edit,
  data,
  editInfo,
  selectedFilter,
  detailView,
  paginationData,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { userid } = useParams();

  const allUsers = useSelector((state) => state.user.allUsers);
  const companyUnits = useSelector((state) => state?.leads?.companyUnits);
  const companyDetailByUnitId = useSelector(
    (state) => state?.leads?.companyDetailByUnitId
  );
  const singleLeadResponseData = useSelector(
    (state) => state.leads.singleLeadResponseData
  );
  const existingCompanyList = useSelector(
    (state) => state.company.existingCompanyList
  );
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const contactList = useSelector((state) => state?.leads?.allContactList);
  const contactDetail = useSelector((state) => state?.leads?.contactDetail);
  const companyDetail = useSelector((state) => state?.company?.companyDetail);
  const page = useSelector((state) => state.company.page);
  const allIndustry = useSelector((state) => state.industry.allMainIndustry);
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
  const [openModal, setOpenModal] = useState(false);
  const [formLoading, setFormLoading] = useState("");
  const [gstMand, setGstMand] = useState("");

  const handlePanNumberChange = (e) => {
    const value = e.target.value;
    const upperCaseValue = value.toUpperCase();
    const isValid = /^[A-Z0-9]+$/.test(upperCaseValue);
    form.setFieldsValue({ panNo: isValid ? upperCaseValue : value });
  };

  const handleButtonClick = useCallback(() => {
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getCompanyExistData(data?.id ? data?.id : data?.leadId)).then(
      (resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          if (resp.payload?.length > 0) {
            let sortedCompany =
              resp?.payload?.find((item) => item.assigneeId == userid) ||
              resp?.payload?.[0];
            if (sortedCompany?.assigneeId != userid) {
              playWarningSound();
              notification.warning({
                message: `This lead is already assigned to "${sortedCompany?.assigneeName}" for company id "${sortedCompany?.id}" company name " ${sortedCompany?.companyName}"`,
              });
            } else {
              form.setFieldsValue({
                companyId: sortedCompany?.id,
                isUnit: false,
              });
              dispatch(getCompanyUnitsById(sortedCompany?.id));
              setOpenModal(true);
            }
          } else {
            form.setFieldsValue({ isUnit: true });
            setOpenModal(true);
          }
        } else {
          setOpenModal(true);
        }
      }
    );
  }, [form, data, dispatch, userid]);

  function getFileName(file) {
    if (file) {
      let temp = file?.split("/");
      return temp[temp?.length - 1];
    }
  }

  const handleManageUnits = (e) => {
    if (e === false) {
      form.setFieldsValue({
        panNo: "",
        gstNo: "",
        isPrimaryAddress: false,
        companyAge: "",
        primaryPinCode: "",
        secondaryPinCode: "",
        assigneeId: "",
        updatedBy: "",
        state: "",
        address: "",
        country: "",
        primaryContact: false,
        primaryDesignation: "",
        primaryTitle: "",
        contactId: "",
        contactName: "",
        contactEmails: "",
        contactNo: "",
        contactWhatsappNo: "",
        city: "",
        isSecondaryAddress: false,
        scountry: "",
        saddress: "",
        sstate: "",
        secondaryContact: false,
        secondaryTitle: "",
        scontactEmails: "",
        scontactNo: "",
        scontactName: "",
        scontactWhatsappNo: "",
        secondaryDesignation: "",
        scontactId: "",
        scity: "",
        amount: "",
        comment: "",
        industryId: "",
        subIndustryId: "",
        subsubIndustryId: "",
        industrydataId: [],
      });
    }
  };

  const handleSelectUnit = (e) => {
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getCompanyByUnitId(e)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        let unitData = resp?.payload;
        dispatch(getSubIndustryByIndustryId(unitData?.industryId));
        dispatch(getSubSubIndustryBySubIndustryId(unitData?.subIndustryId));
        dispatch(getIndustryDataBySubSubIndustryId(unitData?.subSubIndustryId));
        form.setFieldsValue({
          panNo: unitData?.panNo,
          gstNo: unitData?.gstNo,
          isPrimaryAddress: true,
          companyAge: unitData?.companyAge,
          primaryPinCode: unitData?.primaryPinCode,
          secondaryPinCode: unitData?.secondaryPinCode,
          assigneeId: unitData?.assigneeId,
          updatedBy: unitData?.updatedBy?.id,
          state: unitData?.state,
          address: unitData?.address,
          country: unitData?.country,
          primaryContact: true,
          primaryDesignation: Number(unitData?.primaryContact?.designation),
          primaryTitle: unitData?.primaryContact?.title,
          contactId: unitData?.primaryContact?.contactId,
          contactName: unitData?.primaryContact?.name,
          contactEmails: unitData?.primaryContact?.emails,
          contactNo: unitData?.primaryContact?.contactNo,
          contactWhatsappNo: unitData?.primaryContact?.whatsappNo,
          city: unitData?.city,
          isSecondaryAddress: true,
          scountry: unitData?.scountry,
          saddress: unitData?.saddress,
          sstate: unitData?.sstate,
          secondaryContact: true,
          secondaryTitle: unitData?.secondaryContact?.title,
          scontactEmails: unitData?.secondaryContact?.emails,
          scontactNo: unitData?.secondaryContact?.contactNo,
          scontactName: unitData?.secondaryContact?.name,
          scontactWhatsappNo: unitData?.secondaryContact?.whatsappNo,
          secondaryDesignation: Number(unitData?.secondaryContact?.designation),
          scontactId: unitData?.secondaryContact?.scontactId,
          scity: unitData?.scity,
          amount: unitData?.amount,
          comment: unitData?.comment,
          industryId: unitData?.industryId,
          subIndustryId: unitData?.subIndustryId,
          subsubIndustryId: unitData?.subSubIndustryId,
          industrydataId: unitData?.industryData?.map((item) => item?.id),
        });
      }
    });
  };

  const handleEditBtnClick = useCallback(() => {
    if (editInfo?.id !== undefined) {
      dispatch(getAllMainIndustry());
      dispatch(getClientDesiginationList());
      dispatch(getCompanyDetailsById(editInfo?.id)).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let editData = resp?.payload;
          dispatch(getSubIndustryByIndustryId(editData?.industry?.id));
          dispatch(getSubSubIndustryBySubIndustryId(editData?.subIndustry?.id));
          dispatch(
            getIndustryDataBySubSubIndustryId(editData?.subsubIndustry?.id)
          );
          form.setFieldsValue({
            isPresent: editData?.isPresent,
            companyName: editData?.companyName,
            companyId: editData?.companyId,
            isUnit: editData?.isUnit,
            unitName: editData?.unitName,
            unitId: editData?.unitId,
            panNo: editData?.panNo,
            gstNo: editData?.gstNo,
            gstType: editData?.gstType,
            gstDocuments: [
              {
                uid: "-1",
                name: getFileName(editData?.gstDocuments),
                status: "done",
                response: editData?.gstDocuments,
              },
            ],
            isPrimaryAddress: editData?.isPrimaryAddress,
            companyAge: editData?.companyAge,
            primaryPinCode: editData?.primaryPinCode,
            secondaryPinCode: editData?.secondaryPinCode,
            assigneeId: editData?.assigneeId,
            contactId: editData?.contactId,
            contactName: editData?.contactName,
            contactEmails: editData?.contactEmails,
            contactNo: editData?.contactNo,
            contactWhatsappNo: editData?.contactWhatsappNo,
            updatedBy: editData?.updatedBy?.id,
            state: editData?.state,
            address: editData?.address,
            country: editData?.country,
            primaryContact: editData?.primaryContact,
            city: editData?.city,
            isSecondaryAddress: editData?.isSecondaryAddress,
            secondaryContact: editData?.secondaryContact,
            scountry: editData?.scountry,
            saddress: editData?.saddress,
            sstate: editData?.sstate,
            scontactEmails: editData?.scontactEmails,
            scontactNo: editData?.scontactNo,
            scontactName: editData?.scontactName,
            scity: editData?.scity,
            scontactId: editData?.scontactId,
            scontactWhatsappNo: editData?.scontactWhatsappNo,
            amount: editData?.amount,
            comment: editData?.comment,
            secondaryDesignation: Number(editData?.secondaryDesignation),
            primaryDesignation: Number(editData?.primaryDesignation),
            primaryTitle: editData?.title,
            secondaryTitle: editData?.secTitle,
            industryId: editData?.industry?.id,
            subIndustryId: editData?.subIndustry?.id,
            subsubIndustryId: editData?.subsubIndustry?.id,
            industrydataId: editData?.industryDataList?.map((item) => item?.id),
          });
        }
      });
      setOpenModal(true);
    }
  }, [dispatch, editInfo, form]);

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

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFinish = useCallback(
    (values) => {
      values.gstDocuments = values.gstDocuments?.[0]?.response;
      values.assigneeId =
        getHighestPriorityRole(currentRoles) === "ADMIN"
          ? values?.assigneeId
          : userid;
      setFormLoading("pending");
      if (edit) {
        values.companyFormId = companyDetail?.id;
        values.isPresent = companyDetail?.isPresent;
        values.leadId = singleLeadResponseData?.parent
          ? values?.leadId
          : companyDetail?.lead?.id;
        values.companyId = companyDetail?.companyId;
        dispatch(updateCompanyForm(values))
          .then((response) => {
            if (response.meta.requestStatus === "fulfilled") {
              setFormLoading("success");
              playSuccessSound();
              dispatch(
                getAllCompanyByStatus({
                  id: userid,
                  status: selectedFilter,
                  page: paginationData?.page,
                  size: paginationData?.size,
                })
              );
              notification.success({
                message: "Company created successfully.",
              });
              setOpenModal(false);
            } else {
              setFormLoading("rejected");
              playErrorSound();
              notification.error({ message: "Something went wrong !." });
              form.resetFields();
            }
          })
          .catch(() => {
            setFormLoading("rejected");
            playErrorSound();
            notification.error({ message: "Something went wrong !." });
          });
      } else {
        const formData = form.getFieldsValue(["companyId", "companyName"]);
        values.leadId = singleLeadResponseData?.parent
          ? values?.leadId
          : data?.id
          ? data?.id
          : data?.leadId;
        if (Object.keys(companyDetail)?.length > 0) {
          values.isPresent = true;
        } else {
          values.isPresent = false;
        }
        if (formData?.companyId) {
          values.companyId = companyDetail?.id;
        }

        console.log("kdsjkjasgdkjgdjh", values);
        dispatch(createCompanyForm(values))
          .then((response) => {
            if (response.meta.requestStatus === "fulfilled") {
              setFormLoading("success");
              dispatch(getAllUsers());
              notification.success({
                message: "Company created successfully.",
              });
              playSuccessSound();
              setOpenModal(false);
              form.resetFields();
            } else {
              setFormLoading("rejected");
              playErrorSound();
              notification.error({ message: "Something went wrong !." });
            }
          })
          .catch(() => {
            setFormLoading("rejected");
            playErrorSound();
            notification.error({ message: "Something went wrong !." });
          });
      }
    },
    [
      companyDetail,
      dispatch,
      form,
      data,
      companyDetail,
      userid,
      selectedFilter,
      edit,
      singleLeadResponseData,
    ]
  );

  return (
    <>
      {edit ? (
        <Button type="text" size="small" onClick={handleEditBtnClick}>
          <Icon icon="fluent:edit-24-regular" /> Edit
        </Button>
      ) : detailView ? (
        <Button size="small" type="primary" onClick={handleButtonClick}>
          <Icon icon="fluent:add-24-filled" />
          Add company
        </Button>
      ) : (
        <Button type="text" size="small" onClick={handleButtonClick}>
          <Icon icon="fluent:add-24-filled" height={18} width={18} /> Add
        </Button>
      )}

      <Modal
        title={edit ? "Edit company details" : "Create company"}
        centered
        width={"70%"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
        okButtonProps={{
          loading: formLoading === "pending" ? true : false,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: "75vh", padding: "4px", overflow: "auto" }}
          scrollToFirstError
          onFinish={handleFinish}
          initialValues={{
            primaryContact: false,
            isUnit: false,
            secondaryContact: false,
            isSecondaryAddress: false,
            isPrimaryAddress: false,
          }}
        >
          <div className="form-grid-col-2">
            {existingCompanyList?.length > 0 ? (
              <Form.Item
                label="Company name"
                name="companyId"
                rules={[
                  { required: true, message: "please select the company name" },
                ]}
              >
                <Select
                  showSearch
                  options={existingCompanyList?.map((item) => ({
                    label: item?.companyName,
                    value: item?.id,
                    disabled: item?.assigneeId != userid,
                    ...item,
                  }))}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="Company name"
                name="companyName"
                rules={[
                  { required: true, message: "please enter the company name" },
                ]}
              >
                <Input />
              </Form.Item>
            )}

            {existingCompanyList?.length > 0 && (
              <>
                <Form.Item
                  label="New units"
                  name="isUnit"
                  rules={[{ required: true }]}
                >
                  <Switch size="small" onChange={handleManageUnits} />
                </Form.Item>

                <Form.Item
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.isUnit !== currentValues.isUnit
                  }
                  noStyle
                >
                  {({ getFieldValue }) => (
                    <>
                      {getFieldValue("isUnit") ? (
                        <Form.Item
                          label="Select company unit"
                          name="unitId"
                          rules={[
                            {
                              required: true,
                              message: "please select company unit",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            allowClear
                            onChange={handleSelectUnit}
                            options={
                              companyUnits?.length > 0
                                ? companyUnits?.map((item) => ({
                                    label: item?.companyName,
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
                      ) : (
                        <Form.Item
                          label="Enter new company unit"
                          name="unitName"
                          rules={[
                            {
                              required: true,
                              message: "please enter the company unit",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      )}
                    </>
                  )}
                </Form.Item>
              </>
            )}

            <Form.Item
              label="Company age"
              name="companyAge"
              rules={[{ required: true, message: "please enter company age" }]}
            >
              <InputNumber controls={false} style={{ width: "100%" }} />
            </Form.Item>

            {singleLeadResponseData?.parent && (
              <Form.Item
                label="Select lead"
                name="leadId"
                rules={[{ required: true, message: "please select the lead" }]}
              >
                <Select
                  options={
                    singleLeadResponseData?.childLead?.length > 0
                      ? singleLeadResponseData?.childLead?.map((item) => ({
                          label: item?.childLeadName,
                          value: item?.childId,
                        }))
                      : []
                  }
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            )}

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
                options={[
                  { label: "Registered", value: "Registered" },
                  { label: "Unregisterded", value: "Unregistered" },
                  { label: "SE2", value: "SE2" },
                  { label: "International", value: "International" },
                ]}
                onChange={(e) => setGstMand(e)}
              />
            </Form.Item>

            <Form.Item
              label="Gst number"
              name="gstNo"
              rules={
                gstMand === "Registered" || gstMand === ""
                  ? [
                      {
                        required: true,
                        message: "",
                      },
                      {
                        validator: validateGstNumber(dispatch),
                      },
                    ]
                  : []
              }
            >
              <Input maxLength={15} />
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
                { required: true, message: "please select the sub industry" },
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
              label="Select sub-sub-industry"
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
              label="Select industry data"
              name="industrydataId"
              rules={[
                { required: true, message: "please select the industry data" },
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

            {Object.keys(companyDetail)?.length === 0 &&
              getHighestPriorityRole(currentRoles) === "ADMIN" && (
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
              )}

            <Form.Item label="Pan number" name="panNo">
              <Input maxLength={10} onChange={handlePanNumberChange} />
            </Form.Item>

            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: "please enter amount" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Upload gst document"
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

          <Divider style={{ color: "#cccccc" }} orientation="center">
            Primary details
          </Divider>
          <div className="form-grid-col-2">
            <Form.Item
              label="New primary contact details"
              name="primaryContact"
              rules={[{ required: true }]}
            >
              <Switch size="small" />
            </Form.Item>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.primaryContact !== currentValues.primaryContact
              }
              noStyle
            >
              {({ getFieldValue }) => (
                <>
                  {getFieldValue("primaryContact") ? (
                    <>
                      <Form.Item
                        label="Salutation"
                        name="primaryTitle"
                        rules={[
                          {
                            required: true,
                            message:
                              "please select salutation for contact name",
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
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
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
                    </>
                  ) : (
                    <Form.Item
                      label="Select contact"
                      name="contactId"
                      rules={[
                        { required: true, message: "please select contact" },
                      ]}
                    >
                      <Select
                        showSearch
                        allowClear
                        onChange={(e) => dispatch(getContactById(e))}
                        options={
                          contactList?.length > 0
                            ? contactList?.map((item) => ({
                                label: `${maskEmail(
                                  item?.emails
                                )} || ${maskMobileNumber(item?.contactNo)} `,
                                value: item?.id,
                                email: item?.emails,
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
                  )}
                </>
              )}
            </Form.Item>

            <Form.Item label="Add new primary address" name="isPrimaryAddress">
              <Switch size="small" />
            </Form.Item>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isPrimaryAddress !== currentValues.isPrimaryAddress
              }
              noStyle
            >
              {({ getFieldValue }) => (
                <>
                  {getFieldValue("isPrimaryAddress") ? (
                    <>
                      <Form.Item
                        label="Primary address"
                        name="address"
                        rules={[
                          {
                            required: true,
                            message: "please enter the address",
                          },
                        ]}
                      >
                        <Input.TextArea />
                      </Form.Item>

                      <Form.Item
                        label="City"
                        name="city"
                        rules={[
                          { required: true, message: "please enter the city" },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="State"
                        name="state"
                        rules={[
                          { required: true, message: "please enter the state" },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="Country"
                        name="country"
                        rules={[
                          {
                            required: true,
                            message: "please enter the country",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="PinCode"
                        name="primaryPinCode"
                        rules={[
                          { required: true, message: "please enter pincode" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </>
                  ) : null}
                </>
              )}
            </Form.Item>
          </div>

          <Divider style={{ color: "#cccccc" }} orientation="center">
            Secondary details
          </Divider>
          <div className="form-grid-col-2">
            <Form.Item
              label="New secondary contact details"
              name="secondaryContact"
              rules={[{ required: true }]}
            >
              <Switch size="small" />
            </Form.Item>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.secondaryContact !== currentValues.secondaryContact
              }
              noStyle
            >
              {({ getFieldValue }) => (
                <>
                  {getFieldValue("secondaryContact") ? (
                    <>
                      <Form.Item
                        label="Salutation"
                        name="secondaryTitle"
                        rules={[
                          {
                            required: true,
                            message:
                              "please select salutation for contact name ",
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
                        name="scontactName"
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
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        label="Email"
                        name="scontactEmails"
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
                        name="scontactNo"
                        rules={[
                          {
                            required: true,
                            message: "please enter contact number",
                          },
                        ]}
                      >
                        <Input maxLength={10} />
                      </Form.Item>

                      <Form.Item
                        label="Whatsapp number"
                        name="scontactWhatsappNo"
                        rules={[
                          {
                            required: true,
                            message: "please enter whatsapp number",
                          },
                        ]}
                      >
                        <Input maxLength={10} />
                      </Form.Item>
                    </>
                  ) : (
                    <Form.Item
                      label="Select contact"
                      name="scontactId"
                      rules={[
                        { required: true, message: "please select contact" },
                      ]}
                    >
                      <Select
                        showSearch
                        allowClear
                        onChange={(e) => dispatch(getContactById(e))}
                        options={
                          contactList?.length > 0
                            ? contactList?.map((item) => ({
                                label: `${maskEmail(
                                  item?.emails
                                )} || ${maskMobileNumber(item?.contactNo)} `,
                                value: item?.id,
                                email: item?.emails,
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
                  )}
                </>
              )}
            </Form.Item>

            <Form.Item
              label="Add new secondary address"
              name="isSecondaryAddress"
            >
              <Switch size="small" />
            </Form.Item>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isSecondaryAddress !==
                currentValues.isSecondaryAddress
              }
              noStyle
            >
              {({ getFieldValue }) => (
                <>
                  {getFieldValue("isSecondaryAddress") ? (
                    <>
                      <Form.Item label="Address" name="saddress">
                        <Input.TextArea />
                      </Form.Item>

                      <Form.Item label="City" name="scity">
                        <Input />
                      </Form.Item>

                      <Form.Item label="State" name="sstate">
                        <Input />
                      </Form.Item>

                      <Form.Item label="Country" name="scountry">
                        <Input />
                      </Form.Item>

                      <Form.Item label="PinCode" name="secondaryPinCode">
                        <Input />
                      </Form.Item>
                    </>
                  ) : null}
                </>
              )}
            </Form.Item>
            {edit && (
              <Form.Item
                label="Comment"
                name="comment"
                rules={[
                  { required: true, message: "please write the comment " },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CompanyFormModal;
