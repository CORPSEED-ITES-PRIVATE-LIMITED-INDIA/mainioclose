import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToast,
  Button,
  Chip,
  DatePicker,
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
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  EllipsisVertical,
  Eye,
  ExternalLink,
  File,
  FileText,
  MessageCircle,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";
import dayjs from "dayjs";
import FileUploader from "../components/FileUploader.jsx";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import {
  agreementDecisionForVendorLegalRequest,
  getAllVendorQuotationLegalRequests,
  sendAgreementToProcurement,
  startOperationChat,
  sendOperationChatMessage,
  getOperationChatMessages,
  closeOperationChat,
  reopenOperationChat,
} from "../toolkit/slices/operationSlice.js";

const columns = [
  { name: "VENDOR", uid: "vendor" },
  { name: "QUOTATION / VENDOR", uid: "quotationVendor" },
  { name: "LEGAL", uid: "legal" },
  { name: "STATUS", uid: "status" },
  { name: "DATES", uid: "dates" },
  { name: "ATTACHMENTS", uid: "attachments" },
  { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
  SERVICE_AGREEMENT_REQUESTED: "warning",
  AGREEMENT_SENT_TO_PROCUREMENT: "primary",
  AGREEMENT_AGREED: "success",
  AGREEMENT_DISAGREED: "danger",
  CANCELLED: "default",
  PENDING: "warning",
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.response)) return response.response;
  return [];
};

const LEGAL_CHAT_CONTEXT_TYPE = "LEGAL_REQUEST";

const normalizeChatMessages = (response) => {
  const content = Array.isArray(response?.content)
    ? response.content
    : Array.isArray(response)
      ? response
      : [];

  // Backend returns latest first. Chat UI needs oldest first.
  return [...content].reverse();
};

const isChatClosedStatus = (status) => {
  return ["CLOSED", "CLOSE"].includes(
    String(status || "")
      .trim()
      .toUpperCase(),
  );
};

const getResolvedUserId = (currentUser) => {
  return (
    currentUser?.id || currentUser?.userId || currentUser?.employeeId || ""
  );
};

const getResolvedUserName = (currentUser) => {
  return (
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.employeeName ||
    "Corpseed"
  );
};

const getFileNameFromUrl = (url = "") => {
  try {
    const cleanUrl = String(url).split("?")[0];
    return decodeURIComponent(
      cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1) || "attachment",
    );
  } catch {
    return "attachment";
  }
};

const getFileTypeFromNameOrUrl = (fileName = "", fileUrl = "") => {
  const source = fileName || fileUrl || "";
  const extension = source.split("?")[0].split(".").pop()?.toLowerCase();
  return extension || "file";
};

const getChatAttachmentUrl = (file) => {
  return (
    file?.fileUrl ||
    file?.filePath ||
    file?.url ||
    file?.path ||
    file?.location ||
    ""
  );
};

const normalizeChatAttachmentPayload = (file) => {
  if (!file) return null;

  const fileUrl = getChatAttachmentUrl(file);

  return {
    fileUrl,
    fileName: file?.fileName || file?.name || getFileNameFromUrl(fileUrl),
    fileType:
      file?.fileType ||
      file?.contentType ||
      file?.mimeType ||
      file?.type ||
      getFileTypeFromNameOrUrl(file?.fileName || "", fileUrl),
    fileSize: Number(file?.fileSize || file?.size || 0),
  };
};

const getChatReferenceId = (request) => {
  return request?.id || "";
};

const getChatReceiverId = (request, currentUserId) => {
  const candidates = [
    request?.assignedToLegal,
    request?.assignedToLegalId,
    request?.legalUserId,
    request?.createdBy,
    request?.createdById,
    request?.updatedBy,
    request?.updatedById,
  ];

  const receiver = candidates.find((value) => {
    const numericValue = Number(value);
    return (
      value !== undefined &&
      value !== null &&
      Number.isFinite(numericValue) &&
      numericValue !== Number(currentUserId)
    );
  });

  return receiver || "";
};

const getUploadedFileValue = (value) => {
  return (
    value?.filePath ||
    value?.fileUrl ||
    value?.url ||
    value?.path ||
    value?.location ||
    value ||
    ""
  );
};

const getFileExtension = (fileName = "", fileUrl = "") => {
  const source = String(fileName || fileUrl || "").split("?")[0];
  const extension = source.split(".").pop()?.toLowerCase();
  return extension && extension !== source ? extension : "file";
};

