import {
  addToast,
  Avatar,
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
  Snippet,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  ChartBarDecreasing,
  EllipsisVertical,
  Factory,
  FileText,
  Link,
  MapPin,
  MessageCircle,
  MessageSquareMore,
  Pencil,
  Phone,
  Plus,
  Trash,
  User,
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
  getAllRemarkAndCommnts,
  getSingleLeadDataByLeadId,
  updateAddressInLeads,
  updateIndustriesInLeads,
  updateLeadsContact,
  updateLeadStatus,
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
  getAllUsers,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BulkFileUploader from "../../components/BulkFileUploader";
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

const LeadInfo = ({ leadData }) => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const industryModal = useDisclosure();
  const addressModal = useDisclosure();
  const contactModal = useDisclosure();
  const allUsers = useSelector((state) => state.common.usersList);
  const slugList = useSelector((state) => state.setting.slugList);
  const statusList = useSelector((state) => state.setting.statusList);
  const allComments = useSelector((state) => state.setting.allComments);
  const remarkData = useSelector((state) => state.leads.remarkData);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.common.subIndustryListByIndustryId
  );
  const subSubIndustryListById = useSelector(
    (state) => state.common.subSubIndustryListBySubIndustryId
  );
  const industryDataListById = useSelector(
    (state) => state.common.industryDataListBySubSubIndustryId
  );
  const [toggleSlug, setToggleSlug] = useState(true);
  const [toggleAssignee, setToggleAssignee] = useState(true);
  const [customComment, setCustomComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [toggleStatus, setToggleStatus] = useState(true);
  const [files, setFiles] = useState([]);
  const [editContact, setEditContact] = useState(null);

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllSlugList());
    dispatch(getAllComments());
    dispatch(getAllUsers());
    dispatch(getAllRemarkAndCommnts(leadId));
  }, [dispatch, leadId]);

  const handleUpdateLeadName = (leadName) => {
    dispatch(updateSingleLeadName({ leadName, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead name updated successfully !.",
            color: "success",
          });
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleSlug(true);
        } else {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
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
      dispatch(createRemakWithFile(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Remark added successfully !.",
              color: "success",
            });
            setFiles([]);
            setCustomComment("");
            setSelectedComment(null);
            dispatch(getAllRemarkAndCommnts(leadId));
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    } else {
      addToast({ title: "Select comment to proceed", color: "warning" });
    }
  }, [files, leadId, userId, selectedComment, customComment, dispatch]);

  const changeLeadAssignee = (assigneeId) => {
    dispatch(changeLeadAssigneeLeads({ assigneeId, leadId, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Assignee updated successfully !.",
            color: "success",
          });
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleAssignee(true);
        } else {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const changeLeadStatus = (statusId) => {
    dispatch(updateLeadStatus({ leadId, userId, statusId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Status updated successfully",
            color: "success",
          });
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          setToggleStatus(true);
        } else {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
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

  const industryModalPress = () => {
    dispatch(getAllMainIndustry());
    industryModal.onOpen();
  };

  const addressModalPress = () => {
    dispatch(getAllCountries());
    addressModal.onOpen();
  };

  const editContactModalPress = (value) => {
    contactModal.onOpen();
    contactForm.reset({
      name: value?.clientName,
      email: value?.email,
      contactNo: value?.contactNo,
    });
    setEditContact(value);
  };

  const handleAddressFinish = (values) => {
    values.leadId = leadId;
    dispatch(updateAddressInLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Address updated successfully !.",
            color: "success",
          });
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          addressModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const handleIndustryFinish = (values) => {
    values.leadId = leadId;
    dispatch(updateIndustriesInLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Industries updated successfully !.",
            color: "success",
          });
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          industryModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const handleContctFinish = (values) => {
    values.leadId = leadId;
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
            dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
            contactModal.onOpenChange(false);
            setEditContact(null);
            contactForm.reset(contactFormDefault);
          } else {
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
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
            dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
            contactModal.onOpenChange(false);
            setEditContact(null);
          } else {
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 p-2 max-h-[78vh] overflow-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full">
          <Card className="my-2">
            <CardBody>
              {toggleSlug ? (
                <div className="flex justify-between items-center">
                  <h6 className="font-medium">{leadData?.leadName}</h6>
                  <Button
                    onPress={() => setToggleSlug(false)}
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
                    label={"Select slug"}
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
          <Card className=" my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <MapPin className={iconClass} />{" "}
                  <h3 className="font-medium">Address Info</h3>
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
                  <p className="text-foreground-500 text-xs">Address</p>
                  <p className="text-xs">{leadData?.address || "-"}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">Country</p>
                  <p className="text-xs">{leadData?.country || "-"}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">State</p>
                  <p className="text-xs">{leadData?.state || "-"}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">City</p>
                  <p className="text-xs">{leadData?.city}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">Pin code</p>
                  <p className="text-xs">{leadData?.pinCode}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Factory className={iconClass} />{" "}
                  <h3 className="font-medium">Industry Info</h3>
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
                  <p className="text-foreground-500 text-xs">Industry</p>
                  <p className="text-xs">{leadData?.industries?.name}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">Sub Industry</p>
                  <p className="text-xs">{leadData?.subIndustry?.name}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">Category</p>
                  <p className="text-xs">{leadData?.subSubIndustry?.name}</p>
                </div>
                <div>
                  <p className="text-foreground-500 text-xs">
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
          <Card className="my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <User className={iconClass} />{" "}
                  <h3 className="font-medium">Assignee</h3>
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
                  <span className="font-semibold text-xs">
                    {leadData?.assigne?.fullName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {leadData?.assigne?.email}
                  </span>
                </div>
              ) : (
                <NewSelect
                  data={allUsers || []}
                  labelKey={"fullName"}
                  valueKey={"id"}
                  label={"Select assignee"}
                  value={leadData?.assigne?.id}
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
                  <h3 className="font-medium">Status</h3>
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
                  <span className="text-sm">{leadData?.status?.name}</span>
                </div>
              ) : (
                <NewSelect
                  data={statusList || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  label={"Select status"}
                  value={leadData?.status?.id}
                  onChange={(e) => changeLeadStatus(e)}
                />
              )}
            </CardBody>
          </Card>
        </div>
        <div className="w-full">
          <Card className="my-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className={iconClass} />{" "}
                <h3 className="font-medium">Lead description</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-xs">{leadData?.description}</p>
            </CardBody>
          </Card>
          <Card className="my-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link className={iconClass} />{" "}
                <h3 className="font-medium">Website link</h3>
              </div>
            </CardHeader>
            <CardBody>
              <Snippet>https://www.corpseed.com</Snippet>
            </CardBody>
          </Card>
          <Card className="my-2">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Phone className={iconClass} />{" "}
                  <h3 className="font-medium">Contacts</h3>
                </div>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  className="w-6 h-6 rounded-full bg-none"
                  onPress={() => contactModal.onOpen()}
                >
                  <Plus className={iconClass} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="max-h-[300px] overflow-auto">
              {leadData?.clients?.map((item) => {
                return (
                  <div
                    key={item?.clientName}
                    className="flex justify-between items-center border rounded-md mb-2 px-2"
                  >
                    <div className="flex flex-col p-2">
                      <span className="font-semibold text-sm">
                        {item?.clientName || "-"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item?.email || ""}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item?.contactNo || ""}
                      </span>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="light" isIconOnly size="sm">
                          <EllipsisVertical className={iconClass} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Static Actions"
                        selectionMode="single"
                        onSelectionChange={(e) =>
                          Array.from(e)[0] === "edit"
                            ? editContactModalPress(item)
                            : ""
                        }
                      >
                        <DropdownItem
                          key="edit"
                          startContent={<Pencil className={iconClass} />}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          className="text-danger"
                          startContent={<Trash className={iconClass} />}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
      <div>
        <Card className="my-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className={iconClass} />
              <h3 className="font-medium">Comments / Upload </h3>
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
              onChange={(e) => {
                setSelectedComment(e);
                setCustomComment("");
              }}
            />
            {selectedComment === "Other" && (
              <Textarea
                className="my-2"
                value={customComment}
                placeholder="Please write your remarks"
                onChange={(e) => setCustomComment(e.target.value)}
              />
            )}
            <BulkFileUploader files={files} setFiles={setFiles} />
          </CardBody>
          <CardFooter className="flex justify-end">
            <div>
              <Button color="primary" onPress={onSubmit}>
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
        <Card className="my-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareMore className={iconClass} />
              <h3 className="font-medium">Remarks </h3>
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
                        <Avatar className="w-5 h-5 text-xs">
                          {remark?.updatedBy?.fullName?.[0]}
                        </Avatar>
                        <span className="font-medium text-xs">
                          {remark?.updatedBy?.fullName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{remark?.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex justify-between items-center">
                        <ImageGroup
                          images={remark?.imageList?.map(
                            (item) => item?.filePath
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button isIconOnly size="sm" variant="light">
                          <Pencil className={iconClass} />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Trash className={iconClass} color="red" />
                        </Button>
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
                        <Textarea label="Address" name="address" {...field} />
                      )}
                    />
                    <Controller
                      name="country"
                      control={addressForm.control}
                      render={({ field }) => (
                        <NewSelect
                          data={countryList}
                          label="Country"
                          labelKey="name"
                          valueKey="name"
                          // errorMessage={addressForm.errors.country?.message}
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
                          data={statesList}
                          label="State"
                          labelKey="name"
                          valueKey="name"
                          // errorMessage={addressForm.errors.state?.message}
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
                          data={citiesList}
                          label="City"
                          labelKey="name"
                          valueKey="name"
                          // errorMessage={addressForm.errors.city?.message}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="pinCode"
                      control={addressForm.control}
                      render={({ field }) => (
                        <Input label="Pin code" isRequired {...field} />
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
                  onSubmit={industryForm.handleSubmit(handleIndustryFinish)}
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
                            dispatch(getSubIndustryByIndustryId(selectedValue));
                            field.onChange(selectedValue);
                          }}
                          // errorMessage={industryForm.errors.industriesId?.message}
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
                              getSubSubIndustryBySubIndustryId(selectedValue)
                            );
                            field.onChange(selectedValue);
                          }}
                          // errorMessage={industryForm.errors.subIndustryId?.message}
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
                              getIndustryDataBySubSubIndustryId(selectedValue)
                            );
                            field.onChange(selectedValue);
                          }}
                          // errorMessage={industryForm.errors.subsubIndustryId?.message}
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
                          // errorMessage={industryForm.errors.industriesDataId?.message}
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
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="email"
                      control={contactForm.control}
                      render={({ field }) => <Input label="Email" {...field} />}
                    />

                    <Controller
                      name="contactNo"
                      control={contactForm.control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter the contact number "
                          label="Contact number"
                          {...field}
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
    </div>
  );
};

export default LeadInfo;
