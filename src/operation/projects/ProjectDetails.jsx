import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
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
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addClientLogInCredentialForPortal,
  getClientLogInCredentialDetailForPortal,
  getHistoryByMileStoneIdAndProjectId,
  getOperationProjectDetailById,
  getRequiredDocumentsByProductId,
  updateApplicantTypeInProject,
  updateAssigneeForMileStone,
  updateAssignmentStatusForMileStone,
  uploadDocumentInProjects,
} from "../../toolkit/slices/operationSlice";
import { Link, useParams } from "react-router-dom";
import {
  BookText,
  Building,
  Calendar,
  EllipsisVertical,
  GitFork,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  User2,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import {
  getAllMilestoneStatusesForOperations,
  getUsersListByDepartmentId,
} from "../../toolkit/slices/commonSlice";
import { statusColorCode, statusColors } from "../../common";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { getApplicantTypeList } from "../../toolkit/slices/settingSlice";
import FileUploader from "../../components/FileUploader";

export const WhatsAppIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        d="M12.004 2C6.476 2 2 6.486 2 12.023c0 1.983.579 3.83 1.575 5.386L2 22l4.674-1.53A10.003 10.003 0 0 0 12.004 22C17.532 22 22 17.514 22 11.977 22 6.487 17.532 2 12.004 2Zm-.014 18.005c-1.605 0-3.115-.477-4.377-1.287l-.313-.2-2.774.91.914-2.705-.202-.322a8.002 8.002 0 1 1 6.752 3.604Zm4.445-5.635c-.244-.122-1.446-.713-1.67-.793-.224-.081-.387-.122-.55.122-.163.244-.63.793-.773.957-.142.163-.285.183-.53.061-.244-.122-1.033-.381-1.964-1.216-.726-.648-1.215-1.447-1.36-1.691-.142-.244-.015-.377.107-.498.11-.108.244-.285.366-.428.122-.142.163-.244.244-.407.081-.163.041-.305-.02-.428-.061-.122-.55-1.324-.753-1.812-.199-.479-.402-.413-.55-.42l-.468-.007a.902.902 0 0 0-.651.305c-.224.244-.855.835-.855 2.035s.875 2.362 1.001 2.524c.122.163 1.722 2.627 4.176 3.684.584.252 1.04.402 1.395.514.586.186 1.119.16 1.54.097.47-.07 1.446-.59 1.65-1.162.204-.57.204-1.06.142-1.162-.061-.102-.224-.163-.468-.285Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const PdfIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6 2C4.897 2 4 2.897 4 4v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V8l-6-6H6zm7 1.414L18.586 9H14a1 1 0 0 1-1-1V3.414zM7 13h1.5a1.5 1.5 0 0 0 0-3H7v3zm1.5-2a.5.5 0 0 1 0 1H8v-1h.5zM11 10v4h1v-1h.5a1.5 1.5 0 0 0 0-3H11zm1.5 1a.5.5 0 0 1 0 1H12v-1h.5zM15 10v4h1v-1h1v-1h-1v-1h1v-1h-2z"
      />
    </svg>
  );
};

const documentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  companyDocSourceId: z.coerce.number().min(1, "Source is required"),
  isFromCompanyDoc: z.boolean(),
  expiryDate: z.string().optional(),
  isPermanent: z.boolean(),
  fileSizeKb: z.coerce.number().min(1, "File size required"),
  fileFormat: z.string().min(1, "File format is required"),
  remarks: z.string().optional(),
});

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const assigneeModal = useDisclosure();
  const statusModal = useDisclosure();
  const clientModal = useDisclosure();
  const docModal = useDisclosure();
  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail,
  );
  const clientLoginPortalCredentials = useSelector(
    (state) => state.operation.clientLoginCredential,
  );
  const requiredDocsList = useSelector(
    (state) => state.operation.requiredDoucmentListOfProduct,
  );
  const userListBydepartment = useSelector(
    (state) => state.common.userListByDepartment,
  );
  const milestoneStatusList = useSelector(
    (state) => state.common.milestoneStatusList,
  );
  const mileStoneHistoryDetail = useSelector(
    (state) => state.operation.mileStoneEventHistory,
  );
  const applicantTypeList = useSelector(
    (state) => state.setting.applicantTypeList,
  );

  const [assigneeObj, setAssigneeObj] = useState({
    assignmentId: null,
    newUserId: null,
    reassignmentReason: "",
    changedById: null,
  });

  const [statusObj, setStatusObj] = useState({
    assignmentId: null,
    newStatusName: "",
    statusReason: "",
    changedById: null,
  });

  const [isCredentials, setIsCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    portalName: "",
    portalUrl: "",
    username: "",
    password: "",
    remarks: "",
  });
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    dispatch(getOperationProjectDetailById({ projectId, userId }));
    dispatch(getAllMilestoneStatusesForOperations());
    dispatch(getClientLogInCredentialDetailForPortal({ projectId, userId }));
    dispatch(getApplicantTypeList({ page: 1, size: 1000 }));
  }, [projectId]);

  const handleChangeAssignee = () => {
    dispatch(updateAssigneeForMileStone(assigneeObj))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Assignee updated successfully !.",
            color: "success",
          });
          assigneeModal.onClose();
          dispatch(getOperationProjectDetailById({ projectId, userId }));
          setAssigneeObj({
            assignmentId: null,
            newUserId: null,
            reassignmentReason: "",
            changedById: null,
          });
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleStatusChange = () => {
    dispatch(updateAssignmentStatusForMileStone(statusObj))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Status updated successfully !.",
            color: "success",
          });
          setStatusObj({
            assignmentId: null,
            newStatusName: "",
            statusReason: "",
            changedById: null,
          });
          statusModal.onClose();
          dispatch(getOperationProjectDetailById({ projectId, userId }));
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch((error) => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    dispatch(addClientLogInCredentialForPortal({ projectId, userId, data }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Client login credentials is added !.",
            color: "success",
          });
          setCredentials({
            portalName: "",
            portalUrl: "",
            username: "",
            password: "",
            remarks: "",
          });
          setIsCredentials(false);
          dispatch(
            getClientLogInCredentialDetailForPortal({ projectId, userId }),
          );
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  useEffect(() => {
    if (detailedData?.milestones?.length > 0) {
      dispatch(
        getHistoryByMileStoneIdAndProjectId({
          milestoneId: detailedData?.milestones?.[0]?.milestoneId,
          projectId: detailedData?.milestones?.[0]?.projectId,
          userId,
        }),
      );
    }
  }, [detailedData]);

  const handleChangeAccordian = (milestoneId, projectId, userId) => {
    dispatch(
      getHistoryByMileStoneIdAndProjectId({ milestoneId, projectId, userId }),
    );
  };

  const handleUpdateApplicantType = (applicantTypeId) => {
    dispatch(updateApplicantTypeInProject({ applicantTypeId, projectId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Applicant type updated successfully !.",
            color: "success",
          });
          dispatch(getOperationProjectDetailById({ projectId, userId }));
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      fileName: "",
      fileSizeKb: "",
      companyDocSourceId: "",
      fileFormat: "",
      expiryDate: "",
      remarks: "",
      isFromCompanyDoc: false,
      isPermanent: false,
    },
  });

  const openUploadForDoc = (doc) => {
    setSelectedDoc(doc);

    // reset form each time you open for a new card
    reset({
      fileName: doc?.fileName || "",
      fileSizeKb: doc?.fileSizeKb || "",
      companyDocSourceId: doc?.companyDocSourceId || "",
      fileFormat: doc?.fileFormat || "",
      expiryDate: doc?.expiryDate || "",
      remarks: doc?.remarks || "",
      isFromCompanyDoc: !!doc?.isFromCompanyDoc,
      isPermanent: !!doc?.permanent || !!doc?.isPermanent,
    });

    docModal.onOpen();
  };

  const onDocumentSubmit = (data) => {
    data.projectId = projectId;
    data.requiredDocumentId = selectedDoc.documentId;
    data.uploadedById = Number(userId);
    data.createdById = Number(userId);
    dispatch(uploadDocumentInProjects({ projectId, data }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Doucment uploaded successfully !.",
            color: "success",
          });
          reset();
          docModal.onClose();
          dispatch(
            getRequiredDocumentsByProductId({
              userId,
              projectId,
            }),
          );
        } else {
          addToast({
            title: resp?.payload?.status,
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between gap-3 px-3">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="font-medium">
                {detailedData?.projectDetails?.name}
              </h1>
              <h3 className="text-default-500 text-xs">
                {detailedData?.projectDetails?.projectNo}{" "}
                {detailedData?.projectDetails?.date &&
                  `(created date : ${dayjs(detailedData?.projectDetails?.createdDate).format("DD-MM-YYYY")})`}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />{" "}
              <h3 className="text-sm font-medium">
                {detailedData?.projectDetails?.companyName}
              </h3>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4" />{" "}
              <div className="flex flex-col ">
                <p className="text-sm">
                  {[
                    detailedData?.projectDetails?.address,
                    detailedData?.projectDetails?.city,
                    detailedData?.projectDetails?.state,
                    detailedData?.projectDetails?.country,
                  ].join(",")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4" />{" "}
              <div className="flex flex-col ">
                <p className="text-sm">
                  Last updated :{" "}
                  {dayjs(detailedData?.projectDetails?.updatedDate).format(
                    "DD-MM-YYYY",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" isIconOnly radius="full">
              <EllipsisVertical />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem
              key="documents"
              startContent={<BookText />}
              onPress={() => {
                onOpen();
                dispatch(
                  getRequiredDocumentsByProductId({
                    userId,
                    projectId,
                  }),
                );
              }}
            >
              Documents
            </DropdownItem>
            <DropdownItem
              key="clientLoginDetails"
              startContent={<User2 />}
              onPress={clientModal.onOpen}
            >
              Client login credentials
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <Accordion variant="splitted" defaultExpandedKeys={["0"]}>
          {detailedData?.milestones?.length > 0 &&
            detailedData?.milestones?.map((detail, idx) => {
              return (
                <AccordionItem
                  onPress={(e) => {
                    console.log("jkhghjfjdjg", e);
                    handleChangeAccordian(
                      detail?.milestoneId,
                      detail?.projectId,
                      userId,
                    );
                  }}
                  key={idx}
                  aria-label="Accordion 1"
                  title={
                    <>
                      {detail?.milestoneName}{" "}
                      <Chip
                        size="sm"
                        color={statusColors[detail?.status]}
                        className="ml-1"
                      >
                        {detail?.status}
                      </Chip>
                    </>
                  }
                  classNames={{ title: "font-medium" }}
                >
                  <div className="grid grid-cols-4 border-t border-gray-300 max-h-[60vh] overflow-auto">
                    <div className="col-span-1 border-r border-gray-300 p-4">
                      <Card key={`contact${idx}`}>
                        <CardHeader className="w-full flex justify-between">
                          <User
                            description={detail?.assignedUser?.email}
                            name={detail?.assignedUser?.fullName}
                            classNames={{ name: "font-medium font-sans" }}
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => {
                              assigneeModal.onOpen();
                              dispatch(
                                getUsersListByDepartmentId(
                                  detail?.departmentId,
                                ),
                              );
                              setAssigneeObj((prev) => ({
                                ...prev,
                                assignmentId: detail?.id,
                                changedById: userId,
                              }));
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardBody>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <p className="text-muted-foreground text-sm">
                              {detail?.assignedUser?.contactNo}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitFork className="w-4 h-4" />
                            <p className="text-muted-foreground text-sm">
                              {detail?.departmentName}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    <div className="col-span-3 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <h2 className="font-medium">
                            {detailedData?.projectDetails?.productName}
                          </h2>
                          <Chip size="sm" color={statusColors[detail?.status]}>
                            {detail?.status}
                          </Chip>
                        </div>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button radius="full" variant="flat" isIconOnly>
                              <EllipsisVertical />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Static Actions"
                            selectionMode="single"
                          >
                            <DropdownItem
                              key="updateStatus"
                              onPress={() => {
                                statusModal.onOpen();
                                setStatusObj((prev) => ({
                                  ...prev,
                                  newStatusName: detail?.status,
                                  assignmentId: detail?.id,
                                  changedById: userId,
                                }));
                              }}
                            >
                              Update status
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <div className="max-h-[35vh] overflow-auto border rounded-lg mt-1.5">
                        {mileStoneHistoryDetail?.assignmentEvents?.map(
                          (history, index) => (
                            <div
                              key={index}
                              className="flex gap-3 px-4 py-3 border-b last:border-b-0"
                            >
                              {/* Yellow Dot */}
                              <div className="flex flex-col items-center pt-1">
                                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
                              </div>

                              {/* Content */}
                              <div className="flex flex-col">
                                {/* Title */}
                                <div className="text-sm font-medium text-slate-700">
                                  <p className="text-blue-600 text-wrap">
                                    {history?.reason || "N/A"}
                                  </p>
                                </div>

                                {/* Role Line */}
                                <div className="text-xs text-slate-500 mt-1">
                                  Assigned to:{" "}
                                  {history?.assignedToName || "Unassigned"}
                                </div>

                                {/* Admin Line */}
                                <div className="text-xs text-slate-400 mt-0.5">
                                  Assigned by : {history?.assignedByName}{" "}
                                  (Administrator) ·{" "}
                                  {dayjs(history?.date).format("MMM DD, YYYY")}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
        </Accordion>
      </div>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Documents
              </DrawerHeader>
              <DrawerBody className="max-h-[90vh] overflow-auto">
                <NewSelect
                  label={"Select applicant type"}
                  labelKey={"name"}
                  valueKey={"id"}
                  data={applicantTypeList?.length > 0 ? applicantTypeList : []}
                  onChange={(e) => handleUpdateApplicantType(e)}
                />

                {requiredDocsList?.map((doc, idx) => {
                  const hasFile = !!doc?.fileUrl;

                  const openPreview = () => {
                    const raw = String(doc?.fileUrl || "").trim();
                    const fixed =
                      raw.includes("amazonaws.com") &&
                      !raw.includes("amazonaws.com/")
                        ? raw.replace("amazonaws.com", "amazonaws.com/")
                        : raw;

                    const href =
                      fixed.startsWith("http://") ||
                      fixed.startsWith("https://")
                        ? fixed
                        : `https://${fixed}`;

                    window.open(href, "_blank", "noopener,noreferrer");
                  };

                  return (
                    <Card
                      key={`doc${idx}`}
                      className="min-h-[180px] max-h-[220px] border border-gray-200"
                    >
                      <CardBody className="flex flex-col justify-between gap-3">
                        {/* Top Section */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-semibold">
                              {doc?.documentName}
                            </h4>

                            <div className="flex gap-2 mt-1 flex-wrap">
                              {doc?.mandatory && (
                                <span className="text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                  Mandatory
                                </span>
                              )}

                              {doc?.permanent && (
                                <span className="text-[11px] bg-green-100 text-green-600 px-2 py-0.5 rounded">
                                  Permanent
                                </span>
                              )}

                              {doc?.expired && (
                                <span className="text-[11px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                                  Expired
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <span
                            className={`text-[11px] font-medium px-2 py-1 rounded ${
                              doc?.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {doc?.status}
                          </span>
                        </div>

                        {/* Middle Section – File Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {hasFile ? (
                            <>
                              <span className="truncate max-w-[180px]">
                                {doc?.fileName || "Uploaded File"}
                              </span>
                            </>
                          ) : (
                            <span className="italic text-gray-400">
                              No file uploaded
                            </span>
                          )}
                        </div>

                        {/* Bottom Section – Actions */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-400">
                            {doc?.expiryDate
                              ? `Expiry: ${doc.expiryDate}`
                              : doc?.permanent
                                ? "No Expiry (Permanent)"
                                : "No expiry date"}
                          </div>

                          {hasFile ? (
                            <button
                              type="button"
                              onClick={openPreview}
                              className="py-1.5 px-2 bg-gray-300 rounded-md text-sm cursor-pointer"
                            >
                              Preview
                            </button>
                          ) : (
                            <Button
                              size="sm"
                              color="secondary"
                              onPress={() => openUploadForDoc(doc)}
                            >
                              Upload
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={assigneeModal.isOpen}
        onOpenChange={assigneeModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update assignee
              </ModalHeader>
              <ModalBody className="max-h-[90vh] overflow-auto">
                <NewSelect
                  label={"Select assignee"}
                  data={userListBydepartment || []}
                  labelKey={"fullName"}
                  valueKey={"id"}
                  value={assigneeObj?.newUserId}
                  onChange={(e) => {
                    setAssigneeObj((prev) => ({
                      ...prev,
                      newUserId: e,
                      changedById: userId,
                    }));
                  }}
                />
                <Textarea
                  label={"Reason"}
                  value={assigneeObj?.reassignmentReason}
                  onChange={(e) => {
                    setAssigneeObj((prev) => ({
                      ...prev,
                      reassignmentReason: e.target.value,
                      changedById: userId,
                    }));
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleChangeAssignee}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update status
              </ModalHeader>
              <ModalBody className="max-h-[90vh] overflow-auto">
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select status"}
                  label={"Select status"}
                  data={milestoneStatusList || []}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={statusObj?.newStatusName}
                  onChange={(e) => {
                    setStatusObj((prev) => ({
                      ...prev,
                      newStatusName: e,
                      changedById: userId,
                    }));
                  }}
                />
                <Textarea
                  label={"Reason"}
                  isRequired
                  errorMessage="please enter reason"
                  value={statusObj?.statusReason}
                  onChange={(e) => {
                    setStatusObj((prev) => ({
                      ...prev,
                      statusReason: e.target.value,
                      changedById: userId,
                    }));
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleStatusChange}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isOpen={docModal.isOpen}
        onOpenChange={(open) => {
          docModal.onOpenChange(open);
          if (!open) setSelectedDoc(null);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Upload document
                {selectedDoc?.documentName ? (
                  <span className="text-xs text-default-400">
                    For: {selectedDoc.documentName}
                  </span>
                ) : null}
              </ModalHeader>

              <ModalBody className="max-h-[90vh] overflow-auto">
                <form onSubmit={handleSubmit(onDocumentSubmit)}>
                  <div className="max-h-[60vh] overflow-auto grid grid-cols-2 gap-2.5">
                    <Controller
                      name="fileName"
                      control={control}
                      render={({ field }) => (
                        <FileUploader
                          label={"Upload file"}
                          value={field.value}
                          onChange={(e) => field.onChange(e)}
                        />
                      )}
                    />

                    <Controller
                      name="fileSizeKb"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="File Size (KB)"
                          isInvalid={!!errors.fileSizeKb}
                          errorMessage={errors.fileSizeKb?.message}
                        />
                      )}
                    />
                    <Controller
                      name="companyDocSourceId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Company Doc Source ID"
                          isInvalid={!!errors.companyDocSourceId}
                          errorMessage={errors.companyDocSourceId?.message}
                        />
                      )}
                    />

                    <Controller
                      name="fileFormat"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="File Format"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            field.onChange(value);
                          }}
                          isInvalid={!!errors.fileFormat}
                          errorMessage={errors.fileFormat?.message}
                        >
                          <SelectItem key="pdf">PDF</SelectItem>
                          <SelectItem key="png">PNG</SelectItem>
                          <SelectItem key="jpg">JPG</SelectItem>
                          <SelectItem key="docx">DOCX</SelectItem>
                        </Select>
                      )}
                    />

                    <Controller
                      name="expiryDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Expiry Date"
                          isDisabled={false}
                        />
                      )}
                    />

                    <Controller
                      name="remarks"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Remarks"
                          minRows={3}
                          placeholder="Add remarks..."
                        />
                      )}
                    />

                    <Controller
                      name="isFromCompanyDoc"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          isSelected={field.value}
                          onValueChange={field.onChange}
                        >
                          Is From Company Doc
                        </Checkbox>
                      )}
                    />

                    <Controller
                      name="isPermanent"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          isSelected={field.value}
                          onValueChange={field.onChange}
                        >
                          Is Permanent
                        </Checkbox>
                      )}
                    />
                  </div>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
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

      <Drawer
        size="3xl"
        isOpen={clientModal.isOpen}
        onOpenChange={clientModal.onOpenChange}
        hideCloseButton
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex justify-between items-center gap-1">
                <div>
                  {isCredentials
                    ? "Add client portal login credentials"
                    : "Client portal login credentials"}
                </div>
                {isCredentials ? (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsCredentials(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsCredentials(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </DrawerHeader>
              <DrawerBody className="max-h-[90vh] overflow-auto">
                {isCredentials ? (
                  <Form className="w-full" onSubmit={onSubmit}>
                    <div className="w-full grid grid-cols-2 gap-2">
                      <Input
                        label="Portal name"
                        name="portalName"
                        isRequired
                        errorMessage="please ebter portal name"
                        value={credentials?.portalName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Portal URL"
                        name="portalUrl"
                        isRequired
                        errorMessage="please ebter portal URL"
                        value={credentials?.portalUrl}
                        onChange={handleChange}
                      />
                      <Input
                        label="Username"
                        name="username"
                        isRequired
                        errorMessage="please enter username"
                        value={credentials?.username}
                        onChange={handleChange}
                      />
                      <Input
                        label="Password"
                        name="password"
                        isRequired
                        errorMessage="please enter password"
                        value={credentials?.password}
                        onChange={handleChange}
                      />
                      <Textarea
                        label="Remarks"
                        name="remarks"
                        isRequired
                        errorMessage="please enter remark"
                        value={credentials?.remarks}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="w-full flex justify-end gap-2">
                      <Button
                        variant="flat"
                        onPress={() => setIsCredentials(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        isDisabled={!isCredentials}
                        type="submit"
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">
                          {clientLoginPortalCredentials?.companyName}
                        </p>{" "}
                        <span className="text-sm text-default-400">
                          {clientLoginPortalCredentials?.projectNo}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {clientLoginPortalCredentials?.portals?.map(
                        (item, idx) => (
                          <Card className="" key={idx}>
                            <CardHeader>
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">
                                    {item?.portalName}
                                  </h3>
                                  <Chip
                                    size="sm"
                                    color={statusColorCode[item?.status]}
                                  >
                                    {item?.status}
                                  </Chip>
                                </div>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  className="w-6 h-6 rounded-full bg-none"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardBody>
                              <div className="flex gap-1.5 items-center">
                                <span className="text-default-400 text-tiny">
                                  Portal URL
                                </span>{" "}
                                :{" "}
                                <div className="text-tiny flex flex-wrap">
                                  {item?.portalUrl}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-default-400 text-tiny">
                                    User name
                                  </span>{" "}
                                  :{" "}
                                  <span className="text-tiny">
                                    {item?.username}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-default-400 text-tiny">
                                    Password
                                  </span>{" "}
                                  :{" "}
                                  <span className="text-tiny">
                                    {item?.password}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 items-center">
                                  <span className="text-default-400 text-tiny">
                                    Remarks
                                  </span>{" "}
                                  :{" "}
                                  <span className="text-tiny">
                                    {item?.remarks}
                                  </span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProjectDetails;
