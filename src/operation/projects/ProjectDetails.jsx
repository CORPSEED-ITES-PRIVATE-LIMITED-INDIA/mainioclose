import {
  Accordion,
  AccordionItem,
  addToast,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  DatePicker,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  User,
} from "@heroui/react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addClientLogInCredentialForPortal,
  addCommentInProject,
  addExpensesInProject,
  addNoteInProject,
  createLegalRequest,
  getActivitiesByProjectId,
  getActivitiesByTypeAndProjectId,
  getClientLogInCredentialDetailForPortal,
  getHistoryByMileStoneIdAndProjectId,
  getOperationProjectDetailById,
  getRequiredDocumentsByProductId,
  mapVendorWithProjectInOperations,
  updateApplicantTypeInProject,
  updateAssigneeForMileStone,
  updateAssignmentStatusForMileStone,
  updateDocumentStatus,
  uploadDocumentInProjects,
  replaceDocumentInProjects,
} from "../../toolkit/slices/operationSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookText,
  Building,
  Calendar,
  EllipsisVertical,
  GitFork,
  IndianRupee,
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
import {
  allowOnlyNumbers,
  inrCurrency,
  statusColorCode,
  statusColors,
} from "../../common";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { getApplicantTypeList } from "../../toolkit/slices/settingSlice";
import FileUploader from "../../components/FileUploader";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  getAllVendors,
  getVendorDetailInProject,
} from "../../toolkit/slices/vendorsSlice";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "VENDOR_FINALIZED":
      return "success";
    case "VENDOR_SHORTLISTED":
      return "warning";
    case "VENDOR_REQUIRED":
      return "danger";
    case "DRAFT":
      return "default";
    default:
      return "primary";
  }
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-default-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {value || "-"}
      </p>
    </div>
  );
};

const DateItem = ({ label, value }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-default-200 bg-content1 p-4">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-default-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {formatDateTime(value)}
        </p>
      </div>
    </div>
  );
};