const formatFileSize = (sizeKb) => {
  const kb = Number(sizeKb || 0);
  if (!kb) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const getQuotationDocuments = (rowData) => {
  if (Array.isArray(rowData?.documents)) {
    return rowData.documents.filter(
      (doc) => doc && !doc.deleted && doc.fileUrl,
    );
  }

  return [];
};

const getAgreementUrl = (rowData) => {
  return (
    rowData?.agreementFileUrl ||
    rowData?.agreementUrl ||
    rowData?.agreementAttachmentUrl ||
    rowData?.agreementAttachment ||
    ""
  );
};

const fileLinkClassMap = {
  primary: "border-primary-100 bg-primary-50 text-primary hover:bg-primary-100",
  success: "border-success-100 bg-success-50 text-success hover:bg-success-100",
};

const FileLink = ({ href, label, meta, color = "primary" }) => {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
        fileLinkClassMap[color] || fileLinkClassMap.primary
      }`}
    >
      <FileText size={15} className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
      {meta ? <span className="shrink-0 text-default-500">{meta}</span> : null}
      <ExternalLink size={13} className="shrink-0" />
    </a>
  );
};

const QuotationDocumentLinks = ({ documents = [], compact = false }) => {
  if (!documents.length) {
    return (
      <div className="rounded-xl border border-dashed border-default-300 bg-default-50 px-3 py-3 text-center text-xs text-default-500">
        No quotation documents
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-1.5"
          : "grid grid-cols-1 gap-2 sm:grid-cols-2"
      }
    >
      {documents.map((doc, index) => {
        const fileName = doc?.fileName || `Quotation Document ${index + 1}`;
        const fileType =
          doc?.fileType || getFileExtension(fileName, doc?.fileUrl);
        const size = formatFileSize(doc?.fileSizeKb);

        return (
          <FileLink
            key={doc?.id || doc?.fileUrl || index}
            href={doc?.fileUrl}
            label={fileName}
            meta={[String(fileType).toUpperCase(), size]
              .filter(Boolean)
              .join(" • ")}
            color="primary"
          />
        );
      })}
    </div>
  );
};

const ProcurementVendors = () => {
  const dispatch = useDispatch();

  const legalRequestsResponse = useSelector(
    (state) => state.operation.vendorLegalRequests,
  );
  const loading = useSelector((state) => state.operation.loading);
  const currentUser = useSelector((state) => state.auth.currentUser);

  const viewModal = useDisclosure();
  const sendToProcurementModal = useDisclosure();
  const decisionModal = useDisclosure();
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const admin = userRole.includes("ADMIN");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const [sendToProcurementData, setSendToProcurementData] = useState({
    agreementFileUrl: "",
    expiryDate: "",
    validityDays: 0,
    remarks: "",
  });

  const [decisionData, setDecisionData] = useState({
    decision: "",
    decisionBy: "",
    remarks: "",
  });

  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatAttachment, setChatAttachment] = useState(null);
  const [selectedChatRequest, setSelectedChatRequest] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatActionLoading, setChatActionLoading] = useState(false);
  const [chatClosed, setChatClosed] = useState(false);
  const [chatAttachmentUploading, setChatAttachmentUploading] = useState(false);
  const [chatUploaderKey, setChatUploaderKey] = useState(0);

  const chatBodyRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  const resolvedUserId = getResolvedUserId(currentUser);

  const selectedChatReferenceId = getChatReferenceId(selectedChatRequest);
  const selectedChatReceiverId = getChatReceiverId(
    selectedChatRequest,
    resolvedUserId,
  );

  const scrollChatToBottom = useCallback((behavior = "auto") => {
    requestAnimationFrame(() => {
      if (chatMessagesEndRef.current) {
        chatMessagesEndRef.current.scrollIntoView({
          behavior,
          block: "end",
        });
        return;
      }

      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (!chatDrawerOpen || !chatConversationId || chatLoading) return;

    scrollChatToBottom("auto");
  }, [
    chatDrawerOpen,
    chatConversationId,
    chatList,
    chatLoading,
    scrollChatToBottom,
  ]);

  const fetchLegalRequests = useCallback(() => {
    dispatch(getAllVendorQuotationLegalRequests());
  }, [dispatch]);

  useEffect(() => {
    fetchLegalRequests();
  }, [fetchLegalRequests]);

  const legalRequests = useMemo(() => {
    return normalizeList(legalRequestsResponse);
  }, [legalRequestsResponse]);

  const filteredItems = useMemo(() => {
    let list = [...legalRequests];

    if (searchValue) {
      const search = searchValue.toLowerCase();

      list = list.filter((item) => {
        const documentText = getQuotationDocuments(item)
          .map((doc) => `${doc?.fileName || ""} ${doc?.fileType || ""}`)
          .join(" ");

        return `${Object.values(item || {}).join(" ")} ${documentText}`
          .toLowerCase()
          .includes(search);
      });
    }

    return list;
  }, [legalRequests, searchValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;
    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  const selectedQuotationDocuments = getQuotationDocuments(selectedRequest);
  const selectedAgreementUrl = getAgreementUrl(selectedRequest);

  const handleView = useCallback(
    (rowData) => {
      setSelectedRequest(rowData);
      viewModal.onOpen();
    },
    [viewModal],
  );

  const handleOpenSendToProcurement = useCallback(
    (rowData) => {
      const agreementUrl = getAgreementUrl(rowData);
      const expiryDate = rowData?.expiryDate
        ? dayjs(rowData.expiryDate).format("YYYY-MM-DD")
        : "";

      setSelectedRequest(rowData);
      setSendToProcurementData({
        agreementFileUrl: agreementUrl,
        expiryDate,
        validityDays: Number(rowData?.validityDays || 0),
        remarks: rowData?.remarks || rowData?.statusReason || "",
      });
      sendToProcurementModal.onOpen();
    },
    [sendToProcurementModal],
  );

  const handleSendToProcurementSubmit = () => {
    if (!selectedRequest?.id) {
      addToast({
        title: "Missing request",
        description: "Legal request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "Missing user",
        description: "User ID is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    if (!sendToProcurementData.agreementFileUrl) {
      addToast({
        title: "Agreement required",
        description:
          "Please upload agreement PDF before sending to procurement.",
        color: "danger",
      });
      return;
    }

    if (
      !sendToProcurementData.expiryDate ||
      !dayjs(sendToProcurementData.expiryDate).isValid()
    ) {
      addToast({
        title: "Expiry date required",
        description: "Please select a valid agreement expiry date.",
        color: "danger",
      });
      return;
    }

    if (dayjs(sendToProcurementData.expiryDate).isBefore(dayjs(), "day")) {
      addToast({
        title: "Invalid expiry date",
        description: "Agreement expiry date cannot be before today.",
        color: "danger",
      });
      return;
    }

    const validityDays = Number(sendToProcurementData.validityDays);

    if (!Number.isFinite(validityDays) || validityDays < 0) {
      addToast({
        title: "Invalid validity",
        description: "Validity days must be zero or greater.",
        color: "danger",
      });
      return;
    }

    const payload = {
      agreementFileUrl: sendToProcurementData.agreementFileUrl,
      expiryDate: dayjs(sendToProcurementData.expiryDate)
        .endOf("day")
        .toISOString(),
      validityDays,
      remarks: sendToProcurementData.remarks || "",
    };

    setSubmitLoading(true);

    dispatch(
      sendAgreementToProcurement({
        id: selectedRequest.id,
        userId: Number(resolvedUserId),
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Agreement sent to procurement successfully.",
          color: "success",
        });

        sendToProcurementModal.onClose();
        setSelectedRequest(null);
        setSendToProcurementData({
          agreementFileUrl: "",
          expiryDate: "",
          validityDays: 0,
          remarks: "",
        });
        fetchLegalRequests();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Failed to send agreement to procurement.",
          color: "danger",
        });
      }
    });
  };

  const handleOpenDecision = (rowData, decision) => {
    setSelectedRequest(rowData);
    setDecisionData({
      decision,
      decisionBy: resolvedUserId ? String(resolvedUserId) : "",
      remarks: "",
    });
    decisionModal.onOpen();
  };

  const handleDecisionSubmit = () => {
    if (!selectedRequest?.id) {
      addToast({
        title: "Missing request",
        description: "Legal request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!decisionData.decisionBy) {
      addToast({
        title: "Decision by required",
        description: "Please enter decision by user ID.",
        color: "danger",
      });
      return;
    }

    const payload = {
      decision: decisionData.decision,
      decisionBy: Number(decisionData.decisionBy),
      remarks: decisionData.remarks || "",
    };

    setSubmitLoading(true);

    dispatch(
      agreementDecisionForVendorLegalRequest({
        id: selectedRequest.id,
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: `Agreement marked as ${decisionData.decision}.`,
          color: decisionData.decision === "AGREED" ? "success" : "danger",
        });

        decisionModal.onClose();
        setSelectedRequest(null);
        setDecisionData({ decision: "", decisionBy: "", remarks: "" });
        fetchLegalRequests();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Failed to update agreement decision.",
          color: "danger",
        });
      }
    });
  };

  const fetchChatMessages = useCallback(
    async (conversationId) => {
      if (!conversationId || !resolvedUserId) return;

      try {
        setChatLoading(true);

        const resp = await dispatch(
          getOperationChatMessages({
            conversationId: Number(conversationId),
            userId: Number(resolvedUserId),
            page: 0,
            size: 30,
          }),
        ).unwrap();

        setChatList(normalizeChatMessages(resp));
      } catch (error) {
        addToast({
          title: "Failed to fetch chat messages",
          description: error?.message || error || "Please try again.",
          color: "danger",
        });
      } finally {
        setChatLoading(false);
      }
    },
    [dispatch, resolvedUserId],
  );

  const handleOpenChatHistory = (rowData) => {
    setSelectedChatRequest(rowData);
    setChatConversationId(null);
    setChatList([]);
    setChatMessage("");
    setChatAttachment(null);
    setChatClosed(false);
    setChatUploaderKey((prev) => prev + 1);
    setChatDrawerOpen(true);
  };

  const handleStartLegalChat = async () => {
    if (!resolvedUserId) {
      addToast({
        title: "Created by user is missing",
        color: "danger",
      });
      return;
    }

    if (!selectedChatReferenceId) {
      addToast({
        title: "Legal request reference is missing",
        color: "danger",
      });
      return;
    }

    if (!selectedChatReceiverId) {
      addToast({
        title: "Receiver user is missing",
        description:
          "This legal request must have createdBy or assignedToLegal user id for chat.",
        color: "danger",
      });
      return;
    }

    try {
      setChatLoading(true);

      const resp = await dispatch(
        startOperationChat({
          contextType: LEGAL_CHAT_CONTEXT_TYPE,
          referenceId: Number(selectedChatReferenceId),
          createdBy: Number(resolvedUserId),
          receiverId: Number(selectedChatReceiverId),
        }),
      ).unwrap();

      const conversationId = resp?.id;

      if (!conversationId) {
        throw new Error("Conversation ID not received from start chat API");
      }

      setChatConversationId(conversationId);
      setChatClosed(isChatClosedStatus(resp?.status || resp?.chatStatus));
      await fetchChatMessages(conversationId);
    } catch (error) {
      addToast({
        title: "Failed to start chat",
        description: error?.message || error || "Please try again.",
        color: "danger",
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleCloseChat = async () => {
    if (!chatConversationId || !resolvedUserId) {
      addToast({
        title: "Conversation or user is missing",
        color: "danger",
      });
      return;
    }

    try {
      setChatActionLoading(true);

      await dispatch(
        closeOperationChat({
          conversationId: Number(chatConversationId),
          userId: Number(resolvedUserId),
        }),
      ).unwrap();

      setChatClosed(true);
      addToast({
        title: "Chat closed",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Failed to close chat",
        description: error?.message || error || "Please try again.",
        color: "danger",
      });
    } finally {
      setChatActionLoading(false);
    }
  };

  const handleReopenChat = async () => {
    if (!chatConversationId || !resolvedUserId) {
      addToast({
        title: "Conversation or user is missing",
        color: "danger",
      });
      return;
    }

    try {
      setChatActionLoading(true);

      await dispatch(
        reopenOperationChat({
          conversationId: Number(chatConversationId),
          userId: Number(resolvedUserId),
        }),
      ).unwrap();

      setChatClosed(false);
      addToast({
        title: "Chat reopened",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Failed to reopen chat",
        description: error?.message || error || "Please try again.",
        color: "danger",
      });
    } finally {
      setChatActionLoading(false);
    }
  };

  const handleSubmitChat = async () => {
    const message = chatMessage.trim();

    if (!message && !chatAttachment?.fileUrl) return;

    if (chatClosed) {
      addToast({
        title: "Chat is closed",
        description: "Please reopen the chat before sending a message.",
        color: "warning",
      });
      return;
    }

    if (chatAttachmentUploading) {
      addToast({
        title: "Attachment is uploading",
        description: "Please wait until the file upload is complete.",
        color: "warning",
      });
      return;
    }

    if (!chatConversationId) {
      addToast({
        title: "Please start chat first",
        color: "warning",
      });
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "Sender user is missing",
        color: "danger",
      });
      return;
    }

    const attachmentPayload = normalizeChatAttachmentPayload(chatAttachment);

    if (chatAttachment && !attachmentPayload?.fileUrl) {
      addToast({
        title: "Please upload the file first",
        description:
          "Chat attachment API requires fileUrl. Use FileUploader/S3 URL before sending attachment.",
        color: "danger",
      });
      return;
    }

    const payload = {
      senderId: Number(resolvedUserId),
      senderName: getResolvedUserName(currentUser),
      messageType: "TEXT",
      message,
      replyToMessageId: 0,
      attachments: attachmentPayload ? [attachmentPayload] : [],
    };

    try {
      setChatSending(true);

      await dispatch(
        sendOperationChatMessage({
          conversationId: Number(chatConversationId),
          data: payload,
        }),
      ).unwrap();

      setChatMessage("");
      setChatAttachment(null);
      setChatUploaderKey((prev) => prev + 1);

      await fetchChatMessages(chatConversationId);
      scrollChatToBottom("smooth");
    } catch (error) {
      addToast({
        title: "Message sending failed",
        description: error?.message || error || "Please try again.",
        color: "danger",
      });
    } finally {
      setChatSending(false);
    }
  };

  const canSendToProcurement = (status) =>
    status === "SERVICE_AGREEMENT_REQUESTED" || status === "PENDING";

  const canTakeDecision = (status) =>
    status === "AGREEMENT_SENT_TO_PROCUREMENT";

  const renderCell = useCallback(
    (rowData, columnKey) => {
      const status = rowData?.status;
      const quotationDocuments = getQuotationDocuments(rowData);
      const agreementUrl = getAgreementUrl(rowData);

      switch (columnKey) {
        case "vendor":
          return (
            <div className="flex max-w-[260px] flex-col">
              <span className="font-semibold text-foreground">
                {rowData?.vendorName || rowData?.vendorId || "-"}
              </span>
            </div>
          );

        case "quotationVendor":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>
                Quotation:{" "}
                <span className="font-semibold">
                  {rowData?.quotationNumber ||
                    rowData?.vendorQuotationId ||
                    "-"}
                </span>
              </span>
              <span></span>
            </div>
          );

        case "legal":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>Assigned To: {rowData?.assignedToLegal || "-"}</span>
              <span>Created By: {rowData?.createdBy || "-"}</span>
              <span>Updated By: {rowData?.updatedBy || "-"}</span>
            </div>
          );

        case "status":
          return (
            <Chip
              size="sm"
              color={statusColorMap[status] || "default"}
              variant="flat"
            >
              {status || "-"}
            </Chip>
          );

        case "dates":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>
                Created:{" "}
                {rowData?.createdDate
                  ? dayjs(rowData.createdDate).format("DD-MM-YYYY HH:mm")
                  : "-"}
              </span>
              <span>
                Updated:{" "}
                {rowData?.updatedDate
                  ? dayjs(rowData.updatedDate).format("DD-MM-YYYY HH:mm")
                  : "-"}
              </span>
            </div>
          );

        case "attachments":
          return (
            <div className="flex flex-col gap-1.5 text-xs">
              {quotationDocuments.length > 0 ? (
                <Tooltip
                  content={quotationDocuments
                    .map((doc) => doc?.fileName || "Document")
                    .join(", ")}
                >
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="w-fit"
                  >
                    {quotationDocuments.length} Quotation File
                    {quotationDocuments.length > 1 ? "s" : ""}
                  </Chip>
                </Tooltip>
              ) : (
                <Chip
                  size="sm"
                  color="default"
                  variant="flat"
                  className="w-fit"
                >
                  No Quotation Files
                </Chip>
              )}

              {agreementUrl ? (
                <a
                  href={agreementUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-success"
                >
                  View Agreement <ExternalLink size={12} />
                </a>
              ) : (
                <Chip
                  size="sm"
                  color="default"
                  variant="flat"
                  className="w-fit"
                >
                  No Agreement
                </Chip>
              )}
            </div>
          );

        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Legal request actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye size={15} />}
                  onPress={() => handleView(rowData)}
                >
                  View
                </DropdownItem>

                <DropdownItem
                  key="chat"
                  startContent={<MessageCircle size={15} />}
                  onPress={() => handleOpenChatHistory(rowData)}
                >
                  Chat
                </DropdownItem>

                <DropdownItem
                  key="sendToProcurement"
                  startContent={<Send size={15} />}
                  onPress={() => handleOpenSendToProcurement(rowData)}
                  isDisabled={!canSendToProcurement(status)}
                >
                  Send To Procurement
                </DropdownItem>

                <DropdownItem
                  key="agreed"
                  startContent={<CheckCircle size={15} />}
                  onPress={() => handleOpenDecision(rowData, "AGREED")}
                  isDisabled={!canTakeDecision(status)}
                >
                  Mark Agreed
                </DropdownItem>

                <DropdownItem
                  key="disagreed"
                  startContent={<XCircle size={15} />}
                  onPress={() => handleOpenDecision(rowData, "DISAGREED")}
                  isDisabled={!canTakeDecision(status)}
                  className="text-danger"
                  color="danger"
                >
                  Mark Disagreed
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [handleOpenSendToProcurement, handleView, handleOpenChatHistory],
  );

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Vendor Legal Requests
          </h1>
          <p className="text-sm text-default-500">
            Service agreement requests sent from procurement/onboarding.
          </p>
        </div>

        <Input
          isClearable
          className="w-full sm:max-w-[320px]"
          placeholder="Search legal request..."
          startContent={<Search size={17} />}
          value={searchValue}
          onValueChange={(value) => {
            setSearchValue(value || "");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
          onClear={() => {
            setSearchValue("");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-small text-default-400">
          Total {filteredItems.length} legal requests
        </span>

        <label className="flex items-center gap-2 text-small text-default-400">
          Rows per page:
          <select
            className="bg-transparent text-small text-default-400 outline-none"
            value={filteration.size}
            onChange={(e) =>
              setFilteration({
                page: 1,
                size: Number(e.target.value),
              })
            }
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="flex items-center justify-between px-2 py-2">
      <span className="text-small text-default-400">
        Page {filteration.page} of {pages}
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        page={filteration.page}
        total={pages}
        onChange={(page) =>
          setFilteration((prev) => ({
            ...prev,
            page,
          }))
        }
      />
    </div>
  );

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Vendor legal requests table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={loading === "pending"}
          items={paginatedItems}
          emptyContent={
            loading === "pending" ? "Loading..." : "No legal requests found"
          }
        >
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="3xl"
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              Legal Request Details
            </ModalHeader>

            <ModalBody className="max-h-[72vh] space-y-4 overflow-y-auto py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Title"
                  value={selectedRequest?.legalRequestTitle || "-"}
                  isReadOnly
                />
                <Input
                  label="Status"
                  value={selectedRequest?.status || "-"}
                  isReadOnly
                />
                <Input
                  label="Quotation"
                  value={selectedRequest?.quotationNumber || "-"}
                  isReadOnly
                />
                <Input
                  label="Vendor"
                  value={selectedRequest?.vendorName || "-"}
                  isReadOnly
                />
              </div>

              <Textarea
                label="Notes"
                value={selectedRequest?.notes || "-"}
                isReadOnly
              />
              <Textarea
                label="Description"
                value={selectedRequest?.statusReason || "-"}
                isReadOnly
              />

              <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Quotation Documents
                  </p>
                  <Chip size="sm" color="primary" variant="flat">
                    {selectedQuotationDocuments.length} Files
                  </Chip>
                </div>
                <QuotationDocumentLinks
                  documents={selectedQuotationDocuments}
                />
              </div>

              <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Agreement Document
                </p>
                {selectedAgreementUrl ? (
                  <FileLink
                    href={selectedAgreementUrl}
                    label="View Agreement PDF"
                    color="success"
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-default-300 bg-white px-3 py-3 text-center text-xs text-default-500">
                    Agreement PDF not uploaded yet.
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={viewModal.onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={sendToProcurementModal.isOpen}
        onOpenChange={sendToProcurementModal.onOpenChange}
        size="3xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              Send Agreement To Procurement
            </ModalHeader>

            <ModalBody className="max-h-[72vh] space-y-4 overflow-y-auto py-5">
              <Input
                label="Legal Request"
                value={selectedRequest?.legalRequestTitle || "-"}
                isReadOnly
              />

              <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Quotation Documents
                  </p>
                  <Chip size="sm" color="primary" variant="flat">
                    {selectedQuotationDocuments.length} Files
                  </Chip>
                </div>
                <QuotationDocumentLinks
                  documents={selectedQuotationDocuments}
                />
              </div>

              {sendToProcurementData.agreementFileUrl ? (
                <div className="rounded-2xl border border-success-200 bg-success-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Current Agreement
                  </p>
                  <FileLink
                    href={sendToProcurementData.agreementFileUrl}
                    label="View Existing Agreement PDF"
                    color="success"
                  />
                </div>
              ) : null}

              <FileUploader
                isRequired
                label="Agreement PDF"
                value={sendToProcurementData.agreementFileUrl}
                onChange={(value) =>
                  setSendToProcurementData((prev) => ({
                    ...prev,
                    agreementFileUrl: getUploadedFileValue(value),
                  }))
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatePicker
                  label="Agreement Expiry Date"
                  isRequired
                  variant="bordered"
                  className="w-full"
                  minValue={today(getLocalTimeZone())}
                  value={
                    sendToProcurementData.expiryDate
                      ? parseDate(
                          dayjs(sendToProcurementData.expiryDate).format(
                            "YYYY-MM-DD",
                          ),
                        )
                      : null
                  }
                  onChange={(date) => {
                    const expiryDate = date ? date.toString() : "";

                    const validityDays = expiryDate
                      ? Math.max(
                          dayjs(expiryDate)
                            .startOf("day")
                            .diff(dayjs().startOf("day"), "day"),
                          0,
                        )
                      : 0;

                    setSendToProcurementData((prev) => ({
                      ...prev,
                      expiryDate,
                      validityDays,
                    }));
                  }}
                />

                <Input
                  type="number"
                  label="Validity Days"
                  isRequired
                  variant="bordered"
                  min={0}
                  step={1}
                  value={String(sendToProcurementData.validityDays ?? 0)}
                  onValueChange={(value) => {
                    const parsedValue = Number(value);

                    const validityDays =
                      Number.isFinite(parsedValue) && parsedValue >= 0
                        ? Math.floor(parsedValue)
                        : 0;

                    setSendToProcurementData((prev) => ({
                      ...prev,
                      validityDays,
                      expiryDate: dayjs()
                        .startOf("day")
                        .add(validityDays, "day")
                        .format("YYYY-MM-DD"),
                    }));
                  }}
                />
              </div>

              <Textarea
                label="Remarks"
                value={sendToProcurementData.remarks}
                onChange={(e) =>
                  setSendToProcurementData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
              />
            </ModalBody>

            <ModalFooter className="border-t">
              <Button
                variant="flat"
                onPress={() => {
                  sendToProcurementModal.onClose();
                  setSelectedRequest(null);
                  setSendToProcurementData({
                    agreementFileUrl: "",
                    expiryDate: "",
                    validityDays: 0,
                    remarks: "",
                  });
                }}
              >
                Cancel
              </Button>

              <Button
                color="primary"
                isLoading={submitLoading}
                onPress={handleSendToProcurementSubmit}
              >
                Send To Procurement
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={decisionModal.isOpen}
        onOpenChange={decisionModal.onOpenChange}
        size="2xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              {decisionData.decision === "AGREED"
                ? "Mark Agreement as Agreed"
                : "Mark Agreement as Disagreed"}
            </ModalHeader>

            <ModalBody className="space-y-4 py-5">
              <Input
                label="Legal Request"
                value={selectedRequest?.legalRequestTitle || "-"}
                isReadOnly
              />

              {selectedAgreementUrl ? (
                <FileLink
                  href={selectedAgreementUrl}
                  label="View Agreement PDF"
                  color="success"
                />
              ) : (
                <Chip variant="flat">No Agreement PDF</Chip>
              )}

              <Input
                label="Decision"
                value={decisionData.decision}
                isReadOnly
              />

              <Input
                label="Decision By User ID"
                isRequired
                value={decisionData.decisionBy}
                onChange={(e) =>
                  setDecisionData((prev) => ({
                    ...prev,
                    decisionBy: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />

              <Textarea
                label="Remarks"
                value={decisionData.remarks}
                onChange={(e) =>
                  setDecisionData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
              />
            </ModalBody>

            <ModalFooter className="border-t">
              <Button
                variant="flat"
                onPress={() => {
                  decisionModal.onClose();
                  setSelectedRequest(null);
                  setDecisionData({
                    decision: "",
                    decisionBy: "",
                    remarks: "",
                  });
                }}
              >
                Cancel
              </Button>

              <Button
                color={
                  decisionData.decision === "AGREED" ? "success" : "danger"
                }
                isLoading={submitLoading}
                onPress={handleDecisionSubmit}
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      {chatDrawerOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setChatDrawerOpen(false)}
          />

          <div className="relative z-10 flex h-full w-full max-w-[620px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Chat</h2>

                <p className="text-xs text-gray-500">
                  {chatConversationId
                    ? `Conversation ID: ${chatConversationId}`
                    : `Reference: ${LEGAL_CHAT_CONTEXT_TYPE}-${selectedChatReferenceId || "-"}`}
                </p>

                {selectedChatRequest && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Request: {selectedChatRequest?.legalRequestTitle || "-"}
                  </p>
                )}

                {chatConversationId && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color={chatClosed ? "danger" : "success"}
                    className="mt-1"
                  >
                    {chatClosed ? "Closed" : "Open"}
                  </Chip>
                )}
              </div>

              <div className="flex items-center gap-2">
                {chatConversationId && (
                  <>
                    {(department?.trim()?.toLowerCase() === "legal" ||
                      admin) && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isLoading={chatActionLoading && !chatClosed}
                        isDisabled={chatClosed || chatActionLoading}
                        onPress={handleCloseChat}
                      >
                        Close Chat
                      </Button>
                    )}

                    {(department?.trim()?.toLowerCase() === "procurement" ||
                      admin) && (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        isLoading={chatActionLoading && chatClosed}
                        isDisabled={!chatClosed || chatActionLoading}
                        onPress={handleReopenChat}
                      >
                        Reopen Chat
                      </Button>
                    )}
                  </>
                )}

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setChatDrawerOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {!chatConversationId ? (
              <div className="flex flex-1 items-center justify-center bg-gray-50 p-5">
                <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900">
                    Start chat
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    This will start or reopen existing conversation for this
                    legal request reference.
                  </p>

                  <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                    <p>Context Type: {LEGAL_CHAT_CONTEXT_TYPE}</p>
                    <p>Reference ID: {selectedChatReferenceId || "-"}</p>
                    <p>Sender ID: {resolvedUserId || "-"}</p>
                    <p>Receiver ID: {selectedChatReceiverId || "-"}</p>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    color="primary"
                    isLoading={chatLoading}
                    onPress={handleStartLegalChat}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div
                  ref={chatBodyRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4"
                >
                  {chatLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Loading messages...
                    </div>
                  ) : chatList.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No messages yet. Start the conversation.
                    </div>
                  ) : (
                    chatList.map((chat) => {
                      const isMine =
                        Number(chat.senderId) === Number(resolvedUserId);
                      const attachments = Array.isArray(chat.attachments)
                        ? chat.attachments
                        : chat.attachment
                          ? [chat.attachment]
                          : [];

                      return (
                        <div
                          key={chat.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${
                              isMine
                                ? "rounded-br-sm bg-primary text-white"
                                : "rounded-bl-sm border bg-white text-gray-900"
                            }`}
                          >
                            <p
                              className={`mb-1 text-[11px] font-semibold ${
                                isMine ? "text-white/80" : "text-gray-500"
                              }`}
                            >
                              {chat.senderName || "-"}
                            </p>

                            {chat.message && (
                              <p className="whitespace-pre-wrap text-sm leading-5">
                                {chat.message}
                              </p>
                            )}

                            {attachments.map((attachment, index) => {
                              const fileUrl =
                                attachment.fileUrl || attachment.url || "#";
                              const fileName =
                                attachment.fileName ||
                                attachment.name ||
                                `Attachment ${index + 1}`;

                              return (
                                <a
                                  key={attachment.id || fileName}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                                    isMine
                                      ? "border-white/30 bg-white/10 text-white"
                                      : "border-gray-200 bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <File size={15} />
                                  <span className="line-clamp-1">
                                    {fileName}
                                  </span>
                                </a>
                              );
                            })}

                            <p
                              className={`mt-1 text-right text-[10px] ${
                                isMine ? "text-white/70" : "text-gray-400"
                              }`}
                            >
                              {chat.createdAt
                                ? dayjs(chat.createdAt).format(
                                    "DD MMM, hh:mm A",
                                  )
                                : "-"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={chatMessagesEndRef} />
                </div>

                <div className="border-t bg-white px-4 py-3">
                  {chatClosed ? (
                    <div className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger">
                      This chat is closed. Use Reopen Chat from the header to
                      send a new message.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <FileUploader
                        key={chatUploaderKey}
                        value={chatAttachment?.fileUrl || ""}
                        label="Attachment"
                        placeholder="Upload attachment. File URL will be sent in attachments[].fileUrl"
                        uploadingType="single"
                        onUploadingChange={setChatAttachmentUploading}
                        onChange={(uploadedUrl) => {
                          if (!uploadedUrl) {
                            setChatAttachment(null);
                            return;
                          }

                          setChatAttachment((prev) => ({
                            ...(prev || {}),
                            fileUrl: uploadedUrl,
                            fileName:
                              prev?.fileName || getFileNameFromUrl(uploadedUrl),
                            fileType:
                              prev?.fileType ||
                              getFileTypeFromNameOrUrl("", uploadedUrl),
                            fileSize: Number(prev?.fileSize || 0),
                          }));
                        }}
                        onUploadSuccess={(fileMeta) => {
                          const fileUrl = fileMeta?.filePath || "";

                          if (!fileUrl) {
                            setChatAttachment(null);
                            return;
                          }

                          setChatAttachment({
                            fileUrl,
                            fileName:
                              fileMeta?.fileName || getFileNameFromUrl(fileUrl),
                            fileType:
                              fileMeta?.contentType ||
                              getFileTypeFromNameOrUrl(
                                fileMeta?.fileName || "",
                                fileUrl,
                              ),
                            fileSize: Number(fileMeta?.fileSize || 0),
                          });
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Message..."
                          value={chatMessage}
                          onValueChange={setChatMessage}
                          className="min-w-0 flex-1"
                          classNames={{
                            inputWrapper: "h-11",
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitChat();
                            }
                          }}
                        />

                        <Button
                          isIconOnly
                          color="primary"
                          type="button"
                          className="h-11 w-11 shrink-0"
                          onPress={handleSubmitChat}
                          isLoading={chatSending}
                          isDisabled={
                            chatAttachmentUploading ||
                            (!chatMessage.trim() && !chatAttachment?.fileUrl)
                          }
                        >
                          <Send size={19} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProcurementVendors;
