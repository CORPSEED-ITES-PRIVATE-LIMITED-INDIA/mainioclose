import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Select,
  SelectItem,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { inrCurrency } from "../common";
import {
  getAllCreditNotes,
  approveCreditNote,
  rejectCreditNote,
  accountApproveCreditNote,
} from "../toolkit/slices/accountSlice";
import PreviewComponent from "../components/PreviewComponent.jsx";
import FileUploader from "../components/FileUploader.jsx";

export const columns = [
  { name: "DATE", uid: "date", sortable: true },
  { name: "CREDIT NOTE NO.", uid: "creditNoteNumber", sortable: true },
  { name: "UNBILLED NO.", uid: "unbilledNumber" },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "COMPANY", uid: "companyName" },
  { name: "CONTACT", uid: "contactName" },
  { name: "TOTAL AMOUNT", uid: "totalAmount", sortable: true },
  { name: "RECEIVED", uid: "receivedAmount", sortable: true },
  { name: "OUTSTANDING", uid: "outstandingAmount", sortable: true },
  { name: "REFUND", uid: "refundAmount", sortable: true },
  { name: "CREDIT", uid: "creditAmount", sortable: true },
  { name: "GST PORTAL ATTACHMENT", uid: "gstPortalAttachment" },
  { name: "STATUS", uid: "status" },
  { name: "REASON", uid: "reason" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0)?.toUpperCase() + s.slice(1)?.toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "creditNoteNumber",
  "unbilledNumber",
  "estimateNumber",
  "companyName",
  "totalAmount",
  "receivedAmount",
  "outstandingAmount",
  "refundAmount",
  "creditAmount",
  "gstPortalAttachment",
  "status",
  "actions",
];

const CREDIT_NOTE_GST_RATE = 18;

const parseAmount = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const cleanedValue = String(value)
    .replace(/[₹,\s]/g, "")
    .trim();

  return Number(cleanedValue) || 0;
};

const getCreditNoteAmountBreakup = (refundAmount) => {
  const grossAmount = parseAmount(refundAmount);

  // Refund amount is treated as GST-inclusive amount.
  // Example: 500 => taxable 423.73, GST 76.27
  const gstAmount =
    grossAmount > 0
      ? Number(
          (
            (grossAmount * CREDIT_NOTE_GST_RATE) /
            (100 + CREDIT_NOTE_GST_RATE)
          ).toFixed(2),
        )
      : 0;

  const taxableAmount =
    grossAmount > 0 ? Number((grossAmount - gstAmount).toFixed(2)) : 0;

  return {
    grossAmount,
    taxableAmount,
    gstRate: CREDIT_NOTE_GST_RATE,
    gstAmount,
  };
};

const getInitialCreditLedgerData = (rowData = null) => {
  const refundAmount = Number(rowData?.refundAmount || 0);
  const amountBreakup = getCreditNoteAmountBreakup(refundAmount);

  return {
    voucherDate: dayjs().format("YYYY-MM-DD"),

    creditNoteId: rowData?.id || "",
    creditNoteNumber: rowData?.creditNoteNumber || "",
    unbilledNumber: rowData?.unbilledNumber || "",
    estimateNumber: rowData?.estimateNumber || "",

    companyName: rowData?.companyName || "",
    contactName: rowData?.contactName || "",
    partyLedger: rowData?.companyName || "",

    refundAmount: String(rowData?.refundAmount ?? ""),
    creditAmount: String(rowData?.creditAmount ?? rowData?.refundAmount ?? ""),

    taxableAmount: String(amountBreakup.taxableAmount),
    gstRate: String(amountBreakup.gstRate),
    gstAmount: String(amountBreakup.gstAmount),

    // Backend default ledgers
    debitLedger: "SALES_RETURN",
    creditLedger: "SUNDRY_DEBTORS",

    referenceNumber: "",
    narration: rowData?.reason || "",
    attachment: "",
  };
};

