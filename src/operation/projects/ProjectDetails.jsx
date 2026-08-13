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
  getAllCompanyDocumentsByCompanyIdAndUnitId,
  approveOrRejectClientPortalDetails,
  updateClientPortalLoginDetails,
  deleteClientPortalLoginDetails,
  checkDocumentExpiryByUrl,
  sendBackToPreviousMilestone,
  createProjectReopenRequest,
  getProjectMilestoneAssignmentOptions,
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
  Trash2,
  User2,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import {
  getAllMilestoneStatusesForOperations,
  getUserDetailById,
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
  getVendorsBasedOnService,
} from "../../toolkit/slices/vendorsSlice";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import SingleFileUploader from "../../components/SingleFileUploader";

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
              name={getInitials(vendor?.vendorName || vendor?.name)}
              className="bg-primary-100 text-primary"
            />

            <div>
              <p className="text-sm font-semibold text-foreground">
                {vendor?.vendorName || vendor?.name || "-"}
              </p>
              <p className="text-xs text-default-500">
                Vendor ID: {vendor?.vendorId || vendor?.id || "-"}
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

const expenseSchema = z.object({
  expenseCategory: z.string().min(1, "Please select expense category"),

  amount: z.coerce
    .number({
      invalid_type_error: "Please enter amount",
    })
    .positive("Amount must be greater than 0"),

  remark: z.string().trim().min(1, "Please enter remark"),

  expenseDate: z.string().min(1, "Please select expense date"),

  attachmentUrl: z.string().min(1, "Please upload payment proof"),

  externalReference: z.string().trim().optional(),

  currencyCode: z.string().min(1, "Please select currency"),
});

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const lastHistoryRequestRef = useRef(null);
  const { projectId, userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const assigneeModal = useDisclosure();
  const statusModal = useDisclosure();
  const clientModal = useDisclosure();
  const editPortalModal = useDisclosure();
  const deletePortalModal = useDisclosure();
  const portalStatusModal = useDisclosure();
  const docModal = useDisclosure();
  const verifyModal = useDisclosure();
  const expenseModal = useDisclosure();
  const noteModal = useDisclosure();
  const commentModal = useDisclosure();
  const legalSupportModal = useDisclosure();
  const vendorMapModal = useDisclosure();
  const vendorDrawer = useDisclosure();
  const activityDrawer = useDisclosure();
  const reopenModal = useDisclosure();

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
  const vendorList = useSelector(
    (state) => state.vendors.vendorListBasedOnService,
  );

  console.log("Vendor List Based on Service:", vendorList);

  const normalizedVendorList = useMemo(() => {
    if (Array.isArray(vendorList)) return vendorList;
    if (Array.isArray(vendorList?.content)) return vendorList.content;
    if (Array.isArray(vendorList?.data)) return vendorList.data;
    if (Array.isArray(vendorList?.data?.content))
      return vendorList.data.content;
    return [];
  }, [vendorList]);

  console.log("adsjgdfjgs", normalizedVendorList);

  const vendorDetail = useSelector(
    (state) => state.vendors.vendorDetailInProject,
  );

  const eligibleVendors = vendorDetail?.eligibleVendors || [];

  const selectedVendor = useMemo(() => {
    if (!vendorDetail?.selectedVendorId) return null;

    return eligibleVendors.find(
      (vendor) =>
        Number(vendor.vendorId || vendor.id) ===
        Number(vendorDetail.selectedVendorId),
    );
  }, [eligibleVendors, vendorDetail?.selectedVendorId]);

  const selectedVendorId =
    selectedVendor?.vendorId ||
    selectedVendor?.id ||
    vendorDetail?.selectedVendorId ||
    null;

  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );
  const isManager = useSelector(
    (state) => state.auth.getDepartmentDetail?.isManager,
  );
  const companyDocumentsList = useSelector(
    (state) => state.operation.compnyDocumentListByCompanyIdAndUnitId || [],
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

    certificationTenure: "",
    certificationExpiryDate: "",
    certificationAttachmentUrl: "",
    certificationTenureUnit: "",

    // For REWORK
    reworkDocuments: [],
    additionalReworkDocuments: [],
  });

  const [isCredentials, setIsCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    portalName: "",
    portalUrl: "",
    username: "",
    password: "",
    remarks: "",
  });
  const [selectedPortalDetail, setSelectedPortalDetail] = useState(null);

  const [editPortalData, setEditPortalData] = useState({
    portalName: "",
    portalUrl: "",
    username: "",
    password: "",
    remarks: "",
  });

  const [portalStatusData, setPortalStatusData] = useState({
    status: "",
    approvalRemarks: "",
  });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyDocId, setVerifyDocId] = useState(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [expiryCheckResult, setExpiryCheckResult] = useState(null);
  const [isCheckingExpiry, setIsCheckingExpiry] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [expenseData, setExpenseData] = useState({
    departmentId: "",
    amount: "",
    expenseCategory: "",
    remark: "",
    expenseDate: "",
    attachmentUrl: "",
    externalReference: "",
    currencyCode: "",
    createdByUserId: userId,
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

  const [reopenData, setReopenData] = useState({
    projectId: null,
    detectedAtAssignmentId: null,
    responsibleAssignmentId: "",
    reason: "",
  });

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  const [responsibleMilestoneOptions, setResponsibleMilestoneOptions] =
    useState([]);

  const [responsibleMilestoneLoading, setResponsibleMilestoneLoading] =
    useState(false);

  const procurementAssignmentId =
    detailedData?.projectDetails?.procurementMilestoneAssignmentId;

  const isProcurementMilestone =
    selectedMilestone?.milestoneName?.toLowerCase() === "procurement";

  const isCertificationMilestone =
    selectedMilestone?.milestoneName?.toLowerCase() === "certification";

  const isCertificationCompleted =
    isCertificationMilestone &&
    statusObj?.newStatusName?.toUpperCase() === "COMPLETED";

  const userDetailById = useSelector((state) => state.common.userDetailById);

  const userDetailByIdLoading = useSelector(
    (state) => state.common.userDetailByIdLoading,
  );

  // useEffect(() => {
  //   dispatch(getOperationProjectDetailById({ projectId, userId }));
  //   dispatch(getAllMilestoneStatusesForOperations());
  //   dispatch(getClientLogInCredentialDetailForPortal({ projectId, userId }));
  //   dispatch(getApplicantTypeList({ page: 1, size: 1000 }));
  // }, [projectId]);

  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    formState: { errors: expenseErrors, isSubmitting: isExpenseSubmitting },
    reset: resetExpenseForm,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseCategory: "",
      amount: "",
      remark: "",
      expenseDate: "",
      attachmentUrl: "",
      externalReference: "",
      currencyCode: "INR",
    },
  });

  useEffect(() => {
    if (userId) {
      dispatch(getUserDetailById(Number(userId)));
    }
  }, [dispatch, userId]);

  const normalizeReworkAttachment = (fileMeta) => {
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
      uploadedAt: meta?.uploadedAt || new Date().toISOString(),
    };
  };

  const getRatingBadgeClass = (rating) => {
    const value = String(rating || "")
      .trim()
      .toLowerCase();

    if (value === "gold") {
      return "border border-yellow-200 bg-yellow-50 text-yellow-700";
    }

    if (value === "silver") {
      return "border border-slate-200 bg-slate-50 text-slate-600";
    }

    if (value === "bronze") {
      return "border border-orange-200 bg-orange-50 text-orange-700";
    }

    return "border border-slate-200 bg-slate-50 text-slate-500";
  };

  const getPriorityBadgeClass = (priority) => {
    const value = String(priority || "")
      .trim()
      .toLowerCase();

    if (value === "normal") {
      return "border border-green-200 bg-green-50 text-green-700";
    }

    if (value === "high priority" || value === "high") {
      return "border border-yellow-200 bg-yellow-50 text-yellow-700";
    }

    if (value === "critical") {
      return "border border-red-200 bg-red-50 text-red-700";
    }

    return "border border-slate-200 bg-slate-50 text-slate-500";
  };

  const formatBadgeText = (value) => {
    if (!value) return "";
    return String(value).trim();
  };

  const handleSelectedReworkAttachmentChange = (
    requiredDocumentId,
    uploadedFiles,
  ) => {
    const files = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : uploadedFiles
        ? [uploadedFiles]
        : [];

    const attachments = files
      .map((file) => normalizeReworkAttachment(file))
      .filter(Boolean);

    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      reworkDocuments: (prev.reworkDocuments || []).map((doc) =>
        Number(doc.requiredDocumentId) === Number(requiredDocumentId)
          ? {
              ...doc,
              attachmentFiles: files,
              attachments,
            }
          : doc,
      ),
    }));
  };

  const handleSelectedReworkAttachmentSuccess = (
    requiredDocumentId,
    fileMeta,
  ) => {
    const attachment = normalizeReworkAttachment(fileMeta);
    if (!attachment) return;

    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      reworkDocuments: (prev.reworkDocuments || []).map((doc) => {
        if (Number(doc.requiredDocumentId) !== Number(requiredDocumentId)) {
          return doc;
        }

        const oldAttachments = doc.attachments || [];

        const alreadyExists = oldAttachments.some(
          (item) => item.fileUrl === attachment.fileUrl,
        );

        return {
          ...doc,
          attachments: alreadyExists
            ? oldAttachments
            : [...oldAttachments, attachment],
        };
      }),
    }));
  };

  const handleAdditionalReworkAttachmentChange = (tempId, uploadedFiles) => {
    const files = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : uploadedFiles
        ? [uploadedFiles]
        : [];

    const attachments = files
      .map((file) => normalizeReworkAttachment(file))
      .filter(Boolean);

    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      additionalReworkDocuments: (prev.additionalReworkDocuments || []).map(
        (doc) =>
          doc.tempId === tempId
            ? {
                ...doc,
                attachmentFiles: files,
                attachments,
              }
            : doc,
      ),
    }));
  };

  const handleAdditionalReworkAttachmentSuccess = (tempId, fileMeta) => {
    const attachment = normalizeReworkAttachment(fileMeta);
    if (!attachment) return;

    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      additionalReworkDocuments: (prev.additionalReworkDocuments || []).map(
        (doc) => {
          if (doc.tempId !== tempId) return doc;

          const oldAttachments = doc.attachments || [];

          const alreadyExists = oldAttachments.some(
            (item) => item.fileUrl === attachment.fileUrl,
          );

          return {
            ...doc,
            attachments: alreadyExists
              ? oldAttachments
              : [...oldAttachments, attachment],
          };
        },
      ),
    }));
  };

  const documentChecklist = useMemo(() => {
    if (Array.isArray(requiredDocsList)) return requiredDocsList;
    if (Array.isArray(requiredDocsList?.content))
      return requiredDocsList.content;
    return [];
  }, [requiredDocsList]);

  const isReworkSelected = statusObj?.newStatusName === "REWORK";

  const getRequiredDocId = (doc) => {
    return doc?.documentId || doc?.requiredDocumentId || doc?.id;
  };

  const getRequiredDocName = (doc) => {
    return (
      doc?.documentName || doc?.requiredDocumentName || doc?.name || "Document"
    );
  };

  const handleReworkDocSelectionChange = (keys) => {
    const selectedKeys =
      keys === "all"
        ? documentChecklist
            .map((doc) => String(getRequiredDocId(doc)))
            .filter(Boolean)
        : Array.from(keys || []).map(String);

    setStatusObj((prev) => {
      const oldReasonMap = new Map(
        (prev.reworkDocuments || []).map((item) => [
          String(item.requiredDocumentId),
          item.reason || "",
        ]),
      );

      const selectedDocs = selectedKeys
        .map((docId) => {
          const doc = documentChecklist.find(
            (item) => String(getRequiredDocId(item)) === String(docId),
          );

          if (!doc) return null;

          return {
            requiredDocumentId: Number(docId),
            documentName: getRequiredDocName(doc),
            reason: oldReasonMap.get(String(docId)) || "",
          };
        })
        .filter(Boolean);

      return {
        ...prev,
        reworkDocuments: selectedDocs,
        changedById: userId,
      };
    });
  };

  const handleReworkDocReasonChange = (requiredDocumentId, reason) => {
    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      reworkDocuments: (prev.reworkDocuments || []).map((doc) =>
        Number(doc.requiredDocumentId) === Number(requiredDocumentId)
          ? { ...doc, reason }
          : doc,
      ),
    }));
  };

  const handleAddAdditionalReworkDocument = () => {
    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      additionalReworkDocuments: [
        ...(prev.additionalReworkDocuments || []),
        {
          tempId: `${Date.now()}-${Math.random()}`,
          documentName: "",
          reason: "",
        },
      ],
    }));
  };

  const handleAdditionalReworkDocumentChange = (tempId, field, value) => {
    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      additionalReworkDocuments: (prev.additionalReworkDocuments || []).map(
        (doc) => (doc.tempId === tempId ? { ...doc, [field]: value } : doc),
      ),
    }));
  };

  const handleRemoveAdditionalReworkDocument = (tempId) => {
    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      additionalReworkDocuments: (prev.additionalReworkDocuments || []).filter(
        (doc) => doc.tempId !== tempId,
      ),
    }));
  };

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

  // useEffect(() => {
  //   const first = detailedData?.milestones?.[0];

  //   if (!first?.milestoneId || !first?.projectId) return;

  //   setSelectedMilestone((prev) => {
  //     if (prev?.milestoneId === first.milestoneId) {
  //       return prev;
  //     }

  //     return first;
  //   });

  //   fetchMilestoneHistory(first);
  // }, [
  //   detailedData?.projectDetails?.id,
  //   detailedData?.milestones?.[0]?.milestoneId,
  //   userId,
  // ]);
  useEffect(() => {
    setSelectedMilestone(null);
    lastHistoryRequestRef.current = null;

    dispatch(getOperationProjectDetailById({ projectId, userId })).then(
      (resp) => {
        const firstMilestone = resp?.payload?.milestones?.[0];

        if (firstMilestone?.milestoneId && firstMilestone?.projectId) {
          setSelectedMilestone(firstMilestone);
          fetchMilestoneHistory(firstMilestone, true);
        }
      },
    );

    dispatch(getAllMilestoneStatusesForOperations());
    dispatch(getClientLogInCredentialDetailForPortal({ projectId, userId }));
    dispatch(getApplicantTypeList({ page: 1, size: 1000 }));
  }, [dispatch, projectId, userId]);

  const handleChangeAssignee = () => {
    dispatch(updateAssigneeForMileStone(assigneeObj))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Assignee updated successfully !.",
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
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const REWORK_STATUS_NAME = "REWORK";

  const handleStatusChange = () => {
    if (!statusObj?.newStatusName) {
      addToast({
        title: "REQUIRED",
        description: "Please select status.",
        color: "danger",
      });
      return;
    }

    if (!statusObj?.statusReason?.trim()) {
      addToast({
        title: "REQUIRED",
        description: "Please enter reason.",
        color: "danger",
      });
      return;
    }

    if (isCertificationCompleted) {
      if (
        !statusObj.certificationTenure ||
        Number(statusObj.certificationTenure) <= 0
      ) {
        addToast({
          title: "REQUIRED",
          description: "Certification tenure is required",
          color: "danger",
        });
        return;
      }

      if (!statusObj.certificateExpiryDate) {
        addToast({
          title: "REQUIRED",
          description: "Certificate expiry date is required",
          color: "danger",
        });
        return;
      }

      if (!statusObj.certificationTenureUnit) {
        addToast({
          title: "REQUIRED",
          description: "Certificate tennure unit is required",
          color: "danger",
        });
        return;
      }

      if (!statusObj.certificationAttachmentUrl) {
        addToast({
          title: "REQUIRED",
          description: "Certification attachment is required",
          color: "danger",
        });
        return;
      }
    }

    const isReworkStatus = statusObj.newStatusName === REWORK_STATUS_NAME;

    let requestAction;

    if (isReworkStatus) {
      const selectedReworkDocs = statusObj.reworkDocuments || [];

      if (selectedReworkDocs.length === 0) {
        addToast({
          title: "REQUIRED",
          description: "Please select at least one document for rework.",
          color: "danger",
        });
        return;
      }

      const docWithoutReason = selectedReworkDocs.find(
        (doc) => !doc.reason?.trim(),
      );

      if (docWithoutReason) {
        addToast({
          title: "REQUIRED",
          description: `Please enter reason for ${docWithoutReason.documentName}.`,
          color: "danger",
        });
        return;
      }

      const reworkPayload = {
        currentAssignmentId: Number(statusObj.assignmentId),
        changedById: Number(userId),
        reason: statusObj.statusReason.trim(),
        rejectedDocumentIds: selectedReworkDocs.map((doc) =>
          Number(doc.requiredDocumentId),
        ),
      };

      requestAction = sendBackToPreviousMilestone({
        assignmentId: Number(statusObj.assignmentId),
        data: reworkPayload,
      });
    } else {
      const normalPayload = {
        assignmentId: Number(statusObj.assignmentId),
        newStatusName: statusObj.newStatusName,
        statusReason: statusObj.statusReason.trim(),
        changedById: Number(userId),

        ...(isCertificationCompleted && {
          certificationTenure: Number(statusObj.certificationTenure),
          certificateExpiryDate: statusObj.certificateExpiryDate,
          certificationAttachmentUrl: statusObj.certificationAttachmentUrl,
          certificationTenureUnit: statusObj.certificationTenureUnit,
        }),
      };

      requestAction = updateAssignmentStatusForMileStone(normalPayload);
    }

    dispatch(requestAction)
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: isReworkStatus
              ? "Milestone sent back for rework successfully!"
              : "Status updated successfully!",
            color: "success",
          });

          setStatusObj({
            assignmentId: null,
            newStatusName: "",
            statusReason: "",
            changedById: null,
            reworkDocuments: [],
            additionalReworkDocuments: [],
            certificationTenure: "",
            certificateExpiryDate: "",
            certificationAttachmentUrl: "",
            certificationTenureUnit: "",
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
            title: resp?.payload?.status || "Failed",
            color: "danger",
            description:
              resp?.payload?.message ||
              resp?.payload ||
              "Failed to update status.",
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

  const getPortalDetailId = (portal) => {
    return portal?.detailId || portal?.portalDetailId || portal?.id;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const openPortalStatusModal = (portal) => {
    setSelectedPortalDetail(portal);

    setPortalStatusData({
      status: portal?.status === "REJECTED" ? "REJECTED" : "",
      approvalRemarks: portal?.approvalRemarks || "",
    });

    portalStatusModal.onOpen();
  };

  const handlePortalStatusChange = (e) => {
    const { name, value } = e.target;

    setPortalStatusData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdatePortalStatus = (e) => {
    e.preventDefault();

    const detailId =
      selectedPortalDetail?.detailId ||
      selectedPortalDetail?.portalDetailId ||
      selectedPortalDetail?.id;

    if (!detailId) {
      addToast({
        title: "Detail ID missing",
        description: "Portal detail ID not found.",
        color: "danger",
      });
      return;
    }

    if (!portalStatusData.status) {
      addToast({
        title: "Status required",
        description: "Please select approve or reject status.",
        color: "danger",
      });
      return;
    }

    if (!portalStatusData.approvalRemarks?.trim()) {
      addToast({
        title: "Remarks required",
        description: "Please enter approval remarks.",
        color: "danger",
      });
      return;
    }

    const data = {
      status: portalStatusData.status,
      approvalRemarks: portalStatusData.approvalRemarks.trim(),
    };

    dispatch(
      approveOrRejectClientPortalDetails({
        projectId,
        detailId,
        userId,
        data,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Portal status updated successfully!",
            color: "success",
          });

          portalStatusModal.onClose();

          setSelectedPortalDetail(null);
          setPortalStatusData({
            status: "",
            approvalRemarks: "",
          });

          dispatch(
            getClientLogInCredentialDetailForPortal({ projectId, userId }),
          );
        } else {
          addToast({
            title: resp?.payload?.status || "Failed",
            description:
              resp?.payload?.message ||
              resp?.payload ||
              "Failed to update portal status.",
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

  const openEditPortalModal = (portal) => {
    setSelectedPortalDetail(portal);

    setEditPortalData({
      portalName: portal?.portalName || "",
      portalUrl: portal?.portalUrl || "",
      username: portal?.username || "",
      password: portal?.password || "",
      remarks: portal?.remarks || "",
    });

    editPortalModal.onOpen();
  };

  const handleEditPortalChange = (e) => {
    const { name, value } = e.target;

    setEditPortalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openDeletePortalModal = (portal) => {
    setSelectedPortalDetail(portal);
    deletePortalModal.onOpen();
  };

  const handleDeletePortalDetails = () => {
    const detailId = getPortalDetailId(selectedPortalDetail);

    if (!detailId) {
      addToast({
        title: "Detail ID missing",
        description: "Portal detail ID not found.",
        color: "danger",
      });
      return;
    }

    dispatch(
      deleteClientPortalLoginDetails({
        projectId,
        detailId,
        userId,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Portal details deleted successfully!",
          color: "success",
        });

        deletePortalModal.onClose();
        setSelectedPortalDetail(null);

        dispatch(
          getClientLogInCredentialDetailForPortal({ projectId, userId }),
        );
      } else {
        addToast({
          title: resp?.payload?.status || "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to delete portal details.",
          color: "danger",
        });
      }
    });
  };

  const handleUpdatePortalDetails = (e) => {
    e.preventDefault();

    const detailId = getPortalDetailId(selectedPortalDetail);

    if (!detailId) {
      addToast({
        title: "Detail ID missing",
        description: "Portal detail ID not found.",
        color: "danger",
      });
      return;
    }

    const data = {
      portalName: editPortalData.portalName,
      portalUrl: editPortalData.portalUrl,
      username: editPortalData.username,
      password: editPortalData.password,
      remarks: editPortalData.remarks,
    };

    dispatch(
      updateClientPortalLoginDetails({
        projectId,
        detailId,
        userId,
        data,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Portal details updated successfully!",
          color: "success",
        });

        editPortalModal.onClose();

        setSelectedPortalDetail(null);

        setEditPortalData({
          portalName: "",
          portalUrl: "",
          username: "",
          password: "",
          remarks: "",
        });

        dispatch(
          getClientLogInCredentialDetailForPortal({ projectId, userId }),
        );
      } else {
        addToast({
          title: resp?.payload?.status || "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to update portal details.",
          color: "danger",
        });
      }
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    dispatch(addClientLogInCredentialForPortal({ projectId, userId, data }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Portal details added successfully!",
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
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        }),
      );
  };

  const handleUpdateApplicantType = (applicantTypeId) => {
    dispatch(updateApplicantTypeInProject({ applicantTypeId, projectId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Applicant type updated successfully !.",
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
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
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

  const fetchCompanyDocuments = React.useCallback(() => {
    const companyId = detailedData?.projectDetails?.companyId;
    const companyUnitId =
      detailedData?.projectDetails?.companyUnitId ||
      detailedData?.projectDetails?.unitId;

    if (!companyId || !companyUnitId) return;

    dispatch(
      getAllCompanyDocumentsByCompanyIdAndUnitId({
        companyId,
        companyUnitId,
      }),
    );
  }, [dispatch, detailedData?.projectDetails]);

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
          title: "SUCCESS",
          description: "Document status updated successfully!",
          color: "success",
        });
        verifyModal.onClose();
        dispatch(
          getRequiredDocumentsByProductId({
            userId,
            projectId,
          }),
        );
        fetchCompanyDocuments();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to update document status.",
          color: "danger",
        });
      }
    });
  };

  const handleCheckDocumentExpiry = async (uploadedFileUrl) => {
    if (!uploadedFileUrl) return;

    setIsCheckingExpiry(true);
    setExpiryCheckResult(null);

    try {
      const resp = await dispatch(
        checkDocumentExpiryByUrl({
          fileUrl: uploadedFileUrl,
        }),
      );

      if (resp.meta.requestStatus === "fulfilled") {
        const result = resp.payload;

        setExpiryCheckResult(result);

        if (result?.expiryDate) {
          setValue("isPermanent", false, {
            shouldValidate: true,
            shouldDirty: true,
          });

          setIsPermanent(false);

          setValue("expiryDate", result.expiryDate, {
            shouldValidate: true,
            shouldDirty: true,
          });

          addToast({
            title: "Expiry date detected",
            description: `Expiry date set as ${result.expiryDate}`,
            color: "success",
          });
        } else {
          addToast({
            title: "Expiry date not detected",
            description:
              result?.message ||
              "Please select expiry date manually if required.",
            color: "warning",
          });
        }
      } else {
        addToast({
          title: "Expiry check failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Could not check document expiry date.",
          color: "warning",
        });
      }
    } catch (error) {
      addToast({
        title: "Expiry check failed",
        description: "Something went wrong while checking expiry date.",
        color: "warning",
      });
    } finally {
      setIsCheckingExpiry(false);
    }
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
          title: "ERROR",
          color: "danger",
          description: resp?.payload,
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
            title: "SUCCESS",
            description: "Comment added successfully !.",
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
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
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
            title: "SUCCESS",
            description: "Note added successfully !.",
            color: "success",
          });
          noteModal.onClose();
          setNoteText("");
          setActivityType("ALL");
          dispatch(getActivitiesByProjectId({ projectId, page: 1, size: 50 }));
        } else {
          addToast({
            title: "ERROR",
            color: "danger",
            description: resp?.payload?.message,
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const handleAddExpense = async (formData) => {
    const departmentId = Number(userDetailById?.userDepartment?.id);
    const createdByUserId = Number(userDetailById?.id);

    if (!departmentId) {
      addToast({
        title: "Department not found",
        description: "The user's department details are unavailable.",
        color: "danger",
      });
      return;
    }

    if (!createdByUserId) {
      addToast({
        title: "User not found",
        description: "The user details are unavailable.",
        color: "danger",
      });
      return;
    }

    const payload = {
      departmentId,
      expenseCategory: formData.expenseCategory,
      amount: Number(formData.amount),
      remark: formData.remark.trim(),
      expenseDate: formData.expenseDate,
      createdByUserId,
      attachmentUrl: formData.attachmentUrl,
      externalReference: formData.externalReference?.trim() || "",
      currencyCode: formData.currencyCode,
    };

    try {
      const resp = await dispatch(
        addExpensesInProject({
          projectId: Number(projectId),
          data: payload,
        }),
      );

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Expense added successfully!",
          color: "success",
        });

        resetExpenseForm({
          expenseCategory: "",
          amount: "",
          remark: "",
          expenseDate: "",
          attachmentUrl: "",
          externalReference: "",
          currencyCode: "INR",
        });

        expenseModal.onClose();
        setActivityType("ALL");

        dispatch(
          getActivitiesByProjectId({
            projectId,
            page: 1,
            size: 50,
          }),
        );

        return;
      }

      addToast({
        title: resp?.payload?.status || "Unable to add expense",
        description: resp?.payload?.message,
        color: "danger",
      });
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        description: error?.message,
        color: "danger",
      });
    }
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

  const isSameRequiredDocument = (requiredDoc, companyDoc) => {
    const requiredDocumentId =
      requiredDoc?.documentId ||
      requiredDoc?.requiredDocumentId ||
      requiredDoc?.id;

    if (
      requiredDocumentId &&
      companyDoc?.requiredDocumentId &&
      Number(requiredDocumentId) === Number(companyDoc.requiredDocumentId)
    ) {
      return true;
    }

    return (
      String(requiredDoc?.documentName || "")
        .trim()
        .toLowerCase() ===
      String(companyDoc?.requiredDocumentName || "")
        .trim()
        .toLowerCase()
    );
  };

  const getCompanyDocFileUrl = (doc) => {
    return (
      doc?.fileUrl ||
      doc?.documentUrl ||
      doc?.attachmentUrl ||
      doc?.s3Url ||
      doc?.url ||
      doc?.path ||
      ""
    );
  };

  const getCompanyDocFileName = (doc) => {
    return (
      doc?.fileName ||
      doc?.originalFileName ||
      doc?.originalName ||
      getFileNameFromUrl(getCompanyDocFileUrl(doc))
    );
  };

  const getCompanyDocFormat = (doc) => {
    const fileName = getCompanyDocFileName(doc);
    const fileUrl = getCompanyDocFileUrl(doc);
    const source = fileName || fileUrl || "";

    return (
      doc?.fileFormat ||
      doc?.format ||
      source?.split("?")[0]?.split(".")?.pop()?.toLowerCase() ||
      "file"
    );
  };

  const getCompanyDocPermanentValue = (companyDoc, requiredDoc) => {
    if (companyDoc?.isPermanent !== undefined) {
      return Boolean(companyDoc.isPermanent);
    }

    if (companyDoc?.permanent !== undefined) {
      return Boolean(companyDoc.permanent);
    }

    if (requiredDoc?.isPermanent !== undefined) {
      return Boolean(requiredDoc.isPermanent);
    }

    if (requiredDoc?.permanent !== undefined) {
      return Boolean(requiredDoc.permanent);
    }

    return true;
  };

  const buildCompanyDocDropPayload = (requiredDoc, companyDoc) => {
    const requiredDocumentId = Number(
      requiredDoc?.documentId ||
        requiredDoc?.requiredDocumentId ||
        requiredDoc?.id,
    );

    const fileUrl = getCompanyDocFileUrl(companyDoc);
    const fileName = getCompanyDocFileName(companyDoc);
    const isPermanentValue = getCompanyDocPermanentValue(
      companyDoc,
      requiredDoc,
    );

    return {
      projectId: Number(projectId),
      requiredDocumentId,
      fileUrl,
      fileName,
      uploadedById: Number(userId),
      createdById: Number(userId),
      companyDocSourceId: Number(
        companyDoc?.companyDocSourceId || companyDoc?.id || 0,
      ),
      isFromCompanyDoc: true,
      expiryDate: isPermanentValue ? null : companyDoc?.expiryDate || null,
      isPermanent: isPermanentValue,
      fileSizeKb: Number(companyDoc?.fileSizeKb || companyDoc?.fileSize || 0),
      fileFormat: getCompanyDocFormat(companyDoc),
      remarks: companyDoc?.remarks || "",
    };
  };

  const openCompanyDocPreview = (companyDoc) => {
    const raw = String(companyDoc?.fileUrl || "").trim();

    if (!raw) {
      addToast({
        title: "File not found",
        description: "No file URL available for this document.",
        color: "warning",
      });
      return;
    }

    const fixed =
      raw.includes("amazonaws.com") && !raw.includes("amazonaws.com/")
        ? raw.replace("amazonaws.com", "amazonaws.com/")
        : raw;

    const href =
      fixed.startsWith("http://") || fixed.startsWith("https://")
        ? fixed
        : `https://${fixed}`;

    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleOpenReopenModal = () => {
    if (!projectId) {
      addToast({
        title: "Project missing",
        description: "Project ID not found.",
        color: "danger",
      });
      return;
    }

    if (!selectedMilestone?.id) {
      addToast({
        title: "Milestone missing",
        description: "Please select milestone first.",
        color: "danger",
      });
      return;
    }

    setReopenData({
      projectId: Number(projectId),

      // This is the assignment from where reopen is being raised
      detectedAtAssignmentId: Number(selectedMilestone.id),

      // User will select this from API dropdown
      responsibleAssignmentId: "",
      reason: "",
    });

    setResponsibleMilestoneOptions([]);
    setResponsibleMilestoneLoading(true);

    dispatch(getProjectMilestoneAssignmentOptions(projectId)).then((resp) => {
      setResponsibleMilestoneLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        setResponsibleMilestoneOptions(
          Array.isArray(resp.payload) ? resp.payload : [],
        );
      } else {
        addToast({
          title: "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch responsible milestone options.",
          color: "danger",
        });
      }
    });

    reopenModal.onOpen();
  };

  const handleCreateReopenRequest = () => {
    if (!reopenData.detectedAtAssignmentId) {
      addToast({
        title: "Detected milestone missing",
        description: "Detected at assignment ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!reopenData.responsibleAssignmentId) {
      addToast({
        title: "Responsible milestone required",
        description: "Please select responsible milestone.",
        color: "danger",
      });
      return;
    }

    if (!reopenData.reason?.trim()) {
      addToast({
        title: "Reason required",
        description: "Please enter reopen reason.",
        color: "danger",
      });
      return;
    }

    const payload = {
      projectId: Number(projectId),

      // current selected milestone assignment id
      detectedAtAssignmentId: Number(reopenData.detectedAtAssignmentId),

      // selected from API dropdown
      responsibleAssignmentId: Number(reopenData.responsibleAssignmentId),

      reason: reopenData.reason.trim(),
    };

    dispatch(createProjectReopenRequest(payload)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Reopen request created successfully!",
          color: "success",
        });

        reopenModal.onClose();

        setReopenData({
          projectId: null,
          detectedAtAssignmentId: null,
          responsibleAssignmentId: "",
          reason: "",
        });

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
          title: resp?.payload?.status || "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to create reopen request.",
          color: "danger",
        });
      }
    });
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
                <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
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

                  {detailedData?.projectDetails?.rating && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 ${getRatingBadgeClass(
                        detailedData?.projectDetails?.rating,
                      )}`}
                    >
                      {formatBadgeText(detailedData?.projectDetails?.rating)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-default-600">
                  <Building className="h-4 w-4 text-default-400" />
                  <span className="text-default-400">Company unit:</span>

                  <span className="font-medium text-foreground">
                    {detailedData?.projectDetails?.companyUnitName || "-"}
                  </span>

                  {detailedData?.projectDetails?.priority && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 ${getPriorityBadgeClass(
                        detailedData?.projectDetails?.priority,
                      )}`}
                    >
                      {formatBadgeText(detailedData?.projectDetails?.priority)}
                    </span>
                  )}
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

                  fetchCompanyDocuments();
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
          {(adminRole || isManager) && (
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
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            size="sm"
                            color={
                              statusColors[selectedMilestone?.status] ||
                              "default"
                            }
                            className="cursor-pointer"
                            onClick={() => {
                              statusModal.onOpen();

                              dispatch(
                                getRequiredDocumentsByProductId({
                                  userId,
                                  projectId,
                                }),
                              );

                              setStatusObj((prev) => ({
                                ...prev,
                                newStatusName: selectedMilestone?.status,
                                assignmentId: selectedMilestone?.id,
                                changedById: userId,
                                reworkDocuments: [],
                                additionalReworkDocuments: [],
                              }));
                            }}
                          >
                            {selectedMilestone?.status || "-"}
                          </Chip>

                          <Button
                            size="sm"
                            color="warning"
                            variant="flat"
                            radius="full"
                            onPress={handleOpenReopenModal}
                          >
                            Reopen
                          </Button>
                        </div>
                      </div>

                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {selectedMilestone?.milestoneName || "Milestone"}
                      </h2>
                      <p className="mt-0.5 text-xs text-default-500">
                        Assignment ID: {selectedMilestone?.id || "-"}
                      </p>
                    </div>
                    {!isCertificationMilestone && (
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
                    )}
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

                      {/* <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        onPress={onClose}
                      >
                        <X className="h-4 w-4" />
                      </Button> */}
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
                    value={detailedData?.projectDetails?.applicantId}
                    data={
                      applicantTypeList?.length > 0 ? applicantTypeList : []
                    }
                    onChange={(e) => handleUpdateApplicantType(e)}
                  />
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-12">
                  {/* LEFT SIDE: COMPANY DOCUMENTS */}
                  <aside className="min-h-0 overflow-hidden rounded-2xl border border-default-200 bg-content1 lg:col-span-4">
                    <div className="border-b border-default-200 bg-default-50 px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">
                        Company Documents
                      </p>
                      <p className="text-xs text-default-500">
                        Drag matching document and drop on required document
                        card
                      </p>
                    </div>

                    <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
                      {companyDocumentsList?.length > 0 ? (
                        companyDocumentsList.map((companyDoc) => (
                          <div
                            key={companyDoc?.id}
                            draggable
                            onDragStart={() => setDraggedDoc(companyDoc)}
                            onDragEnd={() => setDraggedDoc(null)}
                            className="cursor-grab rounded-xl border border-default-200 bg-white p-3 shadow-sm transition-all hover:border-primary hover:bg-primary-50 active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {companyDoc?.requiredDocumentName ||
                                    "Document"}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-default-500">
                                  {companyDoc?.fileName || "-"}
                                </p>
                              </div>

                              <Chip
                                size="sm"
                                color={
                                  companyDoc?.status === "VERIFIED"
                                    ? "success"
                                    : "warning"
                                }
                                variant="flat"
                              >
                                {companyDoc?.status || "NA"}
                              </Chip>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Chip size="sm" variant="flat">
                                {getCompanyDocFormat(companyDoc)}
                              </Chip>

                              <Chip size="sm" variant="flat">
                                {companyDoc?.fileSizeKb || 0} KB
                              </Chip>

                              {companyDoc?.permanent ? (
                                <Chip size="sm" color="success" variant="flat">
                                  Permanent
                                </Chip>
                              ) : (
                                <Chip size="sm" color="warning" variant="flat">
                                  Expirable
                                </Chip>
                              )}
                              <Chip
                                size="sm"
                                color="primary"
                                variant="flat"
                                className="cursor-pointer"
                                onClick={() =>
                                  openCompanyDocPreview(companyDoc)
                                }
                              >
                                View
                              </Chip>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-default-300 text-center">
                          <div>
                            <p className="text-sm font-medium text-default-600">
                              No company documents found
                            </p>
                            <p className="mt-1 text-xs text-default-400">
                              Upload documents in company repository first
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </aside>

                  {/* RIGHT SIDE: REQUIRED SERVICE DOCUMENTS */}
                  <section className="min-h-0 overflow-y-auto pr-2 lg:col-span-8">
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
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async (e) => {
                              e.preventDefault();

                              if (!draggedDoc) return;

                              if (!isSameRequiredDocument(doc, draggedDoc)) {
                                addToast({
                                  title: "Document mismatch",
                                  description: `${
                                    draggedDoc?.requiredDocumentName ||
                                    "Selected document"
                                  } cannot be dropped on ${
                                    doc?.documentName ||
                                    "this required document"
                                  }.`,
                                  color: "warning",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              try {
                                const payload = buildCompanyDocDropPayload(
                                  doc,
                                  draggedDoc,
                                );

                                if (!payload.requiredDocumentId) {
                                  addToast({
                                    title: "Required document missing",
                                    description:
                                      "Required document ID not found.",
                                    color: "danger",
                                  });

                                  setDraggedDoc(null);
                                  return;
                                }

                                if (!payload.companyDocSourceId) {
                                  addToast({
                                    title: "Company document missing",
                                    description:
                                      "Company document source ID not found.",
                                    color: "danger",
                                  });

                                  setDraggedDoc(null);
                                  return;
                                }

                                if (!payload.fileUrl) {
                                  addToast({
                                    title: "File URL missing",
                                    description:
                                      "Selected company document does not have a valid file URL.",
                                    color: "danger",
                                  });

                                  setDraggedDoc(null);
                                  return;
                                }

                                if (!payload.fileName) {
                                  addToast({
                                    title: "File name missing",
                                    description:
                                      "Selected company document does not have a valid file name.",
                                    color: "danger",
                                  });

                                  setDraggedDoc(null);
                                  return;
                                }

                                if (!payload.fileFormat) {
                                  addToast({
                                    title: "File format missing",
                                    description:
                                      "Selected company document does not have a valid file format.",
                                    color: "danger",
                                  });

                                  setDraggedDoc(null);
                                  return;
                                }

                                if (
                                  !payload.isPermanent &&
                                  !payload.expiryDate
                                ) {
                                  addToast({
                                    title: "Expiry date required",
                                    description:
                                      "This document is not permanent. Please upload it manually with expiry date.",
                                    color: "warning",
                                  });

                                  setDraggedDoc(null);
                                  return;
                                }

                                console.log("DRAG DROP PAYLOAD:", payload);

                                const resp = await dispatch(
                                  uploadDocumentInProjects({
                                    projectId,
                                    data: payload,
                                  }),
                                );

                                if (resp?.meta?.requestStatus === "fulfilled") {
                                  addToast({
                                    title: "Document uploaded",
                                    description:
                                      "Company document added to required document successfully.",
                                    color: "success",
                                  });

                                  dispatch(
                                    getRequiredDocumentsByProductId({
                                      userId,
                                      projectId,
                                    }),
                                  );

                                  fetchCompanyDocuments();
                                } else {
                                  addToast({
                                    title: "Upload failed",
                                    description:
                                      resp?.payload?.message ||
                                      resp?.payload ||
                                      "Something went wrong while uploading.",
                                    color: "danger",
                                  });
                                }
                              } catch (error) {
                                console.error("DROP DOCUMENT ERROR:", error);

                                addToast({
                                  title: "Error",
                                  description:
                                    "Something went wrong while dropping document.",
                                  color: "danger",
                                });
                              } finally {
                                setDraggedDoc(null);
                              }
                            }}
                            className={`rounded-2xl border bg-white shadow-sm transition-all ${
                              draggedDoc
                                ? "border-dashed border-primary bg-primary-50/40"
                                : "border-default-200"
                            }`}
                          >
                            <CardBody className="flex flex-col gap-4 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground">
                                    {doc?.documentName}
                                  </h4>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {doc?.mandatory && (
                                      <Chip
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                      >
                                        Mandatory
                                      </Chip>
                                    )}

                                    {doc?.permanent && (
                                      <Chip
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                      >
                                        Permanent
                                      </Chip>
                                    )}

                                    {doc?.expired && (
                                      <Chip
                                        size="sm"
                                        color="warning"
                                        variant="flat"
                                      >
                                        Expired
                                      </Chip>
                                    )}

                                    {draggedDoc && (
                                      <Chip
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                      >
                                        Drop here
                                      </Chip>
                                    )}
                                  </div>
                                </div>

                                <Chip
                                  size="sm"
                                  color={
                                    doc?.status === "VERIFIED"
                                      ? "success"
                                      : doc?.status === "PENDING"
                                        ? "warning"
                                        : "default"
                                  }
                                  variant="flat"
                                >
                                  {doc?.status || "NA"}
                                </Chip>
                              </div>

                              <div>
                                <p className="mb-2 text-sm text-default-500">
                                  Uploaded File
                                </p>

                                {hasFile ? (
                                  <div className="flex items-center justify-between rounded-xl border border-default-100 bg-default-50 px-4 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                                        <PdfIcon className="h-5 w-5 text-red-500" />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">
                                          {doc?.fileName || "Document"}
                                        </p>
                                        <p className="text-xs text-default-400">
                                          {doc?.fileSizeKb
                                            ? `${doc.fileSizeKb} KB`
                                            : ""}
                                        </p>
                                      </div>
                                    </div>

                                    <Button
                                      size="sm"
                                      color="success"
                                      variant="flat"
                                      onPress={openPreview}
                                    >
                                      View
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-dashed border-default-300 bg-default-50 px-4 py-6 text-center">
                                    <p className="text-sm font-medium text-default-500">
                                      No file uploaded
                                    </p>
                                    <p className="mt-1 text-xs text-default-400">
                                      Upload manually or drag matching company
                                      document here
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="text-sm text-default-500">
                                {doc?.expiryDate
                                  ? `Expiry: ${dayjs(doc.expiryDate).format("DD MMM YYYY")}`
                                  : doc?.permanent
                                    ? "No expiry date"
                                    : "No expiry date"}
                              </div>

                              <div className="flex flex-wrap gap-2 pt-1">
                                {doc?.status !== "VERIFIED" && hasFile && (
                                  <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    onPress={() => openVerify(doc)}
                                  >
                                    Verify
                                  </Button>
                                )}

                                {doc?.status !== "UPLOADED" && (
                                  <Button
                                    size="sm"
                                    color="secondary"
                                    variant="flat"
                                    onPress={() => openUploadForDoc(doc)}
                                  >
                                    Upload
                                  </Button>
                                )}

                                {hasFile && (
                                  <Button
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    onPress={() => openReplaceForDoc(doc)}
                                  >
                                    Replace
                                  </Button>
                                )}
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
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
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update status
              </ModalHeader>

              <ModalBody className="max-h-[75vh] overflow-auto">
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

                      // Clear REWORK data when another status is selected
                      reworkDocuments:
                        e === "REWORK" ? prev.reworkDocuments : [],
                      additionalReworkDocuments:
                        e === "REWORK" ? prev.additionalReworkDocuments : [],
                    }));

                    if (e === "REWORK") {
                      dispatch(
                        getRequiredDocumentsByProductId({
                          userId,
                          projectId,
                        }),
                      );
                    }
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

                {isCertificationCompleted && (
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-primary-200 bg-primary-50/40 p-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-foreground">
                        Certification Details
                      </p>
                      <p className="text-xs text-default-500">
                        Complete all certification details before marking this
                        milestone as completed.
                      </p>
                    </div>

                    <Select
                      className="max-w-xs"
                      isRequired
                      items={[
                        { label: "DAYS", value: "DAYS" },
                        { label: "MONTHS", value: "MONTHS" },
                        { label: "YEARS", value: "YEARS" },
                      ]}
                      label="Certification Period"
                      placeholder="Select period"
                      selectedKeys={[statusObj.certificationTenureUnit]}
                      onSelectionChange={(keys) => {
                        const temp = Array.from(keys)[0];
                        setStatusObj((prev) => ({
                          ...prev,
                          certificationTenureUnit: temp,
                        }));
                      }}
                    >
                      {(item) => (
                        <SelectItem key={item?.value}>{item.label}</SelectItem>
                      )}
                    </Select>

                    <Input
                      type="number"
                      min={1}
                      label="Certification Tenure (Years)"
                      placeholder="Enter tenure"
                      isRequired
                      value={statusObj.certificationTenure}
                      onChange={(e) =>
                        setStatusObj((prev) => ({
                          ...prev,
                          certificationTenure: e.target.value,
                        }))
                      }
                    />

                    <DatePicker
                      label="Certification Expiry Date"
                      isRequired
                      showMonthAndYearPickers
                      minValue={today(getLocalTimeZone())}
                      value={
                        statusObj.certificateExpiryDate
                          ? parseDate(statusObj.certificateExpiryDate)
                          : null
                      }
                      onChange={(date) =>
                        setStatusObj((prev) => ({
                          ...prev,
                          certificateExpiryDate: date ? date.toString() : "",
                        }))
                      }
                    />

                    <div className="md:col-span-2">
                      <SingleFileUploader
                        label="Certification Attachment"
                        value={statusObj.certificationAttachmentUrl}
                        onChange={(url) =>
                          setStatusObj((prev) => ({
                            ...prev,
                            certificationAttachmentUrl: url || "",
                          }))
                        }
                        isRequired
                      />
                    </div>
                  </div>
                )}

                {isReworkSelected && (
                  <div className="space-y-4 rounded-xl border border-warning-200 bg-warning-50/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Rework documents
                      </p>
                      <p className="text-xs text-default-500">
                        Select checklist documents for which rework is required.
                      </p>
                    </div>

                    <Select
                      label="Select documents from checklist"
                      placeholder="Select one or more documents"
                      selectionMode="multiple"
                      selectedKeys={
                        new Set(
                          (statusObj.reworkDocuments || []).map((doc) =>
                            String(doc.requiredDocumentId),
                          ),
                        )
                      }
                      onSelectionChange={handleReworkDocSelectionChange}
                      className="w-full"
                    >
                      {documentChecklist.map((doc) => {
                        const docId = getRequiredDocId(doc);
                        const docName = getRequiredDocName(doc);

                        return (
                          <SelectItem key={String(docId)} textValue={docName}>
                            {docName}
                          </SelectItem>
                        );
                      })}
                    </Select>

                    {(statusObj.reworkDocuments || []).length > 0 && (
                      <div className="space-y-3">
                        {(statusObj.reworkDocuments || []).map((doc) => (
                          <div
                            key={doc.requiredDocumentId}
                            className="rounded-lg border border-default-200 bg-content1 p-3"
                          >
                            <p className="mb-2 text-sm font-medium text-foreground">
                              {doc.documentName}
                            </p>

                            <Textarea
                              size="sm"
                              label="Small description / reason"
                              placeholder="Example: Document is blurred, expired, wrong format..."
                              value={doc.reason}
                              onChange={(e) =>
                                handleReworkDocReasonChange(
                                  doc.requiredDocumentId,
                                  e.target.value,
                                )
                              }
                            />

                            <div className="mt-3 rounded-lg border border-dashed border-default-300 p-3">
                              <FileUploader
                                label="Attachment optional"
                                placeholder={`Upload attachment for ${doc.documentName}`}
                                uploadingType="multiple"
                                value={doc.attachmentFiles || []}
                                onChange={(uploadedFiles) =>
                                  handleSelectedReworkAttachmentChange(
                                    doc.requiredDocumentId,
                                    uploadedFiles,
                                  )
                                }
                                onUploadSuccess={(fileMeta) =>
                                  handleSelectedReworkAttachmentSuccess(
                                    doc.requiredDocumentId,
                                    fileMeta,
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Divider />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Additional documents
                          </p>
                          <p className="text-xs text-default-500">
                            Add documents which are not available in checklist.
                          </p>
                        </div>

                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Plus className="h-4 w-4" />}
                          onPress={handleAddAdditionalReworkDocument}
                        >
                          Add Document
                        </Button>
                      </div>

                      {(statusObj.additionalReworkDocuments || []).map(
                        (doc) => (
                          <div
                            key={doc.tempId}
                            className="rounded-lg border border-default-200 bg-content1 p-3"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-foreground">
                                Additional document
                              </p>

                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() =>
                                  handleRemoveAdditionalReworkDocument(
                                    doc.tempId,
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <Input
                                label="Document name"
                                placeholder="Enter document name"
                                value={doc.documentName}
                                onChange={(e) =>
                                  handleAdditionalReworkDocumentChange(
                                    doc.tempId,
                                    "documentName",
                                    e.target.value,
                                  )
                                }
                              />

                              <Textarea
                                label="Small description / reason"
                                placeholder="Enter why this document is required"
                                value={doc.reason}
                                onChange={(e) =>
                                  handleAdditionalReworkDocumentChange(
                                    doc.tempId,
                                    "reason",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="mt-3 rounded-lg border border-dashed border-default-300 p-3">
                              <FileUploader
                                label="Attachment optional"
                                placeholder={
                                  doc.documentName
                                    ? `Upload attachment for ${doc.documentName}`
                                    : "Upload attachment for this document"
                                }
                                uploadingType="multiple"
                                value={doc.attachmentFiles || []}
                                onChange={(uploadedFiles) =>
                                  handleAdditionalReworkAttachmentChange(
                                    doc.tempId,
                                    uploadedFiles,
                                  )
                                }
                                onUploadSuccess={(fileMeta) =>
                                  handleAdditionalReworkAttachmentSuccess(
                                    doc.tempId,
                                    fileMeta,
                                  )
                                }
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
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
            setExpiryCheckResult(null);
            setIsCheckingExpiry(false);

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
                          onUploadSuccess={async (fileMeta) => {
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

                            await handleCheckDocumentExpiry(uploadedFileUrl);
                          }}
                        />
                      )}
                    />

                    {isCheckingExpiry && (
                      <div className="col-span-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                        <p className="text-sm font-semibold text-primary">
                          Checking document expiry date...
                        </p>
                        <p className="mt-1 text-xs text-default-500">
                          Please wait while the system scans the uploaded
                          document.
                        </p>
                      </div>
                    )}

                    {expiryCheckResult && (
                      <div
                        className={`col-span-2 rounded-xl border px-4 py-3 ${
                          expiryCheckResult?.status === "VALID"
                            ? "border-success-200 bg-success-50"
                            : expiryCheckResult?.manualReviewRequired
                              ? "border-warning-200 bg-warning-50"
                              : "border-default-200 bg-default-50"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Expiry check result
                            </p>

                            <p className="mt-1 text-xs text-default-500">
                              {expiryCheckResult?.message || "-"}
                            </p>
                          </div>

                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              expiryCheckResult?.status === "VALID"
                                ? "success"
                                : expiryCheckResult?.manualReviewRequired
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {expiryCheckResult?.status || "CHECKED"}
                          </Chip>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                          <div>
                            <span className="text-default-400">
                              File Name:{" "}
                            </span>
                            <span className="font-medium text-foreground">
                              {expiryCheckResult?.fileName || "-"}
                            </span>
                          </div>

                          <div>
                            <span className="text-default-400">
                              Expiry Date:{" "}
                            </span>
                            <span className="font-medium text-foreground">
                              {expiryCheckResult?.expiryDate || "-"}
                            </span>
                          </div>

                          <div className="md:col-span-2">
                            <span className="text-default-400">
                              Matched Text:{" "}
                            </span>
                            <span className="font-medium text-foreground">
                              {expiryCheckResult?.matchedText || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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
                    setExpiryCheckResult(null);
                    setIsCheckingExpiry(false);

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
        size="4xl"
        scrollBehavior="inside"
        isOpen={clientModal.isOpen}
        onOpenChange={clientModal.onOpenChange}
        hideCloseButton
        classNames={{
          base: "max-h-[92vh]",
          body: "py-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200">
                <div>
                  <p className="text-base font-semibold">
                    {isCredentials
                      ? "Add client portal login credentials"
                      : "Client portal login credentials"}
                  </p>
                  <p className="text-xs font-normal text-default-500">
                    {isCredentials
                      ? "Add portal URL, username and password for client login."
                      : "View and approve/reject client portal login details."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isCredentials ? (
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => setIsCredentials(false)}
                    >
                      Back
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<Plus className="w-4 h-4" />}
                      onPress={() => setIsCredentials(true)}
                    >
                      Add Credentials
                    </Button>
                  )}

                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    onPress={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </ModalHeader>

              <ModalBody>
                {isCredentials ? (
                  <Form className="w-full" onSubmit={onSubmit}>
                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                      <Input
                        label="Portal name"
                        name="portalName"
                        isRequired
                        errorMessage="Please enter portal name"
                        value={credentials?.portalName}
                        onChange={handleChange}
                      />

                      <Input
                        label="Portal URL"
                        name="portalUrl"
                        isRequired
                        errorMessage="Please enter portal URL"
                        value={credentials?.portalUrl}
                        onChange={handleChange}
                      />

                      <Input
                        label="Username"
                        name="username"
                        isRequired
                        errorMessage="Please enter username"
                        value={credentials?.username}
                        onChange={handleChange}
                      />

                      <Input
                        label="Password"
                        name="password"
                        isRequired
                        errorMessage="Please enter password"
                        value={credentials?.password}
                        onChange={handleChange}
                      />

                      <Textarea
                        label="Remarks"
                        name="remarks"
                        isRequired
                        minRows={3}
                        errorMessage="Please enter remark"
                        value={credentials?.remarks}
                        onChange={handleChange}
                        className="md:col-span-2"
                      />
                    </div>

                    <ModalFooter className="w-full px-0">
                      <Button
                        variant="flat"
                        onPress={() => setIsCredentials(false)}
                      >
                        Cancel
                      </Button>

                      <Button color="primary" type="submit">
                        Submit
                      </Button>
                    </ModalFooter>
                  </Form>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {clientLoginPortalCredentials?.companyName || "-"}
                      </p>

                      <p className="mt-1 text-xs text-default-500">
                        Project No:{" "}
                        {clientLoginPortalCredentials?.projectNo || "-"}
                      </p>
                    </div>

                    {clientLoginPortalCredentials?.portals?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {clientLoginPortalCredentials?.portals?.map(
                          (item, idx) => (
                            <Card
                              key={item?.id || item?.detailId || idx}
                              className="border border-default-200 shadow-none"
                            >
                              <CardHeader className="border-b border-default-100 px-4 py-3">
                                <div className="flex w-full items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      <h3 className="max-w-full truncate text-sm font-semibold text-foreground">
                                        {item?.portalName || "-"}
                                      </h3>

                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                          statusColorCode[item?.status] ||
                                          "default"
                                        }
                                        className="shrink-0"
                                      >
                                        {item?.status || "-"}
                                      </Chip>
                                    </div>

                                    <p className="mt-1 break-all text-xs text-default-500">
                                      {item?.portalUrl || "-"}
                                    </p>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                      className="shrink-0"
                                      onPress={() =>
                                        openPortalStatusModal(item)
                                      }
                                    >
                                      Update Status
                                    </Button>

                                    <Button
                                      size="sm"
                                      isIconOnly
                                      variant="flat"
                                      className="shrink-0"
                                      onPress={() => openEditPortalModal(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      isIconOnly
                                      color="danger"
                                      variant="flat"
                                      className="shrink-0"
                                      onPress={() =>
                                        openDeletePortalModal(item)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>

                              <CardBody className="gap-3 px-4 py-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div className="min-w-0 rounded-lg bg-default-50 px-3 py-2">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                                      Username
                                    </p>
                                    <p className="mt-1 break-all text-xs font-semibold text-foreground">
                                      {item?.username || "-"}
                                    </p>
                                  </div>

                                  <div className="min-w-0 rounded-lg bg-default-50 px-3 py-2">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                                      Password
                                    </p>
                                    <p className="mt-1 break-all text-xs font-semibold text-foreground">
                                      {item?.password || "-"}
                                    </p>
                                  </div>
                                </div>

                                <div className="min-w-0 rounded-lg bg-default-50 px-3 py-2">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                                    Remarks
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap break-words text-xs text-foreground">
                                    {item?.remarks || "-"}
                                  </p>
                                </div>

                                {item?.approvalRemarks && (
                                  <div className="min-w-0 rounded-lg bg-primary-50 px-3 py-2">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                                      Approval Remarks
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap break-words text-xs text-foreground">
                                      {item?.approvalRemarks}
                                    </p>
                                  </div>
                                )}
                              </CardBody>
                            </Card>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-default-300 py-10 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          No portal credentials found
                        </p>
                        <p className="mt-1 text-xs text-default-500">
                          Click Add Credentials to create client portal login
                          details.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={portalStatusModal.isOpen}
        onOpenChange={portalStatusModal.onOpenChange}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <Form onSubmit={handleUpdatePortalStatus}>
              <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200 w-full">
                <div>
                  <p className="text-base font-semibold">
                    Update portal status
                  </p>
                  <p className="text-xs font-normal text-default-500">
                    Approve or reject client portal login details with remarks.
                  </p>
                </div>

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </ModalHeader>

              <ModalBody className="w-full gap-4">
                <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                    Portal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedPortalDetail?.portalName || "-"}
                  </p>

                  <p className="mt-1 break-all text-xs text-default-500">
                    {selectedPortalDetail?.portalUrl || "-"}
                  </p>
                </div>

                <Select
                  label="Status"
                  name="status"
                  isRequired
                  selectedKeys={
                    portalStatusData.status ? [portalStatusData.status] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];

                    setPortalStatusData((prev) => ({
                      ...prev,
                      status: value,
                    }));
                  }}
                >
                  <SelectItem key="APPROVED">APPROVED</SelectItem>
                  <SelectItem key="REJECTED">REJECTED</SelectItem>
                </Select>

                <Textarea
                  label="Approval remarks"
                  name="approvalRemarks"
                  isRequired
                  minRows={4}
                  placeholder="Enter approval/rejection remarks..."
                  value={portalStatusData.approvalRemarks}
                  onChange={handlePortalStatusChange}
                />
              </ModalBody>

              <ModalFooter className="border-t border-default-200">
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="3xl"
        scrollBehavior="inside"
        isOpen={editPortalModal.isOpen}
        onOpenChange={editPortalModal.onOpenChange}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <Form onSubmit={handleUpdatePortalDetails}>
              <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200 w-full">
                <div>
                  <p className="text-base font-semibold">
                    Update portal login details
                  </p>
                  <p className="text-xs font-normal text-default-500">
                    Update portal name, URL, username, password and remarks.
                  </p>
                </div>

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </ModalHeader>

              <ModalBody className="w-full gap-4">
                <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Portal name"
                    name="portalName"
                    isRequired
                    value={editPortalData.portalName}
                    onChange={handleEditPortalChange}
                  />

                  <Input
                    label="Portal URL"
                    name="portalUrl"
                    isRequired
                    value={editPortalData.portalUrl}
                    onChange={handleEditPortalChange}
                  />

                  <Input
                    label="Username"
                    name="username"
                    isRequired
                    value={editPortalData.username}
                    onChange={handleEditPortalChange}
                  />

                  <Input
                    label="Password"
                    name="password"
                    isRequired
                    value={editPortalData.password}
                    onChange={handleEditPortalChange}
                  />

                  <Textarea
                    label="Remarks"
                    name="remarks"
                    isRequired
                    minRows={3}
                    value={editPortalData.remarks}
                    onChange={handleEditPortalChange}
                    className="md:col-span-2"
                  />
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-default-200">
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button color="primary" type="submit">
                  Update
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="md"
        isOpen={deletePortalModal.isOpen}
        onOpenChange={deletePortalModal.onOpenChange}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200">
                <div>
                  <p className="text-base font-semibold text-danger">
                    Delete portal details
                  </p>
                  <p className="text-xs font-normal text-default-500">
                    This will soft delete the selected portal login details.
                  </p>
                </div>

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </ModalHeader>

              <ModalBody>
                <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedPortalDetail?.portalName || "-"}
                  </p>

                  <p className="mt-1 break-all text-xs text-default-600">
                    {selectedPortalDetail?.portalUrl || "-"}
                  </p>
                </div>

                <p className="text-sm text-default-600">
                  Are you sure you want to delete this portal login detail?
                </p>
              </ModalBody>

              <ModalFooter className="border-t border-default-200">
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button color="danger" onPress={handleDeletePortalDetails}>
                  Delete
                </Button>
              </ModalFooter>
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
        onOpenChange={(isOpen) => {
          expenseModal.onOpenChange(isOpen);

          if (!isOpen && !isExpenseSubmitting) {
            resetExpenseForm({
              expenseCategory: "",
              amount: "",
              remark: "",
              expenseDate: "",
              attachmentUrl: "",
              externalReference: "",
              currencyCode: "INR",
            });
          }
        }}
        isDismissable={!isExpenseSubmitting}
        hideCloseButton={isExpenseSubmitting}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={handleExpenseSubmit(handleAddExpense)}
            >
              <ModalHeader>Add Expense</ModalHeader>

              <ModalBody className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="expenseCategory"
                  control={expenseControl}
                  render={({ field }) => (
                    <Select
                      label="Expense Category"
                      isRequired
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) => {
                        field.onChange(Array.from(keys)[0] || "");
                      }}
                      isInvalid={!!expenseErrors.expenseCategory}
                      errorMessage={expenseErrors.expenseCategory?.message}
                    >
                      <SelectItem key="GOVERNMENT_FEE">
                        Government Fee
                      </SelectItem>
                      <SelectItem key="PORTAL_FEE">Portal Fee</SelectItem>
                      <SelectItem key="PROFESSIONAL_FEE">
                        Profesional Fee
                      </SelectItem>
                      <SelectItem key="CONSULTANT_FEE">
                        Consultant Fee
                      </SelectItem>
                      <SelectItem key="TRAVEL">Travel Fee</SelectItem>
                      <SelectItem key="COURIER">Courier Fee</SelectItem>
                      <SelectItem key="PRINTING">Printing Fee</SelectItem>
                      <SelectItem key="INSPECTION_FEE">
                        Inspection Fee
                      </SelectItem>
                      <SelectItem key="TESTING_FEE">Testing Fee</SelectItem>
                      <SelectItem key="OTHER">Other Fee</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="amount"
                  control={expenseControl}
                  render={({ field }) => (
                    <Input
                      label="Amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      isRequired
                      startContent={<IndianRupee className="h-4 w-4" />}
                      value={field.value?.toString() || ""}
                      onValueChange={field.onChange}
                      isInvalid={!!expenseErrors.amount}
                      errorMessage={expenseErrors.amount?.message}
                    />
                  )}
                />

                <Controller
                  name="currencyCode"
                  control={expenseControl}
                  render={({ field }) => (
                    <Select
                      label="Currency"
                      isRequired
                      selectedKeys={
                        field.value ? new Set([field.value]) : new Set()
                      }
                      onSelectionChange={(keys) => {
                        field.onChange(Array.from(keys)[0] || "");
                      }}
                      isInvalid={!!expenseErrors.currencyCode}
                      errorMessage={expenseErrors.currencyCode?.message}
                    >
                      <SelectItem key="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem key="USD">USD - US Dollar</SelectItem>
                      <SelectItem key="EUR">EUR - Euro</SelectItem>
                      <SelectItem key="AED">AED - UAE Dirham</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="expenseDate"
                  control={expenseControl}
                  render={({ field }) => (
                    <DatePicker
                      label="Expense Date"
                      showMonthAndYearPickers
                      isRequired
                      value={
                        field.value
                          ? parseDate(dayjs(field.value).format("YYYY-MM-DD"))
                          : null
                      }
                      maxValue={today(getLocalTimeZone())}
                      onChange={(date) => {
                        if (!date) {
                          field.onChange("");
                          return;
                        }

                        const selectedDate = toCalendarDate(date).toString();

                        const isoDate = dayjs(selectedDate)
                          .hour(dayjs().hour())
                          .minute(dayjs().minute())
                          .second(dayjs().second())
                          .millisecond(dayjs().millisecond())
                          .toISOString();

                        field.onChange(isoDate);
                      }}
                      isInvalid={!!expenseErrors.expenseDate}
                      errorMessage={expenseErrors.expenseDate?.message}
                    />
                  )}
                />

                <Controller
                  name="externalReference"
                  control={expenseControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="External Reference"
                      placeholder="Enter transaction or receipt reference"
                      value={field.value || ""}
                      isInvalid={!!expenseErrors.externalReference}
                      errorMessage={expenseErrors.externalReference?.message}
                    />
                  )}
                />

                <Controller
                  name="attachmentUrl"
                  control={expenseControl}
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <SingleFileUploader
                        label="Payment Proof"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value || "");
                        }}
                        isRequired
                        isInvalid={!!expenseErrors.attachmentUrl}
                        errorMessage={expenseErrors.attachmentUrl?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="remark"
                  control={expenseControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Remark"
                      placeholder="Enter expense details"
                      isRequired
                      className="md:col-span-2"
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      isInvalid={!!expenseErrors.remark}
                      errorMessage={expenseErrors.remark?.message}
                    />
                  )}
                />
              </ModalBody>

              <ModalFooter className="flex w-full justify-end gap-2">
                <Button
                  type="button"
                  variant="flat"
                  isDisabled={isExpenseSubmitting}
                  onPress={onClose}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  isLoading={isExpenseSubmitting}
                  isDisabled={isExpenseSubmitting}
                >
                  {isExpenseSubmitting ? "Submitting..." : "Submit"}
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
                <Select
                  isRequired
                  label="Select vendor"
                  name="vendorId"
                  placeholder={
                    normalizedVendorList.length > 0
                      ? "Select approved vendor"
                      : "No approved vendors found"
                  }
                  selectedKeys={
                    vendorMapData?.vendorId
                      ? new Set([String(vendorMapData.vendorId)])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)?.[0] || "";

                    setVendorMapData((prev) => ({
                      ...prev,
                      vendorId: selected,
                    }));
                  }}
                  isDisabled={normalizedVendorList.length === 0}
                >
                  {normalizedVendorList.map((vendor) => {
                    const optionValue = String(vendor.vendorId || vendor.id);
                    const optionLabel =
                      vendor.vendorName || vendor.name || "Vendor";

                    return (
                      <SelectItem key={optionValue} textValue={optionLabel}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {optionLabel}
                          </span>
                          <span className="text-xs text-default-500">
                            {vendor.email || "-"}
                            {vendor.priceLevel ? ` • ${vendor.priceLevel}` : ""}
                            {vendor.totalFinalizedAmount
                              ? ` • ${inrCurrency(vendor.totalFinalizedAmount)}`
                              : ""}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </Select>

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
                        setVendorMapData((prev) => ({
                          ...prev,
                          vendorId: null,
                        }));

                        vendorMapModal.onOpen();

                        dispatch(
                          getVendorsBasedOnService({
                            userId,
                            productId: detailedData?.projectDetails?.productId,
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
                                      name={getInitials(
                                        selectedVendor?.vendorName ||
                                          selectedVendor?.name,
                                      )}
                                      className="h-14 w-14 bg-success-100 text-success"
                                    />

                                    <div>
                                      <h3 className="text-lg font-bold text-foreground">
                                        {selectedVendor?.vendorName ||
                                          selectedVendor?.name ||
                                          "-"}
                                      </h3>

                                      <p className="text-sm text-default-500">
                                        Vendor ID:{" "}
                                        {selectedVendor?.vendorId ||
                                          selectedVendor?.id ||
                                          "-"}
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

      <Modal
        isOpen={reopenModal.isOpen}
        onOpenChange={reopenModal.onOpenChange}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Reopen Project Request
                <span className="text-xs font-normal text-default-500">
                  Raise reopen request from current milestone and select
                  responsible milestone.
                </span>
              </ModalHeader>

              <ModalBody className="space-y-4">
                <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Project
                      </p>
                      <p className="font-semibold text-foreground">
                        {detailedData?.projectDetails?.name || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Project No.
                      </p>
                      <p className="font-semibold text-foreground">
                        {detailedData?.projectDetails?.projectNo || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Detected At Milestone
                      </p>
                      <p className="font-semibold text-foreground">
                        {selectedMilestone?.milestoneName || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Detected Assignment ID
                      </p>
                      <p className="font-semibold text-foreground">
                        {reopenData.detectedAtAssignmentId ||
                          selectedMilestone?.id ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <Select
                  label="Responsible Milestone"
                  placeholder={
                    responsibleMilestoneLoading
                      ? "Loading milestones..."
                      : "Select responsible milestone"
                  }
                  isRequired
                  isDisabled={responsibleMilestoneLoading}
                  selectedKeys={
                    reopenData.responsibleAssignmentId
                      ? new Set([String(reopenData.responsibleAssignmentId)])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)?.[0];

                    setReopenData((prev) => ({
                      ...prev,
                      responsibleAssignmentId: selected ? String(selected) : "",
                    }));
                  }}
                >
                  {(responsibleMilestoneOptions || []).map((mile) => (
                    <SelectItem
                      key={String(mile.assignmentId)}
                      textValue={`${mile.milestoneName} ${mile.assignmentId}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {mile.milestoneName || "-"}
                        </span>
                        <span className="text-xs text-default-500">
                          Assignment ID: {mile.assignmentId || "-"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  label="Reason"
                  isRequired
                  minRows={4}
                  placeholder="Enter reason for reopening this project..."
                  value={reopenData.reason}
                  onChange={(e) =>
                    setReopenData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>

                <Button color="warning" onPress={handleCreateReopenRequest}>
                  Submit Reopen Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
