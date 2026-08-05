import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Chip,
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
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  addToast,
  useDisclosure,
} from "@heroui/react";

import { ChevronDown, EllipsisVertical, Eye, Search } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FileUploader from "../components/FileUploader";

import {
  approveAdvanceTaxInvoiceRequest,
  rejectAdvanceTaxInvoiceRequest,
  confirmAdvanceTaxInvoiceEInvoiceAndCreateProject,
  getAllAdvanceTaxInvoiceRequests,
} from "../toolkit/slices/accountSlice";
import AdvanceTaxInvoiceView from "./AdvanceTaxInvoiceView";
import { getEstimateByEstimateId } from "../toolkit/slices/leadSlice";
import NewEstimatePreview from "../sales/leads/leadEstimate/NewEstimatePreview";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const COLUMNS = [
  { name: "DATE", uid: "createdAt" },
  { name: "COMPANY / UNIT", uid: "companyName" },
  { name: "CONTACT", uid: "contactName" },
  { name: "SOLUTION", uid: "solutionName" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "ESTIMATE TOTAL", uid: "estimateGrandTotal", align: "end" },
  { name: "REQUESTED AMOUNT", uid: "requestedAmount", align: "end" },
  { name: "APPROVED AMOUNT", uid: "approvedAmount", align: "end" },
  { name: "REQUEST REMARKS", uid: "requestRemarks" },
  { name: "REQUESTED BY", uid: "requestedByName" },
  { name: "GST TYPE", uid: "gstRegistrationType" },
  { name: "REQUEST STATUS", uid: "requestStatus" },
  { name: "REVIEW DETAILS", uid: "reviewDetails" },
  { name: "ACTIONS", uid: "actions", align: "center" },
];

const EMPTY_E_INVOICE_FORM = {
  remarks: "",
  eInvoiceAttachmentUrl: "",
  eInvoiceAckDate: "",
  eInvoiceAckNo: "",
  eInvoiceIrn: "",
};

const getLoggedInUserId = () => {
  try {
    const keys = ["user", "authUser", "loggedInUser", "userInfo"];

    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsed = JSON.parse(value);

      const id =
        parsed?.id ||
        parsed?.userId ||
        parsed?.data?.id ||
        parsed?.payload?.id ||
        parsed?.user?.id;

      if (id) {
        return Number(id);
      }
    }
  } catch (error) {
    console.error("Unable to resolve logged-in user ID", error);
  }

  return null;
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "warning";

    case "APPROVED":
      return "success";
    case "E_INVOICE_CONFIRMED":
      return "success";

    case "REJECTED":
      return "danger";

    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

const getPaymentStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "success";

    case "PARTIALLY_PAID":
      return "warning";

    case "UNPAID":
      return "danger";

    default:
      return "default";
  }
};

const formatStatus = (status) => {
  return String(status || "-").replaceAll("_", " ");
};

const getApiErrorMessage = (error) => {
  if (!error) {
    return "Something went wrong";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.data?.message ||
    error?.response?.data?.message ||
    "Something went wrong"
  );
};

const normalizeLocalDateTime = (value) => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  return value;
};

/**
 * The advance-invoice list API already returns the complete invoice snapshot.
 * TaxInvoice expects `grandTotal`, while this response exposes
 * `invoiceGrandTotal`, so normalize the selected row before rendering it.
 */
const buildTaxInvoiceData = (item) => {
  if (!item) return null;

  return {
    ...item,
    id: item?.invoiceId ?? item?.id ?? null,
    publicUuid: item?.invoicePublicUuid ?? item?.publicUuid ?? null,
    status: item?.invoiceStatus ?? item?.status ?? null,
    paymentStatus: item?.invoicePaymentStatus ?? item?.paymentStatus ?? null,
    grandTotal:
      item?.invoiceGrandTotal ?? item?.grandTotal ?? item?.approvedAmount ?? 0,
    lineItems: Array.isArray(item?.lineItems) ? item.lineItems : [],
  };
};

