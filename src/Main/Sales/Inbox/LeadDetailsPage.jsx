import React, { useCallback, useEffect, useState } from "react";
import "./LeadDetailsPage.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  changeLeadAssigneeLeads,
  changeLeadStatus,
  createLeadContacts,
  deleteLeadContact,
  editViewData,
  getAllRemarkAndCommnts,
  getAllStatusListByUserId,
  getSingleLeadDataByLeadID,
  handleLeadassignedToSamePerson,
  updateAddressInLeads,
  updateAutoAssignnee,
  updateIndustriesInLeads,
  updateLeadDescription,
  updateLeadsContact,
  updateOriginalNameInLeads,
  updateSingleLeadName,
} from "../../../Toolkit/Slices/LeadSlice";
import BulkFileUploader from "../Leads/BulkFileUploader";
import {
  Button,
  Col,
  Collapse,
  Divider,
  Flex,
  Form,
  Input,
  List,
  Modal,
  notification,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { Icon } from "@iconify/react";
import { playErrorSound, playSuccessSound } from "../../Common/Commons";
import CompanyFormModal from "../../Accounts/CompanyFormModal";
import LeadComments from "./LeadComments";
import LeadCompany from "../Leads/LeadCompany";
import {
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
} from "../../../Toolkit/Slices/CommonSlice";
import {
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../../Toolkit/Slices/IndustrySlice";
const { Text } = Typography;

toast.configure();

const LeadDetailsPage = ({ leadid }) => {
  const [form1] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [industryForm] = Form.useForm();
  const { userid } = useParams();
  const dispatch = useDispatch();
  const [descriptionText, setDescriptionText] = useState("");
  const currentUserRoles = useSelector((state) => state?.auth?.roles);
  const allLeadUrl = useSelector((prev) => prev?.leadurls.allUrlList);
  const userDataResponse = useSelector(
    (state) => state.leads.getAllLeadUserData
  );
  const getAllStatus = useSelector((state) => state.leads.statusListById);
  const singleLeadResponseData = useSelector(
    (state) => state.leads.singleLeadResponseData
  );
  const notesApiData = useSelector((state) => state.leads.remarkData);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const clientsContact = useSelector((state) => state.leads.clientsContact);
  const complianceDocumentList = useSelector(
    (state) => state.leads.complianceDocumentList
  );
  const leadDetailLoading = useSelector(
    (state) => state.leads.leadDetailLoading
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const slugList = useSelector((state) => state.leadslug.slugList);
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
  const [openModal, setOpenModal] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [updateLeadNameToggle, setUpdateLeadNameToggle] = useState(true);
  const [updateOriginalName, setUpdateOriginalName] = useState(false);
  const [updatedLeadName, setUpdatedLeadName] = useState("");
  const [showDescriptionField, setShowDescriptionField] = useState(false);
  const [assigneValue, setAssigneValue] = useState(null);
  const [document, setDocument] = useState("");
  const [openDocumentModal, setOpenDocumentModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [industryModal, setIndustryModal] = useState(false);
  const [originalData, setOriginalData] = useState({
    leadId: leadid,
    originalName: "",
    currentUserId: userid,
  });
  const [addressInfo, setaddressInfo] = useState(false);
  const [industryInfo, setIndustryInfo] = useState(false);

  useEffect(() => {
    if (
      singleLeadResponseData &&
      Object.keys(singleLeadResponseData)?.length > 0
    ) {
      setDescriptionText(singleLeadResponseData?.description);
      if (
        singleLeadResponseData?.industries &&
        Object.keys(singleLeadResponseData?.industries)?.length > 0 &&
        singleLeadResponseData?.subIndustry &&
        Object.keys(singleLeadResponseData?.subIndustry)?.length > 0 &&
        singleLeadResponseData?.subSubIndustry &&
        Object.keys(singleLeadResponseData?.subSubIndustry)?.length > 0 &&
        singleLeadResponseData?.industriesData?.length > 0 &&
        !adminRole
      ) {
        setIndustryInfo(true);
      }

      if (
        singleLeadResponseData?.address &&
        singleLeadResponseData?.country &&
        singleLeadResponseData?.state &&
        singleLeadResponseData?.city &&
        singleLeadResponseData?.pinCode &&
        !adminRole
      ) {
        setaddressInfo(true);
      }
    }
  }, [singleLeadResponseData]);

  useEffect(() => {
    dispatch(getAllStatusListByUserId(userid));
  }, [userid]);

  const getSingleLeadData = useCallback(() => {
    if (leadid) {
      dispatch(getSingleLeadDataByLeadID({ leadid, userid }));
    }
  }, [leadid, userid, dispatch]);

  const updateOriginalNameFun = useCallback(() => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({
        message: "Please update industry  to proceed !.",
      });
    } else {
      dispatch(updateOriginalNameInLeads(originalData))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Name updated successfully",
            });
            getSingleLeadData();
            setUpdateOriginalName((prev) => !prev);
          } else {
            notification.error({
              message: "Something went wrong !.",
            });
          }
        })
        .catch(() => {
          notification.error({
            message: "Something went wrong !.",
          });
        });
    }
  }, [originalData, dispatch, getSingleLeadData, addressInfo, industryInfo]);

  useEffect(() => {
    if (leadid) {
      dispatch(editViewData(leadid));
      dispatch(getAllRemarkAndCommnts(leadid));
    }
  }, [dispatch, leadid]);

  const adminRole = currentUserRoles.includes("ADMIN");

  const changeLeadStatusFun = (statusId) => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({
        message: "Please update industry  to proceed !.",
      });
    } else {
      dispatch(changeLeadStatus({ leadid, userid, statusId }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Status updated successfully",
            });
            getSingleLeadData();
          } else {
            notification.error({
              message: "Something went wrong !.",
            });
          }
        })
        .catch(() => {
          notification.error({
            message: "Something went wrong !.",
          });
        });
    }
  };

  useEffect(() => {
    getSingleLeadData();
  }, [getSingleLeadData]);

  const updateLeadNameSinglePage = useCallback(
    (e) => {
      if (!addressInfo) {
        notification.warning({
          message: "Please update address to proceed !.",
        });
      } else if (!industryInfo) {
        notification.warning({
          message: "Please update industry  to proceed !.",
        });
      } else {
        dispatch(updateSingleLeadName({ updatedLeadName, leadid, userid }))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Assignee updated successfully",
              });
              getSingleLeadData();
              setUpdateLeadNameToggle(true);
            } else {
              notification.error({
                message: "Something went wrong !.",
              });
            }
          })
          .catch(() => {
            notification.error({
              message: "Something went wrong !.",
            });
          });
      }
    },
    [
      updatedLeadName,
      leadid,
      userid,
      dispatch,
      getSingleLeadData,
      addressInfo,
      industryInfo,
    ]
  );

  const changeLeadAssignee = (id) => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({
        message: "Please update industry  to proceed !.",
      });
    } else {
      setAssigneValue(id);
      dispatch(changeLeadAssigneeLeads({ leadid, id, userid }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Assignee updated successfully",
            });
            getSingleLeadData();
            setAssigneValue(null);
          } else {
            notification.error({
              message: "Something went wrong !.",
            });
          }
        })
        .catch(() => {
          notification.error({
            message: "Something went wrong !.",
          });
        });
    }
  };

  const deleteContactFun = useCallback(
    (id) => {
      if (!addressInfo) {
        notification.warning({
          message: "Please update address to proceed !.",
        });
      } else if (!industryInfo) {
        notification.warning({
          message: "Please update industry  to proceed !.",
        });
      } else {
        let data = {
          leadid: leadid,
          id: id,
          userid: userid,
        };
        dispatch(deleteLeadContact(data))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Contact deleted successfully",
              });
              getSingleLeadData();
            } else {
              notification.error({
                message: "Something went wrong !.",
              });
            }
          })
          .catch(() => {
            notification.error({
              message: "Something went wrong !.",
            });
          });
      }
    },
    [leadid, userid, dispatch, getSingleLeadData, addressInfo, industryInfo]
  );

  const sameAssigneePresonFun = async () => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({
        message: "Please update industry  to proceed !.",
      });
    } else {
      if (window.confirm("Aree you Want to Sure")) {
        const autoUpdateSame = await dispatch(
          updateAutoAssignnee({
            leadId: leadid,
            updatedById: userid,
            status: "Badfit",
            autoSame: true,
          })
        );
        if (autoUpdateSame.type === "auto-lead-assignee/rejected")
          return toast.error("Something went Wrong");
        if (autoUpdateSame.type === "auto-lead-assignee/fulfilled") {
          toast.success("Lead Assignee Same Person Succesfully");
        }
      }
    }
  };

  const notSameAssigneePresonFun = async () => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({
        message: "Please update industry  to proceed !.",
      });
    } else {
      if (window.confirm("Aree you Want to Sure")) {
        const autoUpdateNotSame = await dispatch(
          updateAutoAssignnee({
            leadId: leadid,
            updatedById: userid,
            status: "Badfit",
            autoSame: false,
          })
        );
        if (autoUpdateNotSame.type === "auto-lead-assignee/rejected")
          return toast.error("Something went Wrong");
        if (autoUpdateNotSame.type === "auto-lead-assignee/fulfilled") {
          toast.success("Lead Assignee Different Person Succesfully");
        }
      }
    }
  };

  const handleUpdateContact = (value) => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({
        message: "Please update industry  to proceed !.",
      });
    } else {
      form1.setFieldsValue({
        name: value?.clientName,
        email: value?.email,
        contactNo: value?.contactNo,
      });
      setContactData(value);
      setOpenModal(true);
    }
  };

  const handleSubmitContact = useCallback(
    (values) => {
      values.leadId = leadid;
      if (contactData) {
        values.id = contactData?.clientId;
        values.userId = userid;
        dispatch(updateLeadsContact(values))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Contact details updated successfully !.",
              });
              getSingleLeadData();
              setOpenModal(false);
              form1.resetFields();
              dispatch(getSingleLeadDataByLeadID({ leadid, userid }));
            } else {
              notification.error({
                message: "Something went wrong !.",
              });
            }
          })
          .catch(() => {
            notification.error({
              message: "Something went wrong !.",
            });
          });
        setContactData(null);
      } else {
        values.currentUserId = userid;
        dispatch(createLeadContacts(values))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              notification.success({
                message: "Contact details created successfully.",
              });
              getSingleLeadData();
              setOpenModal(false);
              form1.resetFields();
              dispatch(getSingleLeadDataByLeadID({ leadid, userid }));
            } else {
              notification.error({
                message: "Something went wrong !.",
              });
            }
          })
          .catch(() => {
            notification.error({
              message: "Something went wrong !.",
            });
          });
        setContactData(null);
      }
    },
    [userid, leadid, contactData, dispatch, getSingleLeadData, form1]
  );

  const leadAssignedToSame = (id) => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({ message: "Please update industry info first !." });
    } else {
      dispatch(handleLeadassignedToSamePerson(id))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Lead assigned to same person successfully.",
            });
            // playSuccessSound()
            getSingleLeadData();
            window.location.reload();
          } else {
            notification.error({ message: "Something went wrong !." });
            playErrorSound();
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
          playErrorSound();
        });
    }
  };

  const handleUpdateLeadDescription = useCallback(() => {
    if (!addressInfo) {
      notification.warning({ message: "Please update address to proceed !." });
    } else if (!industryInfo) {
      notification.warning({ message: "Please update industry info first !." });
    } else {
      let obj = { id: leadid, description: descriptionText };
      dispatch(updateLeadDescription(obj))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Lead description successfully.",
            });
            // playSuccessSound()
            getSingleLeadData();
            setShowDescriptionField(false);
          } else {
            notification.error({ message: "Something went wrong !." });
            playErrorSound();
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
          playErrorSound();
        });
    }
  }, [leadid, dispatch, descriptionText, addressInfo, industryInfo]);

  const onEditClick = () => {
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryId(singleLeadResponseData?.countryId));
    dispatch(getAllCitiesByStateId(singleLeadResponseData?.stateId));
    addressForm.setFieldsValue({
      address: singleLeadResponseData?.address,
      country: singleLeadResponseData?.country,
      state: singleLeadResponseData?.state,
      city: singleLeadResponseData?.city,
      pinCode: singleLeadResponseData?.pinCode,
    });
    setAddressModal(true);
  };

  const handleAddressFinish = (values) => {
    values.leadId = singleLeadResponseData?.leadId;
    dispatch(updateAddressInLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Address updated successfully !." });
          dispatch(
            getSingleLeadDataByLeadID({
              leadid: singleLeadResponseData?.leadId,
              userid,
            })
          );
          setAddressModal(false);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  const onIndustryEdit = () => {
    dispatch(getAllMainIndustry());
    dispatch(
      getSubIndustryByIndustryId(singleLeadResponseData?.industries?.id)
    );
    dispatch(
      getSubSubIndustryBySubIndustryId(singleLeadResponseData?.subIndustry?.id)
    );
    dispatch(
      getIndustryDataBySubSubIndustryId(
        singleLeadResponseData?.subSubIndustry?.id
      )
    );
    industryForm.setFieldsValue({
      industriesId: singleLeadResponseData?.industries?.id,
      subIndustryId: singleLeadResponseData?.subIndustry?.id,
      subsubIndustryId: singleLeadResponseData?.subSubIndustry?.id,
      industriesDataId: singleLeadResponseData?.industriesData?.map(
        (item) => item?.id
      ),
    });
    setIndustryModal(true);
  };

  const handleIndustryFinish = (values) => {
    values.leadId = singleLeadResponseData?.leadId;
    dispatch(updateIndustriesInLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Industries updated successfully !.",
          });
          dispatch(
            getSingleLeadDataByLeadID({
              leadid: singleLeadResponseData?.leadId,
              userid,
            })
          );
          setIndustryModal(false);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  const items = [
    {
      key: "1",
      label: "Contacts",
      extra: (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (!addressInfo) {
              notification.warning({
                message: "Please update your address first !.",
              });
            } else if (!industryInfo) {
              notification.warning({
                message: "Please update your industries info first !.",
              });
            } else {
              setOpenModal(true);
              form1.resetFields();
            }
          }}
        >
          <Icon icon="fluent:add-20-regular" /> Add
        </Button>
      ),
      children: (
        <List
          dataSource={clientsContact}
          renderItem={(item) => (
            <List.Item key={item.email}>
              <List.Item.Meta
                title={item?.clientName}
                description={
                  <Space size={2} direction="vertical">
                    <div className="flex-vert-hori-center">
                      <Icon icon="fluent:mail-20-regular" />
                      <Text type="secondary">{item.email}</Text>
                    </div>
                    <div className="flex-vert-hori-center">
                      <Icon icon="fluent:call-20-regular" />
                      <Text type="secondary">{item.contactNo}</Text>
                    </div>
                  </Space>
                }
              />
              <Space size={4}>
                <Button size="small" onClick={() => handleUpdateContact(item)}>
                  <Icon icon="fluent:edit-20-regular" />
                  Edit
                </Button>
                {adminRole && (
                  <Popconfirm
                    title="Delete the task"
                    description="Are you sure to delete this task?"
                    onConfirm={() => deleteContactFun(item.clientId)}
                  >
                    <Button size="small" danger>
                      <Icon icon="fluent:delete-20-regular" /> Delete
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <Spin
      size="large"
      spinning={leadDetailLoading === "pending" ? true : false}
    >
      {Object.keys(singleLeadResponseData)?.length > 0 ? (
        <div className="cm-padding-one lead-details">
          <Row gutter={16}>
            <Col span={9}>
              <div className="left-lead-section">
                {updateOriginalName ? (
                  <div className="comp-container">
                    <Select
                      showSearch
                      size="small"
                      className="comp-component-1"
                      style={{ width: "100%" }}
                      placeholder="select urls"
                      options={allLeadUrl?.map((item) => ({
                        label: item?.urlsName,
                        value: item?.urlsName,
                      }))}
                      onChange={(e) =>
                        setOriginalData((prev) => ({
                          ...prev,
                          originalName: e,
                        }))
                      }
                      // filterOption={(input, option) =>
                      //   option.label.toLowerCase().includes(input.toLowerCase())
                      // }
                    />

                    <Space className="comp-component-2">
                      <Button
                        type="primary"
                        size="small"
                        onClick={(e) => updateOriginalNameFun(e)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setUpdateOriginalName(false)}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <div className="comp-container">
                    <div className="flex-vert-hori-center">
                      {singleLeadResponseData?.originalName ? (
                        <Icon
                          icon="fluent:circle-20-filled"
                          height={12}
                          width={12}
                          color="red"
                        />
                      ) : (
                        <Icon
                          icon="fluent:circle-20-filled"
                          height={12}
                          width={12}
                          color="green"
                        />
                      )}
                      {singleLeadResponseData?.count !== undefined && (
                        <Text className="heading-text">
                          {`(${singleLeadResponseData?.count})`}
                        </Text>
                      )}
                      <Text className="heading-text">
                        {singleLeadResponseData?.originalName
                          ? singleLeadResponseData?.originalName
                          : "NA"}
                      </Text>
                      {/* <Button
                        size="small"
                        onClick={() => setUpdateOriginalName(true)}
                      >
                        <Icon icon="fluent:edit-20-regular" /> Edit
                      </Button> */}
                    </div>
                  </div>
                )}

                {updateLeadNameToggle ? (
                  <div className="comp-container">
                    <div className="flex-vert-hori-center">
                      <Text className="heading-text">
                        {singleLeadResponseData?.leadName}
                      </Text>
                      <Button
                        size="small"
                        onClick={() => {
                          if (!addressInfo) {
                            notification.warning({
                              message: "Please update address to proceed !.",
                            });
                          } else if (!industryInfo) {
                            notification.warning({
                              message: "Please update industry  to proceed !.",
                            });
                          } else {
                            setUpdateLeadNameToggle(false);
                          }
                        }}
                      >
                        <Icon icon="fluent:edit-20-regular" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="comp-container">
                    <Select
                      showSearch
                      allowClear
                      size="small"
                      style={{ width: "100%" }}
                      className="comp-component-1"
                      placeholder="select the slug"
                      options={
                        slugList?.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                        })) || []
                      }
                      onChange={(e) => setUpdatedLeadName(e)}
                      // filterOption={(input, option) =>
                      //   option.label.toLowerCase().includes(input.toLowerCase())
                      // }
                    />
                    <Space className="comp-component-2">
                      <Button
                        type="primary"
                        size="small"
                        onClick={(e) => updateLeadNameSinglePage(e)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setUpdateLeadNameToggle(true)}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    padding: "12px",
                    borderRadius: "4px",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex gap={8} align="center">
                      <Icon icon="fluent:location-24-regular" />
                      <Text className="heading-text">Address info</Text>
                    </Flex>
                    <Button type="link" onClick={onEditClick}>
                      Update address
                    </Button>
                  </Flex>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <Flex vertical gap={8}>
                      <Text type="secondary">Address</Text>
                      <Text>{singleLeadResponseData?.address}</Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">Country</Text>
                      <Text>{singleLeadResponseData?.country}</Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">State</Text>
                      <Text>{singleLeadResponseData?.state}</Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">City</Text>
                      <Text>{singleLeadResponseData?.city}</Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">Pin code</Text>
                      <Text>{singleLeadResponseData?.pinCode}</Text>
                    </Flex>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    padding: "12px",
                    borderRadius: "4px",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex gap={8} align="center">
                      <Icon
                        icon="fluent:building-32-regular"
                        width="12"
                        height="12"
                      />
                      <Text className="heading-text">Industry info</Text>
                    </Flex>
                    <Button type="link" onClick={onIndustryEdit}>
                      Update industry
                    </Button>
                  </Flex>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <Flex vertical gap={8}>
                      <Text type="secondary">Industries</Text>
                      <Text>{singleLeadResponseData?.industries?.name}</Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">Sub industries</Text>
                      <Text>{singleLeadResponseData?.subIndustry?.name}</Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">Sub sub industries</Text>
                      <Text>
                        {singleLeadResponseData?.subSubIndustry?.name}
                      </Text>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Text type="secondary">Industries data</Text>
                      <Text>
                        {singleLeadResponseData?.industriesData
                          ?.map((item) => item?.name)
                          ?.join(",")}
                      </Text>
                    </Flex>
                  </div>
                </div>

                <Divider style={{ margin: "6px" }} />
                {currentUserDetail?.department !== "Sales" && (
                  <div className="lead-assignee-container">
                    <Text className="heading-text">Update assignee</Text>
                    <Select
                      placeholder="Change assignee"
                      showSearch
                      style={{ width: "100%", margin: "6px 0px" }}
                      value={assigneValue}
                      options={
                        userDataResponse?.map((ele) => ({
                          label: ele?.fullName,
                          value: ele?.id,
                        })) || []
                      }
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      onChange={changeLeadAssignee}
                    />
                  </div>
                )}
                <div className="flex-vert-hori-center">
                  <Icon icon="fluent:person-24-regular" />
                  <Text>
                    Assignee Person -{" "}
                    {singleLeadResponseData?.assigne?.fullName}
                  </Text>
                </div>
                <Divider style={{ margin: "6px" }} />
                <Select
                  showSearch
                  placeholder="change status"
                  value={singleLeadResponseData?.status?.id}
                  options={
                    getAllStatus?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                    })) || []
                  }
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(e) => changeLeadStatusFun(e)}
                />
                <div className="flex-vert-hori-center">
                  <Icon icon="fluent:bookmark-24-regular" />
                  <Text>Status - {singleLeadResponseData?.status?.name}</Text>
                </div>
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    onClick={sameAssigneePresonFun}
                  >
                    Same
                  </Button>
                  <Button size="small" onClick={notSameAssigneePresonFun}>
                    Not same
                  </Button>
                </Space>

                {singleLeadResponseData?.source === "IVR" && (
                  <>
                    <Divider style={{ margin: "6px" }} />
                    <Text className="heading-text">Lead description</Text>
                    {showDescriptionField ? (
                      <div className="comp-container">
                        <Input.TextArea
                          value={descriptionText}
                          onChange={(e) => setDescriptionText(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="description-container">
                        <Text>{descriptionText}</Text>
                      </div>
                    )}

                    {(currentUserDetail?.department === "Quality Team" ||
                      currentUserRoles?.includes("ADMIN")) && (
                      <Space>
                        <Button
                          size="small"
                          onClick={() =>
                            setShowDescriptionField(!showDescriptionField)
                          }
                        >
                          {showDescriptionField ? "Cancel" : "Edit"}
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          disabled={!showDescriptionField}
                          onClick={handleUpdateLeadDescription}
                        >
                          Submit
                        </Button>
                      </Space>
                    )}
                  </>
                )}

                <Divider style={{ margin: "6px" }} />
                <div className="flex-vert-hori-center">
                  <Icon icon="fluent:link-24-filled" />
                  <Text type="secondary">{singleLeadResponseData?.urls} </Text>
                </div>

                {complianceDocumentList?.length > 0 && (
                  <>
                    <Divider style={{ margin: "6px" }} />
                    <Flex wrap gap={2}>
                      {complianceDocumentList?.map((item, idx) => (
                        <>
                          <Tag
                            key={`${idx}compDoc`}
                            style={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onClick={() => {
                              setDocument(item?.name);
                              setOpenDocumentModal(true);
                            }}
                            icon={
                              <Icon
                                icon="fluent:document-pdf-24-regular"
                                height={18}
                                width={18}
                                color="red"
                              />
                            }
                          >
                            Document {idx + 1}
                          </Tag>
                        </>
                      ))}
                    </Flex>
                  </>
                )}
                <Divider style={{ margin: "6px" }} />
                <Collapse
                  accordion
                  defaultActiveKey={["1"]}
                  items={items}
                  bordered={false}
                />
              </div>
            </Col>
            <Col span={15}>
              <div className="flex-justify-end">
                <div className="btn-view-container">
                  <Button
                    size="small"
                    onClick={() => leadAssignedToSame(leadid)}
                  >
                    Assign to same person
                  </Button>
                  <LeadCompany
                    data={singleLeadResponseData}
                    addressInfo={addressInfo}
                    industryInfo={industryInfo}
                  />
                  <CompanyFormModal
                    detailView={true}
                    data={singleLeadResponseData}
                    addressInfo={addressInfo}
                    industryInfo={industryInfo}
                  />
                </div>
              </div>

              <Flex vertical gap={12}>
                <BulkFileUploader
                  leadid={leadid}
                  addressInfo={addressInfo}
                  industryInfo={industryInfo}
                />
                <LeadComments
                  list={notesApiData}
                  leadid={leadid}
                  addressInfo={addressInfo}
                  industryInfo={industryInfo}
                />
              </Flex>
            </Col>
          </Row>
          <Modal
            title={contactData ? "Edit contact details" : "Create contact"}
            open={openModal}
            onCancel={() => setOpenModal(false)}
            onClose={() => setOpenModal(false)}
            onOk={() => form1.submit()}
            okText="Submit"
          >
            <Form layout="vertical" form={form1} onFinish={handleSubmitContact}>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  { required: true, message: "name field can not blank" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                // rules={[{ required: true, message: "please give email" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Phone number"
                name="contactNo"
                rules={[
                  { required: true, message: "please enter phone number" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            open={openDocumentModal}
            onCancel={() => setOpenDocumentModal(false)}
            onClose={() => setOpenDocumentModal(false)}
            title="Document modal"
            footer={false}
            height={600}
            width={900}
            centered
          >
            <iframe src={document} height={580} width={"100%"} />
          </Modal>
          <Modal
            title="Update address"
            open={addressModal}
            onCancel={() => setAddressModal(false)}
            onClose={() => setAddressModal(false)}
            onOk={() => addressForm.submit()}
          >
            <Form
              layout="vertical"
              form={addressForm}
              onFinish={handleAddressFinish}
            >
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
                      addressForm.resetFields(["state", "city"]);
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
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(e, option) => {
                      dispatch(getAllCitiesByStateId(option?.id));
                    }}
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
                  name="pinCode"
                  rules={[{ required: true, message: "please enter pincode" }]}
                >
                  <Input />
                </Form.Item>
              </div>
            </Form>
          </Modal>
          <Modal
            title="Update industry"
            open={industryModal}
            onCancel={() => setIndustryModal(false)}
            onClose={() => setIndustryModal(false)}
            onOk={() => industryForm.submit()}
          >
            <Form
              layout="vertical"
              form={industryForm}
              onFinish={handleIndustryFinish}
            >
              <div className="form-grid-col-2">
                <Form.Item
                  label="Select industry"
                  name="industriesId"
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
                      industryForm.resetFields([
                        "industriesDataId",
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
                      industryForm.resetFields([
                        "industriesDataId",
                        "subsubIndustryId",
                      ]);
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
                      industryForm.resetFields(["industriesDataId"]);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Select business activity"
                  name="industriesDataId"
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
              </div>
            </Form>
          </Modal>
        </div>
      ) : (
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the data is not available."
        />
      )}
    </Spin>
  );
};

export default LeadDetailsPage;
