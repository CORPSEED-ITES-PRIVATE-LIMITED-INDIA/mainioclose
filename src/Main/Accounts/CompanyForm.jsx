import React, { useCallback, useEffect, useState } from "react";
import MainHeading from "../../components/design/MainHeading";
import CommonTable from "../../components/CommonTable";
import TableOutlet from "../../components/design/TableOutlet";
import { useDispatch, useSelector } from "react-redux";
import {
  addCommentCompanyForm,
  getAllCompanyByStatus,
  getFormComment,
  searchCompanyForm,
} from "../../Toolkit/Slices/CompanySlice";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Radio,
  Select,
  Tooltip,
  Typography,
} from "antd";
import {
  getAllContactDetails,
  updateStatusById,
} from "../../Toolkit/Slices/LeadSlice";
import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
import OverFlowText from "../../components/OverFlowText";
import ColComp from "../../components/small/ColComp";
import CompanyFormModal from "./CompanyFormModal";
import { getAllUsers } from "../../Toolkit/Slices/UsersSlice";
import {
  getHighestPriorityRole,
  maskEmail,
  maskMobileNumber,
} from "../Common/Commons";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../components/Constants";
const { Text } = Typography;
const { Search } = Input;

const CompanyForm = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const leadCompanyList = useSelector(
    (state) => state.company.allLeadCompanyList
  );
  const page = useSelector((state) => state.company.page);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const adminRole = currentRoles.includes("ADMIN");
  const [selectedFilter, setSelectedFilter] = useState("initiated");
  const [openModal, setOpenModal] = useState(false);
  const [formId, setFormId] = useState(null);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(
      getAllCompanyByStatus({
        id: userid,
        status: selectedFilter,
        page: paginationData?.page,
        size: paginationData?.size,
      })
    );
  }, [dispatch, selectedFilter, userid]);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllContactDetails());
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllCompanyByStatus({
          id: userid,
          status: selectedFilter,
          page: dataPage,
          size: size,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [userid, selectedFilter, dispatch]
  );

  const onSearchLead = (e, b, c) => {
    dispatch(
      searchCompanyForm({
        inputText: e,
        userId: userid,
        page: paginationData?.page,
        size: paginationData?.size,
        status: selectedFilter,
      })
    );
    if (!b) {
      dispatch(
        searchCompanyForm({
          inputText: "",
          userId: userid,
          page: paginationData?.page,
          size: paginationData?.size,
          status: selectedFilter,
        })
      );
    }
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      fixed: "left",
      width: 80,
    },
    {
      title: "Company name",
      dataIndex: "companyName",
      fixed: "left",
      render: (_, value) => <OverFlowText>{value?.companyName}</OverFlowText>,
    },
    {
      title: "Lead id",
      dataIndex: "leadsId",
      render: (_, data) => <OverFlowText>{data?.lead?.id}</OverFlowText>,
    },
    {
      title: "Lead name",
      dataIndex: "leads",
      render: (_, data) => <OverFlowText>{data?.lead?.leadName}</OverFlowText>,
    },
    {
      title: "Pan number",
      dataIndex: "panNo",
      render: (_, data) => <ColComp data={data?.panNo} />,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_, data) => <ColComp data={data?.amount} />,
    },
    {
      title: "Gst type",
      dataIndex: "gstType",
      render: (_, data) => <ColComp data={data?.gstType} />,
    },
    {
      title: "Gst no.",
      dataIndex: "gstNo",
      render: (_, data) => <ColComp data={data?.gstNo} />,
    },
    {
      title: "Company age",
      dataIndex: "companyAge",
      render: (_, data) => <ColComp data={data?.companyAge} />,
    },

    {
      title: "Contact name",
      dataIndex: "contactName",
      render: (_, data) => <OverFlowText>{data?.contactName}</OverFlowText>,
    },
    {
      title: "Desigination",
      dataIndex: "desigination",
      render: (_, data) => (
        <OverFlowText>{data?.primaryDesignation?.name}</OverFlowText>
      ),
    },
    {
      title: "Contact number",
      dataIndex: "contactNo",
      render: (_, data) =>
        adminRole ? (
          <Tooltip title={`${data?.contactNo}`}>
            <Text>{maskMobileNumber(data?.contactNo) || "NA"}</Text>
          </Tooltip>
        ) : (
          <Text>{maskMobileNumber(data?.contactNo) || "NA"}</Text>
        ),
    },
    {
      title: "Contact whatsapp",
      dataIndex: "contactWhatsappNo",
      render: (_, data) =>
        adminRole ? (
          <Tooltip title={`${data?.contactWhatsappNo}`}>
            <Text>{maskMobileNumber(data?.contactWhatsappNo) || "NA"}</Text>
          </Tooltip>
        ) : (
          <Text>{maskMobileNumber(data?.contactWhatsappNo) || "NA"}</Text>
        ),
    },
    {
      title: "Contact email",
      dataIndex: "contactEmails",
      render: (_, data) =>
        adminRole ? (
          <Tooltip title={`${data?.contactEmails}`}>
            <Text>{maskEmail(data?.contactEmails) || "NA"}</Text>
          </Tooltip>
        ) : (
          <Text>{maskEmail(data?.contactEmails) || "NA"}</Text>
        ),
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
      title: "SContact name",
      dataIndex: "secondaryContactName",
      render: (_, data) => <ColComp data={data?.secondaryContactName} />,
    },
    {
      title: "S Desigination",
      dataIndex: "secondarydesigination",
      render: (_, data) => <ColComp data={data?.secondaryDesignation?.name} />,
    },
    {
      title: "SContact number",
      dataIndex: "secondaryContactNo",
      render: (_, data) =>
        adminRole ? (
          <Tooltip title={`${data?.secondaryContactNo}`}>
            <Text>{maskMobileNumber(data?.secondaryContactNo) || "NA"}</Text>
          </Tooltip>
        ) : (
          <Text>{maskMobileNumber(data?.secondaryContactNo) || "NA"}</Text>
        ),
    },
    {
      title: "SContact whatsapp",
      dataIndex: "secondaryContactWhatsappNo",
      render: (_, data) =>
        adminRole ? (
          <Tooltip title={`${data?.secondaryContactWhatsappNo}`}>
            <Text>
              {maskMobileNumber(data?.secondaryContactWhatsappNo) || "NA"}
            </Text>
          </Tooltip>
        ) : (
          <Text>
            {maskMobileNumber(data?.secondaryContactWhatsappNo) || "NA"}
          </Text>
        ),
    },
    {
      title: "SContact email",
      dataIndex: "secondaryContactEmails",
      render: (_, data) =>
        adminRole ? (
          <Tooltip title={`${data?.secondaryContactEmails}`}>
            <Text>{maskEmail(data?.secondaryContactEmails) || "NA"}</Text>
          </Tooltip>
        ) : (
          <Text>{maskEmail(data?.secondaryContactEmails) || "NA"}</Text>
        ),
    },
    {
      title: "Secondary address",
      dataIndex: "sAddress",
      render: (_, value) => <OverFlowText>{value?.sAddress}</OverFlowText>,
    },
    {
      title: "Secondary city",
      dataIndex: "sCity",
      render: (_, data) => <ColComp data={data?.sCity} />,
    },
    {
      title: "Secondary state",
      dataIndex: "sState",
      render: (_, data) => <ColComp data={data?.sState} />,
    },
    {
      title: "Secondary sountry",
      dataIndex: "sCountry",
      render: (_, data) => <ColComp data={data?.sCountry} />,
    },
    {
      title: "Secondary pincode",
      dataIndex: "secondaryPinCode",
      render: (_, data) => <ColComp data={data?.secondaryPinCode} />,
    },
    {
      title: "Updated by",
      dataIndex: "updatedBy",
      render: (_, data) => <ColComp data={data?.updatedBy?.fullName} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (_, data) => <OverFlowText>{data?.comment}</OverFlowText>,
    },

    {
      title: "Industry",
      dataIndex: "industry",
      render: (_, data) => <OverFlowText>{data?.industry}</OverFlowText>,
    },
    {
      title: "Sub industry",
      dataIndex: "subIndustry",
      render: (_, data) => <OverFlowText>{data?.subIndustry}</OverFlowText>,
    },
    {
      title: "Sub sub industry",
      dataIndex: "subSubIndustry",
      render: (_, data) => <OverFlowText>{data?.subSubIndustry}</OverFlowText>,
    },
    {
      title: "Industry data",
      dataIndex: "industryData",
      render: (_, data) => (
        <Flex gap={2} wrap>
          {data?.industryData?.length > 0
            ? data?.industryData?.map((item) => <Text>{item?.name}</Text>)
            : "NA"}
        </Flex>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (_, data) =>
        data.status === "approved" ? (
          <Text>Approved</Text>
        ) : data.status === "disapproved" ? (
          <Text>Disapproved</Text>
        ) : (
          "Initiated"
        ),
    },
    ...(getHighestPriorityRole(currentRoles) !== "ADMIN" &&
    (selectedFilter === "initiated" || selectedFilter === "disapproved")
      ? [
          {
            title: "Edit company",
            dataIndex: "editCompanyDetails",
            render: (_, records) => (
              <CompanyFormModal
                editInfo={records}
                edit={true}
                totalCount={leadCompanyList?.[0]?.totalLeadFor}
                selectedFilter={selectedFilter}
                paginationData={paginationData}
              />
            ),
          },
        ]
      : getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            title: "Edit company",
            dataIndex: "editCompanyDetails",
            render: (_, records) => (
              <CompanyFormModal
                editInfo={records}
                edit={true}
                selectedFilter={selectedFilter}
                page={paginationData?.page}
                pageSize={paginationData?.size}
              />
            ),
          },
        ]
      : []),
    ...(currentUserDetail?.department === "Accounts" ||
    getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            title: "Approved / Disapproved",
            dataIndex: "status",
            render: (_, value) => {
              return (
                <>
                  <Button
                    size="small"
                    type="text"
                    onClick={() => {
                      setFormId(value?.id);
                      setOpenModal(true);
                      dispatch(getFormComment(value?.id)).then((resp) => {
                        if (resp.meta.requestStatus === "fulfilled") {
                          form.setFieldsValue({
                            comment: resp?.payload,
                            status: value?.status,
                          });
                        }
                      });
                    }}
                  >
                    Approval
                  </Button>
                </>
              );
            },
          },
        ]
      : []),
  ];

  const handleSubmit = useCallback(
    (values) => {
      dispatch(
        updateStatusById({
          status: values?.status,
          id: formId,
          userid: userid,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Status update successfully",
            });
            setOpenModal(false);
            getAllCompanyByStatus({
              id: userid,
              status: selectedFilter,
              page: page,
            });
          } else {
            notification.error({
              message: "Something went wrong in status !.",
            });
          }
        })
        .catch(() => {
          notification.error({
            message: "Something went wrong in status !.",
          });
        });
      dispatch(addCommentCompanyForm({ id: formId, comment: values?.comment }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Comment update successfully",
            });
            setOpenModal(false);
          } else {
            notification.error({
              message: "Something went wrong in comment !.",
            });
          }
        })
        .catch(() => {
          notification.error({
            message: "Something went wrong in comment !.",
          });
        });
    },
    [formId, userid, dispatch]
  );

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"Lead forms"} />
      </div>
      <div className="mt-3">
        <div className="flex-verti-center-hori-start">
          <Search
            size="small"
            onSearch={onSearchLead}
            style={{ width: "220px" }}
            placeholder="search"
            onChange={(e) =>
              !e.target.value
                ? dispatch(
                    searchCompanyForm({
                      inputText: "",
                      userId: userid,
                      page: paginationData?.page,
                      size: paginationData?.size,
                      status: selectedFilter,
                    })
                  )
                : ""
            }
            enterButton="search"
            prefix={<Icon icon="fluent:search-24-regular" />}
          />
          <Select
            style={{ width: "220px" }}
            showSearch
            size="small"
            value={selectedFilter}
            options={[
              { label: "Initiated", value: "initiated" },
              { label: "Approved", value: "approved" },
              { label: "Disapproved", value: "disapproved" },
            ]}
            onChange={(e) => {
              setSelectedFilter(e);
              setPaginationData({
                page: 1,
                size: 50,
              });
            }}
          />
        </div>
        <CommonTable
          data={leadCompanyList}
          columns={columns}
          scroll={{ x: 5000, y: "67vh" }}
          rowSelection={true}
          page={paginationData?.page}
          pageSize={paginationData?.size}
          rowKey={(record) => record?.id}
          pagination={true}
          totalCount={leadCompanyList?.[0]?.totalLeadFor}
          handlePagination={handlePagination}
        />
      </div>
      <Modal
        title="Company form Status"
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        open={openModal}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "please select the status" }]}
          >
            <Radio.Group>
              <Radio value="approved">Approved</Radio>
              <Radio value="disapproved">Disapproved</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ required: true, message: "please give the comment" }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </TableOutlet>
  );
};

export default CompanyForm;
