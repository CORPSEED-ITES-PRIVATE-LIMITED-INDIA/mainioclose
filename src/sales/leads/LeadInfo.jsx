import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  User,
} from "@heroui/react";
import {
  ChartBarDecreasing,
  EllipsisVertical,
  Factory,
  FileText,
  Link,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareMore,
  Pencil,
  Phone,
  Plus,
  Podcast,
  Smartphone,
  Trash,
  User2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import NewSelect from "../../components/NewSelect";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllComments,
  getAllSlugList,
  getAllStatusData,
} from "../../toolkit/slices/settingSlice";
import {
  changeLeadAssigneeLeads,
  createLeadContacts,
  createRemakWithFile,
  deleteLeadContact,
  deleteRemarks,
  getAllLeadUser,
  getAllRemarkAndCommnts,
  getSingleLeadDataByLeadId,
  updateAddressInLeads,
  updateAutoAssignnee,
  updateIndustriesInLeads,
  updateLeadsContact,
  updateLeadSource,
  updateLeadStatus,
  updateRemarks,
  updateSingleLeadName,
} from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import ImageGroup from "../../components/ImageGroup";
import { Controller, useForm } from "react-hook-form";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllMainIndustry,
  getAllStatesByCountryName,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BulkFileUploader from "../../components/BulkFileUploader";
import dayjs from "dayjs";
import StatusDisplay from "../../components/StatusDisplay";
import LoadingSpinner from "../../components/LoadingSpinner";
import { allowOnlyNumbers, formatEmail, leadSource } from "../../common";
import BasicCompany from "../company/BasicCompany";
import CompanyAndUnitsInLead from "../company/CompanyAndUnitsInLead";
const iconClass = "h-4 w-4";

const addressFormSchema = z.object({
  address: z.string().min(1, "Please enter a address"),
  country: z.string().min(1, "Please select country"),
  state: z.string().min(1, "Please select state"),
  city: z.string().min(1, "Please select city"),
  pinCode: z.string().min(1, "Please enter pincode"),
});

const addressFormDefault = {
  address: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
};

const industryFormSchema = z.object({
  industriesId: z.string().nonempty("Industry is required"),
  subIndustryId: z.string().nonempty("Sub-industry is required"),
  subsubIndustryId: z.string().nonempty("Category is required"),
  industriesDataId: z
    .array(z.string())
    .nonempty("At least one business activity is required"),
});

const industryFormDefault = {
  industriesId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industriesDataId: [],
};

const contactFormSchema = z.object({
  name: z.string().min(1, "Please enter name"),
  email: z.string().optional(),
  contactNo: z.string().min(1, "Please enter contact number"),
});

const contactFormDefault = z.object({
  name: "",
  email: "",
  contactNo: "",
});

const remarkFormSchema = (flag) =>
  z.object({
    ...(flag ? { textMessage: z.string().min(1, "Please enter comment") } : {}),
    message: z.string().min(1, "Please enter message"),
  });

const remarkFormDefault = z.object({
  name: "",
  email: "",
  contactNo: "",
});

