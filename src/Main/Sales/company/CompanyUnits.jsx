import React, { lazy, Suspense, useEffect, useState } from "react";
import TableOutlet from "../../../components/design/TableOutlet";
import MainHeading from "../../../components/design/MainHeading";
import { useDispatch, useSelector } from "react-redux";
import OverFlowText from "../../../components/OverFlowText";
import TableScalaton from "../../../components/TableScalaton";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Upload,
} from "antd";
import {
  getAllLeadUser,
  getCompanyByUnitId,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import { getHighestPriorityRole } from "../../Common/Commons";
import {
  getAllCompanyUnits,
  updateCompanyData,
} from "../../../Toolkit/Slices/CompanySlice";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../../Toolkit/Slices/IndustrySlice";
import { getClientDesiginationList } from "../../../Toolkit/Slices/SettingSlice";
import { Icon } from "@iconify/react";
import { getAllUsers } from "../../../Toolkit/Slices/UsersSlice";
const CommonTable = lazy(() => import("../../../components/CommonTable"));

const CompanyUnits = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [companyForm] = Form.useForm();
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const allUsers = useSelector((state) => state.user.allUsers);
  const allUnits = useSelector((state) => state.company.allCompanyUnits);
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
  const [updatedData, setUpdatedData] = useState(null);

  function getFileName(file) {
    if (file) {
      let temp = file?.split("/");
      return temp[temp?.length - 1];
    }
  }

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleUpdate = (value) => {
    dispatch(getAllUsers());
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getCompanyByUnitId(value?.id)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        let companyEditData = resp?.payload;
        dispatch(getSubIndustryByIndustryId(companyEditData?.industryId));
        dispatch(
          getSubSubIndustryBySubIndustryId(companyEditData?.subIndustryId)
        );
        dispatch(
          getIndustryDataBySubSubIndustryId(companyEditData?.subSubIndustryId)
        );
        companyForm.setFieldsValue({
          companyName: companyEditData?.name,
          panNo: companyEditData?.panNo,
          gstNo: companyEditData?.gstNo,
          gstType: companyEditData?.gstType,
          gstDocuments: [
            {
              uid: "-1",
              name: getFileName(companyEditData?.gstDoc),
              status: "done",
              response: companyEditData?.gstDoc,
            },
          ],
          companyAge: companyEditData?.companyAge,
          primaryTitle: companyEditData?.primaryContact?.title,
          primaryPinCode: companyEditData?.primaryPinCode,
          secondaryTitle: companyEditData?.secondaryContact?.title,
          secondaryAddress: companyEditData?.sAddress,
          secondaryCity: companyEditData?.sCity,
          secondaryState: companyEditData?.sState,
          secondaryPinCode: companyEditData?.secondaryPinCode,
          secondaryCountry: companyEditData?.sCountry,
          assigneeId: companyEditData?.assigneeId,
          status: companyEditData?.status,
          contactId: companyEditData?.primaryContact?.id,
          contactName: companyEditData?.primaryContact?.name,
          contactEmails: companyEditData?.primaryContact?.emails,
          contactNo: companyEditData?.primaryContact?.contactNo,
          contactWhatsappNo: companyEditData?.primaryContact?.whatsappNo,
          primaryDesignation: companyEditData?.designation,
          secondaryContactId: companyEditData?.secondaryContact?.id,
          secondaryContactName: companyEditData?.secondaryContact?.name,
          secondaryContactEmails: companyEditData?.secondaryContact?.emails,
          secondaryContactNo: companyEditData?.secondaryContact?.contactNo,
          secondaryContactWhatsappNo:
            companyEditData?.secondaryContact?.whatsappNo,
          secondaryDesignation: companyEditData?.secondaryContact?.designation,
          industryId: companyEditData?.industryId,
          subIndustryId: companyEditData?.subIndustryId,
          subsubIndustryId: companyEditData?.subSubIndustryId,
          industrydataId: companyEditData?.industryData?.map(
            (item) => item?.id
          ),
          state: companyEditData?.state,
          address: companyEditData?.address,
          country: companyEditData?.country,
          city: companyEditData?.city,
        });
      }
    });
    setUpdatedData(value);
    setOpenModal(true);
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      width: 50,
      fixed: "left",
    },
    {
      title: "Company name",
      dataIndex: "companyName",
      render: (_, record) => <OverFlowText>{record?.companyName}</OverFlowText>,
      fixed: "left",
    },
    {
      title: "Assignee",
      dataIndex: "assignee",
      render: (_, record) => (
        <OverFlowText>{record?.assignee?.fullName}</OverFlowText>
      ),
    },
    {
      dataIndex: "primaryContact",
      title: "Client name",
      render: (_, record) => (
        <OverFlowText>{record?.primaryContact?.name}</OverFlowText>
      ),
    },
    {
      dataIndex: "primarydesigination",
      title: "Desigination",
      checked: false,
      render: (_, record) => (
        <OverFlowText>{record?.primaryContact?.designation}</OverFlowText>
      ),
    },
    {
      title: "Contact no.",
      dataIndex: "primaryContact",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.contactNo}</OverFlowText>
      ),
    },
    {
      title: "Email",
      dataIndex: "emails",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.emails}</OverFlowText>
      ),
    },
    {
      title: "Whtasapp",
      dataIndex: "Whtasapp",
      render: (_, data) => (
        <OverFlowText>{data?.primaryContact?.whatsappNo}</OverFlowText>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (_, record) => <OverFlowText>{record?.address}</OverFlowText>,
    },
    {
      title: "City",
      dataIndex: "city",
      render: (_, record) => <OverFlowText>{record?.city}</OverFlowText>,
    },
    {
      title: "State",
      dataIndex: "state",
    },
    {
      title: "Country",
      dataIndex: "country",
    },
    {
      title: "Sec contact no.",
      dataIndex: "secondaryContact",
      render: (_, data) => (
        <OverFlowText>{data?.secondaryContact?.contactNo}</OverFlowText>
      ),
    },
    {
      title: "Sec address",
      dataIndex: "secAddress",
      render: (_, record) => <OverFlowText>{record?.secAddress}</OverFlowText>,
    },
    {
      title: "Sec city",
      dataIndex: "secCity",
      render: (_, record) => <OverFlowText>{record?.secCity}</OverFlowText>,
    },
    {
      title: "Sec city",
      dataIndex: "secState",
    },
    {
      title: "Sec country",
      dataIndex: "seCountry",
    },
    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            dataIndex: "update",
            title: "Update company name",
            render: (_, props) => (
              <Button onClick={() => handleUpdate(props)}>Edit</Button>
            ),
          },
        ]
      : []),
  ];

  const handleUpdateCompanyName = (values) => {
    values.gstDocuments = values.gstDocuments?.[0]?.response;
    dispatch(
      updateCompanyData({
        companyId: updatedData?.id,
        contactId: updatedData?.primaryContact?.id,
        secondaryContactId: updatedData?.secondaryContact?.id,
        updatedBy: userid,
        ...values,
      })
    )
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Company unit updated successfully !.",
          });
          companyForm.resetFields();
          setUpdatedData(null);
          setOpenModal(false);
          dispatch(getAllCompanyUnits(updatedData?.id));
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"All company units"} />
      </div>
      <>
        <Suspense fallback={<TableScalaton />}>
          <CommonTable
            data={allUnits}
            columns={columns}
            scroll={{ y: 650, x: 2000 }}
          />
        </Suspense>
      </>
      <Modal
        title="Update company unit"
        width={"70%"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => companyForm.submit()}
        okText="Submit"
      >
        <Form
          form={companyForm}
          layout="vertical"
          onFinish={handleUpdateCompanyName}
          style={{ maxHeight: "70vh", overflow: "auto" }}
        >
          <div className="form-grid-col-2">
            <Form.Item
              label="Company name"
              name="companyName"
              rules={[
                {
                  required: true,
                  message: "please enter the company name",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Company age"
              name="companyAge"
              rules={[{ required: true, message: "please enter company age" }]}
            >
              <InputNumber controls={false} style={{ width: "100%" }} />
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
                options={[
                  { label: "Registered", value: "Registered" },
                  { label: "Unregisterded", value: "Unregistered" },
                  { label: "SE2", value: "SE2" },
                  { label: "International", value: "International" },
                ]}
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

            <Form.Item label="Pan number" name="panNo">
              <Input maxLength={10} />
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
                  companyForm.resetFields([
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
                  companyForm.resetFields([
                    "industrydataId",
                    "subsubIndustryId",
                  ]);
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
                  companyForm.resetFields(["industrydataId"]);
                }}
              />
            </Form.Item>

            <Form.Item
              label="Select industry data"
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
              label="Select assignee"
              name="assigneeId"
              rules={[{ required: true, message: "please select assignee" }]}
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
              label="Primary city"
              name="city"
              rules={[{ required: true, message: "please enter the city" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Primary state"
              name="state"
              rules={[{ required: true, message: "please enter the state" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Primary country"
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
              label="Primary pinCode"
              name="primaryPinCode"
              rules={[{ required: true, message: "please enter pincode" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <Divider style={{ color: "#cccccc" }} orientation="center">
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
                  option.label.toLowerCase().includes(input.toLowerCase())
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

            <Form.Item label="Secondary address" name="saddress">
              <Input.TextArea />
            </Form.Item>

            <Form.Item label="Secondary city" name="scity">
              <Input />
            </Form.Item>

            <Form.Item label="Secondary state" name="sstate">
              <Input />
            </Form.Item>

            <Form.Item label="Secondary country" name="scountry">
              <Input />
            </Form.Item>

            <Form.Item label="Secondary pinCode" name="secondaryPinCode">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </TableOutlet>
  );
};

export default CompanyUnits;