const CreditNote = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const data = useSelector((state) => state.account.creditNoteList?.content);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING_ACCOUNT_REVIEW");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    rowData: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");

  const [attachmentPreviewModal, setAttachmentPreviewModal] = useState({
    isOpen: false,
    file: null,
  });

  const [approveModal, setApproveModal] = useState({
    isOpen: false,
    rowData: null,
  });

  const creditLedgerModal = useDisclosure();

  const [creditLedgerRow, setCreditLedgerRow] = useState(null);
  const [creditLedgerData, setCreditLedgerData] = useState(
    getInitialCreditLedgerData(),
  );
  const [
    isCreditLedgerAttachmentUploading,
    setIsCreditLedgerAttachmentUploading,
  ] = useState(false);

  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [approvalAttachment, setApprovalAttachment] = useState("");
  const [approvalAttachmentError, setApprovalAttachmentError] = useState("");

  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    type: "creditNoteNumber",
  });

  const [creditNotePreviewModal, setCreditNotePreviewModal] = useState({
    isOpen: false,
    data: null,
  });

  const hasSearchFilter = Boolean(filterValue);

  const fetchCreditNotes = React.useCallback(() => {
    dispatch(getAllCreditNotes({ status, page, size: rowsPerPage }));
  }, [dispatch, status, page, rowsPerPage]);

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCreditNotes = [...(data || [])];

    if (hasSearchFilter) {
      filteredCreditNotes = filteredCreditNotes.filter((item) => {
        const searchText = filterValue.toLowerCase();

        if (searchFilters.type && item?.[searchFilters.type] !== undefined) {
          return String(item?.[searchFilters.type])
            ?.toLowerCase()
            ?.includes(searchText);
        }

        return Object.values(item || {}).some((val) =>
          String(val)?.toLowerCase()?.includes(searchText),
        );
      });
    }

    return filteredCreditNotes;
  }, [data, filterValue, hasSearchFilter, searchFilters.type]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a?.[sortDescriptor.column];
      const second = b?.[sortDescriptor.column];

      if (first === undefined || first === null) return 1;
      if (second === undefined || second === null) return -1;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedItems.slice(start, end);
  }, [page, sortedItems, rowsPerPage]);

  const getStatusClass = React.useCallback((value) => {
    const statusValue = String(value || "").toUpperCase();

    switch (statusValue) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }, []);

  const closeRejectModal = React.useCallback(() => {
    setRejectModal({
      isOpen: false,
      rowData: null,
    });
    setRejectionReason("");
    setRejectionReasonError("");
  }, []);

  const handleApproveCreditNote = React.useCallback(
    async (rowData) => {
      const creditNoteId = rowData?.id;

      if (!creditNoteId || !userId) {
        addToast({
          title: "Missing required data",
          description: "Credit Note ID or User ID is missing.",
          color: "danger",
        });
        return;
      }

      try {
        setActionLoadingId(creditNoteId);

        const resp = adminRole
          ? await dispatch(
              approveCreditNote({
                creditNoteId,
                userId,
                proposalId: rowData?.proposalId,
              }),
            )
          : await dispatch(
              accountApproveCreditNote({
                creditNoteId,
                userId,
                approvalRemarks,
                gstPortalAttachment: approvalAttachment,
              }),
            );

        if (resp?.meta?.requestStatus === "fulfilled") {
          fetchCreditNotes();

          addToast({
            title: "Success",
            description: adminRole
              ? "Credit note approved successfully."
              : "Credit note account approved successfully.",
            color: "success",
          });
        } else {
          addToast({
            title: "Something went wrong",
            description:
              resp?.payload?.message || "Credit note approval failed.",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Something went wrong",
          description: error?.message || "Credit note approval failed.",
          color: "danger",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [dispatch, userId, fetchCreditNotes, adminRole],
  );

  const openRejectModal = React.useCallback(
    (rowData) => {
      const creditNoteId = rowData?.id;

      if (!creditNoteId || !userId) {
        addToast({
          title: "Missing required data",
          description: "Credit Note ID or User ID is missing.",
          color: "danger",
        });
        return;
      }

      setRejectModal({
        isOpen: true,
        rowData,
      });
      setRejectionReason("");
      setRejectionReasonError("");
    },
    [userId],
  );

  const handleSubmitRejectCreditNote = React.useCallback(
    async (e) => {
      e?.preventDefault?.();

      const rowData = rejectModal?.rowData;
      const creditNoteId = rowData?.id;
      const reason = rejectionReason.trim();

      if (!reason) {
        setRejectionReasonError("Please enter rejection reason.");
        return;
      }

      if (!creditNoteId || !userId) {
        addToast({
          title: "Missing required data",
          description: "Credit Note ID or User ID is missing.",
          color: "danger",
        });
        return;
      }

      try {
        setActionLoadingId(creditNoteId);

        const resp = await dispatch(
          rejectCreditNote({
            creditNoteId,
            userId,
            rejectionReason: reason,
          }),
        );

        if (resp?.meta?.requestStatus === "fulfilled") {
          fetchCreditNotes();
          closeRejectModal();

          addToast({
            title: "Success",
            description: "Credit note rejected successfully.",
            color: "success",
          });
        } else {
          addToast({
            title: "Something went wrong",
            description: "Credit note rejection failed.",
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Reject credit note failed:", error);

        addToast({
          title: "Something went wrong",
          description: "Credit note rejection failed.",
          color: "danger",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [
      dispatch,
      userId,
      rejectModal,
      rejectionReason,
      fetchCreditNotes,
      closeRejectModal,
    ],
  );

  const getCreditNoteAttachment = React.useCallback((rowData) => {
    const attachment =
      Array.isArray(rowData?.attachmentUrls) && rowData?.attachmentUrls?.length
        ? rowData.attachmentUrls[0]
        : rowData?.attachmentUrl ||
          rowData?.attachment ||
          rowData?.fileUrl ||
          rowData?.filePath ||
          null;

    if (!attachment) return null;

    if (typeof attachment === "string") {
      return {
        fileUrl: attachment,
        fileName: attachment.split("?")[0].split("/").pop() || "Attachment",
      };
    }

    return {
      ...attachment,
      fileUrl:
        attachment?.fileUrl ||
        attachment?.filePath ||
        attachment?.url ||
        attachment?.path ||
        "",
      fileName:
        attachment?.fileName ||
        attachment?.name ||
        attachment?.originalName ||
        "Attachment",
      contentType: attachment?.contentType || attachment?.mimeType || "",
      fileSize: attachment?.fileSize || attachment?.size || 0,
    };
  }, []);

  const handleAccountApproval = async (e) => {
    e?.preventDefault?.();

    const rowData = approveModal?.rowData;
    const creditNoteId = rowData?.id;

    if (!creditNoteId || !userId) {
      addToast({
        title: "Missing required data",
        description: "Credit Note ID or User ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!String(approvalAttachment || "").trim()) {
      setApprovalAttachmentError("Attachment is required.");
      return;
    }

    try {
      setActionLoadingId(creditNoteId);

      const resp = await dispatch(
        accountApproveCreditNote({
          creditNoteId,
          userId,
          approvalRemarks:
            approvalRemarks?.trim() || "Approved by account user",
          gstPortalAttachment: approvalAttachment,
        }),
      );

      if (resp?.meta?.requestStatus === "fulfilled") {
        fetchCreditNotes();

        addToast({
          title: "Success",
          description: "Credit note account approved successfully.",
          color: "success",
        });

        setApproveModal({
          isOpen: false,
          rowData: null,
        });

        setApprovalRemarks("");
        setApprovalAttachment("");
        setApprovalAttachmentError("");
      } else {
        addToast({
          title: "Approval failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Credit note account approval failed.",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description: error?.message || "Credit note account approval failed.",
        color: "danger",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCreditLedgerModal = React.useCallback(
    (rowData) => {
      setCreditLedgerRow(rowData);
      setCreditLedgerData(getInitialCreditLedgerData(rowData));
      creditLedgerModal.onOpen();
    },
    [creditLedgerModal],
  );

  const closeCreditLedgerModal = React.useCallback(() => {
    setCreditLedgerRow(null);
    setCreditLedgerData(getInitialCreditLedgerData());
    creditLedgerModal.onClose();
  }, [creditLedgerModal]);

  const buildCreditNotePreviewData = (payload, rowData) => {
    const taxableAmount = Number(payload?.taxableAmount || 0);
    const gstAmount = Number(payload?.gstAmount || 0);
    const totalAmount = Number(payload?.ledgerAmount || 0);

    return {
      irn: "bd3cbff014e6909d9634d10ec5e307a1774b9ca12d2-d947049850b6a7589890d",
      ackNo: "142518923640227",
      ackDate: dayjs().format("DD-MMM-YY"),

      company: {
        name: "Corpseed Ites Private Limited",
        address:
          "2nd Floor A-154/A Sector-63 Noida, Gautam Budh Nagar, Uttar Pradesh 201301",
        gstin: "09AAHCC4539J1ZC",
        state: "Uttar Pradesh",
        stateCode: "09",
        email: "praveen.kumar@corpseed.com",
      },

      buyer: {
        name:
          rowData?.companyName ||
          payload?.companyName ||
          "Motorola Solutions India Private Limited",
        address:
          rowData?.companyAddress ||
          "415/2 Mehrauli Gurgaon Road, 6th And 7th Floor, Sector 14 Gurgaon",
        gstin: rowData?.buyerGstin || "06AAACM9343D1ZO",
        state: rowData?.buyerState || "Haryana",
        stateCode: rowData?.buyerStateCode || "06",
      },

      creditNoteNumber: payload?.creditNoteNumber || "-",
      creditNoteDate: payload?.voucherDate
        ? dayjs(payload.voucherDate).format("DD-MMM-YY")
        : dayjs().format("DD-MMM-YY"),

      referenceNumber: payload?.referenceNumber || "-",
      originalInvoiceNo: rowData?.invoiceNumber || "-",
      buyerOrderNo: rowData?.buyerOrderNo || "NP31004203",
      buyerOrderDate: "20-Nov-25",

      serviceName: rowData?.solutionName || "DGFT License",
      hsnSac: rowData?.hsnSac || "998312",
      gstRate: Number(payload?.gstRate || 18),
      taxableAmount,
      gstAmount,
      totalAmount,

      amountInWords: "Indian Rupees Five Hundred Only",

      bank: {
        accountHolderName: "Corpseed Ites Pvt Ltd",
        bankName: "IDFC FIRST Bank",
        accountNumber: "10052624515",
        branch: "Noida, Sector 63 Branch",
        ifsc: "IDFB0021331",
      },
    };
  };

  const handleSubmitCreditLedger = React.useCallback(
    async (e) => {
      e?.preventDefault?.();

      if (!creditLedgerData.voucherDate) {
        addToast({
          title: "Voucher date is required",
          color: "danger",
        });
        return;
      }

      // if (!creditLedgerData.referenceNumber?.trim()) {
      //   addToast({
      //     title: "Reference number is required",
      //     color: "danger",
      //   });
      //   return;
      // }

      if (!creditLedgerData.partyLedger?.trim()) {
        addToast({
          title: "Party ledger is required",
          color: "danger",
        });
        return;
      }

      const refundAmount = Number(creditLedgerData.refundAmount || 0);

      if (refundAmount <= 0) {
        addToast({
          title: "Refund amount is missing",
          description:
            "Credit ledger amount will be created from refund amount.",
          color: "danger",
        });
        return;
      }

      if (!creditLedgerData.narration?.trim()) {
        addToast({
          title: "Narration is required",
          color: "danger",
        });
        return;
      }

      if (isCreditLedgerAttachmentUploading) {
        addToast({
          title: "Attachment upload in progress",
          description: "Please wait until upload is completed.",
          color: "warning",
        });
        return;
      }

      const amountBreakup = getCreditNoteAmountBreakup(refundAmount);

      const payload = {
        creditNoteId: Number(creditLedgerData.creditNoteId),
        creditNoteNumber: creditLedgerData.creditNoteNumber,
        unbilledNumber: creditLedgerData.unbilledNumber,
        estimateNumber: creditLedgerData.estimateNumber,

        voucherDate: creditLedgerData.voucherDate,
        createdByUserId: Number(userId),

        companyName: creditLedgerData.companyName,
        contactName: creditLedgerData.contactName,
        partyLedger: creditLedgerData.partyLedger.trim(),

        // Default backend ledgers
        debitLedger: "SALES_RETURN",
        creditLedger: "SUNDRY_DEBTORS",

        // Ledger amount comes from refund amount
        ledgerAmount: refundAmount,
        refundAmount,
        creditAmount: Number(creditLedgerData.creditAmount || refundAmount),

        gstRate: amountBreakup.gstRate,
        taxableAmount: amountBreakup.taxableAmount,
        gstAmount: amountBreakup.gstAmount,

        referenceNumber: creditLedgerData.referenceNumber.trim(),
        narration: creditLedgerData.narration.trim(),
        attachment: creditLedgerData.attachment,
      };

      console.log("Credit Ledger Payload:", payload);

      const previewData = buildCreditNotePreviewData(payload, creditLedgerRow);

      addToast({
        title: "Credit ledger entry prepared successfully",
        description: "Credit note preview generated.",
        color: "success",
      });

      closeCreditLedgerModal();

      setCreditNotePreviewModal({
        isOpen: true,
        data: previewData,
      });

      // When backend API is ready:
      // const resp = await dispatch(createCreditLedgerEntry(payload));
      // if (resp.meta.requestStatus === "fulfilled") fetchCreditNotes();
    },
    [
      creditLedgerData,
      userId,
      isCreditLedgerAttachmentUploading,
      closeCreditLedgerModal,
    ],
  );

  const handleActionsClick = React.useCallback(
    (key, rowData) => {
      const actionKey = String(key);

      if (actionKey === "viewCreditNote") {
        console.log("View Credit Note:", rowData);
        return;
      }

      if (actionKey === "CREDIT_LEDGER") {
        openCreditLedgerModal(rowData);
        return;
      }

      if (actionKey === "viewAttachment") {
        const attachment = getCreditNoteAttachment(rowData);

        if (!attachment?.fileUrl) {
          addToast({
            title: "Attachment not found",
            description: "No attachment is available for this credit note.",
            color: "warning",
          });
          return;
        }

        setAttachmentPreviewModal({
          isOpen: true,
          file: attachment,
        });
        return;
      }

      if (
        actionKey === "APPROVE" &&
        rowData?.status === "PENDING_ACCOUNT_REVIEW"
      ) {
        setApproveModal({
          isOpen: true,
          rowData,
        });
        return;
      }

      if (actionKey === "APPROVE") {
        handleApproveCreditNote(rowData);
        return;
      }

      if (actionKey === "REJECT") {
        openRejectModal(rowData);
      }
    },
    [
      handleApproveCreditNote,
      openRejectModal,
      getCreditNoteAttachment,
      openCreditLedgerModal,
    ],
  );

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];

      switch (columnKey) {
        case "date":
          return (
            <p className="text-[12.5px]">
              {rowData?.createdAt
                ? dayjs(rowData.createdAt).format("DD-MM-YYYY")
                : "-"}
            </p>
          );

        case "creditNoteNumber":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-medium">
                {rowData?.creditNoteNumber || "-"}
              </p>
              <p className="text-[11.5px] text-default-500">
                ID: {rowData?.id}
              </p>
            </div>
          );

        case "unbilledNumber":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px]">{rowData?.unbilledNumber || "-"}</p>
              <p className="text-[11.5px] text-default-500">
                Unbilled ID: {rowData?.unbilledId || "-"}
              </p>
            </div>
          );

        case "estimateNumber":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px]">{rowData?.estimateNumber || "-"}</p>
              <p className="text-[11.5px] text-default-500">
                Estimate ID: {rowData?.estimateId || "-"}
              </p>
            </div>
          );

        case "companyName":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-medium capitalize">
                {rowData?.companyName || "-"}
              </p>
              <p className="text-[11.5px] text-default-500">
                Company ID: {rowData?.companyId || "-"}
              </p>
            </div>
          );

        case "contactName":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] capitalize">
                {rowData?.contactName || "-"}
              </p>
              <p className="text-[11.5px] text-default-500">
                Contact ID: {rowData?.contactId || "-"}
              </p>
            </div>
          );

        case "gstPortalAttachment": {
          const fileUrl = rowData?.gstPortalAttachment;

          if (!fileUrl) {
            return <p className="text-[12.5px] text-default-400">-</p>;
          }

          const file = {
            fileUrl,
            fileName:
              fileUrl.split("?")[0].split("/").pop() || "GST Portal Attachment",
          };

          return (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onPress={() =>
                setAttachmentPreviewModal({
                  isOpen: true,
                  file,
                })
              }
            >
              View
            </Button>
          );
        }

        case "totalAmount":
          return (
            <p className="text-[12.5px]">
              {inrCurrency(rowData?.totalAmount || 0)}
            </p>
          );

        case "receivedAmount":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px]">
                {inrCurrency(rowData?.receivedAmount || 0)}
              </p>
              <p className="text-[11.5px] text-default-500">
                Current: {inrCurrency(rowData?.currentReceivedAmount || 0)}
              </p>
            </div>
          );

        case "outstandingAmount":
          return (
            <p className="text-[12.5px] font-medium">
              {inrCurrency(rowData?.outstandingAmount || 0)}
            </p>
          );

        case "refundAmount":
          return (
            <p className="text-[12.5px] font-medium">
              {inrCurrency(rowData?.refundAmount || 0)}
            </p>
          );

        case "creditAmount":
          return (
            <p className="text-[12.5px] font-medium">
              {inrCurrency(rowData?.creditAmount || 0)}
            </p>
          );

        case "status":
          return (
            <span
              className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${getStatusClass(
                rowData?.status,
              )}`}
            >
              {rowData?.status || "-"}
            </span>
          );

        case "reason":
          return (
            <p className="max-w-[220px] truncate text-[12.5px]">
              {rowData?.rejectionReason || rowData?.reason || "-"}
            </p>
          );

        case "actions":
          return (
            <div className="relative flex items-center justify-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    isDisabled={actionLoadingId === rowData?.id}
                  >
                    <EllipsisVertical className="w-4 h-4 text-default-300" />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  aria-label="Credit note actions"
                  onAction={(key) => handleActionsClick(key, rowData)}
                >
                  <DropdownItem key="viewCreditNote">
                    View Credit Note
                  </DropdownItem>

                  <DropdownItem key="viewAttachment">
                    View Attachment
                  </DropdownItem>

                  {rowData?.status === "PENDING" ? (
                    <DropdownItem
                      key="APPROVE"
                      color="success"
                      className="text-success"
                    >
                      Approve
                    </DropdownItem>
                  ) : null}

                  {rowData?.status === "PENDING" ? (
                    <DropdownItem
                      key="REJECT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject
                    </DropdownItem>
                  ) : null}
                  {rowData?.status === "PENDING_ACCOUNT_REVIEW" ? (
                    <DropdownItem
                      key="APPROVE"
                      color="success"
                      className="text-success"
                    >
                      Approve
                    </DropdownItem>
                  ) : null}

                  {rowData?.status === "PENDING_ACCOUNT_REVIEW" ? (
                    <DropdownItem
                      key="REJECT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject
                    </DropdownItem>
                  ) : null}
                  {rowData?.status === "PENDING_ADMIN_APPROVAL" ? (
                    <DropdownItem
                      key="APPROVE"
                      color="success"
                      className="text-success"
                    >
                      Approve
                    </DropdownItem>
                  ) : null}

                  {rowData?.status === "PENDING_ADMIN_APPROVAL" ? (
                    <DropdownItem
                      key="REJECT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject
                    </DropdownItem>
                  ) : null}

                  <DropdownItem key="CREDIT_LEDGER">
                    Send Credit Note Approval
                  </DropdownItem>
                  <DropdownItem key="GST_CREDIT_NOTE">
                    Upload GST Credit Note
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return cellValue || "-";
      }
    },
    [actionLoadingId, getStatusClass, handleActionsClick],
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 w-full sm:max-w-[360px]">
            <Select
              size="sm"
              className="max-w-[160px] shrink-0"
              selectionMode="single"
              selectedKeys={[searchFilters?.type]}
              onSelectionChange={(e) => {
                const key = Array.from(e)[0];
                setSearchFilters((prev) => ({ ...prev, type: key }));
                setFilterValue("");
                setPage(1);
              }}
            >
              <SelectItem key="creditNoteNumber">Credit note number</SelectItem>
              <SelectItem key="companyName">Company name</SelectItem>
              <SelectItem key="unbilledNumber">Unbilled number</SelectItem>
              <SelectItem key="estimateNumber">Estimate number</SelectItem>
            </Select>

            <Input
              isClearable
              size="sm"
              className="w-full"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search ..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {status}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  const key = Array.from(e)[0];
                  setStatus(key);
                  setPage(1);
                }}
              >
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
                <DropdownItem key="PENDING_ACCOUNT_REVIEW">
                  PENDING_ACCOUNT_REVIEW
                </DropdownItem>
                <DropdownItem key="PENDING_ADMIN_APPROVAL">
                  PENDING_ADMIN_APPROVAL
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-default-400 text-[12.5px]">
            Total {filteredItems.length} Credit Notes
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    status,
    searchFilters,
    filteredItems.length,
    onClear,
    onSearchChange,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex items-center justify-between">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />

        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    filteredItems.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Credit Note
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Credit note table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody emptyContent="No data found" items={paginatedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={rejectModal.isOpen}
        onOpenChange={(open) => {
          if (!open) closeRejectModal();
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reject Credit Note</ModalHeader>

              <form onSubmit={handleSubmitRejectCreditNote}>
                <ModalBody>
                  <Input
                    label="Rejection Reason"
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onValueChange={(value) => {
                      setRejectionReason(value);
                      if (value?.trim()) {
                        setRejectionReasonError("");
                      }
                    }}
                    isInvalid={Boolean(rejectionReasonError)}
                    errorMessage={rejectionReasonError}
                    isRequired
                  />
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={() => {
                      closeRejectModal();
                      onClose();
                    }}
                    isDisabled={actionLoadingId === rejectModal?.rowData?.id}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="danger"
                    type="submit"
                    isLoading={actionLoadingId === rejectModal?.rowData?.id}
                  >
                    Submit Reject
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

      <PreviewComponent
        isOpen={attachmentPreviewModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAttachmentPreviewModal({
              isOpen: false,
              file: null,
            });
          }
        }}
        file={attachmentPreviewModal.file}
        title="Credit Note Attachment"
        modalSize="full"
        showDetailsPanelDefault={false}
      />
      <Modal
        isOpen={approveModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setApproveModal({
              isOpen: false,
              rowData: null,
            });
            setApprovalRemarks("");
            setApprovalAttachment("");
            setApprovalAttachmentError("");
          }
        }}
      >
        <ModalContent>
          <ModalHeader>Approve Credit Note</ModalHeader>

          <form onSubmit={handleAccountApproval}>
            <ModalBody>
              <Input
                label="Approval Remarks"
                value={approvalRemarks}
                onValueChange={setApprovalRemarks}
              />

              <FileUploader
                label="Approval attachement"
                value={approvalAttachment}
                isRequired
                errorMessage={approvalAttachmentError}
                onChange={(url) => {
                  setApprovalAttachment(url);
                  setApprovalAttachmentError("");
                }}
                onUploadSuccess={(file) => {
                  setApprovalAttachment(file?.filePath || "");
                  setApprovalAttachmentError("");
                }}
              />

              {approvalAttachmentError && (
                <p className="text-danger text-sm">{approvalAttachmentError}</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                variant="flat"
                onPress={() => {
                  setApproveModal({
                    isOpen: false,
                    rowData: null,
                  });
                  setApprovalRemarks("");
                  setApprovalAttachment("");
                  setApprovalAttachmentError("");
                }}
              >
                Cancel
              </Button>

              <Button
                color="success"
                type="submit"
                isLoading={actionLoadingId === approveModal?.rowData?.id}
              >
                Approve
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        // isDismissable={false}
        // isKeyboardDismissDisabled={true}
        isOpen={creditLedgerModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCreditLedgerModal();
          }
        }}
        placement="top-center"
        // scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmitCreditLedger}>
              <ModalHeader className="flex flex-col gap-1">
                Add Credit Ledger
                <span className="text-xs font-normal text-default-500">
                  Tally-style ledger entry for accounts team
                </span>
              </ModalHeader>

              <ModalBody className="max-h-[75vh] overflow-auto">
                <div className="space-y-5">
                  <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-default-700">
                      Credit Note Reference
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <Input
                        size="sm"
                        label="Credit Note No."
                        value={creditLedgerData.creditNoteNumber}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Unbilled No."
                        value={creditLedgerData.unbilledNumber}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Estimate No."
                        value={creditLedgerData.estimateNumber}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Company"
                        value={creditLedgerData.companyName}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Contact"
                        value={creditLedgerData.contactName}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Refund / Ledger Amount"
                        value={inrCurrency(creditLedgerData.refundAmount || 0)}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Taxable Amount"
                        value={inrCurrency(creditLedgerData.taxableAmount || 0)}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="GST Rate"
                        value={`${creditLedgerData.gstRate || 0}%`}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Calculated GST"
                        value={inrCurrency(creditLedgerData.gstAmount || 0)}
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Debit Ledger"
                        value="Sales Return"
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Credit Ledger"
                        value="Sundry Debtors"
                        isReadOnly
                      />

                      <Input
                        size="sm"
                        label="Party Ledger"
                        value={creditLedgerData.partyLedger || "-"}
                        isReadOnly
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-default-200 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-default-700">
                      Ledger Entry Details
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input
                        size="sm"
                        type="date"
                        label="Voucher Date"
                        isRequired
                        value={creditLedgerData.voucherDate}
                        onChange={(e) =>
                          setCreditLedgerData((prev) => ({
                            ...prev,
                            voucherDate: e.target.value,
                          }))
                        }
                      />

                      <FileUploader
                        label="Supporting Attachment"
                        value={creditLedgerData.attachment}
                        placeholder="Upload ledger supporting document"
                        onChange={(url) =>
                          setCreditLedgerData((prev) => ({
                            ...prev,
                            attachment: url,
                          }))
                        }
                        onUploadSuccess={(file) =>
                          setCreditLedgerData((prev) => ({
                            ...prev,
                            attachment: file?.filePath || "",
                          }))
                        }
                        onUploadingChange={setIsCreditLedgerAttachmentUploading}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-default-200 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-default-700">
                      Narration / Details
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      <Textarea
                        size="sm"
                        label="Narration"
                        placeholder="Enter narration for ledger entry"
                        isRequired
                        minRows={3}
                        value={creditLedgerData.narration}
                        onChange={(e) =>
                          setCreditLedgerData((prev) => ({
                            ...prev,
                            narration: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={closeCreditLedgerModal}
                  isDisabled={isCreditLedgerAttachmentUploading}
                >
                  Cancel
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  isLoading={isCreditLedgerAttachmentUploading}
                >
                  Save Credit Ledger
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
      <CreditNotePreviewModal
        isOpen={creditNotePreviewModal.isOpen}
        data={creditNotePreviewModal.data}
        onClose={() =>
          setCreditNotePreviewModal({
            isOpen: false,
            data: null,
          })
        }
      />
    </div>
  );
};

const CreditNotePreviewModal = ({ isOpen, data, onClose }) => {
  if (!data) return null;

  return (
    <Modal
      size="5xl"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="top-center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[92vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="border-b border-default-200">
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wide">
                Credit Note Preview
              </h2>
              <p className="text-xs font-normal text-default-500">
                Tally-style preview generated after credit ledger submission
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="bg-white p-5">
          <div className="mx-auto max-w-[900px] border border-black bg-white p-0 text-black">
            <div className="grid grid-cols-[1fr_220px] border-b border-black">
              <div className="p-4">
                <h1 className="mb-6 text-center text-2xl font-bold">
                  CREDIT NOTE
                </h1>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="inline-block w-[90px]">IRN</span>
                    <span className="font-semibold">: {data.irn}</span>
                  </p>
                  <p>
                    <span className="inline-block w-[90px]">Ack No.</span>
                    <span className="font-semibold">: {data.ackNo}</span>
                  </p>
                  <p>
                    <span className="inline-block w-[90px]">Ack Date</span>
                    <span className="font-semibold">: {data.ackDate}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-l border-black p-4">
                <p className="mb-2 text-sm font-semibold">e-Invoice</p>
                <div className="grid h-[140px] w-[140px] grid-cols-6 grid-rows-6 gap-[2px] bg-white p-1">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <div
                      key={index}
                      className={
                        index % 2 === 0 || index % 5 === 0
                          ? "bg-black"
                          : "bg-white"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1.2fr_1fr] border-b border-black">
              <div className="border-r border-black">
                <div className="border-b border-black p-3">
                  <p className="text-base font-bold">{data.company.name}</p>
                  <p className="text-sm">{data.company.address}</p>
                  <p className="text-sm">GSTIN/UIN: {data.company.gstin}</p>
                  <p className="text-sm">
                    State Name: {data.company.state}, Code:{" "}
                    {data.company.stateCode}
                  </p>
                  <p className="text-sm">E-Mail: {data.company.email}</p>
                </div>

                <div className="border-b border-black p-3">
                  <p className="text-sm">Consignee (Ship to)</p>
                  <p className="text-base font-bold">{data.buyer.name}</p>
                  <p className="text-sm">{data.buyer.address}</p>
                  <p className="text-sm">GSTIN/UIN: {data.buyer.gstin}</p>
                  <p className="text-sm">
                    State Name: {data.buyer.state}, Code: {data.buyer.stateCode}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-sm">Buyer (Bill to)</p>
                  <p className="text-base font-bold">{data.buyer.name}</p>
                  <p className="text-sm">{data.buyer.address}</p>
                  <p className="text-sm">GSTIN/UIN: {data.buyer.gstin}</p>
                  <p className="text-sm">
                    State Name: {data.buyer.state}, Code: {data.buyer.stateCode}
                  </p>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 border-b border-black">
                  <div className="border-r border-black p-3">
                    <p className="text-sm">Credit Note No.</p>
                    <p className="font-bold">{data.creditNoteNumber}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-sm">Dated</p>
                    <p className="font-bold">{data.creditNoteDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black">
                  <div className="border-r border-black p-3">
                    <p className="text-sm">Original Invoice No. & Date</p>
                    <p className="font-semibold">{data.originalInvoiceNo}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-sm">Other References</p>
                    <p className="font-semibold">{data.referenceNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black">
                  <div className="border-r border-black p-3">
                    <p className="text-sm">Buyer’s Order No.</p>
                    <p className="font-bold">{data.buyerOrderNo}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-sm">Dated</p>
                    <p className="font-bold">{data.buyerOrderDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black">
                  <div className="border-r border-black p-3">
                    <p className="text-sm">Dispatch Doc No.</p>
                    <p className="font-semibold">-</p>
                  </div>
                  <div className="p-3">
                    <p className="text-sm">Destination</p>
                    <p className="font-semibold">-</p>
                  </div>
                </div>

                <div className="min-h-[120px] p-3">
                  <p className="text-sm">Terms of Delivery</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[50px_1fr_110px_110px_110px_80px_140px] border-b border-black text-sm">
              <div className="border-r border-black p-2 font-semibold">
                Sl No.
              </div>
              <div className="border-r border-black p-2 text-center font-semibold">
                Particulars
              </div>
              <div className="border-r border-black p-2 text-center font-semibold">
                HSN/SAC
              </div>
              <div className="border-r border-black p-2 text-center font-semibold">
                Quantity
              </div>
              <div className="border-r border-black p-2 text-center font-semibold">
                Rate
              </div>
              <div className="border-r border-black p-2 text-center font-semibold">
                per
              </div>
              <div className="p-2 text-center font-semibold">Amount</div>
            </div>

            <div className="grid min-h-[210px] grid-cols-[50px_1fr_110px_110px_110px_80px_140px] border-b border-black text-sm">
              <div className="border-r border-black p-2">1</div>

              <div className="border-r border-black p-2">
                <p className="text-center text-base font-bold">
                  {data.serviceName}
                </p>
                <p className="mt-3 text-right font-bold">IGST</p>

                <div className="mt-8">
                  <p className="font-semibold underline">Bill Details:</p>
                  <div className="mt-2 flex justify-between">
                    <span>On Account</span>
                    <span>
                      {inrCurrency(data.totalAmount)} <b>Cr</b>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-r border-black p-2 text-center">
                {data.hsnSac}
              </div>

              <div className="border-r border-black p-2 text-center"></div>

              <div className="border-r border-black p-2 text-right">
                <p className="mt-12">{data.gstRate}</p>
              </div>

              <div className="border-r border-black p-2 text-center">
                <p className="mt-12">%</p>
              </div>

              <div className="p-2 text-right font-bold">
                <p>{inrCurrency(data.taxableAmount)}</p>
                <p>{inrCurrency(data.gstAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_140px] border-b border-black">
              <div className="p-2 text-right font-semibold">Total</div>
              <div className="border-l border-black p-2 text-right text-lg font-bold">
                {inrCurrency(data.totalAmount)}
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3">
                <p className="text-sm">Amount Chargeable (in words)</p>
                <p className="mt-2 font-bold">{data.amountInWords}</p>
              </div>

              <div className="p-3">
                <p className="text-base font-semibold">
                  Company’s Bank Details
                </p>

                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    A/c Holder’s Name :{" "}
                    <span className="font-bold">
                      {data.bank.accountHolderName}
                    </span>
                  </p>
                  <p>
                    Bank Name :{" "}
                    <span className="font-bold">{data.bank.bankName}</span>
                  </p>
                  <p>
                    A/c No. :{" "}
                    <span className="font-bold">{data.bank.accountNumber}</span>
                  </p>
                  <p>
                    Branch & IFS Code :{" "}
                    <span className="font-bold">
                      {data.bank.branch} & {data.bank.ifsc}
                    </span>
                  </p>
                </div>

                <div className="mt-8 border-t border-black pt-2 text-right">
                  <p className="font-bold">for Corpseed Ites Private Limited</p>
                  <p className="mt-12">Authorised Signatory</p>
                </div>
              </div>
            </div>

            <div className="border-t border-black p-2 text-center text-sm">
              This is a Computer Generated Document
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-default-200">
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>

          <Button color="primary" onPress={() => window.print()}>
            Print
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreditNote;