const LeadInfo = () => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const industryModal = useDisclosure();
  const addressModal = useDisclosure();
  const contactModal = useDisclosure();
  const deleteModal = useDisclosure();
  const remarkModal = useDisclosure();
  const deleteRemarkModal = useDisclosure();
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const leadDetailLoading = useSelector(
    (state) => state.leads.leadDetailLoading,
  );
  const allUsers = useSelector((state) => state.leads.leadUsersList);
  const slugList = useSelector((state) => state.setting.slugList);
  const statusList = useSelector((state) => state.setting.statusList);
  const allComments = useSelector((state) => state.setting.allComments);
  const remarkData = useSelector((state) => state.leads.remarkData);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.common.subIndustryListByIndustryId,
  );
  const subSubIndustryListById = useSelector(
    (state) => state.common.subSubIndustryListBySubIndustryId,
  );
  const industryDataListById = useSelector(
    (state) => state.common.industryDataListBySubSubIndustryId,
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const [toggleSlug, setToggleSlug] = useState(true);
  const [toggleAssignee, setToggleAssignee] = useState(true);
  const [customComment, setCustomComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [toggleStatus, setToggleStatus] = useState(true);
  const [toggleSource, setToggleSource] = useState(true);
  const [files, setFiles] = useState([]);
  const [editContact, setEditContact] = useState(null);
  const [remarkDataItem, setRemarkDataItem] = useState(null);
  const [remarkLoading, setRemarkLoading] = useState("");
  const [statusLoading, setStatusLoading] = useState("");
  const [sourceLoading, setSourceLoading] = useState("");
  const [leadLoading, setLeadLoading] = useState("");
  const [addressLoading, setAddressLoading] = useState("");
  const [industryLoading, setIndustryLoading] = useState("");
  const [assigneeLoading, setAssigneeLoading] = useState("");
  const [contactLoading, setContactLoading] = useState("");
  const [assignLoading, setAssignLoading] = useState("");

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllSlugList());
    dispatch(getAllComments());
    dispatch(getAllLeadUser(userId));
    dispatch(getAllRemarkAndCommnts(leadId));
  }, [dispatch, leadId, userId]);

  const handleUpdateLeadName = (leadName) => {
    setLeadLoading("pending");
    dispatch(updateSingleLeadName({ leadName, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead name updated successfully !.",
            color: "success",
          });
          setLeadLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleSlug(true);
        } else {
          setLeadLoading("rejected");
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setLeadLoading("rejected");
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const onSubmit = useCallback(() => {
    let data = {
      leadId: leadId,
      userId: userId,
      type: selectedComment === "Other" ? "Other" : "selected",
      message: selectedComment === "Other" ? customComment : selectedComment,
      file: files?.map((item) => item?.url),
    };
    if (customComment || selectedComment) {
      setRemarkLoading("pending");
      dispatch(createRemakWithFile(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Remark added successfully !.",
              color: "success",
            });
            setFiles([]);
            setCustomComment("");
            setRemarkLoading("success");
            setSelectedComment(null);
            dispatch(getAllRemarkAndCommnts(leadId));
          } else {
            setRemarkLoading("reject");
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          setRemarkLoading("reject");
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    } else {
      addToast({ title: "Select comment to proceed", color: "warning" });
    }
  }, [files, leadId, userId, selectedComment, customComment, dispatch]);

  const changeLeadAssignee = (assigneeId) => {
    setAssigneeLoading("pending");
    dispatch(changeLeadAssigneeLeads({ assigneeId, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Assignee updated successfully !.",
            color: "success",
          });
          setAssigneeLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleAssignee(true);
        } else {
          setAssigneeLoading("rejected");
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setAssigneeLoading("rejected");
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const changeLeadStatus = (statusId) => {
    setStatusLoading("pending");
    dispatch(updateLeadStatus({ leadId, userId, statusId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Status updated successfully",
            color: "success",
          });
          setStatusLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleStatus(true);
        } else {
          setStatusLoading("rejected");
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setStatusLoading("rejected");
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const handleUpdateSource = (source) => {
    setSourceLoading("pending");
    dispatch(updateLeadSource({ sourceName: source, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Source updated successfully !.",
            color: "success",
          });
          setSourceLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleSource(true);
        } else {
          setSourceLoading("rejected");
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setSourceLoading("rejected");
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const addressForm = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: addressFormDefault,
  });

  const industryForm = useForm({
    resolver: zodResolver(industryFormSchema),
    defaultValues: industryFormDefault,
  });

  const contactForm = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactFormDefault,
  });
  const remarkForm = useForm({
    resolver: zodResolver(remarkFormSchema(remarkDataItem?.type === "Other")),
    defaultValues: remarkFormDefault,
  });

  const industryModalPress = () => {
    dispatch(getAllMainIndustry());
    industryModal.onOpen();
  };

  const addressModalPress = () => {
    dispatch(getAllCountries());
    addressModal.onOpen();
  };

  const updateRemarkModalPress = (item) => {
    remarkForm.reset({
      message: item?.type === "selected" ? item?.message : "Other",
      textMessage: item?.type === "Other" ? item?.message : "",
    });
    remarkModal.onOpen();
    setRemarkDataItem(item);
  };

  const deleteRemarkModalPress = (item) => {
    deleteRemarkModal.onOpen();
    setRemarkDataItem(item);
  };

  const conFirmDeleteRemark = () => {
    setRemarkLoading("pending");
    dispatch(deleteRemarks({ remarkId: remarkDataItem?.id, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Remark deleted successfully !.",
            color: "success",
          });
          setRemarkLoading("success");
          dispatch(getAllRemarkAndCommnts(leadId));
          deleteRemarkModal.onOpenChange(false);
          setRemarkDataItem(null);
        } else {
          setRemarkLoading("rejected");
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        setRemarkLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleUpdateRemark = (values) => {
    let obj = {
      remarkId: remarkDataItem?.id,
      userId: userId,
      message:
        values?.message === "Other" ? values?.textMessage : values?.message,
      type: values?.message === "Other" ? "Other" : "selected",
      leadId: leadId,
    };
    setRemarkLoading("pending");
    dispatch(updateRemarks(obj))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Remark updated successfully !.",
            color: "success",
          });
          setRemarkLoading("success");
          dispatch(getAllRemarkAndCommnts(leadId));
          remarkModal.onOpenChange(false);
          setRemarkDataItem(null);
          remarkForm.reset(remarkFormDefault);
        } else {
          setRemarkLoading("rejected");
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        setRemarkLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const editContactModalPress = (value) => {
    contactModal.onOpen();
    contactForm.reset({
      name: value?.name,
      email: value?.emails || "",
      contactNo: value?.contactNo,
    });
    setEditContact(value);
  };

  const handleDeleteContact = (value) => {
    deleteModal.onOpen();
    setEditContact(value);
  };

  const confirmDeleteContact = () => {
    setContactLoading("pending");
    dispatch(
      deleteLeadContact({ leadId, clientId: editContact?.clientId, userId }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Contact deleted successfully !.",
            color: "success",
          });
          setContactLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          deleteModal.onOpenChange(false);
          setEditContact(null);
        } else {
          setContactLoading("rejected");
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        setContactLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleAddressFinish = (values) => {
    values.leadId = leadId;
    setAddressLoading("pending");
    dispatch(updateAddressInLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Address updated successfully !.",
            color: "success",
          });
          setAddressLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          addressModal.onOpenChange(false);
        } else {
          setAddressLoading("rejected");
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        setAddressLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleIndustryFinish = (values) => {
    values.leadId = leadId;
    setIndustryLoading("pending");
    dispatch(updateIndustriesInLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Industries updated successfully !.",
            color: "success",
          });
          setIndustryLoading("success");
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          industryModal.onOpenChange(false);
        } else {
          setIndustryLoading("rejected");
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        setIndustryLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleContctFinish = (values) => {
    values.leadId = leadId;
    setContactLoading("pending");
    if (editContact) {
      values.id = editContact?.clientId;
      values.userId = userId;
      dispatch(updateLeadsContact(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Contact details updated successfully !.",
              color: "success",
            });
            setContactLoading("success");
            dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
            contactModal.onOpenChange(false);
            setEditContact(null);
            contactForm.reset(contactFormDefault);
          } else {
            setContactLoading("rejected");
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          setContactLoading("rejected");
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        });
    } else {
      values.currentUserId = userId;
      dispatch(createLeadContacts(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Contact details created successfully.",
              color: "success",
            });
            setContactLoading("success");
            dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
            contactModal.onOpenChange(false);
            setEditContact(null);
          } else {
            setContactLoading("rejected");
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          setContactLoading("rejected");
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        });
    }
  };

  const sameAssigneePresonFun = async () => {
    if (window.confirm("Are you Want to Sure")) {
      setAssignLoading("pending");
      dispatch(
        updateAutoAssignnee({
          leadId: leadId,
          updatedById: userId,
          status: "Badfit",
          autoSame: true,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({ title: "Assigned to same person", color: "success" });
            setAssignLoading("success");
            dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
            setAssignLoading("rejected");
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
          setAssignLoading("rejected");
        });
    }
  };

  const notSameAssigneePresonFun = async () => {
    if (window.confirm("Are you Want to Sure ?")) {
      dispatch(
        updateAutoAssignnee({
          leadId: leadId,
          updatedById: userId,
          status: "Badfit",
          autoSame: false,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Not Assigned to same person",
              color: "success",
            });
            setAssignLoading("success");
            dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
            setAssignLoading("rejected");
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
          setAssignLoading("rejected");
        });
    }
  };

  return (
    <>
      {(remarkLoading === "pending" ||
        statusLoading === "pending" ||
        leadLoading === "pending" ||
        addressLoading === "pending" ||
        industryLoading === "pending" ||
        assigneeLoading === "pending" ||
        contactLoading === "pending" ||
        sourceLoading === "pending" ||
        assignLoading === "pending") && <LoadingSpinner />}
      {leadDetailLoading === "pending" ? (
        <LoadingSpinner />
      ) : Object.keys(leadData)?.length > 0 &&
        (leadData?.assignee?.id == userId || adminRole) ? (
        <>
          <div className="grid grid-cols-[minmax(0,60%)_minmax(0,40%)] gap-3 p-2 2xl:max-h-[78vh] md:max-h-[72vh] overflow-auto">
            <div>
              <div className="w-full">
                <Card className="my-2">
                  <CardBody>
                    {toggleSlug ? (
                      <div className="flex justify-between items-center">
                        <h6 className="text-sm font-medium">
                          {leadData?.lead?.name}
                        </h6>
                        <Button
                          onPress={() => {
                            if (
                              leadData?.proposalStatus === "INITIATED" ||
                              leadData?.proposalStatus === "APPROVED" ||
                              leadData?.proposalStatus === "DRAFT" ||
                              leadData?.proposalSendOrNot
                            ) {
                              addToast({
                                title: "RESTRICTED",
                                color: "danger",
                                description: `Service name cannot be changed as proposal is already approved or ${leadData?.proposalSendOrNot ? ", sent to the client" : ""} or Draft or initiated.`,
                              });
                              return;
                            }
                            setToggleSlug(false);
                          }}
                          size="sm"
                          isIconOnly
                          variant="light"
                          className="w-6 h-6 rounded-full bg-none"
                        >
                          <Pencil className={iconClass} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <NewSelect
                          data={slugList}
                          labelKey={"name"}
                          valueKey={"name"}
                          label={"Select service"}
                          onChange={handleUpdateLeadName}
                        />
                        <Button
                          onPress={() => setToggleSlug(true)}
                          size="sm"
                          isIconOnly
                          variant="light"
                          className="w-6 h-6 rounded-full bg-none"
                        >
                          <X className={iconClass} />
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="w-full">
                  <CompanyAndUnitsInLead />

                  {/* <Card className="my-2">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <Factory className={iconClass} />{" "}
                          <p className="text-sm font-medium">Industry Info</p>
                        </div>
                        <Button
                          size="sm"
                          isIconOnly
                          variant="light"
                          className="w-6 h-6 rounded-full bg-none"
                          onPress={industryModalPress}
                        >
                          <Pencil className={iconClass} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Industry</p>
                          <p className="text-xs">
                            {leadData?.industries?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sub Industry</p>
                          <p className="text-xs">
                            {leadData?.subIndustry?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-xs">
                            {leadData?.subSubIndustry?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Business activity
                          </p>
                          <p className="text-xs">
                            {leadData?.industriesData
                              ?.map((item) => item?.name)
                              .join(",")}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card className=" my-2">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className={iconClass} />{" "}
                          <p className="text-sm font-medium">Address Info</p>
                        </div>
                        <Button
                          size="sm"
                          isIconOnly
                          variant="light"
                          className="w-6 h-6 rounded-full bg-none"
                          onPress={addressModalPress}
                        >
                          <Pencil className={iconClass} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="text-sm">{leadData?.address || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Country</p>
                          <p className="text-xs">{leadData?.country || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">State</p>
                          <p className="text-xs">{leadData?.state || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">City</p>
                          <p className="text-xs">{leadData?.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pin code</p>
                          <p className="text-xs">{leadData?.pinCode}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card> */}
                </div>
                <div className="w-full">
                  <Card className="my-2">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <Phone className={iconClass} />{" "}
                          <p className="text-sm font-medium">
                            Company Representative
                          </p>
                        </div>
                        <Button
                          size="sm"
                          isIconOnly
                          variant="light"
                          className="w-6 h-6 rounded-full bg-none"
                          onPress={() => {
                            if (
                              leadData?.proposalStatus === "INITIATED" ||
                              leadData?.proposalStatus === "APPROVED" ||
                              leadData?.proposalStatus === "DRAFT"
                            ) {
                              addToast({
                                title: "RESTRICTED",
                                color: "danger",
                                description:
                                  "Contact details cannot be changed as proposal is already approved or Draft or initiated.",
                              });
                              return;
                            }
                            contactModal.onOpen();
                            contactForm.reset({
                              name: "",
                              email: "",
                              contactNo: "",
                            });
                          }}
                        >
                          <Plus className={iconClass} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody className="max-h-[300px] overflow-auto">
                      {leadData?.clients?.map((item) => {
                        return (
                          <div
                            key={item?.name}
                            className="flex justify-between items-center border rounded-md mb-2 px-2"
                          >
                            <div className="flex flex-col p-3">
                              <span className="font-medium text-xm">
                                {item?.name || "-"}
                              </span>
                              {item?.emails && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  <span className="block max-w-full break-all text-sm text-default-500">
                                    {item?.emails || ""}
                                  </span>
                                </div>
                              )}
                              {item?.contactNo && (
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-4 h-4" />
                                  <span className="text-sm text-default-500">
                                    {item?.contactNo || ""}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button variant="light" isIconOnly size="sm">
                                  <EllipsisVertical className={iconClass} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Static Actions">
                                <DropdownItem
                                  key="edit"
                                  startContent={
                                    <Pencil className={iconClass} />
                                  }
                                  onPress={() => {
                                    if (
                                      leadData?.proposalStatus ===
                                        "INITIATED" ||
                                      leadData?.proposalStatus === "APPROVED" ||
                                      leadData?.proposalStatus === "DRAFT"
                                    ) {
                                      addToast({
                                        title: "RESTRICTED",
                                        color: "danger",
                                        description:
                                          "Contact details cannot be changed as proposal is already approved or initiated.",
                                      });
                                      return;
                                    }
                                    editContactModalPress(item);
                                  }}
                                >
                                  Edit
                                </DropdownItem>
                                {adminRole && (
                                  <DropdownItem
                                    key="delete"
                                    color="danger"
                                    className="text-danger"
                                    startContent={
                                      <Trash className={iconClass} />
                                    }
                                    onPress={() => {
                                      if (
                                        leadData?.proposalStatus ===
                                          "INITIATED" ||
                                        leadData?.proposalStatus ===
                                          "APPROVED" ||
                                        leadData?.proposalStatus === "DRAFT"
                                      ) {
                                        addToast({
                                          title: "RESTRICTED",
                                          color: "danger",
                                          description:
                                            "Contact details cannot be deleted as proposal is already approved or Draft or initiated.",
                                        });
                                        return;
                                      }
                                      handleDeleteContact(item);
                                    }}
                                  >
                                    Delete
                                  </DropdownItem>
                                )}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        );
                      })}
                    </CardBody>
                  </Card>
                  {/* <BasicCompany /> */}

                  {/* <Card className="my-2">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Link className={iconClass} />{" "}
                        <p className="text-sm font-medium">Link</p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm font-medium">{leadData?.urls}</p>
                    </CardBody>
                  </Card> */}

                  {/* <Card className="my-2">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <User2 className={iconClass} />{" "}
                          <p className="text-sm font-medium">Assignee</p>
                        </div>

                        {toggleAssignee ? (
                          <Button
                            variant="light"
                            onPress={() => setToggleAssignee(false)}
                            size="sm"
                            isIconOnly
                            className="w-6 h-6 rounded-full bg-none"
                          >
                            <Pencil className={iconClass} />
                          </Button>
                        ) : (
                          <Button
                            onPress={() => setToggleAssignee(true)}
                            size="sm"
                            variant="light"
                            isIconOnly
                            className="w-6 h-6 rounded-full bg-none"
                          >
                            <X className={iconClass} />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardBody>
                      {toggleAssignee ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {leadData?.assignee?.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {leadData?.assignee?.email}
                          </span>
                        </div>
                      ) : (
                        <NewSelect
                          data={allUsers || []}
                          labelKey={"fullName"}
                          valueKey={"id"}
                          label={"Select assignee"}
                          value={String(leadData?.assigne?.id)}
                          onChange={(e) => changeLeadAssignee(e)}
                        />
                      )}
                    </CardBody>
                  </Card>
                  <Card className="my-2">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <ChartBarDecreasing className={iconClass} />{" "}
                          <p className="text-sm font-medium">Status</p>
                        </div>

                        {toggleStatus ? (
                          <Button
                            variant="light"
                            onPress={() => {
                              setToggleStatus(false);
                              dispatch(getAllStatusData());
                            }}
                            size="sm"
                            isIconOnly
                            className="w-6 h-6 rounded-full bg-none"
                          >
                            <Pencil className={iconClass} />
                          </Button>
                        ) : (
                          <Button
                            variant="light"
                            onPress={() => {
                              setToggleStatus(true);
                            }}
                            size="sm"
                            isIconOnly
                            className="w-6 h-6 rounded-full bg-none"
                          >
                            <X className={iconClass} />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardBody>
                      {toggleStatus ? (
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {leadData?.status?.name}
                          </span>
                        </div>
                      ) : (
                        <NewSelect
                          data={statusList || []}
                          labelKey={"name"}
                          valueKey={"id"}
                          label={"Select status"}
                          value={String(leadData?.status?.id)}
                          onChange={(e) => changeLeadStatus(e)}
                        />
                      )}
                    </CardBody>
                  </Card>
                  <Card className="my-2">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <Podcast className={iconClass} />{" "}
                          <p className="text-sm font-medium">Source</p>
                        </div>
                        {adminRole && (
                          <>
                            {toggleSource ? (
                              <Button
                                variant="light"
                                onPress={() => {
                                  setToggleSource(false);
                                }}
                                size="sm"
                                isIconOnly
                                className="w-6 h-6 rounded-full bg-none"
                              >
                                <Pencil className={iconClass} />
                              </Button>
                            ) : (
                              <Button
                                variant="light"
                                onPress={() => {
                                  setToggleSource(true);
                                }}
                                size="sm"
                                isIconOnly
                                className="w-6 h-6 rounded-full bg-none"
                              >
                                <X className={iconClass} />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardBody>
                      {toggleSource ? (
                        <div className="flex flex-col">
                          <span className="text-sm">{leadData?.source}</span>
                        </div>
                      ) : (
                        <Select
                          label="Source"
                          selectedKeys={[leadData?.source]}
                          onSelectionChange={(e) => {
                            let key = Array.from(e)[0];
                            handleUpdateSource(key);
                          }}
                        >
                          {leadSource.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    </CardBody>
                  </Card>

                  <Card className="my-2">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className={iconClass} />{" "}
                        <p className="text-sm font-medium">Lead description</p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm">{leadData?.description}</p>
                    </CardBody>
                  </Card> */}

                  <Card className="my-2 overflow-hidden border border-default-200 shadow-sm">
                    <CardHeader className="border-b border-default-200 bg-gradient-to-r from-default-50 to-white px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText className={iconClass} />
                        <p className="text-sm font-semibold">
                          Lead Information
                        </p>
                      </div>
                    </CardHeader>

                    <CardBody className="p-3">
                      <div className="grid gap-2">
                        {/* Assignee */}
                        <div className="rounded-xl border border-default-200 bg-default-50/60 p-2.5">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <User2 className={iconClass} />
                              <p className="text-xs font-semibold text-default-600">
                                Assignee
                              </p>
                            </div>

                            <Button
                              variant="light"
                              onPress={() => {
                                if (
                                  leadData?.proposalStatus === "APPROVED" ||
                                  leadData?.proposalStatus === "INITIATED" ||
                                  leadData?.proposalStatus === "DRAFT"
                                ) {
                                  addToast({
                                    title: "RESTRICTED",
                                    color: "danger",
                                    description:
                                      "Service name cannot be changed as proposal is already approved or initiated or draft.",
                                  });
                                  return;
                                }
                                setToggleAssignee(!toggleAssignee);
                              }}
                              size="sm"
                              isIconOnly
                              className="h-6 w-6 min-w-6 rounded-full"
                            >
                              {toggleAssignee ? (
                                <Pencil className={iconClass} />
                              ) : (
                                <X className={iconClass} />
                              )}
                            </Button>
                          </div>

                          {toggleAssignee ? (
                            <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">
                              <span className="block text-sm font-semibold leading-4">
                                {leadData?.assignee?.fullName}
                              </span>
                              <span className="block break-all text-xs text-default-500">
                                {leadData?.assignee?.email}
                              </span>
                            </div>
                          ) : (
                            <NewSelect
                              data={allUsers || []}
                              labelKey="fullName"
                              valueKey="id"
                              label="Select assignee"
                              value={String(leadData?.assigne?.id)}
                              onChange={(e) => changeLeadAssignee(e)}
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {/* Status */}
                          <div className="rounded-xl border border-default-200 bg-default-50/60 p-2.5">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <ChartBarDecreasing className={iconClass} />
                                <p className="text-xs font-semibold text-default-600">
                                  Status
                                </p>
                              </div>

                              <Button
                                variant="light"
                                onPress={() => {
                                  if (
                                    leadData?.proposalStatus === "APPROVED" ||
                                    leadData?.proposalStatus === "INITIATED" ||
                                    leadData?.proposalStatus === "DRAFT"
                                  ) {
                                    addToast({
                                      title: "RESTRICTED",
                                      color: "danger",
                                      description:
                                        "Service name cannot be changed as proposal is already approved or initiated or draft.",
                                    });
                                    return;
                                  }
                                  if (toggleStatus)
                                    dispatch(getAllStatusData());
                                  setToggleStatus(!toggleStatus);
                                }}
                                size="sm"
                                isIconOnly
                                className="h-6 w-6 min-w-6 rounded-full"
                              >
                                {toggleStatus ? (
                                  <Pencil className={iconClass} />
                                ) : (
                                  <X className={iconClass} />
                                )}
                              </Button>
                            </div>

                            {toggleStatus ? (
                              <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">
                                <span className="text-sm">
                                  {leadData?.status?.name}
                                </span>
                              </div>
                            ) : (
                              <NewSelect
                                data={statusList || []}
                                labelKey="name"
                                valueKey="id"
                                label="Select status"
                                value={String(leadData?.status?.id)}
                                onChange={(e) => changeLeadStatus(e)}
                              />
                            )}
                          </div>

                          {/* Source */}
                          <div className="rounded-xl border border-default-200 bg-default-50/60 p-2.5">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Podcast className={iconClass} />
                                <p className="text-xs font-semibold text-default-600">
                                  Source
                                </p>
                              </div>

                              {adminRole && (
                                <Button
                                  variant="light"
                                  onPress={() => {
                                    if (
                                      leadData?.proposalStatus === "APPROVED" ||
                                      leadData?.proposalStatus ===
                                        "INITIATED" ||
                                      leadData?.proposalStatus === "DRAFT"
                                    ) {
                                      addToast({
                                        title: "RESTRICTED",
                                        color: "danger",
                                        description:
                                          "Service name cannot be changed as proposal is already approved or initiated or draft.",
                                      });
                                      return;
                                    }
                                    setToggleSource(!toggleSource);
                                  }}
                                  size="sm"
                                  isIconOnly
                                  className="h-6 w-6 min-w-6 rounded-full"
                                >
                                  {toggleSource ? (
                                    <Pencil className={iconClass} />
                                  ) : (
                                    <X className={iconClass} />
                                  )}
                                </Button>
                              )}
                            </div>

                            {toggleSource ? (
                              <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">
                                <span className="text-sm">
                                  {leadData?.source}
                                </span>
                              </div>
                            ) : (
                              <Select
                                label="Source"
                                selectedKeys={[leadData?.source]}
                                onSelectionChange={(e) => {
                                  let key = Array.from(e)[0];
                                  handleUpdateSource(key);
                                }}
                              >
                                {leadSource.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Lead Description */}
                        <div className="rounded-xl border border-default-200 bg-default-50/60 p-2.5">
                          <div className="mb-1.5 flex items-center gap-2">
                            <FileText className={iconClass} />
                            <p className="text-xs font-semibold text-default-600">
                              Lead Description
                            </p>
                          </div>

                          <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">
                            <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm text-default-700">
                              {leadData?.lead?.description ||
                                "No description available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* <Card className="my-2">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Link className={iconClass} />{" "}
                        <p className="text-sm font-medium">Link</p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm font-medium">{leadData?.urls}</p>
                    </CardBody>
                  </Card> */}

                  {/* {(department === "Quality Team" || adminRole) && (
                    <Card className="my-2">
                      <CardHeader>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            <User2 className={iconClass} />{" "}
                            <p className="text-sm font-medium">
                              Assigne to same person{" "}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="flex gap-1.5">
                        <Button color="primary" onPress={sameAssigneePresonFun}>
                          Same
                        </Button>
                        <Button onPress={notSameAssigneePresonFun}>
                          Not same
                        </Button>
                      </CardBody>
                    </Card>
                  )} */}
                </div>
              </div>
            </div>
            <div>
              <Card className="my-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageCircle className={iconClass} />
                    <p className="text-sm font-medium">Comments / Upload </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <NewSelect
                    placeholder="Select comment..."
                    data={[{ name: "Other" }, ...allComments]}
                    valueKey={"name"}
                    labelKey={"name"}
                    label={"Comments"}
                    isClearable
                    value={selectedComment}
                    onChange={(e) => {
                      if (
                        leadData?.proposalStatus === "APPROVED" ||
                        leadData?.proposalStatus === "INITIATED"
                      ) {
                        addToast({
                          title: "RESTRICTED",
                          color: "danger",
                          description:
                            "Service name cannot be changed as proposal is already approved or initiated.",
                        });
                        return;
                      }
                      setSelectedComment(e);
                      setCustomComment("");
                    }}
                  />
                  {selectedComment === "Other" && (
                    <Textarea
                      className="my-2"
                      value={customComment}
                      placeholder="Please write your remarks"
                      onChange={(e) => {
                        if (
                          leadData?.proposalStatus === "APPROVED" ||
                          leadData?.proposalStatus === "INITIATED"
                        ) {
                          addToast({
                            title: "RESTRICTED",
                            color: "danger",
                            description:
                              "Service name cannot be changed as proposal is already approved or initiated.",
                          });
                          return;
                        }
                        setCustomComment(e.target.value);
                      }}
                    />
                  )}
                  <BulkFileUploader
                    files={files}
                    setFiles={setFiles}
                    leadData={leadData}
                  />
                </CardBody>
                <CardFooter className="flex justify-end">
                  <div>
                    <Button
                      color="primary"
                      isDisabled={remarkLoading === "pending"}
                      isLoading={remarkLoading === "pending"}
                      onPress={onSubmit}
                    >
                      Submit
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              <Card className="my-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquareMore className={iconClass} />
                    <p className="text-sm font-medium">Remarks </p>
                  </div>
                </CardHeader>
                <CardBody className="max-h-[200px] overflow-auto">
                  {remarkData?.map((remark) => {
                    return (
                      <div
                        key={`remark${remark?.id}`}
                        className="rounded-md border-1 p-2 my-1"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <User
                                description={dayjs(
                                  remark?.latestUpdated,
                                )?.format("DD-MM-YYYY, HH:mm A")}
                                name={remark?.updatedBy?.fullName}
                              />
                            </div>
                            <p className="text-sm">{remark?.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex justify-between items-center">
                              <ImageGroup
                                images={remark?.imageList?.map(
                                  (item) => item?.filePath,
                                )}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => updateRemarkModalPress(remark)}
                              >
                                <Pencil className={iconClass} />
                              </Button>
                              {adminRole && (
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => deleteRemarkModalPress(remark)}
                                >
                                  <Trash className={iconClass} color="red" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            </div>
            <Modal
              size="3xl"
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={addressModal.isOpen}
              onOpenChange={addressModal.onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Update address
                    </ModalHeader>
                    <ModalBody>
                      <form
                        className="w-full flex flex-col gap-4 "
                        onSubmit={addressForm.handleSubmit(handleAddressFinish)}
                      >
                        <div className="w-full grid grid-cols-2 gap-4 max-h-[65vh] overflow-auto px-2 py-1">
                          <Controller
                            name="address"
                            control={addressForm.control}
                            render={({ field }) => (
                              <Input
                                isRequired
                                label="Address"
                                name="address"
                                errorMessage={
                                  addressForm.formState.errors?.address?.message
                                }
                                {...field}
                              />
                            )}
                          />
                          <Controller
                            name="country"
                            control={addressForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired
                                data={countryList}
                                label="Country"
                                labelKey="name"
                                valueKey="name"
                                errorMessage={
                                  addressForm.formState.errors?.country?.message
                                }
                                {...field}
                                onChange={(value) => {
                                  field.onChange(value);
                                  dispatch(getAllStatesByCountryName(value));
                                }}
                              />
                            )}
                          />

                          <Controller
                            name="state"
                            control={addressForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired
                                data={statesList}
                                label="State"
                                labelKey="name"
                                valueKey="name"
                                errorMessage={
                                  addressForm.formState.errors?.state?.message
                                }
                                {...field}
                                onChange={(value) => {
                                  field.onChange(value);
                                  dispatch(getAllCitiesByStateName(value));
                                }}
                              />
                            )}
                          />

                          <Controller
                            name="city"
                            control={addressForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired
                                data={citiesList}
                                label="City"
                                labelKey="name"
                                valueKey="name"
                                errorMessage={
                                  addressForm.formState.errors?.city?.message
                                }
                                {...field}
                              />
                            )}
                          />

                          <Controller
                            name="pinCode"
                            control={addressForm.control}
                            render={({ field }) => (
                              <Input
                                label="Pin code"
                                isRequired
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    allowOnlyNumbers(e.target.value, 6),
                                  )
                                }
                              />
                            )}
                          />
                        </div>
                        <ModalFooter className="w-full flex justify-end">
                          <Button onPress={onClose}>Cancel</Button>
                          <Button color="primary" type="submit">
                            Submit
                          </Button>
                        </ModalFooter>
                      </form>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            <Modal
              size="3xl"
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={industryModal.isOpen}
              onOpenChange={industryModal.onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Update industry
                    </ModalHeader>
                    <ModalBody>
                      <form
                        className="w-full flex flex-col gap-4 "
                        onSubmit={industryForm.handleSubmit(
                          handleIndustryFinish,
                        )}
                      >
                        <div className="w-full grid grid-cols-2 gap-4 max-h-[65vh] overflow-auto px-2 py-1">
                          <Controller
                            name="industriesId"
                            control={industryForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired={true}
                                data={allIndustry || []}
                                label="Select industry"
                                name="industriesId"
                                labelKey="name"
                                valueKey="id"
                                value={field.value}
                                onChange={(selectedValue) => {
                                  dispatch(
                                    getSubIndustryByIndustryId(selectedValue),
                                  );
                                  field.onChange(selectedValue);
                                }}
                                errorMessage={
                                  industryForm.formState.errors?.industriesId
                                    ?.message
                                }
                              />
                            )}
                          />

                          <Controller
                            name="subIndustryId"
                            control={industryForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired={true}
                                data={subIndustryListById || []}
                                label="Select sub industry"
                                name="subIndustryId"
                                labelKey="name"
                                valueKey="id"
                                value={field.value}
                                onChange={(selectedValue) => {
                                  dispatch(
                                    getSubSubIndustryBySubIndustryId(
                                      selectedValue,
                                    ),
                                  );
                                  field.onChange(selectedValue);
                                }}
                                errorMessage={
                                  industryForm.formState.errors?.subIndustryId
                                    ?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            name="subsubIndustryId"
                            control={industryForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired={true}
                                data={subSubIndustryListById || []}
                                label="Select category"
                                name="subsubIndustryId"
                                labelKey="name"
                                valueKey="id"
                                value={field.value}
                                onChange={(selectedValue) => {
                                  dispatch(
                                    getIndustryDataBySubSubIndustryId(
                                      selectedValue,
                                    ),
                                  );
                                  field.onChange(selectedValue);
                                }}
                                errorMessage={
                                  industryForm.formState.errors
                                    ?.subsubIndustryId?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            name="industriesDataId"
                            control={industryForm.control}
                            render={({ field }) => (
                              <NewSelect
                                isRequired={true}
                                data={industryDataListById || []}
                                label="Select business activity"
                                name="industriesDataId"
                                labelKey="name"
                                valueKey="id"
                                selectionMode="multiple"
                                value={field.value}
                                onChange={(selectedValue) => {
                                  field.onChange(selectedValue);
                                }}
                                errorMessage={
                                  industryForm.formState.errors
                                    ?.industriesDataId?.message
                                }
                              />
                            )}
                          />
                        </div>
                        <ModalFooter className="w-full flex justify-end">
                          <Button onPress={onClose}>Cancel</Button>
                          <Button color="primary" type="submit">
                            Submit
                          </Button>
                        </ModalFooter>
                      </form>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>

            <Modal
              size="2xl"
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={contactModal.isOpen}
              onOpenChange={contactModal.onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      {editContact ? "Edit contact" : "Add contact"}
                    </ModalHeader>
                    <ModalBody>
                      <form
                        className="w-full flex flex-col gap-4 "
                        onSubmit={contactForm.handleSubmit(handleContctFinish)}
                      >
                        <div className="w-full grid grid-cols-2 gap-4 max-h-[65vh] overflow-auto px-2 py-1">
                          <Controller
                            name="name"
                            control={contactForm.control}
                            render={({ field }) => (
                              <Input
                                isRequired
                                errorMessage="please enter the name "
                                label="Name"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            )}
                          />

                          <Controller
                            name="email"
                            control={contactForm.control}
                            render={({ field }) => (
                              <Input
                                label="Email"
                                type="email"
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(formatEmail(e.target.value))
                                }
                              />
                            )}
                          />

                          <Controller
                            name="contactNo"
                            control={contactForm.control}
                            render={({ field }) => (
                              <Input
                                isRequired
                                errorMessage="please enter the contact number "
                                label="Contact number"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    allowOnlyNumbers(e.target.value),
                                  )
                                }
                              />
                            )}
                          />
                        </div>
                        <ModalFooter className="w-full flex justify-end">
                          <Button onPress={onClose}>Cancel</Button>
                          <Button color="primary" type="submit">
                            Submit
                          </Button>
                        </ModalFooter>
                      </form>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>

            <Modal
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={deleteModal.isOpen}
              onOpenChange={deleteModal.onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Delete
                    </ModalHeader>
                    <ModalBody>
                      <p>Are you sure you want to delete this Item?</p>
                    </ModalBody>
                    <ModalFooter className="w-full flex justify-end">
                      <Button onPress={onClose}>Cancel</Button>
                      <Button color="primary" onPress={confirmDeleteContact}>
                        Submit
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>

            <Modal
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={deleteRemarkModal.isOpen}
              onOpenChange={deleteRemarkModal.onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Delete
                    </ModalHeader>
                    <ModalBody>
                      <p className="font-medium">
                        Are you sure you want to delete this Item?
                      </p>
                    </ModalBody>
                    <ModalFooter className="w-full flex justify-end">
                      <Button onPress={onClose}>Cancel</Button>
                      <Button color="primary" onPress={conFirmDeleteRemark}>
                        Submit
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>

            <Modal
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={remarkModal.isOpen}
              onOpenChange={remarkModal.onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Update remark
                    </ModalHeader>
                    <ModalBody>
                      <form
                        className="w-full flex flex-col gap-4 "
                        onSubmit={remarkForm.handleSubmit(handleUpdateRemark)}
                      >
                        <div className="w-full grid gap-4 max-h-[65vh] overflow-auto px-2 py-1">
                          <Controller
                            name="message"
                            control={remarkForm.control}
                            render={({ field }) => (
                              <NewSelect
                                placeholder="Select comment..."
                                data={[{ name: "Other" }, ...allComments]}
                                valueKey={"name"}
                                labelKey={"name"}
                                label={"Comments"}
                                value={field.value}
                                isClearable
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                              />
                            )}
                          />
                          {remarkDataItem?.type === "Other" && (
                            <Controller
                              name="textMessage"
                              control={remarkForm.control}
                              render={({ field }) => (
                                <Textarea
                                  isRequired
                                  className="my-2"
                                  value={field.value}
                                  placeholder="Please write your remarks"
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              )}
                            />
                          )}
                        </div>
                        <ModalFooter className="w-full flex justify-end">
                          <Button onPress={onClose}>Cancel</Button>
                          <Button color="primary" type="submit">
                            Submit
                          </Button>
                        </ModalFooter>
                      </form>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </>
      ) : (
        <StatusDisplay type="notfound" message="Lead is not assigned to you " />
      )}
    </>
  );
};

export default LeadInfo;