const VendorCard = ({ vendor, isSelected }) => {
  return (
    <Card
      className={`border shadow-none transition-all ${
        isSelected
          ? "border-success-300 bg-success-50"
          : "border-default-200 bg-content1"
      }`}
    >
      <CardBody className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={getInitials(vendor?.name)}
              className="bg-primary-100 text-primary"
            />

            <div>
              <p className="text-sm font-semibold text-foreground">
                {vendor?.name || "-"}
              </p>
              <p className="text-xs text-default-500">
                Vendor ID: {vendor?.id || "-"}
              </p>
            </div>
          </div>

          {isSelected && (
            <Chip color="success" variant="flat" size="sm">
              Selected
            </Chip>
          )}
        </div>

        <Divider />

        <div className="grid grid-cols-1 gap-2 text-sm text-default-600">
          <div className="flex justify-between gap-3">
            <span className="text-default-400">Email</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.email || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-default-400">Mobile</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.mobile || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-default-400">GST No.</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.gstNumber || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-default-400">PAN No.</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.panNumber || "-"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip
            size="sm"
            color={vendor?.status === "ACTIVE" ? "success" : "default"}
            variant="flat"
          >
            {vendor?.status || "-"}
          </Chip>

          <Chip
            size="sm"
            color={vendor?.verified ? "success" : "warning"}
            variant="flat"
          >
            {vendor?.verified ? "Verified" : "Not Verified"}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};

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

const CommentThread = ({ comment, level = 0, onReply }) => {
  return (
    <div className="mt-3" style={{ marginLeft: Math.min(level * 14, 56) }}>
      <div className="group border-l border-default-200 pl-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-default-500">
          <span className="font-semibold text-foreground">
            {comment.createdByUserName || "-"}
          </span>
          <span>•</span>
          <span>
            {comment.createdDate
              ? dayjs(comment.createdDate).format("DD/MM/YYYY, HH:mm")
              : "-"}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-default-700">
          {comment.commentText || "-"}
        </p>

        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="mt-1 text-[11px] font-medium text-primary opacity-80 hover:opacity-100"
        >
          Reply
        </button>
      </div>

      {comment.children?.length > 0 && (
        <div className="mt-2">
          {comment.children.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              level={level + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ActivityItem = ({ activity, onReply }) => {
  const renderContent = () => {
    switch (activity.activityType) {
      case "COMMENT":
        return (
          <div className="group">
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-default-700">
              {activity.details?.commentText || "-"}
            </p>

            <button
              type="button"
              onClick={() => onReply(activity.details?.id)}
              className="mt-1 text-xs font-medium text-primary opacity-80 hover:opacity-100"
            >
              Reply
            </button>

            {activity.details?.children?.length > 0 && (
              <div className="mt-3 border-l border-default-200 pl-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-default-400">
                  Replies
                </p>

                {activity.details.children.map((child) => (
                  <CommentThread
                    key={child.id}
                    comment={child}
                    onReply={onReply}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "NOTE":
        return (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-default-700">
            {activity.details?.noteText || "-"}
          </p>
        );

      case "EXPENSE":
        return (
          <div className="mt-1 text-sm text-default-700">
            <p className="font-medium text-foreground">
              {activity.details?.expenseType || "Expense"}{" "}
              {inrCurrency(activity.details?.amount)}
            </p>

            {activity.details?.description && (
              <p className="mt-1 whitespace-pre-wrap break-words text-xs text-default-500">
                {activity.details.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative flex gap-3 border-b border-default-100 py-3 text-xs last:border-b-0">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-default-500">
          <span className="font-semibold text-foreground">
            {activity.createdByUserName || "-"}
          </span>
          <span>•</span>
          <span>
            {activity.activityDate
              ? dayjs(activity.activityDate).format("DD/MM/YYYY, HH:mm")
              : "-"}
          </span>
          <span className="rounded-full bg-default-100 px-2 py-0.5 text-[10px] font-medium text-default-600">
            {activity.activityType}
          </span>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

const documentSchema = z
  .object({
    fileUrl: z.string().min(1, "File is required"),
    fileName: z.string().min(1, "File name is required"),
    isFromCompanyDoc: z.boolean().default(false),
    isPermanent: z.boolean({
      required_error: "Please select document type",
    }),
    expiryDate: z.string().nullable().optional(),
    fileSizeKb: z.coerce.number().min(1, "File size required"),
    fileFormat: z.string().min(1, "File format is required"),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isPermanent === false && !data.expiryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiry date is required when document is not permanent",
        path: ["expiryDate"],
      });
    }
  });

const verifySchema = z.object({
  newStatus: z.string().min(1, "Please select status"),
  remarks: z.string().min(1, "Remarks is required"),
});

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const lastHistoryRequestRef = useRef(null);
  const { projectId, userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const assigneeModal = useDisclosure();
  const statusModal = useDisclosure();
  const clientModal = useDisclosure();
  const docModal = useDisclosure();
  const verifyModal = useDisclosure();
  const expenseModal = useDisclosure();
  const noteModal = useDisclosure();
  const commentModal = useDisclosure();
  const legalSupportModal = useDisclosure();
  const vendorMapModal = useDisclosure();
  const vendorDrawer = useDisclosure();
  const activityDrawer = useDisclosure();

  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail,
  );
  const clientLoginPortalCredentials = useSelector(
    (state) => state.operation.clientLoginCredential,
  );
  const requiredDocsList = useSelector(
    (state) => state.operation.requiredDoucmentListOfProduct,
  );
  console.log("Required Doc List:", requiredDocsList);
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
  const activities = useSelector(
    (state) => state.operation.activitiesByProjectId?.content || [],
  );
  const vendorList = useSelector((state) => state.vendors.vendorList?.content);
  const vendorDetail = useSelector(
    (state) => state.vendors.vendorDetailInProject,
  );

  const eligibleVendors = vendorDetail?.eligibleVendors || [];

  const selectedVendor = useMemo(() => {
    if (!vendorDetail?.selectedVendorId) return null;

    return eligibleVendors.find(
      (vendor) => Number(vendor.id) === Number(vendorDetail.selectedVendorId),
    );
  }, [eligibleVendors, vendorDetail?.selectedVendorId]);

  const selectedVendorId =
    selectedVendor?.id || vendorDetail?.selectedVendorId || null;

  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [activityType, setActivityType] = useState("ALL");
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
  const [verifyDocId, setVerifyDocId] = useState(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [expenseData, setExpenseData] = useState({
    amount: "",
    expenseType: "",
    remark: "",
    expenseDate: "",
    paymentMedium: "",
  });

  const [isLegalDocUploading, setIsLegalDocUploading] = useState(false);
  const legalDocsRef = useRef([]);

  const [legalRequestData, setLegalRequestData] = useState({
    legalRequestTitle: "",
    notes: "",
    statusReason: "",
    documents: [],
    legalRequestDocumentDtoList: [],
  });

  const [vendorMapData, setVendorMapData] = useState({
    vendorId: null,
    userId: userId,
    remarks: "",
  });

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  const procurementAssignmentId =
    detailedData?.projectDetails?.procurementMilestoneAssignmentId;

  const isProcurementMilestone =
    selectedMilestone?.milestoneName?.toLowerCase() === "procurement";

  useEffect(() => {
    dispatch(getOperationProjectDetailById({ projectId, userId }));
    dispatch(getAllMilestoneStatusesForOperations());
    dispatch(getClientLogInCredentialDetailForPortal({ projectId, userId }));
    dispatch(getApplicantTypeList({ page: 1, size: 1000 }));
  }, [projectId]);

  useEffect(() => {
    if (procurementAssignmentId) {
      dispatch(
        getVendorDetailInProject({
          procurementAssignmentId,
        }),
      );
    }
  }, [dispatch, procurementAssignmentId]);

  const fetchMilestoneHistory = (mile, force = false) => {
    if (!mile?.milestoneId || !mile?.projectId || !userId) return;

    const requestKey = `${mile.projectId}-${mile.milestoneId}-${userId}`;

    if (!force && lastHistoryRequestRef.current === requestKey) {
      return;
    }

    lastHistoryRequestRef.current = requestKey;

    dispatch(
      getHistoryByMileStoneIdAndProjectId({
        milestoneId: mile.milestoneId,
        projectId: mile.projectId,
        userId,
      }),
    );
  };

  useEffect(() => {
    const first = detailedData?.milestones?.[0];

    if (!first?.milestoneId || !first?.projectId) return;

    setSelectedMilestone((prev) => {
      if (prev?.milestoneId === first.milestoneId) {
        return prev;
      }

      return first;
    });

    fetchMilestoneHistory(first);
  }, [
    detailedData?.projectDetails?.id,
    detailedData?.milestones?.[0]?.milestoneId,
    userId,
  ]);

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

          const updatedStatus = statusObj.newStatusName;

          setSelectedMilestone((prev) => ({
            ...prev,
            status: updatedStatus,
          }));

          setStatusObj({
            assignmentId: null,
            newStatusName: "",
            statusReason: "",
            changedById: null,
          });

          statusModal.onClose();

          dispatch(getOperationProjectDetailById({ projectId, userId })).then(
            (res) => {
              const updatedMilestone = res?.payload?.milestones?.find(
                (mile) => Number(mile.id) === Number(selectedMilestone?.id),
              );

              if (updatedMilestone) {
                setSelectedMilestone(updatedMilestone);
                fetchMilestoneHistory(updatedMilestone, true);
              }
            },
          );
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

  // useEffect(() => {
  //   if (detailedData?.milestones?.length > 0) {
  //     dispatch(
  //       getHistoryByMileStoneIdAndProjectId({
  //         milestoneId: detailedData?.milestones?.[0]?.milestoneId,
  //         projectId: detailedData?.milestones?.[0]?.projectId,
  //         userId,
  //       }),
  //     );
  //   }
  // }, [detailedData]);

  const handleUpdateApplicantType = (applicantTypeId) => {
    dispatch(updateApplicantTypeInProject({ applicantTypeId, projectId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Applicant type updated successfully !.",
            color: "success",
          });
          dispatch(getOperationProjectDetailById({ projectId, userId }));
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
    watch,
  } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      fileUrl: "",
      fileName: "",
      fileSizeKb: 0,
      fileFormat: "",
      expiryDate: null,
      remarks: "",
      isFromCompanyDoc: false,
      isPermanent: true,
    },
  });

  const isPermanentValue = watch("isPermanent");

  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    reset: verifyReset,
    serValue,
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      newStatus: "",
      remarks: "",
    },
  });

  const openUploadForDoc = (doc) => {
    setSelectedDoc(doc);

    const permanentValue =
      doc?.isPermanent !== undefined
        ? !!doc.isPermanent
        : doc?.permanent !== undefined
          ? !!doc.permanent
          : true;

    setIsPermanent(permanentValue);

    reset({
      fileUrl: doc?.fileUrl || "",
      fileName: doc?.fileName || "",
      fileSizeKb: doc?.fileSizeKb || 0,
      fileFormat: doc?.fileFormat || "",
      expiryDate: permanentValue ? null : doc?.expiryDate || null,
      remarks: doc?.remarks || "",
      isFromCompanyDoc: !!doc?.isFromCompanyDoc,
      isPermanent: permanentValue,
    });

    docModal.onOpen();
  };

  const openReplaceForDoc = (doc) => {
    const permanentValue =
      doc?.isPermanent !== undefined
        ? !!doc.isPermanent
        : doc?.permanent !== undefined
          ? !!doc.permanent
          : true;

    setSelectedDoc({ ...doc, isReplace: true, oldFileUrl: doc?.fileUrl || "" });
    setIsPermanent(permanentValue);

    reset({
      fileUrl: "",
      fileName: "",
      fileSizeKb: 0,
      fileFormat: "",
      expiryDate: permanentValue ? null : doc?.expiryDate || null,
      remarks: doc?.remarks || "",
      isFromCompanyDoc: !!doc?.isFromCompanyDoc,
      isPermanent: permanentValue,
    });

    docModal.onOpen();
  };

  const openVerify = (doc) => {
    setVerifyDocId(doc.uploadId);
    verifyReset({
      newStatus: "",
      remarks: "",
    });
    verifyModal.onOpen();
  };

  const handleVerifyDocument = (values) => {
    const payload = {
      newStatus: values.newStatus,
      remarks: values.remarks,
      changedById: Number(userId), // NOT in form schema
    };

    dispatch(
      updateDocumentStatus({
        documentId: verifyDocId,
        data: payload,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Document verified successfully!",
          color: "success",
        });
        verifyModal.onClose();
        dispatch(
          getRequiredDocumentsByProductId({
            userId,
            projectId,
          }),
        );
      } else {
        addToast({
          title: "Something went wrong!",
          color: "danger",
        });
      }
    });
  };

  const onDocumentSubmit = async (data) => {
    const requiredDocumentId = Number(
      selectedDoc?.documentId ||
        selectedDoc?.requiredDocumentId ||
        selectedDoc?.id,
    );

    const uploadPayload = {
      projectId: Number(projectId),
      requiredDocumentId,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      uploadedById: Number(userId),
      createdById: Number(userId),
      isFromCompanyDoc: Boolean(data.isFromCompanyDoc),
      expiryDate: data.isPermanent ? null : data.expiryDate,
      isPermanent: Boolean(data.isPermanent),
      fileSizeKb: Number(data.fileSizeKb),
      fileFormat: data.fileFormat,
      remarks: data.remarks || "",
    };

    const replacePayload = {
      projectId: Number(projectId),
      requiredDocumentId,
      fileName: data.fileName,
      uploadedById: Number(userId),
      createdById: Number(userId),
      companyDocSourceId: Number(selectedDoc?.companyDocSourceId || 0),
      isFromCompanyDoc: Boolean(data.isFromCompanyDoc),
      expiryDate: data.isPermanent ? null : data.expiryDate,
      isPermanent: Boolean(data.isPermanent),
      fileSizeKb: Number(data.fileSizeKb),
      fileFormat: data.fileFormat,
      remarks: data.remarks || "",
    };

    try {
      let resp;

      if (selectedDoc?.isReplace) {
        resp = await dispatch(
          replaceDocumentInProjects({
            projectId,
            documentId: selectedDoc?.uploadId,
            data: replacePayload,
          }),
        );
      } else {
        resp = await dispatch(
          uploadDocumentInProjects({ projectId, data: uploadPayload }),
        );
      }

      console.log("jkhsdgkjhwsgdkj", resp);
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: selectedDoc?.isReplace
            ? "Document replaced successfully!"
            : "Document uploaded successfully!",
          color: "success",
        });

        reset({
          fileUrl: "",
          fileName: "",
          fileSizeKb: 0,
          fileFormat: "",
          expiryDate: null,
          remarks: "",
          isFromCompanyDoc: false,
          isPermanent: true,
        });

        setIsPermanent(true);
        docModal.onClose();

        dispatch(
          getRequiredDocumentsByProductId({
            userId,
            projectId,
          }),
        );
      } else {
        addToast({
          title: selectedDoc?.isReplace ? "Replace failed" : "Upload failed",
          color: "danger",
          description: resp?.error.message,
        });
      }
    } catch {
      addToast({
        title: "Something went wrong!",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
  }, []);

  const handleReply = (commentId) => {
    setReplyParentId(commentId);
    commentModal.onOpen();
  };

  const handleFilterChange = (value) => {
    if (value === "ALL") {
      dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
    } else {
      dispatch(
        getActivitiesByTypeAndProjectId({
          projectId,
          type: value,
          page: 1,
          size: 50,
        }),
      );
    }
    setActivityType(value);
  };

  const handleAddComment = () => {
    dispatch(
      addCommentInProject({
        projectId,
        data: {
          commentText,
          ...(replyParentId ? { parentCommentId: replyParentId } : {}),
          createdByUserId: Number(userId),
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Comment added successfully !.",
            color: "success",
          });
          commentModal.onClose();
          setCommentText("");
          setReplyParentId(null);
          setActivityType("ALL");
          dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
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

  const handleAddNote = () => {
    dispatch(
      addNoteInProject({
        projectId,
        data: { noteText, createdByUserId: Number(userId) },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Note added successfully !.",
            color: "success",
          });
          noteModal.onClose();
          setNoteText("");
          setActivityType("ALL");
          dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
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
  const handleAddExpense = () => {
    dispatch(
      addExpensesInProject({
        projectId,
        data: { ...expenseData, createdByUserId: Number(userId) },
      }),
    ).then((resp) => {
      console.log("dsjkhksgjgkjgj", resp);
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Expense added successfully !.",
          color: "success",
        });
        expenseModal.onClose();
        setExpenseData({
          amount: "",
          expenseType: "",
          description: "",
          expenseDate: "",
        });
        setActivityType("ALL");
        dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
      } else {
        addToast({
          title: resp?.payload?.status,
          color: "danger",
          description: resp?.payload?.message,
        });
      }
    });
  };

  const [draggedDoc, setDraggedDoc] = useState(null);

  const getFileNameFromUrl = (url = "") => {
    try {
      const cleanUrl = String(url).split("?")[0];
      const name = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
      return decodeURIComponent(name || "document");
    } catch {
      return "document";
    }
  };

  const getFileTypeFromNameOrUrl = (fileName = "", fileUrl = "") => {
    const source = fileName || fileUrl || "";
    const extension = source.split("?")[0].split(".").pop()?.toLowerCase();
    return extension || "file";
  };

  const makeLegalDocUuid = () => {
    return (
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  };

  const normalizeLegalUploadedFile = (fileMeta) => {
    if (!fileMeta) return null;

    const meta = fileMeta?.data || fileMeta?.response || fileMeta;

    if (typeof meta === "string") {
      const fileUrl = meta;
      const fileName = getFileNameFromUrl(fileUrl);

      return {
        fileName,
        fileUrl,
        fileType: getFileTypeFromNameOrUrl(fileName, fileUrl),
        fileSize: 0,
        uuid: makeLegalDocUuid(),
        uploadedAt: new Date().toISOString(),
      };
    }

    const fileUrl =
      meta?.fileUrl ||
      meta?.filePath ||
      meta?.url ||
      meta?.location ||
      meta?.secureUrl ||
      meta?.path ||
      "";

    if (!fileUrl) return null;

    const fileName =
      meta?.fileName ||
      meta?.name ||
      meta?.originalName ||
      getFileNameFromUrl(fileUrl);

    return {
      fileName,
      fileUrl,
      fileType:
        meta?.fileType ||
        meta?.contentType ||
        meta?.mimeType ||
        getFileTypeFromNameOrUrl(fileName, fileUrl),
      fileSize: Number(meta?.fileSize || meta?.size || 0),
      uuid: meta?.uuid || meta?.id || makeLegalDocUuid(),
      uploadedAt: meta?.uploadedAt || new Date().toISOString(),
    };
  };

  const saveLegalDocs = (uploadedFiles) => {
    const files = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : uploadedFiles
        ? [uploadedFiles]
        : [];

    const legalDocs = files
      .map((file) => normalizeLegalUploadedFile(file))
      .filter(Boolean);

    legalDocsRef.current = legalDocs;

    setLegalRequestData((prev) => ({
      ...prev,
      documents: files,
      legalRequestDocumentDtoList: legalDocs,
    }));
  };

  const appendLegalDoc = (fileMeta) => {
    const dto = normalizeLegalUploadedFile(fileMeta);

    if (!dto) return;

    const merged = [...legalDocsRef.current];

    const alreadyExists = merged.some(
      (item) => item.fileUrl === dto.fileUrl || item.uuid === dto.uuid,
    );

    if (!alreadyExists) {
      merged.push(dto);
    }

    legalDocsRef.current = merged;

    setLegalRequestData((prev) => ({
      ...prev,
      legalRequestDocumentDtoList: merged,
    }));
  };

  const handleAddLegalRequest = () => {
    if (!legalRequestData.legalRequestTitle?.trim()) {
      addToast({
        title: "Request title required",
        description: "Please enter legal request title.",
        color: "danger",
      });
      return;
    }

    if (!legalRequestData.notes?.trim()) {
      addToast({
        title: "Description required",
        description: "Please enter request description.",
        color: "danger",
      });
      return;
    }

    if (isLegalDocUploading) {
      addToast({
        title: "File uploading",
        description: "Please wait until document upload is completed.",
        color: "warning",
      });
      return;
    }

    const legalRequestDocumentDtoList =
      legalDocsRef.current?.length > 0
        ? legalDocsRef.current
        : legalRequestData.legalRequestDocumentDtoList?.length > 0
          ? legalRequestData.legalRequestDocumentDtoList
          : (legalRequestData.documents || [])
              .map((file) => normalizeLegalUploadedFile(file))
              .filter(Boolean);

    const payload = {
      id: 0,
      projectId: Number(projectId),
      projectMilestoneAssignmentId: Number(selectedMilestone?.id || 0),

      milestoneAssigneeId: Number(
        selectedMilestone?.assignedUser?.id ||
          selectedMilestone?.assignedUserId ||
          0,
      ),

      status: "PENDING",
      statusReason: legalRequestData.statusReason || "",
      legalRequestTitle: legalRequestData.legalRequestTitle.trim(),

      assignedToLegal: Number(userId),
      createdById: Number(userId),

      notes: legalRequestData.notes.trim(),

      legalRequestDocumentDtoList,
    };

    console.log("LEGAL REQUEST FINAL PAYLOAD:", payload);

    dispatch(createLegalRequest(payload)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Success",
          description: "Legal request created successfully.",
          color: "success",
        });

        legalSupportModal.onClose();

        setLegalRequestData({
          legalRequestTitle: "",
          notes: "",
          statusReason: "",
          documents: [],
          legalRequestDocumentDtoList: [],
        });

        legalDocsRef.current = [];
        setIsLegalDocUploading(false);
      } else {
        addToast({
          title: "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Something went wrong while creating legal request.",
          color: "danger",
        });
      }
    });
  };

  const handleMapVendorWithProject = () => {
    const procurementMilestoneAssignmentId =
      detailedData?.projectDetails?.procurementMilestoneAssignmentId;

    if (!procurementMilestoneAssignmentId) {
      addToast({
        title: "Missing assignment",
        description: "Procurement milestone assignment ID not found.",
        color: "danger",
      });
      return;
    }

    if (!vendorMapData?.vendorId) {
      addToast({
        title: "Vendor required",
        description: "Please select a vendor.",
        color: "danger",
      });
      return;
    }

    const body = {
      vendorId: Number(vendorMapData.vendorId),
      userId: Number(userId),
      remarks: vendorMapData.remarks || "",
    };

    dispatch(
      mapVendorWithProjectInOperations({
        data: body,
        procurementAssignmentId: procurementMilestoneAssignmentId,
      }),
    )
      .then((resp) => {
        console.log("vendor map response", resp);
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Vendor mapped with project successfully!",
            color: "success",
          });

          vendorMapModal.onClose();

          setVendorMapData({
            vendorId: null,
            userId: userId,
            remarks: "",
          });

          dispatch(getOperationProjectDetailById({ projectId, userId }));
          dispatch(
            getVendorDetailInProject({
              procurementAssignmentId: procurementMilestoneAssignmentId,
            }),
          );
        } else {
          addToast({
            title: "FAILED",
            description: resp?.payload || "Something went wrong!",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong!",
          color: "danger",
        });
      });
  };

  const getFileFormatFromMeta = (fileMeta) => {
    const fileName = fileMeta?.fileName || "";
    const contentType = fileMeta?.contentType || "";

    const mimeFormatMap = {
      "application/pdf": "pdf",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "text/csv": "csv",
      "application/csv": "csv",
      "text/plain": "txt",
      "image/gif": "gif",
      "image/webp": "webp",
    };

    if (mimeFormatMap[contentType]) {
      return mimeFormatMap[contentType];
    }

    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (extension === "jpeg") return "jpg";

    return extension;
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full overflow-y-auto overflow-x-hidden bg-background px-3 py-3">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 pb-6">
        <section className="border-b border-default-200 bg-background pb-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Chip size="sm" color="primary" variant="flat">
                  Project Detail
                </Chip>

                {selectedMilestone?.status && (
                  <Chip
                    size="sm"
                    color={statusColors[selectedMilestone?.status] || "default"}
                    variant="flat"
                  >
                    {selectedMilestone?.status}
                  </Chip>
                )}
              </div>

              <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:gap-3">
                <h1 className="min-w-0 break-words text-xl font-semibold leading-tight text-foreground lg:text-2xl">
                  {detailedData?.projectDetails?.name || "Project"}
                </h1>

                <p className="text-xs font-medium text-default-500">
                  {detailedData?.projectDetails?.projectNo || "-"}
                  {(detailedData?.projectDetails?.createdDate ||
                    detailedData?.projectDetails?.date) &&
                    ` • Created: ${dayjs(
                      detailedData?.projectDetails?.createdDate ||
                        detailedData?.projectDetails?.date,
                    ).format("DD-MM-YYYY")}`}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-default-600">
                  <Building className="h-4 w-4 text-default-400" />
                  <span className="text-default-400">Company:</span>
                  <span className="font-medium text-foreground">
                    {detailedData?.projectDetails?.companyName || "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-default-600">
                  <Calendar className="h-4 w-4 text-default-400" />
                  <span className="text-default-400">Updated:</span>
                  <span className="font-medium text-foreground">
                    {detailedData?.projectDetails?.updatedDate
                      ? dayjs(detailedData?.projectDetails?.updatedDate).format(
                          "DD-MM-YYYY",
                        )
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-default-600">
                  <GitFork className="h-4 w-4 text-default-400" />
                  <span className="text-default-400">Milestones:</span>
                  <span className="font-medium text-foreground">
                    {detailedData?.milestones?.length || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-default-600">
                  <User2 className="h-4 w-4 text-default-400" />
                  <span className="text-default-400">Assignee:</span>
                  <span className="font-medium text-foreground">
                    {selectedMilestone?.assignedUser?.fullName || "Unassigned"}
                  </span>
                </div>
              </div>

              {detailedData?.projectDetails?.address && (
                <div className="mt-2 flex items-start gap-2 text-sm text-default-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-default-400" />
                  <span className="break-words">
                    {[
                      detailedData?.projectDetails?.address,
                      detailedData?.projectDetails?.city,
                      detailedData?.projectDetails?.state,
                      detailedData?.projectDetails?.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </span>
                </div>
              )}

              {(department === "CRT" || adminRole) &&
                detailedData?.projectDetails?.contacts?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-default-100 pt-3 text-sm">
                    {detailedData?.projectDetails?.contacts?.map(
                      (contact, index) => (
                        <div
                          key={`${contact?.contactNo || contact?.emails || index}`}
                          className="flex min-w-[240px] flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="sm"
                              name={getInitials(contact?.name)}
                              className="bg-primary-100 text-primary"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold capitalize text-foreground">
                                {`${contact?.title || ""} ${contact?.name || ""}`.trim() ||
                                  "N/A"}
                              </p>
                              <p className="truncate text-xs text-default-500">
                                {contact?.designation || "Client Contact"}
                              </p>
                            </div>
                          </div>

                          <div className="ml-8 flex flex-wrap gap-x-5 gap-y-1 text-xs text-default-600">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              {contact?.contactNo || "N/A"}
                            </span>
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {contact?.emails || "N/A"}
                              </span>
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:max-w-[560px] xl:justify-end">
              {isProcurementMilestone &&
                (department === "Procurement" || adminRole) && (
                  <Button
                    size="sm"
                    radius="md"
                    variant="flat"
                    className="font-medium"
                    onPress={() => {
                      vendorDrawer.onOpen();
                      dispatch(
                        getVendorDetailInProject({
                          procurementAssignmentId:
                            detailedData?.projectDetails
                              ?.procurementMilestoneAssignmentId,
                        }),
                      );
                    }}
                  >
                    Vendor
                  </Button>
                )}

              {isProcurementMilestone &&
                (department === "Procurement" || adminRole) && (
                  <Button
                    as={Link}
                    size="sm"
                    radius="md"
                    color="primary"
                    variant="flat"
                    className="font-medium"
                    to={`/erp/${userId}/operation/projects/${projectId}/projectDetail/purchaseOrder`}
                    state={{
                      procurementAssignmentId:
                        detailedData?.projectDetails
                          ?.procurementMilestoneAssignmentId,
                      vendorId: selectedVendorId,
                      defaultEstimatedAmount:
                        detailedData?.projectDetails?.estimatedAmount ||
                        detailedData?.projectDetails?.amount ||
                        0,
                    }}
                  >
                    Purchase Orders
                  </Button>
                )}

              <Button
                size="sm"
                radius="md"
                variant="flat"
                className="font-medium"
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
              </Button>

              <Button
                size="sm"
                radius="md"
                variant="flat"
                className="font-medium"
                onPress={clientModal.onOpen}
              >
                Client login credentials
              </Button>

              <Button
                size="sm"
                radius="md"
                color="primary"
                className="font-medium"
                onPress={activityDrawer.onOpen}
              >
                Comment
              </Button>
            </div>
          </div>
        </section>

        {!adminRole && detailedData?.milestones?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-default-100 pb-2">
            {detailedData?.milestones?.map((mile, index) => (
              <Button
                key={`${mile?.milestoneId || index}`}
                size="sm"
                radius="full"
                variant={
                  selectedMilestone?.milestoneId === mile?.milestoneId
                    ? "solid"
                    : "light"
                }
                color={
                  selectedMilestone?.milestoneId === mile?.milestoneId
                    ? "primary"
                    : "default"
                }
                className="shrink-0"
                onPress={() => {
                  setSelectedMilestone(mile);
                  fetchMilestoneHistory(mile);
                }}
              >
                {mile?.milestoneName || "Milestone"}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {adminRole && (
            <aside className="lg:col-span-3">
              <div className="sticky top-0 max-h-[calc(100vh-150px)] overflow-y-auto border-r border-default-200 pr-3">
                <div className="mb-3">
                  <p className="text-base font-semibold text-foreground">
                    Milestones
                  </p>
                  <p className="text-xs text-default-500">
                    Select a milestone to view assignment history
                  </p>
                </div>

                <div className="divide-y divide-default-100">
                  {detailedData?.milestones?.length > 0 ? (
                    detailedData?.milestones?.map((mile, index) => {
                      const isActive =
                        selectedMilestone?.milestoneId === mile?.milestoneId;

                      return (
                        <button
                          key={`${mile?.milestoneId || index}`}
                          type="button"
                          onClick={() => {
                            setSelectedMilestone(mile);
                            fetchMilestoneHistory(mile);
                          }}
                          className={`w-full px-2 py-3 text-left transition-colors ${
                            isActive
                              ? "bg-primary-50 text-primary"
                              : "hover:bg-default-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {mile?.milestoneName || "Milestone"}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-default-500">
                                {mile?.assignedUser?.fullName
                                  ? `Assigned to ${mile.assignedUser.fullName}`
                                  : "Unassigned"}
                              </p>
                            </div>

                            <Chip
                              size="sm"
                              color={statusColors[mile?.status] || "default"}
                              variant="flat"
                              className="shrink-0"
                            >
                              {mile?.status || "-"}
                            </Chip>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="py-6 text-center text-sm text-default-500">
                      No milestones found
                    </p>
                  )}
                </div>
              </div>
            </aside>
          )}

          <main className={adminRole ? "lg:col-span-9" : "lg:col-span-12"}>
            {selectedMilestone ? (
              <section className="overflow-hidden rounded-xl border border-default-200 bg-content1">
                <div className="border-b border-default-200 bg-primary-50/60 px-4 py-3">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Chip color="primary" variant="flat" size="sm">
                          Active Milestone
                        </Chip>
                        <Chip
                          size="sm"
                          color={
                            statusColors[selectedMilestone?.status] || "default"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            statusModal.onOpen();
                            setStatusObj((prev) => ({
                              ...prev,
                              newStatusName: selectedMilestone?.status,
                              assignmentId: selectedMilestone?.id,
                              changedById: userId,
                            }));
                          }}
                        >
                          {selectedMilestone?.status || "-"}
                        </Chip>
                      </div>

                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {selectedMilestone?.milestoneName || "Milestone"}
                      </h2>
                      <p className="mt-0.5 text-xs text-default-500">
                        Assignment ID: {selectedMilestone?.id || "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex min-w-[220px] items-center justify-between gap-3 rounded-lg bg-content1 px-3 py-2 shadow-sm ring-1 ring-default-200">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar
                            size="sm"
                            name={getInitials(
                              selectedMilestone?.assignedUser?.fullName ||
                                "Unassigned",
                            )}
                            className="bg-primary-100 text-primary"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {selectedMilestone?.assignedUser?.fullName ||
                                "Select Assignee"}
                            </p>
                            <p className="truncate text-xs text-default-500">
                              {selectedMilestone?.assignedUser?.email ||
                                "No assignee selected"}
                            </p>
                          </div>
                        </div>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          radius="full"
                          onPress={() => {
                            assigneeModal.onOpen();

                            dispatch(
                              getUsersListByDepartmentId(
                                selectedMilestone?.departmentId,
                              ),
                            );

                            setAssigneeObj((prev) => ({
                              ...prev,
                              assignmentId: selectedMilestone?.id,
                              changedById: userId,
                            }));
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        color="primary"
                        radius="md"
                        onPress={() => {
                          legalSupportModal.onOpen();
                          dispatch(
                            getRequiredDocumentsByProductId({
                              userId,
                              projectId,
                            }),
                          );
                        }}
                      >
                        Legal Request
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-default-100 pb-4 text-sm md:grid-cols-3">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-default-400">
                        Department
                      </dt>
                      <dd className="mt-0.5 font-semibold text-foreground">
                        {selectedMilestone?.departmentName || "-"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-default-400">
                        Assigned To
                      </dt>
                      <dd className="mt-0.5 font-semibold text-foreground">
                        {selectedMilestone?.assignedUser?.fullName ||
                          "Unassigned"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-default-400">
                        Milestone Status
                      </dt>
                      <dd className="mt-0.5 font-semibold text-foreground">
                        {selectedMilestone?.status || "-"}
                      </dd>
                    </div>
                  </dl>

                  <div className="pt-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          Assignment History
                        </p>
                        <p className="text-xs text-default-500">
                          Latest updates for selected milestone
                        </p>
                      </div>

                      <span className="text-xs font-medium text-default-500">
                        {mileStoneHistoryDetail?.assignmentEvents?.length || 0}{" "}
                        Updates
                      </span>
                    </div>

                    {mileStoneHistoryDetail?.assignmentEvents?.length > 0 ? (
                      <div className="relative space-y-0 before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-default-200">
                        {mileStoneHistoryDetail?.assignmentEvents?.map(
                          (history, index) => (
                            <div
                              key={`${history?.date || index}`}
                              className="relative flex gap-3 border-b border-default-100 py-3 last:border-b-0"
                            >
                              <div className="z-[1] mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-warning" />

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <p className="break-words text-sm font-semibold text-primary">
                                    {history?.reason || "N/A"}
                                  </p>

                                  <span className="text-xs font-medium text-default-400">
                                    {history?.date
                                      ? dayjs(history?.date).format(
                                          "DD MMM YYYY, hh:mm A",
                                        )
                                      : "-"}
                                  </span>
                                </div>

                                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-default-600">
                                  <p>
                                    <span className="text-default-400">
                                      Assigned to:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {history?.assignedToName || "Unassigned"}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-default-400">
                                      Assigned by:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {history?.assignedByName || "-"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No assignment history found
                        </p>
                        <p className="mt-1 text-sm text-default-500">
                          History will appear here once this milestone is
                          updated.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg font-semibold text-foreground">
                  No milestone selected
                </p>
                <p className="mt-1 text-sm text-default-500">
                  Select a milestone to view details.
                </p>
              </div>
            )}
          </main>
        </div>

        <Drawer
          isOpen={activityDrawer.isOpen}
          onOpenChange={activityDrawer.onOpenChange}
          size="2xl"
          classNames={{
            base: "h-screen max-h-screen",
          }}
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="border-b border-default-200">
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          Comments
                        </p>
                        <p className="text-xs text-default-500">
                          Comments, notes and expenses for this project
                        </p>
                      </div>

                      <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        onPress={onClose}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Select
                        size="sm"
                        selectedKeys={[activityType]}
                        onSelectionChange={(keys) => {
                          handleFilterChange(Array.from(keys)[0]);
                        }}
                        className="sm:max-w-[220px]"
                      >
                        <SelectItem key="ALL">All</SelectItem>
                        <SelectItem key="COMMENT">Comments</SelectItem>
                        <SelectItem key="NOTE">Notes</SelectItem>
                        <SelectItem key="EXPENSE">Expenses</SelectItem>
                      </Select>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          radius="md"
                          variant="flat"
                          onPress={() => commentModal.onOpen()}
                        >
                          Comment
                        </Button>
                        <Button
                          size="sm"
                          radius="md"
                          variant="flat"
                          onPress={() => noteModal.onOpen()}
                        >
                          Note
                        </Button>
                        <Button
                          size="sm"
                          radius="md"
                          variant="flat"
                          onPress={() => expenseModal.onOpen()}
                        >
                          Expense
                        </Button>
                      </div>
                    </div>
                  </div>
                </DrawerHeader>

                <DrawerBody className="min-h-0 flex-1 overflow-y-auto p-4">
                  {activities?.length > 0 ? (
                    <div className="divide-y divide-default-100">
                      {activities.map(
                        (activity) =>
                          activity?.details && (
                            <ActivityItem
                              key={activity.activityId}
                              activity={activity}
                              onReply={handleReply}
                            />
                          ),
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center p-10 text-center">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          No activity found
                        </p>
                        <p className="mt-1 text-sm text-default-500">
                          Add a comment, note or expense to start the timeline.
                        </p>
                      </div>
                    </div>
                  )}
                </DrawerBody>

                <DrawerFooter className="border-t border-default-200 bg-content1">
                  <Button as={Link} variant="light" to={`activities`}>
                    See All
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Done
                  </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </div>

      {/* <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Documents
              </ModalHeader>
              <ModalBody>
                <NewSelect
                  label={"Select applicant type"}
                  labelKey={"name"}
                  valueKey={"id"}
                  data={applicantTypeList?.length > 0 ? applicantTypeList : []}
                  onChange={(e) => handleUpdateApplicantType(e)}
                />

                <div className="max-h-[80vh] overflow-auto grid grid-cols-2 gap-2">
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
                        className="rounded-2xl shadow-sm border border-gray-200 bg-white my-1.5"
                      >
                        <CardBody className="p-4 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-[14px] font-semibold text-gray-800">
                                {doc?.documentName}
                              </h4>

                              <div className="flex gap-2 mt-2 flex-wrap">
                                {doc?.mandatory && (
                                  <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-md font-medium">
                                    Mandatory
                                  </span>
                                )}

                                {doc?.permanent && (
                                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-md font-medium">
                                    Permanent
                                  </span>
                                )}

                                {doc?.expired && (
                                  <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-md font-medium">
                                    Expired
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                doc?.status === "VERIFIED"
                                  ? "bg-green-100 text-green-700"
                                  : doc?.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {doc?.status}
                            </span>
                          </div>


                          <div>
                            <p className="text-sm text-gray-500 mb-2">
                              Uploaded File
                            </p>

                            {hasFile ? (
                              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <PdfIcon className="text-red-500 w-5 h-5" />
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                                      {doc?.fileName || "Document.pdf"}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {doc?.fileSizeKb
                                        ? `${doc.fileSizeKb} KB`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700 rounded-full px-4"
                                  onPress={openPreview}
                                >
                                  Download
                                </Button>
                              </div>
                            ) : (
                              <div className="text-sm italic text-gray-400">
                                No file uploaded
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-gray-500">
                            {doc?.expiryDate
                              ? `Expiry: ${dayjs(doc.expiryDate).format("DD MMM YYYY")}`
                              : doc?.permanent
                                ? "No expiry date"
                                : "No expiry date"}
                          </div>


                          {doc?.status !== "VERIFIED" && hasFile && (
                            <div className="pt-2">
                              <Button
                                size="sm"
                                color="primary"
                                className="rounded-full px-6"
                                onPress={() => openVerify(doc)}
                              >
                                Verify
                              </Button>
                            </div>
                          )}

                          {doc?.status !== "UPLOADED" && (
                            <Button
                              size="sm"
                              color="secondary"
                              onPress={() => openUploadForDoc(doc)}
                            >
                              Upload
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal> */}

      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        classNames={{
          base: "h-screen max-h-screen",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Documents
              </DrawerHeader>

              <DrawerBody className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0">
                  <NewSelect
                    label={"Select applicant type"}
                    labelKey={"name"}
                    valueKey={"id"}
                    data={
                      applicantTypeList?.length > 0 ? applicantTypeList : []
                    }
                    onChange={(e) => handleUpdateApplicantType(e)}
                  />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 gap-3">
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
                          className="rounded-2xl shadow-sm border border-gray-200 bg-white my-1.5"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async () => {
                            if (!draggedDoc) return;

                            try {
                              const permanentValue =
                                draggedDoc?.isPermanent !== undefined
                                  ? !!draggedDoc.isPermanent
                                  : doc?.permanent !== undefined
                                    ? !!doc.permanent
                                    : true;

                              const expiryDateValue = permanentValue
                                ? null
                                : draggedDoc?.expiryDate || null;

                              if (!permanentValue && !expiryDateValue) {
                                addToast({
                                  title: "Expiry date required",
                                  description:
                                    "This document is not permanent. Please upload it manually with expiry date.",
                                  color: "warning",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              const payload = {
                                projectId: Number(projectId),
                                requiredDocumentId: Number(
                                  doc?.documentId ||
                                    doc?.requiredDocumentId ||
                                    doc?.id,
                                ),
                                fileUrl: draggedDoc.fileUrl,
                                fileName: draggedDoc.fileName,
                                uploadedById: Number(userId),
                                createdById: Number(userId),
                                isFromCompanyDoc: true,
                                expiryDate: expiryDateValue,
                                isPermanent: permanentValue,
                                fileSizeKb: Number(draggedDoc.fileSizeKb || 0),
                                fileFormat: draggedDoc.fileFormat || "pdf",
                                remarks: draggedDoc?.remarks || "",
                              };

                              const resp = await dispatch(
                                uploadDocumentInProjects({
                                  projectId,
                                  data: payload,
                                }),
                              );

                              if (resp.meta.requestStatus === "fulfilled") {
                                addToast({
                                  title: "Document added successfully",
                                  color: "success",
                                });

                                dispatch(
                                  getRequiredDocumentsByProductId({
                                    userId,
                                    projectId,
                                  }),
                                );
                              } else {
                                addToast({
                                  title: resp?.error?.message,
                                  color: "danger",
                                  description: resp?.payload || "Upload failed",
                                });
                              }
                            } catch (err) {
                              console.error("Drop failed", err);
                            } finally {
                              setDraggedDoc(null);
                            }
                          }}
                        >
                          <CardBody className="flex flex-col gap-4 p-4">
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0">
                                <h4 className="text-[14px] font-semibold text-gray-800 break-words">
                                  {doc?.documentName}
                                </h4>

                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {doc?.mandatory && (
                                    <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-md font-medium">
                                      Mandatory
                                    </span>
                                  )}

                                  {doc?.permanent && (
                                    <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-md font-medium">
                                      Permanent
                                    </span>
                                  )}

                                  {doc?.expired && (
                                    <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-md font-medium">
                                      Expired
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                                  doc?.status === "VERIFIED"
                                    ? "bg-green-100 text-green-700"
                                    : doc?.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {doc?.status}
                              </span>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Uploaded File
                              </p>

                              {hasFile ? (
                                <div className="flex justify-between items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 shrink-0 bg-red-100 rounded-lg flex items-center justify-center">
                                      📄
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium text-gray-800 truncate">
                                        {doc?.fileName || "Document.pdf"}
                                      </span>

                                      <span className="text-xs text-gray-400">
                                        {doc?.fileSizeKb
                                          ? `${doc.fileSizeKb} KB`
                                          : ""}
                                      </span>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    className="shrink-0 bg-green-600 text-white hover:bg-green-700 rounded-full px-4"
                                    onPress={openPreview}
                                  >
                                    Download
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-sm italic text-gray-400">
                                  No file uploaded
                                </div>
                              )}
                            </div>

                            <div className="text-sm text-gray-500">
                              {doc?.expiryDate
                                ? `Expiry: ${dayjs(doc.expiryDate).format("DD MMM YYYY")}`
                                : doc?.permanent
                                  ? "No expiry date"
                                  : "No expiry date"}
                            </div>

                            <div className="mt-auto flex shrink-0 flex-wrap justify-end gap-2 border-t border-default-100 pt-3">
                              {doc?.status !== "VERIFIED" && hasFile && (
                                <>
                                  <Button
                                    size="sm"
                                    color="primary"
                                    className="rounded-full px-6"
                                    onPress={() => openVerify(doc)}
                                  >
                                    Verify
                                  </Button>

                                  <Button
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    className="rounded-full px-6"
                                    onPress={() => openReplaceForDoc(doc)}
                                  >
                                    Replace Document
                                  </Button>
                                </>
                              )}

                              {doc?.status !== "UPLOADED" && (
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
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter className="shrink-0 border-t border-default-200 bg-background">
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
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
                  isRequired={true}
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
                <Button
                  color="primary"
                  isDisabled={!assigneeObj?.newUserId}
                  onPress={handleChangeAssignee}
                >
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

          if (!open) {
            setSelectedDoc(null);
            setIsPermanent(true);
            reset({
              fileUrl: "",
              fileName: "",
              fileSizeKb: 0,
              fileFormat: "",
              expiryDate: null,
              remarks: "",
              isFromCompanyDoc: false,
              isPermanent: true,
            });
          }
        }}
        placement="center"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[88vh]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={handleSubmit(onDocumentSubmit)}
              className="flex max-h-[88vh] flex-col"
            >
              <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
                Upload document
                {selectedDoc?.documentName ? (
                  <span className="text-xs text-default-400">
                    For: {selectedDoc.documentName}
                  </span>
                ) : null}
              </ModalHeader>

              <ModalBody className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <Controller
                      name="fileUrl"
                      control={control}
                      render={({ field }) => (
                        <FileUploader
                          label="Upload file"
                          value={field.value}
                          errorMessage={errors.fileUrl?.message}
                          onChange={(uploadedUrl) => {
                            field.onChange(uploadedUrl);
                          }}
                          onUploadSuccess={(fileMeta) => {
                            const uploadedFileUrl = fileMeta?.filePath || "";
                            const uploadedFileName = fileMeta?.fileName || "";
                            const fileSizeKb = fileMeta?.fileSize
                              ? Math.ceil(Number(fileMeta.fileSize) / 1024)
                              : 0;

                            const fileFormat = getFileFormatFromMeta(fileMeta);

                            setValue("fileUrl", uploadedFileUrl, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });

                            setValue("fileName", uploadedFileName, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });

                            setValue("fileSizeKb", fileSizeKb, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });

                            setValue("fileFormat", fileFormat, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                        />
                      )}
                    />
                  </div>

                  <Controller
                    name="isPermanent"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Permanent Document?"
                        isRequired
                        selectedKeys={
                          field.value !== undefined
                            ? [field.value.toString()]
                            : []
                        }
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0];
                          const boolValue = value === "true";

                          field.onChange(boolValue);
                          setIsPermanent(boolValue);

                          if (boolValue) {
                            setValue("expiryDate", null, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        }}
                        isInvalid={!!errors.isPermanent}
                        errorMessage={errors.isPermanent?.message}
                      >
                        <SelectItem key="true">Yes, Permanent</SelectItem>
                        <SelectItem key="false">No, Has Expiry</SelectItem>
                      </Select>
                    )}
                  />

                  {isPermanentValue === false && (
                    <Controller
                      name="expiryDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          isRequired
                          label="Expiry date"
                          showMonthAndYearPickers
                          minValue={today(getLocalTimeZone())}
                          isInvalid={!!errors.expiryDate}
                          errorMessage={errors.expiryDate?.message}
                          value={
                            field.value &&
                            /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                              ? parseDate(field.value)
                              : null
                          }
                          onChange={(value) => {
                            const iso = value ? value.toString() : null;
                            field.onChange(iso);
                          }}
                        />
                      )}
                    />
                  )}

                  <Controller
                    name="remarks"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Remarks"
                        minRows={3}
                        maxRows={5}
                        placeholder="Add remarks..."
                        className="col-span-2"
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
                </div>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t border-default-200 bg-background">
                <Button
                  type="button"
                  variant="light"
                  onPress={() => {
                    setIsPermanent(true);
                    reset({
                      fileUrl: "",
                      fileName: "",
                      fileSizeKb: 0,
                      fileFormat: "",
                      expiryDate: null,
                      remarks: "",
                      isFromCompanyDoc: false,
                      isPermanent: true,
                    });
                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="3xl"
        isOpen={clientModal.isOpen}
        onOpenChange={clientModal.onOpenChange}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center gap-1">
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
              </ModalHeader>
              <ModalBody className="max-h-[90vh] overflow-auto">
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
                    <ModalFooter className="w-full flex justify-end gap-2">
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
                    </ModalFooter>
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
              </ModalBody>
              {/* <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={verifyModal.isOpen}
        onOpenChange={verifyModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Verify Document</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleVerifySubmit(handleVerifyDocument)}
                  className="flex flex-col gap-4"
                >
                  <Controller
                    name="newStatus"
                    control={verifyControl}
                    render={({ field }) => (
                      <Select
                        label="Select Status"
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0];
                          field.onChange(value);
                        }}
                        isInvalid={!!verifyErrors.newStatus}
                        errorMessage={verifyErrors.newStatus?.message}
                      >
                        <SelectItem key="VERIFIED">VERIFIED</SelectItem>
                        <SelectItem key="REJECTED">REJECTED</SelectItem>
                      </Select>
                    )}
                  />

                  <Controller
                    name="remarks"
                    control={verifyControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Remarks"
                        minRows={3}
                        isInvalid={!!verifyErrors.remarks}
                        errorMessage={verifyErrors.remarks?.message}
                      />
                    )}
                  />

                  <ModalFooter className="px-0">
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

      <Modal
        isOpen={commentModal.isOpen}
        onOpenChange={commentModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentText?.trim()) return;
                handleAddComment();
              }}
            >
              <ModalHeader>Add Comment</ModalHeader>
              <ModalBody className="w-full">
                <Textarea
                  label="Comment"
                  name="commentText"
                  isRequired
                  errorMessage="Please enter comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={noteModal.isOpen} onOpenChange={noteModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();

                if (!noteText?.trim()) return;

                handleAddNote();
              }}
            >
              <ModalHeader>Add Note</ModalHeader>

              <ModalBody className="w-full">
                <Textarea
                  label="Note"
                  name="noteText"
                  isRequired
                  errorMessage="Please enter note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="2xl"
        isOpen={expenseModal.isOpen}
        onOpenChange={expenseModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleAddExpense(data);
              }}
            >
              <ModalHeader>Add Expense</ModalHeader>
              <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Select
                  label="Expense Type"
                  name="expenseType"
                  isRequired
                  selectedKeys={[expenseData?.expenseType]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setExpenseData({
                      ...expenseData,
                      expenseType: value,
                    });
                  }}
                  errorMessage={"please select status"}
                >
                  {[
                    { label: "Government Fee", value: "Government Fee" },
                    { label: "Travel Fee", value: "Travel Fee" },
                    { label: "Filing Fee", value: "Filing Fee" },
                  ].map((item) => (
                    <SelectItem key={item.value.toString()} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Amount"
                  type="number"
                  name="amount"
                  isRequired
                  errorMessage="please enter amount"
                  value={expenseData.amount}
                  startContent={<IndianRupee className="h-4 w-4" />}
                  onChange={(e) =>
                    setExpenseData((prev) => ({
                      ...prev,
                      amount: allowOnlyNumbers(e.target.value),
                    }))
                  }
                />

                <Select
                  name="paymentMedium"
                  selectedKeys={
                    expenseData?.paymentMedium
                      ? new Set([expenseData?.paymentMedium])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setExpenseData({
                      ...expenseData,
                      paymentMedium: value,
                    });
                  }}
                  label="Payment Mode"
                  isRequired
                  errorMessage="please select payment mode"
                >
                  <SelectItem key="CASH">Cash</SelectItem>
                  <SelectItem key="UPI">UPI</SelectItem>
                  <SelectItem key="CARD">Card</SelectItem>
                  <SelectItem key="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem key="CHEQUE">Cheque</SelectItem>
                </Select>

                <DatePicker
                  isRequired
                  label="Expense date"
                  showMonthAndYearPickers
                  errorMessage="Please select the date."
                  value={
                    expenseData.expenseDate
                      ? parseDate(
                          dayjs(expenseData.expenseDate).format("YYYY-MM-DD"),
                        )
                      : null
                  }
                  onChange={(e) => {
                    const dateStr = toCalendarDate(e).toString(); // 2026-03-13

                    const isoDate = dayjs(dateStr)
                      .hour(dayjs().hour())
                      .minute(dayjs().minute())
                      .second(dayjs().second())
                      .millisecond(dayjs().millisecond())
                      .toISOString();

                    setExpenseData((prev) => ({
                      ...prev,
                      expenseDate: isoDate,
                    }));
                  }}
                />

                <Textarea
                  label="Remark"
                  name="remark"
                  isRequired
                  errorMessage="please enter description"
                  value={expenseData.remark}
                  onChange={(e) =>
                    setExpenseData((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="2xl"
        isOpen={legalSupportModal.isOpen}
        onOpenChange={(open) => {
          legalSupportModal.onOpenChange(open);

          if (!open) {
            setLegalRequestData({
              legalRequestTitle: "",
              notes: "",
              documents: [],
              tatInDays: "",
              tatReason: "",
            });
          }
        }}
        placement="center"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[88vh]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form
              className="flex max-h-[88vh] w-full flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddLegalRequest();
              }}
            >
              <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
                Legal Request
                {selectedMilestone?.milestoneName && (
                  <span className="text-xs font-normal text-default-500">
                    Milestone: {selectedMilestone.milestoneName}
                  </span>
                )}
              </ModalHeader>

              <ModalBody className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Request title"
                    name="legalRequestTitle"
                    isRequired
                    placeholder="Enter request title"
                    errorMessage="Please enter request title"
                    value={legalRequestData.legalRequestTitle}
                    onChange={(e) =>
                      setLegalRequestData((prev) => ({
                        ...prev,
                        legalRequestTitle: e.target.value,
                      }))
                    }
                  />

                  <Textarea
                    label="Status Reason"
                    name="statusReason"
                    minRows={2}
                    maxRows={4}
                    placeholder="Enter status reason"
                    value={legalRequestData.statusReason}
                    onChange={(e) =>
                      setLegalRequestData((prev) => ({
                        ...prev,
                        statusReason: e.target.value,
                      }))
                    }
                  />

                  <FileUploader
                    label="Document Attachments"
                    placeholder="Upload legal request documents"
                    uploadingType="multiple"
                    value={legalRequestData.documents || []}
                    onChange={(uploadedFiles) => {
                      console.log("LEGAL REQUEST UPLOADER RAW:", uploadedFiles);
                      saveLegalDocs(uploadedFiles);
                    }}
                    onUploadSuccess={(fileMeta) => {
                      console.log("LEGAL REQUEST UPLOAD SUCCESS:", fileMeta);
                      appendLegalDoc(fileMeta);
                    }}
                    onUploadingChange={setIsLegalDocUploading}
                  />

                  <Textarea
                    label="Request description"
                    name="notes"
                    isRequired
                    minRows={4}
                    maxRows={6}
                    placeholder="Enter request description"
                    errorMessage="Please enter description"
                    value={legalRequestData.notes}
                    onChange={(e) =>
                      setLegalRequestData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t border-default-200 bg-background">
                <Button
                  type="button"
                  variant="light"
                  onPress={() => {
                    setLegalRequestData({
                      legalRequestTitle: "",
                      notes: "",
                      documents: [],
                      tatInDays: "",
                      tatReason: "",
                    });
                    onClose();
                  }}
                >
                  Close
                </Button>

                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="2xl"
        isOpen={vendorMapModal.isOpen}
        onOpenChange={vendorMapModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleMapVendorWithProject(data);
              }}
            >
              <ModalHeader>Map Vendor</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <NewSelect
                  isRequired
                  errorMessage={"please select vendor"}
                  data={vendorList}
                  label={"Select vendor"}
                  name={"vendorId"}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={vendorMapData?.vendorId}
                  onChange={(e) => {
                    setVendorMapData((prev) => ({
                      ...prev,
                      vendorId: e,
                    }));
                  }}
                />

                <Textarea
                  label="Remark"
                  name="remarks"
                  isRequired
                  errorMessage="please enter description"
                  value={vendorMapData?.remarks}
                  onChange={(e) =>
                    setVendorMapData((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Drawer
        isOpen={vendorDrawer.isOpen}
        onOpenChange={vendorDrawer.onOpenChange}
        size="5xl"
        hideCloseButton
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 px-6 py-5">
                <div className="flex w-full items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-foreground">
                        Vendor Details
                      </h2>

                      {vendorDetail?.status && (
                        <Chip
                          color={getStatusColor(vendorDetail.status)}
                          variant="flat"
                          size="sm"
                        >
                          {vendorDetail.status}
                        </Chip>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-default-500">
                      View procurement vendor details for this project
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => {
                        vendorMapModal.onOpen();

                        dispatch(
                          getAllVendors({
                            userId,
                            page: 1,
                            size: 5000,
                            search: "",
                          }),
                        );
                      }}
                    >
                      Map Vendor
                    </Button>

                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </DrawerHeader>

              <DrawerBody className="bg-default-50 px-6 py-6">
                {!vendorDetail ? (
                  <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-dashed border-default-300 bg-white">
                    <div className="text-center">
                      <p className="text-base font-semibold text-foreground">
                        No vendor detail found
                      </p>
                      <p className="mt-1 text-sm text-default-500">
                        Vendor data is not available for this procurement
                        milestone.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-170px)] overflow-y-auto pr-2">
                    <div className="space-y-5">
                      <Card className="overflow-hidden border border-default-200 bg-white shadow-sm">
                        <CardBody className="p-0">
                          <div className="bg-gradient-to-r from-primary-100 via-blue-50 to-white p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                  Procurement Assignment
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-foreground">
                                  {vendorDetail.projectName || "-"}
                                </h3>

                                <p className="mt-1 text-sm text-default-600">
                                  {vendorDetail.message ||
                                    "Procurement vendor information"}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Chip color="primary" variant="flat">
                                  Assignment ID:{" "}
                                  {vendorDetail.procurementAssignmentId || "-"}
                                </Chip>

                                <Chip color="secondary" variant="flat">
                                  Project No: {vendorDetail.projectNo || "-"}
                                </Chip>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
                            <DetailItem
                              label="Project ID"
                              value={vendorDetail.projectId}
                            />
                            <DetailItem
                              label="Product"
                              value={vendorDetail.productName}
                            />
                            <DetailItem
                              label="Product ID"
                              value={vendorDetail.productId}
                            />
                            <DetailItem
                              label="Milestone"
                              value={vendorDetail.milestoneName}
                            />
                            <DetailItem
                              label="Milestone ID"
                              value={vendorDetail.milestoneId}
                            />
                            <DetailItem
                              label="Assigned To"
                              value={vendorDetail.assignedToUserName}
                            />
                            <DetailItem
                              label="Assigned User ID"
                              value={vendorDetail.assignedToUserId}
                            />
                            <DetailItem
                              label="Selected Vendor ID"
                              value={vendorDetail.selectedVendorId}
                            />
                          </div>
                        </CardBody>
                      </Card>

                      <Card className="border border-default-200 bg-white shadow-sm">
                        <CardBody className="p-5">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-foreground">
                                Selected Vendor
                              </p>
                              <p className="text-sm text-default-500">
                                Vendor currently mapped with this procurement
                                assignment
                              </p>
                            </div>

                            <Chip
                              color={selectedVendor ? "success" : "warning"}
                              variant="flat"
                            >
                              {selectedVendor ? "Mapped" : "Not Mapped"}
                            </Chip>
                          </div>

                          <Divider />

                          <div className="mt-5">
                            {selectedVendor ? (
                              <div className="rounded-3xl border border-success-200 bg-gradient-to-br from-success-50 to-white p-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="flex items-center gap-4">
                                    <Avatar
                                      name={getInitials(selectedVendor?.name)}
                                      className="h-14 w-14 bg-success-100 text-success"
                                    />

                                    <div>
                                      <h3 className="text-lg font-bold text-foreground">
                                        {selectedVendor?.name || "-"}
                                      </h3>

                                      <p className="text-sm text-default-500">
                                        Vendor ID: {selectedVendor?.id || "-"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Chip
                                      size="sm"
                                      color={
                                        selectedVendor?.status === "ACTIVE"
                                          ? "success"
                                          : "default"
                                      }
                                      variant="flat"
                                    >
                                      {selectedVendor?.status || "-"}
                                    </Chip>

                                    <Chip
                                      size="sm"
                                      color={
                                        selectedVendor?.verified
                                          ? "success"
                                          : "warning"
                                      }
                                      variant="flat"
                                    >
                                      {selectedVendor?.verified
                                        ? "Verified"
                                        : "Not Verified"}
                                    </Chip>
                                  </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <DetailItem
                                    label="Email"
                                    value={selectedVendor?.email}
                                  />
                                  <DetailItem
                                    label="Mobile"
                                    value={selectedVendor?.mobile}
                                  />
                                  <DetailItem
                                    label="GST Number"
                                    value={selectedVendor?.gstNumber}
                                  />
                                  <DetailItem
                                    label="PAN Number"
                                    value={selectedVendor?.panNumber}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-3xl border border-dashed border-default-300 bg-default-50 p-8 text-center">
                                <p className="text-base font-semibold text-foreground">
                                  No selected vendor found
                                </p>
                                <p className="mt-1 text-sm text-default-500">
                                  No vendor is currently mapped with this
                                  procurement.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>

                      <Card className="border border-default-200 bg-white shadow-sm">
                        <CardBody className="p-5">
                          <div className="mb-4">
                            <p className="text-base font-semibold text-foreground">
                              Procurement Timeline
                            </p>
                            <p className="text-sm text-default-500">
                              Important dates related to this procurement
                              milestone
                            </p>
                          </div>

                          <Divider />

                          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <DateItem
                              label="Vendor Shortlisted"
                              value={vendorDetail.vendorShortlistedDate}
                            />

                            <DateItem
                              label="PO Created"
                              value={vendorDetail.poCreatedDate}
                            />

                            <DateItem
                              label="PO Released"
                              value={vendorDetail.poReleasedDate}
                            />

                            <DateItem
                              label="Last Updated"
                              value={vendorDetail.updatedDate}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                )}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProjectDetails;
