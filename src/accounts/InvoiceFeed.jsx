import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Card,
  CardBody,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { inrCurrency } from "../common";
import {
  getAllInvoiceFeed,
  getInvoiceDetailById,
  confirmEInvoice,
  getAllAdvanceInvoice,
  approveAdvanceTaxInvoiceRequest,
  rejectAdvanceTaxInvoiceRequest,
} from "../toolkit/slices/accountSlice";
import TaxInvoice from "../components/TaxInvoice";
import FileUploader from "../components/FileUploader";

const FILTER_OPTIONS = [
  { key: "ALL", label: "All" },
  { key: "INVOICE", label: "Invoices" },
  { key: "ADVANCE_REQUEST", label: "Advance Tax Invoice Requests" },
];

const INVOICE_STATUS_OPTIONS = [
  "GENERATED",
  "SENT_TO_CLIENT",
  "VIEWED",
  "PAID",
  "UNPAID",
  "PARTIALLY_PAID",
  "FINALIZED_WITHOUT_E_INVOICE",
  "CANCELLED",
  "CREDIT_NOTED",
  "E_INVOICE_CONFIRMED",
];

const ADVANCE_REQUEST_STATUS_OPTIONS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const columns = [
  { name: "DATE", uid: "date" },
  { name: "TYPE", uid: "recordType" },
  { name: "REFERENCE NO.", uid: "referenceNumber" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "SERVICE", uid: "solutionName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "AMOUNT", uid: "amount" },
  { name: "GST TYPE", uid: "gstRegistrationType" },
  { name: "STATUS", uid: "status" },
  { name: "ADDED BY", uid: "createdByName" },
  { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
  GENERATED: "default",
  SENT_TO_CLIENT: "primary",
  VIEWED: "primary",
  PAID: "success",
  UNPAID: "warning",
  PARTIALLY_PAID: "warning",
  E_INVOICE_CONFIRMED: "success",
  FINALIZED_WITHOUT_E_INVOICE: "success",
  CANCELLED: "danger",
  CREDIT_NOTED: "secondary",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const EMPTY_E_INVOICE_FORM = {
  remarks: "",
  einvoiceAttachmentUrl: "",
  einvoiceAckDate: "",
  einvoiceIrn: "",
  einvoiceAckNo: "",
};

const getApiErrorMessage = (error) => {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;
  return (
    error?.message ||
    error?.error ||
    error?.data?.message ||
    error?.response?.data?.message ||
    "Something went wrong"
  );
};

const InvoiceFeed = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const currentUserId = useMemo(() => Number(userId), [userId]);

  // ---- FEED STATE ----
  const [filter, setFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchValue, setSearchValue] = useState(""); // NEW
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const invoiceFeed = useSelector((state) => state.account.invoiceFeed) || [];
  const loading = useSelector((state) => state.account.loading);

  // ---- INVOICE action state ----
  const taxInvoiceModal = useDisclosure();
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  const advanceTaxInvoiceModal = useDisclosure();
  const allAdvanceTaxInvoices = useSelector(
    (state) => state.account.allAdvanceTaxInvoices || [],
  );

  const confirmEInvoiceModal = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [isConfirmEInvoiceSubmitting, setIsConfirmEInvoiceSubmitting] =
    useState(false);
  const [confirmEInvoiceForm, setConfirmEInvoiceForm] =
    useState(EMPTY_E_INVOICE_FORM);

  // ---- ADVANCE_REQUEST action state ----
  const advanceTaxInvoiceRequestApproving = useSelector(
    (state) => state.account.advanceTaxInvoiceRequestApproving,
  );
  const advanceTaxInvoiceRequestRejecting = useSelector(
    (state) => state.account.advanceTaxInvoiceRequestRejecting,
  );

  const approveModal = useDisclosure();
  const [selectedAdvanceRequest, setSelectedAdvanceRequest] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");

  const rejectModal = useDisclosure();
  const [selectedRejectRequest, setSelectedRejectRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchFeed = () => {
    dispatch(getAllInvoiceFeed({ userId, filter, page, size }));
  };

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId, filter, page, size]);

  // CHANGED: now applies both status AND search filters client-side,
  // over the current page's already-fetched rows.
  const displayedFeed = useMemo(() => {
    let result = invoiceFeed;

    if (statusFilter) {
      result = result.filter((item) => {
        const statusValue =
          item.recordType === "ADVANCE_REQUEST"
            ? item.advanceRequestStatus
            : item.invoiceStatus;

        return statusValue === statusFilter;
      });
    }

    const searchText = searchValue.trim().toLowerCase();

    if (searchText) {
      result = result.filter((item) => {
        const searchableValues = [
          item.referenceNumber,
          item.estimateNumber,
          item.companyName,
          item.solutionName,
          item.createdByName,
          item.gstRegistrationType,
          item.invoiceStatus,
          item.advanceRequestStatus,
        ];

        return searchableValues.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchText),
        );
      });
    }

    return result;
  }, [invoiceFeed, statusFilter, searchValue]);

  const statusOptions =
    filter === "INVOICE"
      ? INVOICE_STATUS_OPTIONS
      : filter === "ADVANCE_REQUEST"
        ? ADVANCE_REQUEST_STATUS_OPTIONS
        : [];

  const onFilterChange = (key) => {
    setFilter(key);
    setStatusFilter("");
    setPage(1);
  };

  const onStatusFilterChange = (key) => {
    setStatusFilter(key === "ALL_STATUS" ? "" : key);
  };

  // NEW
  const onSearchChange = (value) => {
    setSearchValue(value);
  };

  // NEW
  const onSearchClear = () => {
    setSearchValue("");
  };

  const onRowsPerPageChange = (e) => {
    setSize(Number(e.target.value));
    setPage(1);
  };

  const onNextPage = () => {
    if (invoiceFeed.length === size) setPage((prev) => prev + 1);
  };

  const onPreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  // ===================================================
  // INVOICE ROW ACTIONS
  // ===================================================

  const handleViewTaxInvoice = (item) => {
    dispatch(getInvoiceDetailById({ id: item?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setInvoiceDetail(resp?.payload);
          taxInvoiceModal.onOpen();
        } else {
          addToast({
            title: "ERROR",
            description: "There is some issue in Invoice",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "There is some issue in Invoice",
          color: "danger",
        }),
      );
  };

  const handleShowAdvanceTaxInvoice = async (item) => {
    advanceTaxInvoiceModal.onOpen();

    try {
      await dispatch(
        getAllAdvanceInvoice({ invoiceId: item?.id, userId }),
      ).unwrap();
    } catch (error) {
      advanceTaxInvoiceModal.onClose();
      addToast({
        title: "ERROR",
        description:
          getApiErrorMessage(error) || "Failed to fetch Advance Tax Invoice",
        color: "danger",
      });
    }
  };

  const openConfirmEInvoiceModal = (item) => {
    setSelectedInvoice(item);
    setIsAttachmentUploading(false);

    setConfirmEInvoiceForm({
      remarks: "",
      einvoiceAttachmentUrl: "",
      einvoiceAckDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      einvoiceIrn: "",
      einvoiceAckNo: "",
    });

    confirmEInvoiceModal.onOpen();
  };

  const handleConfirmFormChange = (field, value) => {
    setConfirmEInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitConfirmEInvoice = async () => {
    if (isConfirmEInvoiceSubmitting) return;

    if (!selectedInvoice?.id) {
      addToast({
        title: "ERROR",
        description: "Invoice not selected",
        color: "danger",
      });
      return;
    }

    if (isAttachmentUploading) {
      addToast({
        title: "Wait ...",
        description: "Please wait while the attachment is being uploaded",
        color: "warning",
      });
      return;
    }

    if (
      !confirmEInvoiceForm.einvoiceAttachmentUrl ||
      !confirmEInvoiceForm.einvoiceAckDate ||
      !confirmEInvoiceForm.einvoiceIrn ||
      !confirmEInvoiceForm.einvoiceAckNo
    ) {
      addToast({
        title: "ERROR",
        description: "Please fill all required E-Invoice fields",
        color: "danger",
      });
      return;
    }

    const payload = {
      userId: currentUserId,
      remarks: confirmEInvoiceForm.remarks,
      einvoiceAttachmentUrl: confirmEInvoiceForm.einvoiceAttachmentUrl,
      einvoiceAckDate: new Date(
        confirmEInvoiceForm.einvoiceAckDate,
      ).toISOString(),
      einvoiceIrn: confirmEInvoiceForm.einvoiceIrn,
      einvoiceAckNo: confirmEInvoiceForm.einvoiceAckNo,
    };

    setIsConfirmEInvoiceSubmitting(true);

    try {
      await dispatch(
        confirmEInvoice({ invoiceId: selectedInvoice.id, data: payload }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description: "E-Invoice confirmed successfully",
        color: "success",
      });

      confirmEInvoiceModal.onClose();
      setSelectedInvoice(null);
      setIsAttachmentUploading(false);
      fetchFeed();
    } catch (error) {
      addToast({
        title: "ERROR",
        description: getApiErrorMessage(error) || "Failed to confirm E-Invoice",
        color: "danger",
      });
    } finally {
      setIsConfirmEInvoiceSubmitting(false);
    }
  };

  // ===================================================
  // ADVANCE_REQUEST ROW ACTIONS
  // ===================================================

  const openApproveModal = (item) => {
    setSelectedAdvanceRequest(item);
    setReviewRemarks("");
    approveModal.onOpen();
  };

  const closeApproveModal = () => {
    if (advanceTaxInvoiceRequestApproving) return;
    setSelectedAdvanceRequest(null);
    setReviewRemarks("");
    approveModal.onClose();
  };

  const handleApproveRequest = async () => {
    if (!selectedAdvanceRequest?.id) {
      addToast({
        title: "Invalid advance tax invoice request",
        color: "danger",
      });
      return;
    }

    if (!currentUserId) {
      addToast({ title: "Approver user ID is not available", color: "danger" });
      return;
    }

    const approvedAmount = Number(selectedAdvanceRequest?.amount);

    if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
      addToast({ title: "Requested amount is invalid", color: "danger" });
      return;
    }

    const action = await dispatch(
      approveAdvanceTaxInvoiceRequest({
        requestId: selectedAdvanceRequest.id,
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

      closeApproveModal();
      fetchFeed();
      return;
    }

    addToast({
      title: "Approval failed",
      description: getApiErrorMessage(action?.payload),
      color: "danger",
    });
  };

  const openRejectModal = (item) => {
    setSelectedRejectRequest(item);
    setRejectionReason("");
    rejectModal.onOpen();
  };

  const closeRejectModal = () => {
    if (advanceTaxInvoiceRequestRejecting) return;
    setSelectedRejectRequest(null);
    setRejectionReason("");
    rejectModal.onClose();
  };

  const handleRejectRequest = async () => {
    if (!selectedRejectRequest?.id) {
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
      addToast({ title: "Rejection reason is required", color: "danger" });
      return;
    }

    const action = await dispatch(
      rejectAdvanceTaxInvoiceRequest({
        requestId: selectedRejectRequest.id,
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

      closeRejectModal();
      fetchFeed();
      return;
    }

    addToast({
      title: "Rejection failed",
      description: getApiErrorMessage(action?.payload),
      color: "danger",
    });
  };

  // ===================================================
  // ACTION MENU BUILDERS (per row type + status)
  // ===================================================

  const getInvoiceActionItems = (item) => {
    const items = [
      { key: "viewTaxInvoice", label: "Tax Invoice" },
      //   { key: "showAdvanceTaxInvoice", label: "Show Advance Tax Invoice" },
    ];

    const statusLower = String(item?.invoiceStatus || "").toLowerCase();
    const gstLower = String(item?.gstRegistrationType || "").toLowerCase();

    const hideConfirmEInvoice =
      statusLower === "e_invoice_confirmed" ||
      gstLower === "international" ||
      gstLower === "unregistered";

    if (!hideConfirmEInvoice) {
      items.push({ key: "confirmEInvoice", label: "Confirm E Invoice" });
    }

    return items;
  };

  const getAdvanceRequestActionItems = (item) => {
    const normalizedStatus = String(
      item?.advanceRequestStatus || "",
    ).toUpperCase();
    const items = [];

    if (normalizedStatus === "PENDING") {
      items.push({ key: "approve", label: "Approve", color: "success" });
      items.push({ key: "reject", label: "Reject", color: "danger" });
    }

    if (items.length === 0) {
      items.push({
        key: "noAction",
        label: "No action available",
        isReadOnly: true,
      });
    }

    return items;
  };

  const onActionSelected = (item, key) => {
    if (item.recordType === "INVOICE") {
      if (key === "viewTaxInvoice") handleViewTaxInvoice(item);
      if (key === "showAdvanceTaxInvoice") handleShowAdvanceTaxInvoice(item);
      if (key === "confirmEInvoice") openConfirmEInvoiceModal(item);
      return;
    }

    if (item.recordType === "ADVANCE_REQUEST") {
      if (key === "approve") openApproveModal(item);
      if (key === "reject") openRejectModal(item);
    }
  };

  // ===================================================
  // RENDER HELPERS
  // ===================================================

  const renderStatus = (item) => {
    const statusValue =
      item.recordType === "ADVANCE_REQUEST"
        ? item.advanceRequestStatus
        : item.invoiceStatus;

    if (!statusValue) return <span className="text-default-400">NA</span>;

    return (
      <Chip
        size="sm"
        variant="flat"
        color={statusColorMap[statusValue] || "default"}
      >
        {statusValue}
      </Chip>
    );
  };

  const renderRecordType = (item) => (
    <Chip
      size="sm"
      variant="flat"
      color={item.recordType === "INVOICE" ? "primary" : "secondary"}
    >
      {item.recordType === "INVOICE" ? "Invoice" : "Advance Request"}
    </Chip>
  );

  const renderActions = (item) => {
    const actionItems =
      item.recordType === "INVOICE"
        ? getInvoiceActionItems(item)
        : getAdvanceRequestActionItems(item);

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size="sm" variant="light">
            <EllipsisVertical className="w-4 h-4 text-default-300" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Row actions"
          items={actionItems}
          onAction={(key) => onActionSelected(item, key)}
        >
          {(action) => (
            <DropdownItem
              key={action.key}
              color={action.color}
              isReadOnly={action.isReadOnly}
              className={action.isReadOnly ? "text-slate-400" : ""}
            >
              {action.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    );
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "date":
        return (
          <p className="text-[12.5px]">
            {item.invoiceDate
              ? dayjs(item.invoiceDate).format("DD-MM-YYYY")
              : item.createdAt
                ? dayjs(item.createdAt).format("DD-MM-YYYY")
                : "NA"}
          </p>
        );

      case "recordType":
        return renderRecordType(item);

      case "referenceNumber":
        return (
          <p className="text-[12.5px] font-medium text-blue-600">
            {item.referenceNumber || "NA"}
          </p>
        );

      case "estimateNumber":
        return <p className="text-[12.5px]">{item.estimateNumber || "NA"}</p>;

      case "solutionName":
        return (
          <p className="text-[12.5px] capitalize">
            {item.solutionName || "NA"}
          </p>
        );

      case "companyName":
        return (
          <p className="text-[12.5px] capitalize">{item.companyName || "NA"}</p>
        );

      case "amount":
        return (
          <p className="text-[12.5px]">
            {inrCurrency(item.amount || 0)}{" "}
            <span className="text-default-400 text-[11px]">
              {item.currency || ""}
            </span>
          </p>
        );

      case "gstRegistrationType":
        return (
          <p className="text-[12.5px]">{item.gstRegistrationType || "NA"}</p>
        );

      case "status":
        return renderStatus(item);

      case "createdByName":
        return (
          <p className="text-[12.5px] capitalize">
            {item.createdByName || "NA"}
          </p>
        );

      case "actions":
        return renderActions(item);

      default:
        return item[columnKey];
    }
  };

  const topContent = (
    <div className="flex flex-col gap-2">
      {/* NEW: search bar */}
      <Input
        isClearable
        size="sm"
        className="w-full sm:max-w-[360px]"
        classNames={{ inputWrapper: "h-8 min-h-8" }}
        placeholder="Search reference no., estimate, company, service, added by..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={searchValue}
        onClear={onSearchClear}
        onValueChange={onSearchChange}
      />

      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="text-default-400 text-[12.5px]">
          Showing {displayedFeed.length} of {invoiceFeed.length} record(s)
        </span>

        <div className="flex gap-1.5 flex-wrap">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<ChevronDown className="w-3.5 h-3.5" />}
              >
                {FILTER_OPTIONS.find((f) => f.key === filter)?.label}
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              disallowEmptySelection
              aria-label="Invoice feed filter"
              selectedKeys={[filter]}
              selectionMode="single"
              variant="flat"
              onSelectionChange={(e) => onFilterChange(Array.from(e)[0])}
            >
              {FILTER_OPTIONS.map((option) => (
                <DropdownItem key={option.key}>{option.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {statusOptions.length > 0 && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {statusFilter || "ALL STATUS"}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Status filter"
                selectedKeys={[statusFilter || "ALL_STATUS"]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) =>
                  onStatusFilterChange(Array.from(e)[0])
                }
              >
                <DropdownItem key="ALL_STATUS">ALL STATUS</DropdownItem>
                {statusOptions.map((s) => (
                  <DropdownItem key={s}>{s.replace(/_/g, " ")}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={size}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="text-[12.5px] text-default-400">Page {page}</span>

      <div className="flex gap-2">
        <Button
          isDisabled={page === 1}
          size="sm"
          variant="flat"
          onPress={onPreviousPage}
        >
          Previous
        </Button>

        <Button
          isDisabled={invoiceFeed.length < size}
          size="sm"
          variant="flat"
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {isConfirmEInvoiceSubmitting && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 backdrop-blur-sm"
          role="status"
          aria-live="assertive"
        >
          <div className="flex min-w-[240px] flex-col items-center gap-4 rounded-2xl bg-background px-8 py-7 shadow-2xl">
            <Spinner size="lg" color="primary" />
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                Confirming E-Invoice
              </p>
              <p className="mt-1 text-sm text-default-500">
                Please do not refresh or close this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Invoice Feed
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Combined invoice and advance tax invoice request feed"
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
        topContent={topContent}
        topContentPlacement="outside"
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
          items={displayedFeed}
          isLoading={loading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={loading ? " " : "No records found"}
        >
          {(item) => (
            <TableRow key={`${item.recordType}-${item.id}`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* TAX INVOICE MODAL (Invoice rows) */}
      <Modal
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={taxInvoiceModal.isOpen}
        onOpenChange={taxInvoiceModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Tax Invoice</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <TaxInvoice invoiceData={invoiceDetail} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* SHOW ADVANCE TAX INVOICE MODAL (Invoice rows) */}
      <Modal
        size="5xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={advanceTaxInvoiceModal.isOpen}
        onOpenChange={advanceTaxInvoiceModal.onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Advance Tax Invoices</ModalHeader>

              <ModalBody>
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : allAdvanceTaxInvoices.length === 0 ? (
                  <div className="flex justify-center items-center py-20">
                    <p className="text-default-500">
                      No Advance Tax Invoice found for this invoice.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {allAdvanceTaxInvoices.map((adv) => (
                      <div
                        key={adv.requestId}
                        className="rounded-lg border border-default-200 p-4"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-base font-semibold">
                              Request #{adv.requestId}
                            </p>
                            <p className="text-xs text-default-500">
                              {adv.invoiceNumber || "NA"}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-default-100 text-xs font-medium">
                            {adv.requestStatus || "NA"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Requested Amount"
                            value={inrCurrency(adv.requestedAmount || 0)}
                            isReadOnly
                          />
                          <Input
                            label="Approved Amount"
                            value={inrCurrency(adv.approvedAmount || 0)}
                            isReadOnly
                          />
                          <Input
                            label="Invoice Grand Total"
                            value={inrCurrency(adv.invoiceGrandTotal || 0)}
                            isReadOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* CONFIRM E-INVOICE MODAL (Invoice rows) */}
      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={confirmEInvoiceModal.isOpen}
        onOpenChange={confirmEInvoiceModal.onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm E Invoice</ModalHeader>

              <ModalBody className="max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Invoice Number"
                    value={selectedInvoice?.referenceNumber || ""}
                    isReadOnly
                  />
                  <Input
                    label="User ID"
                    value={String(userId || "")}
                    isReadOnly
                  />

                  <Input
                    label="E-Invoice ACK Date"
                    type="datetime-local"
                    isRequired
                    value={confirmEInvoiceForm.einvoiceAckDate}
                    onValueChange={(value) =>
                      handleConfirmFormChange("einvoiceAckDate", value)
                    }
                  />

                  <Input
                    label="E-Invoice ACK No"
                    isRequired
                    value={confirmEInvoiceForm.einvoiceAckNo}
                    onValueChange={(value) =>
                      handleConfirmFormChange("einvoiceAckNo", value)
                    }
                  />

                  <Input
                    label="E-Invoice IRN"
                    isRequired
                    className="md:col-span-2"
                    value={confirmEInvoiceForm.einvoiceIrn}
                    onValueChange={(value) =>
                      handleConfirmFormChange("einvoiceIrn", value)
                    }
                  />

                  <div className="md:col-span-2">
                    <FileUploader
                      label="E-Invoice Attachment"
                      isRequired
                      value={confirmEInvoiceForm.einvoiceAttachmentUrl}
                      uploadingType="single"
                      placeholder="Upload E-Invoice attachment"
                      onUploadingChange={setIsAttachmentUploading}
                      onChange={(uploadedUrl) =>
                        handleConfirmFormChange(
                          "einvoiceAttachmentUrl",
                          uploadedUrl,
                        )
                      }
                    />
                  </div>

                  <Input
                    label="Remarks"
                    className="md:col-span-2"
                    value={confirmEInvoiceForm.remarks}
                    onValueChange={(value) =>
                      handleConfirmFormChange("remarks", value)
                    }
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    isAttachmentUploading || isConfirmEInvoiceSubmitting
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

      {/* APPROVE MODAL (Advance Request rows) */}
      <Modal
        isOpen={approveModal.isOpen}
        onOpenChange={(open) => !open && closeApproveModal()}
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
                      {selectedAdvanceRequest?.estimateNumber || "-"}
                    </p>
                  </CardBody>
                </Card>

                <Input
                  size="sm"
                  label="Approved Amount"
                  value={
                    selectedAdvanceRequest?.amount !== null &&
                    selectedAdvanceRequest?.amount !== undefined
                      ? String(selectedAdvanceRequest.amount)
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

      {/* REJECT MODAL (Advance Request rows) */}
      <Modal
        isOpen={rejectModal.isOpen}
        onOpenChange={(open) => !open && closeRejectModal()}
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
                      {inrCurrency(selectedRejectRequest?.amount || 0)}
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
    </div>
  );
};

export default InvoiceFeed;
