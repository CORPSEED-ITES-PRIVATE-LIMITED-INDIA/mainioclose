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
  Select,
  SelectItem,
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

import { EllipsisVertical, Eye, Search } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FileUploader from "../components/FileUploader";

import {
  approveAdvanceTaxInvoiceRequest,
  confirmAdvanceTaxInvoiceEInvoiceAndCreateProject,
  getAllAdvanceTaxInvoiceRequests,
} from "../toolkit/slices/accountSlice";
import AdvanceTaxInvoiceView from "./AdvanceTaxInvoiceView";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const COLUMNS = [
  { name: "DATE", uid: "createdAt" },
  { name: "REQUEST ID", uid: "requestId" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "REQUESTED BY", uid: "requestedByName" },
  { name: "ESTIMATE TOTAL", uid: "estimateGrandTotal", align: "end" },
  { name: "REQUESTED AMOUNT", uid: "requestedAmount", align: "end" },
  { name: "APPROVED AMOUNT", uid: "approvedAmount", align: "end" },
  { name: "REQUEST STATUS", uid: "requestStatus" },
  { name: "INVOICE NUMBER", uid: "invoiceNumber" },
  { name: "INVOICE TOTAL", uid: "invoiceGrandTotal", align: "end" },
  { name: "RECEIVED", uid: "receivedAmount", align: "end" },
  { name: "E-INVOICE", uid: "invoiceStatus", align: "end" },
  {
    name: "PENDING RECEIVED",
    uid: "pendingReceivedAmount",
    align: "end",
  },
  {
    name: "AVAILABLE OUTSTANDING",
    uid: "availableOutstandingAmount",
    align: "end",
  },
  { name: "OUTSTANDING", uid: "outstandingAmount", align: "end" },
  { name: "PAYMENT STATUS", uid: "invoicePaymentStatus" },
  { name: "REVIEWED BY", uid: "reviewedByName" },
  { name: "REVIEWED AT", uid: "reviewedAt" },
  { name: "MESSAGE", uid: "message" },
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

  const {
    allAdvanceTaxInvoiceRequests,
    advanceTaxInvoiceRequestsLoading,
    advanceTaxInvoiceRequestsError,
    advanceTaxInvoiceRequestApproving,
    advanceTaxInvoiceEInvoiceConfirming,
  } = useSelector((state) => state.account || {});

  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const confirmEInvoiceModal = useDisclosure();
  const taxInvoiceModal = useDisclosure();

  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState(null);
  const [selectedEInvoiceRequest, setSelectedEInvoiceRequest] = useState(null);
  const [eInvoiceForm, setEInvoiceForm] = useState(EMPTY_E_INVOICE_FORM);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);

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

  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return requests;
    }

    return requests.filter((item) => {
      const values = [
        item?.requestId,
        item?.publicUuid,
        item?.estimateNumber,
        item?.requestedByName,
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

  const openTaxInvoiceModal = (item) => {
    const canViewTaxInvoice =
      Boolean(item?.invoiceGenerated) &&
      Boolean(item?.invoiceId) &&
      Boolean(item?.invoiceNumber);

    if (!canViewTaxInvoice) {
      addToast({
        title: "Tax invoice is not available",
        description: "The invoice has not been generated for this request.",
        color: "warning",
      });
      return;
    }

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
            <p className="text-xs font-medium text-slate-900">
              {formatDate(item?.createdAt)}
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
              {formatDateTime(item?.createdAt)}
            </p>
          </div>
        );

      case "requestId":
        return (
          <div className="whitespace-nowrap">
            <p className="text-xs font-semibold text-slate-900">
              {item?.requestId ?? "-"}
            </p>

            <p
              title={item?.publicUuid}
              className="mt-1 max-w-[145px] truncate text-[10px] text-slate-500"
            >
              {item?.publicUuid || "-"}
            </p>
          </div>
        );

      case "estimateNumber":
        return (
          <span className="whitespace-nowrap text-xs font-semibold text-blue-600">
            {item?.estimateNumber || "-"}
          </span>
        );

      case "requestedByName":
        return (
          <div className="whitespace-nowrap">
            <p className="text-xs font-medium text-slate-900">
              {item?.requestedByName || "-"}
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
              User ID: {item?.requestedByUserId ?? "-"}
            </p>
          </div>
        );

      case "estimateGrandTotal":
      case "requestedAmount":
      case "invoiceGrandTotal":
      case "availableOutstandingAmount":
        return (
          <span className="whitespace-nowrap text-xs font-semibold">
            {formatAmount(item?.[columnKey])}
          </span>
        );

      case "approvedAmount":
      case "receivedAmount":
        return (
          <span className="whitespace-nowrap text-xs font-semibold text-emerald-700">
            {formatAmount(item?.[columnKey])}
          </span>
        );

      case "pendingReceivedAmount":
        return (
          <span className="whitespace-nowrap text-xs font-semibold text-amber-700">
            {formatAmount(item?.pendingReceivedAmount)}
          </span>
        );

      case "outstandingAmount":
        return (
          <span className="whitespace-nowrap text-xs font-semibold text-rose-600">
            {formatAmount(item?.outstandingAmount)}
          </span>
        );

      case "requestStatus":
        return (
          <Chip
            size="sm"
            color={getStatusColor(item?.requestStatus)}
            variant="flat"
          >
            {item?.requestStatus || "-"}
          </Chip>
        );
      case "invoiceStatus":
        return (
          <Chip
            size="sm"
            color={getStatusColor(item?.invoiceStatus)}
            variant="flat"
          >
            {item?.invoiceStatus || "-"}
          </Chip>
        );

      case "invoiceNumber":
        return (
          <span className="whitespace-nowrap text-xs font-semibold text-blue-600">
            {item?.invoiceNumber || "-"}
          </span>
        );

      case "invoicePaymentStatus":
        return item?.invoicePaymentStatus ? (
          <Chip
            size="sm"
            color={getPaymentStatusColor(item?.invoicePaymentStatus)}
            variant="flat"
          >
            {formatStatus(item?.invoicePaymentStatus)}
          </Chip>
        ) : (
          "-"
        );

      case "reviewedByName":
        return (
          <span className="whitespace-nowrap text-xs">
            {item?.reviewedByName || "-"}
          </span>
        );

      case "reviewedAt":
        return (
          <span className="whitespace-nowrap text-xs">
            {formatDateTime(item?.reviewedAt)}
          </span>
        );

      case "message":
        return (
          <p
            title={item?.message}
            className="max-w-[250px] line-clamp-2 text-xs text-slate-700"
          >
            {item?.message || "-"}
          </p>
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
        const canConfirmEInvoice =
          normalizedStatus === "APPROVED" && Boolean(item?.invoiceNumber);
        const actionItems = [];

        if (isPending) {
          actionItems.push({
            key: "approve",
            label: "Approve",
            color: "success",
          });
        }

        if (canViewTaxInvoice) {
          actionItems.push({
            key: "viewTaxInvoice",
            label: "View Tax Invoice",
            color: "secondary",
            icon: <Eye size={16} />,
          });
        }

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
                <EllipsisVertical size={18} />
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              items={actionItems}
              aria-label="Advance tax invoice actions"
              onAction={(key) => {
                if (key === "approve") {
                  openApproveModal(item);
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

  return (
    <div className="h-full min-h-[calc(100vh-76px)] bg-slate-50 p-3">
      <h1 className="mb-3 text-xl font-semibold text-slate-900">
        Advance Tax Invoice Approvals
      </h1>

      <Card shadow="none" className="border border-slate-200">
        <CardBody className="gap-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              isClearable
              size="sm"
              className="w-full lg:max-w-xl"
              placeholder="Search estimate, invoice, requester..."
              value={search}
              onValueChange={setSearch}
              onClear={() => setSearch("")}
              startContent={<Search size={16} className="text-slate-400" />}
            />

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <Select
                size="sm"
                label="Status"
                className="w-full sm:w-48"
                selectedKeys={new Set([status])}
                onSelectionChange={(keys) => {
                  const selectedStatus = Array.from(keys)[0] || "PENDING";

                  setStatus(String(selectedStatus));
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item}>{item}</SelectItem>
                ))}
              </Select>

              <Select
                size="sm"
                label="Rows"
                className="w-full sm:w-32"
                selectedKeys={new Set([String(size)])}
                onSelectionChange={(keys) => {
                  const selectedSize = Number(Array.from(keys)[0] || 10);

                  setSize(selectedSize);
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((item) => (
                  <SelectItem key={String(item)}>{item} rows</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Total {totalElements} requests
            </p>

            <p className="text-xs text-slate-500">Rows per page: {size}</p>
          </div>

          <Table
            isHeaderSticky
            aria-label="Advance tax invoice approval requests"
            classNames={{
              wrapper:
                "max-h-[calc(100vh-280px)] border border-slate-200 shadow-none",
              table: "min-w-[1960px]",
              th: "bg-slate-50 text-[11px] font-semibold text-slate-500",
              td: "text-xs text-slate-700",
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

          {totalElements > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-slate-500">
                Showing {Math.min((page - 1) * size + 1, totalElements)} to{" "}
                {Math.min(page * size, totalElements)} of {totalElements}
              </p>

              <Pagination
                showControls
                size="sm"
                page={page}
                total={totalPages}
                isDisabled={advanceTaxInvoiceRequestsLoading}
                onChange={setPage}
              />
            </div>
          )}
        </CardBody>
      </Card>

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
              <ModalHeader className="border-b border-slate-200 bg-white">
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
              <ModalHeader>Approve Advance Tax Invoice</ModalHeader>

              <ModalBody>
                <Card
                  shadow="none"
                  className="border border-slate-200 bg-slate-50"
                >
                  <CardBody className="p-3">
                    <p className="text-xs text-slate-500">Estimate Number</p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedRequest?.estimateNumber || "-"}
                    </p>
                  </CardBody>
                </Card>

                <Input
                  label="Approved Amount"
                  value={
                    selectedRequest?.requestedAmount !== null &&
                    selectedRequest?.requestedAmount !== undefined
                      ? String(selectedRequest.requestedAmount)
                      : ""
                  }
                  startContent={
                    <span className="text-sm text-slate-500">₹</span>
                  }
                  isReadOnly
                  description="Approved amount is taken from the requested amount."
                />

                <Textarea
                  label="Review Remarks"
                  placeholder="Enter approval remarks..."
                  value={reviewRemarks}
                  onValueChange={setReviewRemarks}
                  minRows={3}
                />
              </ModalBody>

              <ModalFooter>
                <Button
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
              <ModalHeader>Confirm E Invoice</ModalHeader>

              <ModalBody className="max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Invoice Number"
                    value={selectedEInvoiceRequest?.invoiceNumber || ""}
                    isReadOnly
                    className="md:col-span-2"
                  />

                  <Input
                    label="E-Invoice ACK Date"
                    type="datetime-local"
                    isRequired
                    value={eInvoiceForm.eInvoiceAckDate}
                    onValueChange={(value) =>
                      handleConfirmFormChange("eInvoiceAckDate", value)
                    }
                  />

                  <Input
                    label="E-Invoice ACK No"
                    isRequired
                    value={eInvoiceForm.eInvoiceAckNo}
                    onValueChange={(value) =>
                      handleConfirmFormChange("eInvoiceAckNo", value)
                    }
                  />

                  <Input
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
                    label="Remarks"
                    className="md:col-span-2"
                    value={eInvoiceForm.remarks}
                    onValueChange={(value) =>
                      handleConfirmFormChange("remarks", value)
                    }
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
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
                  color="primary"
                  isLoading={advanceTaxInvoiceEInvoiceConfirming}
                  isDisabled={
                    isAttachmentUploading || advanceTaxInvoiceEInvoiceConfirming
                  }
                  onPress={handleSubmitConfirmEInvoice}
                >
                  {isAttachmentUploading ? "Uploading..." : "Confirm E Invoice"}
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
