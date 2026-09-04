import { addToast, Avatar, Button, Chip, useDisclosure } from "@heroui/react";
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
  getProjectTimeline,
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
  getProjectDirectories,
  createProjectDirectory,
  uploadProjectDirectoryDocuments,
  getProjectCompletionAcknowledgements,
} from "../../toolkit/slices/operationSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import dayjs from "dayjs";
import {
  getAllMilestoneStatusesForOperations,
  getUserDetailById,
  getUsersListByDepartmentId,
} from "../../toolkit/slices/commonSlice";
import { statusColors } from "../../common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getApplicantTypeList } from "../../toolkit/slices/settingSlice";
import {
  getVendorDetailInProject,
  getVendorsBasedOnService,
} from "../../toolkit/slices/vendorsSlice";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import SingleFileUploader from "../../components/SingleFileUploader";
import MilestoneAcknowledgementsDrawer from "./MilestoneAcknowledgementsDrawer";
import ReopenProjectModal from "./ReopenProjectModal";
import ProcurementDirectoriesDrawer from "./ProcurementDirectoriesDrawer";
import VendorDetailDrawer from "./VendorDetailDrawer";
import MapVendorModal from "./MapVendorModal";
import LegalRequestModal from "./LegalRequestModal";
import AddExpenseModal from "./AddExpenseModal";
import TextInputModal from "./TextInputModal";
import VerifyDocumentModal from "./VerifyDocumentModal";
import PortalStatusModal from "./PortalStatusModal";
import EditPortalModal from "./EditPortalModal";
import DeletePortalModal from "./DeletePortalModal";
import ClientPortalCredentialsModal from "./ClientPortalCredentialsModal";
import DocumentFormModal from "./DocumentFormModal";
import UpdateAssigneeModal from "./UpdateAssigneeModal";
import MilestoneStatusModal from "./MilestoneStatusModal";
import DocumentsChecklistDrawer from "./DocumentsChecklistDrawer";
import ActivityFeedDrawer from "./ActivityFeedDrawer";
import MilestoneHistoryTimelineTabs from "./MilestoneHistoryTimelineTabs";
import MilestoneSidebar from "./MilestoneSidebar";
import ProjectSummaryHeader from "./ProjectSummaryHeader";
import { getFileNameFromUrl, getInitials } from "./projectDetailsUtils";
import {
  documentSchema,
  expenseSchema,
  verifySchema,
} from "./projectDetailsSchemas";

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const directoriesDrawer = useDisclosure();
  const milestoneAcknowledgementsDrawer = useDisclosure();

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
  const filteredMilestoneStatusList = useMemo(() => {
    const excludedStatuses = ["QUEUED", "REJECTED"];

    return (milestoneStatusList || []).filter(
      (status) =>
        !excludedStatuses.includes(String(status?.name).toUpperCase()),
    );
  }, [milestoneStatusList]);
  const mileStoneHistoryDetail = useSelector(
    (state) => state.operation.mileStoneEventHistory,
  );
  const projectTimeline = useSelector(
    (state) => state.operation.projectTimeline,
  );
  const projectTimelineLoading = useSelector(
    (state) => state.operation.projectTimelineLoading,
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

  const projectDirectories = useSelector(
    (state) => state.operation.projectDirectories,
  );
  const projectDirectoriesLoading = useSelector(
    (state) => state.operation.projectDirectoriesLoading,
  );
  const createDirectoryLoading = useSelector(
    (state) => state.operation.createDirectoryLoading,
  );

  const projectCompletionAcknowledgements = useSelector(
    (state) => state.operation.projectCompletionAcknowledgements,
  );
  const projectCompletionAcknowledgementsLoading = useSelector(
    (state) => state.operation.projectCompletionAcknowledgementsLoading,
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

  const [detailPanelTab, setDetailPanelTab] = useState("history");

  // Project-level timeline: newest event first.
  const projectTimelineEvents = useMemo(() => {
    return [...(projectTimeline || [])].sort(
      (a, b) => new Date(b?.occurredAt || 0) - new Date(a?.occurredAt || 0),
    );
  }, [projectTimeline]);
  // Assignment History: system re-checks a "skip non-mandatory" milestone
  // every few seconds while it's pending, so most assignmentEvents are just
  // that automatic re-check noise. Drop those and merge in the (always
  // meaningful) statusChangeEvents so the timeline reads as a real history.
  const milestoneTimeline = useMemo(() => {
    const isNoiseReason = (reason) =>
      String(reason || "")
        .trim()
        .toLowerCase()
        .replace(/-/g, " ") === "skipped non mandatory";

    const assignmentEntries = (mileStoneHistoryDetail?.assignmentEvents || [])
      .filter((event) => !isNoiseReason(event?.reason))
      .map((event) => ({ kind: "assignment", ...event }));

    const statusEntries = (
      mileStoneHistoryDetail?.statusChangeEvents || []
    ).map((event) => ({ kind: "status", ...event }));

    return [...assignmentEntries, ...statusEntries].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [mileStoneHistoryDetail]);

  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );

  console.log("Department:", department);

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

    // Common for all milestones when completing
    acknowledgementAttachmentUrl: "",
    acknowledgementAttachmentName: "",

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

  const [newDirectoryName, setNewDirectoryName] = useState("");
  const [directoryUploadingId, setDirectoryUploadingId] = useState(null);

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

  const isCompletedStatus =
    statusObj?.newStatusName?.toUpperCase() === "COMPLETED";

  const isCertificationCompleted =
    isCertificationMilestone && isCompletedStatus;

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

  const todayDate = dayjs().toISOString();

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
      expenseDate: todayDate,
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

  const handleSelectedReworkAttachmentChange = (uploadId, uploadedFiles) => {
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
        Number(doc.uploadId) === Number(uploadId)
          ? {
              ...doc,
              attachmentFiles: files,
              attachments,
            }
          : doc,
      ),
    }));
  };

  const handleSelectedReworkAttachmentSuccess = (uploadId, fileMeta) => {
    const attachment = normalizeReworkAttachment(fileMeta);
    if (!attachment) return;

    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      reworkDocuments: (prev.reworkDocuments || []).map((doc) => {
        if (Number(doc.uploadId) !== Number(uploadId)) {
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
    return (
      doc?.uploadId ?? doc?.documentId ?? doc?.requiredDocumentId ?? doc?.id
    );
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
          String(item.uploadId),
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
            uploadId: Number(docId),
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

  const handleReworkDocReasonChange = (uploadId, reason) => {
    setStatusObj((prev) => ({
      ...prev,
      changedById: userId,
      reworkDocuments: (prev.reworkDocuments || []).map((doc) =>
        Number(doc.uploadId) === Number(uploadId) ? { ...doc, reason } : doc,
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
    dispatch(getProjectTimeline(projectId));

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

    if (isCompletedStatus) {
      if (!statusObj.acknowledgementAttachmentUrl) {
        addToast({
          title: "REQUIRED",
          description: "Acknowledgement attachment is required",
          color: "danger",
        });
        return;
      }

      if (!statusObj.acknowledgementAttachmentName?.trim()) {
        addToast({
          title: "REQUIRED",
          description: "Acknowledgement attachment name is required",
          color: "danger",
        });
        return;
      }
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
          Number(doc.uploadId),
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

        ...(isCompletedStatus && {
          acknowledgementAttachmentUrl: statusObj.acknowledgementAttachmentUrl,
          acknowledgementAttachmentName:
            statusObj.acknowledgementAttachmentName,
        }),

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
            acknowledgementAttachmentUrl: "",
            acknowledgementAttachmentName: "",
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

    // Prefill with the existing document's details so the form reflects what
    // is currently on file — the user can keep them as-is or upload a new
    // file, which overwrites fileUrl/fileName/fileSizeKb/fileFormat via
    // onUploadSuccess below.
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
      fileUrl: data.fileUrl,
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
      dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
    } else {
      dispatch(
        getActivitiesByTypeAndProjectId({
          projectId,
          type: value,
          page: 0,
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
          dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
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
          dispatch(getActivitiesByProjectId({ projectId, page: 0, size: 50 }));
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
            page: 0,
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

  // Procurement directories & certificates -------------------------------

  const fetchProjectDirectories = () => {
    dispatch(getProjectDirectories({ projectId }));
  };

  const handleOpenDirectoriesDrawer = () => {
    directoriesDrawer.onOpen();
    fetchProjectDirectories();
  };

  // Milestone completion acknowledgements ---------------------------------

  const handleOpenMilestoneAcknowledgementsDrawer = () => {
    milestoneAcknowledgementsDrawer.onOpen();
    dispatch(getProjectCompletionAcknowledgements({ projectId, userId }));
  };

  const handleCreateDirectory = () => {
    const directoryName = newDirectoryName.trim();

    if (!directoryName) {
      addToast({
        title: "REQUIRED",
        description: "Please enter a directory name.",
        color: "danger",
      });
      return;
    }

    dispatch(createProjectDirectory({ projectId, directoryName, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Directory created successfully!",
            color: "success",
          });
          setNewDirectoryName("");
          fetchProjectDirectories();
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload || "Failed to create directory.",
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

  const handleDirectoryDocumentUploadSuccess = (directoryId, fileMeta) => {
    const fileUrl = fileMeta?.filePath || "";
    const fileName = fileMeta?.fileName || "";

    if (!fileUrl) return;

    const fileSizeKb = fileMeta?.fileSize
      ? Math.ceil(Number(fileMeta.fileSize) / 1024)
      : 0;
    const fileFormat = getFileFormatFromMeta(fileMeta);

    setDirectoryUploadingId(directoryId);

    dispatch(
      uploadProjectDirectoryDocuments({
        projectId,
        directoryId,
        userId,
        data: {
          fileName,
          fileUrl,
          fileSizeKb,
          fileFormat,
          remarks: "",
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Document uploaded successfully!",
            color: "success",
          });
          fetchProjectDirectories();
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload || "Failed to upload document.",
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
      })
      .finally(() => setDirectoryUploadingId(null));
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
    <div className="h-[calc(100vh-80px)] w-full overflow-y-auto overflow-x-hidden bg-background px-3 py-2">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2.5 pb-4">
        <ProjectSummaryHeader
          projectDetails={detailedData?.projectDetails}
          milestonesCount={detailedData?.milestones?.length}
          selectedMilestone={selectedMilestone}
          department={department}
          adminRole={adminRole}
          isProcurementMilestone={isProcurementMilestone}
          onOpenVendor={() => {
            vendorDrawer.onOpen();
            dispatch(
              getVendorDetailInProject({
                procurementAssignmentId:
                  detailedData?.projectDetails
                    ?.procurementMilestoneAssignmentId,
              }),
            );
          }}
          onOpenPurchaseOrders={() => {
            navigate(
              `/erp/${userId}/operation/projects/${projectId}/projectDetail/purchaseOrder`,
              {
                state: {
                  procurementAssignmentId:
                    detailedData?.projectDetails
                      ?.procurementMilestoneAssignmentId,
                  vendorId: selectedVendorId,
                  defaultEstimatedAmount:
                    detailedData?.projectDetails?.estimatedAmount ||
                    detailedData?.projectDetails?.amount ||
                    0,
                },
              },
            );
          }}
          onOpenProcurementAcknowledgement={handleOpenDirectoriesDrawer}
          onOpenMilestoneAcknowledgements={
            handleOpenMilestoneAcknowledgementsDrawer
          }
          onOpenDocuments={() => {
            onOpen();

            dispatch(
              getRequiredDocumentsByProductId({
                userId,
                projectId,
              }),
            );

            fetchCompanyDocuments();
          }}
          onOpenClientCredentials={clientModal.onOpen}
          onOpenComment={activityDrawer.onOpen}
        />

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

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {(adminRole || isManager) && (
            <MilestoneSidebar
              milestones={detailedData?.milestones}
              selectedMilestone={selectedMilestone}
              onSelectMilestone={(mile) => {
                setSelectedMilestone(mile);
                fetchMilestoneHistory(mile);
              }}
            />
          )}

          <main className={adminRole ? "lg:col-span-9" : "lg:col-span-12"}>
            {selectedMilestone ? (
              <section className="overflow-hidden rounded-xl border border-default-200 bg-content1">
                <div className="border-b border-default-200 bg-primary-50/60 px-3.5 py-2.5">
                  <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <Chip
                          color="primary"
                          variant="flat"
                          size="sm"
                          className="h-5 text-[10.5px]"
                        >
                          Active Milestone
                        </Chip>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Chip
                            size="sm"
                            className="h-5 cursor-pointer text-[10.5px]"
                            color={
                              statusColors[selectedMilestone?.status] ||
                              "default"
                            }
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

                      <h2 className="truncate text-[15px] font-semibold text-foreground">
                        {selectedMilestone?.milestoneName || "Milestone"}
                      </h2>
                      {/* <p className="mt-0.5 text-[11px] text-default-500">
                        Assignment ID: {selectedMilestone?.id || "-"}
                      </p> */}
                    </div>
                    {!isCertificationMilestone && (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex min-w-[210px] items-center justify-between gap-2.5 rounded-lg bg-content1 px-2.5 py-1.5 shadow-sm ring-1 ring-default-200">
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
                              <p className="truncate text-[12.5px] font-semibold text-foreground">
                                {selectedMilestone?.assignedUser?.fullName ||
                                  "Select Assignee"}
                              </p>
                              <p className="truncate text-[11px] text-default-500">
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
                            <Pencil className="h-3.5 w-3.5" />
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
                <div className="p-3.5">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-default-100 pb-3 text-xs md:grid-cols-3">
                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wide text-default-400">
                        Department
                      </dt>
                      <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                        {selectedMilestone?.departmentName || "-"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wide text-default-400">
                        Assigned To
                      </dt>
                      <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                        {selectedMilestone?.assignedUser?.fullName ||
                          "Unassigned"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[10.5px] font-medium uppercase tracking-wide text-default-400">
                        Milestone Status
                      </dt>
                      <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                        {selectedMilestone?.status || "-"}
                      </dd>
                    </div>
                  </dl>

                  <MilestoneHistoryTimelineTabs
                    detailPanelTab={detailPanelTab}
                    setDetailPanelTab={setDetailPanelTab}
                    milestoneTimeline={milestoneTimeline}
                    projectTimelineEvents={projectTimelineEvents}
                    projectTimelineLoading={projectTimelineLoading}
                  />
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


        <ActivityFeedDrawer
          isOpen={activityDrawer.isOpen}
          onOpenChange={activityDrawer.onOpenChange}
          activityType={activityType}
          onFilterChange={handleFilterChange}
          onOpenCommentModal={() => commentModal.onOpen()}
          onOpenNoteModal={() => noteModal.onOpen()}
          onOpenExpenseModal={() => expenseModal.onOpen()}
          activities={activities}
          onReply={handleReply}
        />
      </div>

      <DocumentsChecklistDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        applicantTypeList={applicantTypeList}
        selectedApplicantId={detailedData?.projectDetails?.applicantId}
        onUpdateApplicantType={handleUpdateApplicantType}
        companyDocumentsList={companyDocumentsList}
        requiredDocsList={requiredDocsList}
        onRefetchCompanyDocuments={fetchCompanyDocuments}
        onOpenVerify={openVerify}
        onOpenUploadForDoc={openUploadForDoc}
        onOpenReplaceForDoc={openReplaceForDoc}
      />

      <UpdateAssigneeModal
        isOpen={assigneeModal.isOpen}
        onOpenChange={assigneeModal.onOpenChange}
        userListBydepartment={userListBydepartment}
        assigneeObj={assigneeObj}
        setAssigneeObj={setAssigneeObj}
        userId={userId}
        onSubmit={handleChangeAssignee}
      />
      <MilestoneStatusModal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        filteredMilestoneStatusList={filteredMilestoneStatusList}
        statusObj={statusObj}
        setStatusObj={setStatusObj}
        userId={userId}
        onStatusChange={(newStatus) => {
          if (newStatus === "REWORK") {
            dispatch(
              getRequiredDocumentsByProductId({
                userId,
                projectId,
              }),
            );
          }
        }}
        isCompletedStatus={isCompletedStatus}
        isCertificationCompleted={isCertificationCompleted}
        isReworkSelected={isReworkSelected}
        documentChecklist={documentChecklist}
        getRequiredDocId={getRequiredDocId}
        getRequiredDocName={getRequiredDocName}
        onReworkDocSelectionChange={handleReworkDocSelectionChange}
        onReworkDocReasonChange={handleReworkDocReasonChange}
        onSelectedReworkAttachmentChange={handleSelectedReworkAttachmentChange}
        onSelectedReworkAttachmentSuccess={
          handleSelectedReworkAttachmentSuccess
        }
        onAddAdditionalReworkDocument={handleAddAdditionalReworkDocument}
        onRemoveAdditionalReworkDocument={handleRemoveAdditionalReworkDocument}
        onAdditionalReworkDocumentChange={handleAdditionalReworkDocumentChange}
        onAdditionalReworkAttachmentChange={
          handleAdditionalReworkAttachmentChange
        }
        onAdditionalReworkAttachmentSuccess={
          handleAdditionalReworkAttachmentSuccess
        }
        onSubmit={handleStatusChange}
      />

      <DocumentFormModal
        isOpen={docModal.isOpen}
        docModal={docModal}
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
        setIsPermanent={setIsPermanent}
        isPermanentValue={isPermanentValue}
        setExpiryCheckResult={setExpiryCheckResult}
        isCheckingExpiry={isCheckingExpiry}
        setIsCheckingExpiry={setIsCheckingExpiry}
        expiryCheckResult={expiryCheckResult}
        control={control}
        errors={errors}
        setValue={setValue}
        reset={reset}
        handleSubmit={handleSubmit}
        onValidSubmit={onDocumentSubmit}
        onCheckDocumentExpiry={handleCheckDocumentExpiry}
        getFileFormatFromMeta={getFileFormatFromMeta}
      />

      <ClientPortalCredentialsModal
        isOpen={clientModal.isOpen}
        onOpenChange={clientModal.onOpenChange}
        isCredentials={isCredentials}
        setIsCredentials={setIsCredentials}
        credentials={credentials}
        onChange={handleChange}
        onSubmit={onSubmit}
        clientLoginPortalCredentials={clientLoginPortalCredentials}
        onOpenPortalStatusModal={openPortalStatusModal}
        onOpenEditPortalModal={openEditPortalModal}
        onOpenDeletePortalModal={openDeletePortalModal}
      />

      <PortalStatusModal
        isOpen={portalStatusModal.isOpen}
        onOpenChange={portalStatusModal.onOpenChange}
        selectedPortalDetail={selectedPortalDetail}
        portalStatusData={portalStatusData}
        setPortalStatusData={setPortalStatusData}
        onPortalStatusRemarksChange={handlePortalStatusChange}
        onSubmit={handleUpdatePortalStatus}
      />

      <EditPortalModal
        isOpen={editPortalModal.isOpen}
        onOpenChange={editPortalModal.onOpenChange}
        editPortalData={editPortalData}
        onEditPortalChange={handleEditPortalChange}
        onSubmit={handleUpdatePortalDetails}
      />

      <DeletePortalModal
        isOpen={deletePortalModal.isOpen}
        onOpenChange={deletePortalModal.onOpenChange}
        selectedPortalDetail={selectedPortalDetail}
        onConfirmDelete={handleDeletePortalDetails}
      />

      <VerifyDocumentModal
        isOpen={verifyModal.isOpen}
        onOpenChange={verifyModal.onOpenChange}
        control={verifyControl}
        errors={verifyErrors}
        handleSubmit={handleVerifySubmit}
        onValidSubmit={handleVerifyDocument}
      />

      <TextInputModal
        isOpen={commentModal.isOpen}
        onOpenChange={commentModal.onOpenChange}
        title="Add Comment"
        label="Comment"
        value={commentText}
        onChange={setCommentText}
        onSubmit={handleAddComment}
      />

      <TextInputModal
        isOpen={noteModal.isOpen}
        onOpenChange={noteModal.onOpenChange}
        title="Add Note"
        label="Note"
        value={noteText}
        onChange={setNoteText}
        onSubmit={handleAddNote}
      />

      <AddExpenseModal
        isOpen={expenseModal.isOpen}
        onOpenChange={expenseModal.onOpenChange}
        control={expenseControl}
        errors={expenseErrors}
        isSubmitting={isExpenseSubmitting}
        handleSubmit={handleExpenseSubmit}
        onValidSubmit={handleAddExpense}
        resetForm={resetExpenseForm}
      />

      <LegalRequestModal
        isOpen={legalSupportModal.isOpen}
        onOpenChange={legalSupportModal.onOpenChange}
        selectedMilestone={selectedMilestone}
        legalRequestData={legalRequestData}
        setLegalRequestData={setLegalRequestData}
        onSaveLegalDocs={saveLegalDocs}
        onAppendLegalDoc={appendLegalDoc}
        setIsLegalDocUploading={setIsLegalDocUploading}
        onSubmit={handleAddLegalRequest}
      />

      <MapVendorModal
        isOpen={vendorMapModal.isOpen}
        onOpenChange={vendorMapModal.onOpenChange}
        normalizedVendorList={normalizedVendorList}
        vendorMapData={vendorMapData}
        setVendorMapData={setVendorMapData}
        onSubmit={handleMapVendorWithProject}
      />

      <VendorDetailDrawer
        isOpen={vendorDrawer.isOpen}
        onOpenChange={vendorDrawer.onOpenChange}
        vendorDetail={vendorDetail}
        selectedVendor={selectedVendor}
        onMapVendor={() => {
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
      />

      <ProcurementDirectoriesDrawer
        isOpen={directoriesDrawer.isOpen}
        onOpenChange={directoriesDrawer.onOpenChange}
        newDirectoryName={newDirectoryName}
        setNewDirectoryName={setNewDirectoryName}
        createDirectoryLoading={createDirectoryLoading}
        onCreateDirectory={handleCreateDirectory}
        projectDirectoriesLoading={projectDirectoriesLoading}
        projectDirectories={projectDirectories}
        directoryUploadingId={directoryUploadingId}
        onDirectoryDocumentUploadSuccess={handleDirectoryDocumentUploadSuccess}
      />

      <MilestoneAcknowledgementsDrawer
        isOpen={milestoneAcknowledgementsDrawer.isOpen}
        onOpenChange={milestoneAcknowledgementsDrawer.onOpenChange}
        loading={projectCompletionAcknowledgementsLoading}
        acknowledgements={projectCompletionAcknowledgements}
      />

      <ReopenProjectModal
        isOpen={reopenModal.isOpen}
        onOpenChange={reopenModal.onOpenChange}
        projectDetails={detailedData?.projectDetails}
        selectedMilestone={selectedMilestone}
        reopenData={reopenData}
        setReopenData={setReopenData}
        responsibleMilestoneLoading={responsibleMilestoneLoading}
        responsibleMilestoneOptions={responsibleMilestoneOptions}
        onSubmit={handleCreateReopenRequest}
      />
    </div>
  );
};

export default ProjectDetails;
