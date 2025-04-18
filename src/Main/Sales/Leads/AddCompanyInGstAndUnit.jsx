import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Switch,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../../Toolkit/Slices/IndustrySlice";
import { getClientDesiginationList } from "../../../Toolkit/Slices/SettingSlice";
import {
  getAllContactDetails,
  getContactById,
  getGstDetailsByCompanyId,
} from "../../../Toolkit/Slices/LeadSlice";
import { Icon } from "@iconify/react";
import { maskEmail, maskMobileNumber } from "../../Common/Commons";
import {
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
} from "../../../Toolkit/Slices/CommonSlice";
import {
  addCompanyInGst,
  getAllCompanyType,
} from "../../../Toolkit/Slices/CompanySlice";
import { getAllUsers } from "../../../Toolkit/Slices/UsersSlice";

const AddCompanyInGstAndUnit = ({ gstField }) => {
  const dispatch = useDispatch();
  const { companyId } = useParams();
  const [form] = Form.useForm();
  const allIndustry = useSelector((state) => state.industry.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.industry.subIndustryListByIndustryId
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const subSubIndustryListById = useSelector(
    (state) => state.industry.subSubIndustryListBySubIndustryId
  );
  const industryDataListById = useSelector(
    (state) => state.industry.industryDataListBySubSubIndustryId
  );
  const contactList = useSelector((state) => state?.leads?.allContactList);
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allUsers = useSelector((state) => state.user.allUsers);

  const [openModal, setOpenModal] = useState(false);
  const [gstMand, setGstMand] = useState(false);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
    dispatch(getAllUsers());
    dispatch(getAllCompanyType());
  }, [dispatch]);

  const handleFinish = (values) => {
    values.gstDocuments = values.gstDocuments?.[0]?.response;
    values.companyId = companyId;

    dispatch(addCompanyInGst(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Company created successfully" });
          setOpenModal(false);
          form.resetFields();
          dispatch(getGstDetailsByCompanyId(companyId));
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
      <Button type="primary" onClick={() => setOpenModal(true)}>
        {gstField ? "Add Gst" : "Add company unit"}
      </Button>
      <Modal
        title={gstField ? "Add GST unit " : "Add company unit"}
        open={openModal}
        width={"60%"}
        centered
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{
            primaryContact: false,
            isPrimaryAddress: false,
            secondaryContact: false,
            isSecondaryAddress: false,
          }}
          style={{ maxHeight: "60vh", padding: 4, overflow: "auto" }}
        >
          <div className="grid-container-2-col">
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

              <Form.Item
                label="Gst number"
                name="gstNo"
                rules={[
                  {
                    required: true,
                    message: "please enter gst number",
                  },
                ]}
              >
                <Input maxLength={15} />
              </Form.Item>
          </div>

          <Divider style={{ color: "#cccccc" }} orientation="center">
            Primary details
          </Divider>
          <div className="grid-container-2-col">
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
              label="Country"
              name="country"
              rules={[
                {
                  required: true,
                  message: "please enter the country",
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

          <Divider style={{ color: "#cccccc" }} orientation="center">
            Secondary details
          </Divider>

          <div className="grid-container-2-col">
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
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
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
                    </>
                  ) : (
                    <Form.Item
                      label="Select contact"
                      name="secondaryContactId"
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

            <Form.Item label="Address" name="saddress">
              <Input.TextArea />
            </Form.Item>

            <Form.Item label="Country" name="scountry">
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
            <Form.Item label="State" name="sstate">
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

            <Form.Item label="City" name="scity">
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
        </Form>
      </Modal>
    </>
  );
};

export default AddCompanyInGstAndUnit;