const AdvanceInvoices = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { userId } = useParams();
  const viewModal = useDisclosure();

  const {
    allAdvanceTaxInvoiceRequests,
    advanceTaxInvoiceRequestsLoading,
    advanceTaxInvoiceRequestsError,
    advanceTaxInvoiceRequestApproving,
    advanceTaxInvoiceRequestRejecting,
    advanceTaxInvoiceEInvoiceConfirming,
  } = useSelector((state) => state.account || {});

  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const [selectedRejectRequest, setSelectedRejectRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const confirmEInvoiceModal = useDisclosure();
  const taxInvoiceModal = useDisclosure();

  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState(null);
  const [selectedEInvoiceRequest, setSelectedEInvoiceRequest] = useState(null);
  const [eInvoiceForm, setEInvoiceForm] = useState(EMPTY_E_INVOICE_FORM);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [estimateDetail, setEstimateDetail] = useState(null);

  const currentUserId = useMemo(() => {
    return Number(params?.userId || params?.id || getLoggedInUserId());
  }, [params?.userId, params?.id]);

  const response = allAdvanceTaxInvoiceRequests || {};
  const requests = Array.isArray(response?.content) ? response.content : [];
  const totalElements = Number(response?.totalElements || 0);
  const totalPages = Math.max(Number(response?.totalPages || 0), 1);

  useEffect(() => {
    if (!currentUserId) return;

    dispatch(
      getAllAdvanceTaxInvoiceRequests({
        userId: currentUserId,
        status,
        page: page - 1,
        size,
      }),
    );
  }, [dispatch, currentUserId, status, page, size]);

  const handleViewEstimate = (rowData, type) => {
    dispatch(
      getEstimateByEstimateId({ estimateId: rowData?.estimateId, userId }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return requests;
    }

    return requests.filter((item) => {
      const values = [
        item?.requestId,
        item?.publicUuid,
        item?.companyName,
        item?.unitName,
        item?.contactName,
        item?.solutionName,
        item?.estimateNumber,
        item?.requestedByName,
        item?.requestRemarks,
        item?.gstRegistrationType,
        item?.invoiceNumber,
        item?.requestStatus,
        item?.invoicePaymentStatus,
        item?.reviewedByName,
        item?.message,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText),
      );
    });
  }, [requests, search]);

  const refreshRequests = () => {
    if (!currentUserId) return;

    dispatch(
      getAllAdvanceTaxInvoiceRequests({
        userId: currentUserId,
        status,
        page: page - 1,
        size,
      }),
    );
  };

  const openApproveModal = (item) => {
    if (String(item?.requestStatus || "").toUpperCase() !== "PENDING") {
      addToast({
        title: "Only pending requests can be approved",
        color: "warning",
      });
      return;
    }

    setSelectedRequest(item);
    setReviewRemarks("");
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    if (advanceTaxInvoiceRequestApproving) return;

    setSelectedRequest(null);
    setReviewRemarks("");
    setIsApproveModalOpen(false);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest?.requestId) {
      addToast({
        title: "Invalid advance tax invoice request",
        color: "danger",
      });
      return;
    }

    if (!currentUserId) {
      addToast({
        title: "Approver user ID is not available",
        color: "danger",
      });
      return;
    }

    const approvedAmount = Number(selectedRequest?.requestedAmount);

    if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
      addToast({
        title: "Requested amount is invalid",
        color: "danger",
      });
      return;
    }

    const action = await dispatch(
      approveAdvanceTaxInvoiceRequest({
        requestId: selectedRequest.requestId,
        data: {
          approverUserId: currentUserId,
          approvedAmount,
          reviewRemarks: reviewRemarks.trim(),
        },
      }),
    );

    if (approveAdvanceTaxInvoiceRequest.fulfilled.match(action)) {
      addToast({
        title: "Advance tax invoice request approved",
        description:
          action?.payload?.message ||
          "Invoice has been generated successfully.",
        color: "success",
      });

      setSelectedRequest(null);
      setReviewRemarks("");
      setIsApproveModalOpen(false);
      refreshRequests();
      return;
    }

    addToast({
      title: "Approval failed",
      description: getApiErrorMessage(action?.payload),
      color: "danger",
    });
  };

  const openRejectModal = (item) => {
    if (String(item?.requestStatus || "").toUpperCase() !== "PENDING") {
      addToast({
        title: "Only pending requests can be rejected",
        color: "warning",
      });
      return;
    }

    setSelectedRejectRequest(item);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (advanceTaxInvoiceRequestRejecting) return;

    setSelectedRejectRequest(null);
    setRejectionReason("");
    setIsRejectModalOpen(false);
  };

  const handleRejectRequest = async () => {
    if (!selectedRejectRequest?.requestId) {
      addToast({
        title: "Invalid advance tax invoice request",
        color: "danger",
      });
      return;
    }

    if (!currentUserId) {
      addToast({
        title: "Rejecting user ID is not available",
        color: "danger",
      });
      return;
    }

    const normalizedReason = rejectionReason.trim();

    if (!normalizedReason) {
      addToast({
        title: "Rejection reason is required",
        color: "danger",
      });
      return;
    }

    const action = await dispatch(
      rejectAdvanceTaxInvoiceRequest({
        requestId: selectedRejectRequest.requestId,
        data: {
          rejectedByUserId: currentUserId,
          rejectionReason: normalizedReason,
        },
      }),
    );

    if (rejectAdvanceTaxInvoiceRequest.fulfilled.match(action)) {
      addToast({
        title: "Advance tax invoice request rejected",
        description:
          action?.payload?.message || "Request rejected successfully.",
        color: "success",
      });

      setSelectedRejectRequest(null);
      setRejectionReason("");
      setIsRejectModalOpen(false);
      refreshRequests();
      return;
    }

    addToast({
      title: "Rejection failed",
      description: getApiErrorMessage(action?.payload),
      color: "danger",
    });
  };

  const openTaxInvoiceModal = (item) => {
    // const canViewTaxInvoice =
    //   Boolean(item?.invoiceGenerated) &&
    //   Boolean(item?.invoiceId) &&
    //   Boolean(item?.invoiceNumber);

    // if (!canViewTaxInvoice) {
    //   addToast({
    //     title: "Tax invoice is not available",
    //     description: "The invoice has not been generated for this request.",
    //     color: "warning",
    //   });
    //   return;
    // }

    setSelectedTaxInvoice(buildTaxInvoiceData(item));
    taxInvoiceModal.onOpen();
  };

  const closeTaxInvoiceModal = () => {
    setSelectedTaxInvoice(null);
    taxInvoiceModal.onClose();
  };

  const openEInvoiceModal = (item) => {
    const normalizedStatus = String(item?.requestStatus || "").toUpperCase();

    if (normalizedStatus !== "APPROVED") {
      addToast({
        title: "Only approved requests can confirm E-Invoice",
        color: "warning",
      });
      return;
    }

    setSelectedEInvoiceRequest(item);
    setEInvoiceForm(EMPTY_E_INVOICE_FORM);
    setIsAttachmentUploading(false);
    confirmEInvoiceModal.onOpen();
  };

  const closeEInvoiceModal = () => {
    if (isAttachmentUploading || advanceTaxInvoiceEInvoiceConfirming) {
      return;
    }

    setSelectedEInvoiceRequest(null);
    setEInvoiceForm(EMPTY_E_INVOICE_FORM);
    setIsAttachmentUploading(false);
    confirmEInvoiceModal.onClose();
  };

  const handleConfirmFormChange = (field, value) => {
    setEInvoiceForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmitConfirmEInvoice = async () => {
    if (!selectedEInvoiceRequest?.requestId) {
      addToast({
        title: "Invalid advance tax invoice request",
        color: "danger",
      });
      return;
    }

    if (!currentUserId) {
      addToast({
        title: "User ID is not available",
        color: "danger",
      });
      return;
    }

    if (!eInvoiceForm.eInvoiceAckDate) {
      addToast({
        title: "E-Invoice ACK Date is required",
        color: "danger",
      });
      return;
    }

    if (!eInvoiceForm.eInvoiceAckNo.trim()) {
      addToast({
        title: "E-Invoice ACK No is required",
        color: "danger",
      });
      return;
    }

    if (!eInvoiceForm.eInvoiceIrn.trim()) {
      addToast({
        title: "E-Invoice IRN is required",
        color: "danger",
      });
      return;
    }

    if (!eInvoiceForm.eInvoiceAttachmentUrl.trim()) {
      addToast({
        title: "E-Invoice attachment is required",
        color: "danger",
      });
      return;
    }

    if (isAttachmentUploading) {
      addToast({
        title: "Please wait for the attachment upload to complete",
        color: "warning",
      });
      return;
    }

    /*
     * The backend path variable is named invoiceId.
     * As requested, the selected requestId is passed in that path position.
     * userId is resolved internally and is not shown in the modal.
     */
    const action = await dispatch(
      confirmAdvanceTaxInvoiceEInvoiceAndCreateProject({
        requestId: selectedEInvoiceRequest.invoiceId,
        data: {
          userId: currentUserId,
          remarks: eInvoiceForm.remarks.trim() || null,
          eInvoiceAttachmentUrl: eInvoiceForm.eInvoiceAttachmentUrl.trim(),
          eInvoiceAckDate: normalizeLocalDateTime(eInvoiceForm.eInvoiceAckDate),
          eInvoiceAckNo: eInvoiceForm.eInvoiceAckNo.trim(),
          eInvoiceIrn: eInvoiceForm.eInvoiceIrn.trim(),
        },
      }),
    );

    if (
      confirmAdvanceTaxInvoiceEInvoiceAndCreateProject.fulfilled.match(action)
    ) {
      addToast({
        title: "E-Invoice confirmed",
        description:
          action?.payload?.message ||
          "E-Invoice confirmed and project created successfully.",
        color: "success",
      });

      setSelectedEInvoiceRequest(null);
      setEInvoiceForm(EMPTY_E_INVOICE_FORM);
      setIsAttachmentUploading(false);
      confirmEInvoiceModal.onClose();
      refreshRequests();
      return;
    }

    addToast({
      title: "E-Invoice confirmation failed",
      description: getApiErrorMessage(action?.payload),
      color: "danger",
    });
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "createdAt":
        return (
          <div className="whitespace-nowrap">
            <p className="text-[12.5px] font-medium text-slate-900">
              {formatDate(item?.createdAt)}
            </p>

            <p className="mt-0.5 text-[11.5px] text-slate-500">
              {formatDateTime(item?.createdAt)}
            </p>
          </div>
        );

      case "companyName":
        return (
          <div className="min-w-[180px]">
            <p className="text-[12.5px] font-medium text-slate-900 truncate">
              {item?.companyName || "-"}
            </p>

            <p className="mt-0.5 text-[11.5px] text-slate-500 truncate">
              Unit: {item?.unitName || "-"}
            </p>
          </div>
        );

      case "contactName":
        return (
          <div className="whitespace-nowrap">
            <p className="text-[12.5px] font-medium text-slate-900">
              {item?.contactName || "-"}
            </p>
          </div>
        );

      case "solutionName":
        return (
          <div className="whitespace-nowrap">
            <p className="text-[12.5px] font-medium text-slate-900">
              {item?.solutionName || "-"}
            </p>
          </div>
        );

      case "requestedByName":
        return (
          <div className="whitespace-nowrap">
            <p className="text-[12.5px] font-medium text-slate-900">
              {item?.requestedByName || "-"}
            </p>
          </div>
        );

      case "estimateGrandTotal":
      case "requestedAmount":
      case "invoiceGrandTotal":
      case "availableOutstandingAmount":
        return (
          <span className="whitespace-nowrap text-[12.5px] font-semibold">
            {formatAmount(item?.[columnKey])}
          </span>
        );

      case "approvedAmount":
        return (
          <span className="whitespace-nowrap text-[12.5px] font-semibold text-emerald-700">
            {formatAmount(item?.[columnKey])}
          </span>
        );

      case "requestRemarks":
        return (
          <p
            title={item?.requestRemarks}
            className="max-w-[220px] line-clamp-2 text-[12.5px] text-slate-700"
          >
            {item?.requestRemarks || "-"}
          </p>
        );

      case "gstRegistrationType":
        return (
          <div className="flex min-w-[100px] flex-col gap-1">
            <Chip
              size="sm"
              variant="flat"
              color="secondary"
              className="text-[11.5px]"
            >
              {formatStatus(item?.gstRegistrationType)}
            </Chip>
          </div>
        );

      case "requestStatus":
        return (
          <Chip
            size="sm"
            color={getStatusColor(item?.requestStatus)}
            variant="flat"
            className="text-[11.5px]"
          >
            {item?.requestStatus || "-"}
          </Chip>
        );

      case "reviewDetails":
        return (
          <div className="min-w-[145px]">
            <p className="text-[12.5px] font-medium text-slate-900">
              {item?.reviewedByName || "Not reviewed"}
            </p>

            <p className="mt-0.5 text-[11.5px] text-slate-500">
              {formatDateTime(item?.reviewedAt)}
            </p>

            {item?.reviewRemarks ? (
              <p
                title={item?.reviewRemarks}
                className="mt-0.5 max-w-[180px] truncate text-[11.5px] text-slate-500"
              >
                {item.reviewRemarks}
              </p>
            ) : null}
          </div>
        );

      case "actions": {
        const normalizedStatus = String(
          item?.requestStatus || "",
        ).toUpperCase();

        const isPending = normalizedStatus === "PENDING";
        const canViewTaxInvoice =
          Boolean(item?.invoiceGenerated) &&
          Boolean(item?.invoiceId) &&
          Boolean(item?.invoiceNumber);
        // A company/unit without a GST number cannot be e-invoiced, so the
        // action is hidden entirely rather than allowed to fail server-side.
        const hasGstNumber = Boolean(item?.unitGstNo || item?.buyerGstin);
        const canConfirmEInvoice =
          normalizedStatus === "APPROVED" &&
          Boolean(item?.invoiceNumber) &&
          hasGstNumber;
        const actionItems = [];

        if (isPending) {
          actionItems.push({
            key: "approve",
            label: "Approve",
            color: "success",
          });

          actionItems.push({
            key: "reject",
            label: "Reject",
            color: "danger",
          });
        }
        actionItems.push({
          key: "viewTaxInvoice",
          label: "View Tax Invoice",
          color: "secondary",
          icon: <Eye size={14} />,
        });

        if (canConfirmEInvoice) {
          actionItems.push({
            key: "confirmEInvoice",
            label: "Confirm E-Invoice",
            color: "primary",
          });
        }

        if (actionItems.length === 0) {
          actionItems.push({
            key: "noAction",
            label: "No action available",
            isReadOnly: true,
          });
        }

        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              items={actionItems}
              aria-label="Advance tax invoice actions"
              itemClasses={{
                base: "px-2.5 py-1.5",
                title: "text-[12.5px]",
              }}
              onAction={(key) => {
                if (key === "approve") {
                  openApproveModal(item);
                }

                if (key === "reject") {
                  openRejectModal(item);
                }

                if (key === "viewTaxInvoice") {
                  openTaxInvoiceModal(item);
                }

                if (key === "confirmEInvoice") {
                  openEInvoiceModal(item);
                }
              }}
            >
              {(action) => (
                <DropdownItem
                  key={action.key}
                  color={action.color}
                  isReadOnly={action.isReadOnly}
                  startContent={action.icon}
                  className={action.isReadOnly ? "text-slate-400" : ""}
                >
                  {action.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        );
      }

      default:
        return item?.[columnKey] ?? "-";
    }
  };

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <Input
          isClearable
          size="sm"
          className="w-full sm:max-w-[320px]"
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          placeholder="Search estimate, invoice, requester..."
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={search}
          onClear={() => setSearch("")}
          onValueChange={setSearch}
        />

        <Dropdown>
          <DropdownTrigger>
            <Button
              size="sm"
              variant="flat"
              endContent={<ChevronDown className="w-3.5 h-3.5" />}
            >
              Status: {formatStatus(status)}
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            disallowEmptySelection
            aria-label="Filter by status"
            selectionMode="single"
            selectedKeys={new Set([status])}
            itemClasses={{
              base: "px-2.5 py-1.5",
              title: "text-[12.5px]",
            }}
            onSelectionChange={(keys) => {
              const selectedStatus = Array.from(keys)[0] || "PENDING";

              setStatus(String(selectedStatus));
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((item) => (
              <DropdownItem key={item}>{item}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {totalElements} requests
        </span>

        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = totalElements > 0 && (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="text-[12.5px] text-default-400">
        Showing {Math.min((page - 1) * size + 1, totalElements)} to{" "}
        {Math.min(page * size, totalElements)} of {totalElements}
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        size="sm"
        page={page}
        total={totalPages}
        isDisabled={advanceTaxInvoiceRequestsLoading}
        onChange={setPage}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Advance Tax Invoice Approvals
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Advance tax invoice approval requests"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "min-w-[1820px]",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader columns={COLUMNS}>
          {(column) => (
            <TableColumn key={column.uid} align={column.align || "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={filteredRequests}
          isLoading={advanceTaxInvoiceRequestsLoading}
          loadingContent={
            <Spinner
              size="sm"
              label="Loading advance tax invoice requests..."
            />
          }
          emptyContent={
            advanceTaxInvoiceRequestsError
              ? getApiErrorMessage(advanceTaxInvoiceRequestsError)
              : "No advance tax invoice requests found."
          }
        >
          {(item) => (
            <TableRow key={item?.requestId || item?.publicUuid}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="full"
        isOpen={taxInvoiceModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeTaxInvoiceModal();
          }
        }}
        scrollBehavior="inside"
        placement="center"
        classNames={{
          base: "bg-slate-100",
          body: "p-0",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base border-b border-slate-200 bg-white">
                Tax Invoice
                {selectedTaxInvoice?.invoiceNumber
                  ? ` - ${selectedTaxInvoice.invoiceNumber}`
                  : ""}
              </ModalHeader>

              <ModalBody className="overflow-auto bg-slate-100 p-0 sm:p-3">
                {selectedTaxInvoice ? (
                  <div className="min-w-fit">
                    <AdvanceTaxInvoiceView
                      invoiceData={selectedTaxInvoice}
                      heading="TAX INVOICE"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <Spinner label="Loading tax invoice..." />
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-slate-200 bg-white">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    closeTaxInvoiceModal();
                    onClose();
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isApproveModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeApproveModal();
          }
        }}
        isDismissable={!advanceTaxInvoiceRequestApproving}
        isKeyboardDismissDisabled={advanceTaxInvoiceRequestApproving}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base border-b border-slate-100 dark:border-white/10">
                Approve Advance Tax Invoice
              </ModalHeader>

              <ModalBody className="py-4">
                <Card
                  shadow="none"
                  className="border border-slate-200 bg-slate-50"
                >
                  <CardBody className="p-2.5">
                    <p className="text-[11.5px] text-slate-500">
                      Estimate Number
                    </p>

                    <p className="mt-0.5 text-[12.5px] font-semibold text-slate-900">
                      {selectedRequest?.estimateNumber || "-"}
                    </p>
                  </CardBody>
                </Card>

                <Input
                  size="sm"
                  label="Approved Amount"
                  value={
                    selectedRequest?.requestedAmount !== null &&
                    selectedRequest?.requestedAmount !== undefined
                      ? String(selectedRequest.requestedAmount)
                      : ""
                  }
                  startContent={
                    <span className="text-[12.5px] text-slate-500">₹</span>
                  }
                  isReadOnly
                  description="Approved amount is taken from the requested amount."
                />

                <Textarea
                  size="sm"
                  label="Review Remarks"
                  placeholder="Enter approval remarks..."
                  value={reviewRemarks}
                  onValueChange={setReviewRemarks}
                  minRows={3}
                />
              </ModalBody>

              <ModalFooter className="border-t border-slate-100 dark:border-white/10">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    closeApproveModal();
                    onClose();
                  }}
                  isDisabled={advanceTaxInvoiceRequestApproving}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  color="success"
                  className="text-white"
                  onPress={handleApproveRequest}
                  isLoading={advanceTaxInvoiceRequestApproving}
                >
                  Approve & Generate Invoice
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeRejectModal();
          }
        }}
        isDismissable={!advanceTaxInvoiceRequestRejecting}
        isKeyboardDismissDisabled={advanceTaxInvoiceRequestRejecting}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base border-b border-slate-100 dark:border-white/10">
                Reject Advance Tax Invoice
              </ModalHeader>

              <ModalBody className="py-4">
                <Card
                  shadow="none"
                  className="border border-slate-200 bg-slate-50"
                >
                  <CardBody className="p-2.5">
                    <p className="text-[11.5px] text-slate-500">
                      Estimate Number
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-slate-900">
                      {selectedRejectRequest?.estimateNumber || "-"}
                    </p>

                    <p className="mt-2 text-[11.5px] text-slate-500">
                      Requested Amount
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-slate-900">
                      {formatAmount(selectedRejectRequest?.requestedAmount)}
                    </p>
                  </CardBody>
                </Card>

                <Textarea
                  size="sm"
                  isRequired
                  label="Rejection Reason"
                  placeholder="Enter the reason for rejecting this request..."
                  value={rejectionReason}
                  onValueChange={setRejectionReason}
                  minRows={4}
                  maxLength={1000}
                  description={`${rejectionReason.length}/1000 characters`}
                />
              </ModalBody>

              <ModalFooter className="border-t border-slate-100 dark:border-white/10">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    closeRejectModal();
                    onClose();
                  }}
                  isDisabled={advanceTaxInvoiceRequestRejecting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  color="danger"
                  onPress={handleRejectRequest}
                  isLoading={advanceTaxInvoiceRequestRejecting}
                  isDisabled={!rejectionReason.trim()}
                >
                  Reject Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={confirmEInvoiceModal.isOpen}
        onOpenChange={confirmEInvoiceModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base border-b border-slate-100 dark:border-white/10">
                Confirm E-Invoice
              </ModalHeader>

              <ModalBody className="max-h-[70vh] overflow-auto py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    size="sm"
                    label="Invoice Number"
                    value={selectedEInvoiceRequest?.invoiceNumber || ""}
                    isReadOnly
                    className="md:col-span-2"
                  />

                  <Input
                    size="sm"
                    label="E-Invoice ACK Date"
                    type="datetime-local"
                    isRequired
                    value={eInvoiceForm.eInvoiceAckDate}
                    onValueChange={(value) =>
                      handleConfirmFormChange("eInvoiceAckDate", value)
                    }
                  />

                  <Input
                    size="sm"
                    label="E-Invoice ACK No"
                    isRequired
                    value={eInvoiceForm.eInvoiceAckNo}
                    onValueChange={(value) =>
                      handleConfirmFormChange("eInvoiceAckNo", value)
                    }
                  />

                  <Input
                    size="sm"
                    label="E-Invoice IRN"
                    isRequired
                    className="md:col-span-2"
                    value={eInvoiceForm.eInvoiceIrn}
                    onValueChange={(value) =>
                      handleConfirmFormChange("eInvoiceIrn", value)
                    }
                  />

                  <div className="md:col-span-2">
                    <FileUploader
                      label="E-Invoice Attachment"
                      isRequired
                      value={eInvoiceForm.eInvoiceAttachmentUrl}
                      uploadingType="single"
                      placeholder="Upload E-Invoice attachment"
                      onUploadingChange={setIsAttachmentUploading}
                      onChange={(uploadedUrl) =>
                        handleConfirmFormChange(
                          "eInvoiceAttachmentUrl",
                          String(uploadedUrl || ""),
                        )
                      }
                    />
                  </div>

                  <Input
                    size="sm"
                    label="Remarks"
                    className="md:col-span-2"
                    value={eInvoiceForm.remarks}
                    onValueChange={(value) =>
                      handleConfirmFormChange("remarks", value)
                    }
                  />
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-slate-100 dark:border-white/10">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={
                    isAttachmentUploading || advanceTaxInvoiceEInvoiceConfirming
                  }
                  onPress={() => {
                    closeEInvoiceModal();
                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  color="primary"
                  isLoading={advanceTaxInvoiceEInvoiceConfirming}
                  isDisabled={
                    isAttachmentUploading || advanceTaxInvoiceEInvoiceConfirming
                  }
                  onPress={handleSubmitConfirmEInvoice}
                >
                  {isAttachmentUploading ? "Uploading..." : "Confirm E-Invoice"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <NewEstimatePreview
                  details={estimateDetail}
                  viewType={"ESTIMATE"}
                />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button size="sm" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdvanceInvoices;
