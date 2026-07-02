import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  getAllPendingPayment,
  reviewPendingPayment,
} from "../toolkit/slices/accountSlice";

const columns = [
  { key: "payment", label: "PAYMENT" },
  { key: "unbilled", label: "UNBILLED / ESTIMATE" },
  { key: "company", label: "COMPANY / UNIT" },
  { key: "solution", label: "SOLUTION" },
  { key: "poAttachment", label: "PO ATTACHMENT" },
  { key: "paymentTerms", label: "PAYMENT TERMS" },
  { key: "requestedBy", label: "REQUESTED BY" },
  { key: "status", label: "STATUS" },
  { key: "dates", label: "DATES" },
  { key: "remark", label: "REMARK" },
  { key: "actions", label: "ACTIONS" },
];

const safeText = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "PENDING") return "warning";
  if (value === "APPROVED") return "success";
  if (value === "REJECTED") return "danger";
  if (value === "CANCELLED") return "danger";
  if (value === "VERIFIED") return "success";

  return "default";
};

const PoAttachmentButton = ({ url }) => {
  if (!url) {
    return (
      <Chip size="sm" variant="flat" color="default" className="font-medium">
        PO: NA
      </Chip>
    );
  }

  return (
    <Tooltip content="Open PO Attachment">
      <Button
        as="a"
        href={url}
        target="_blank"
        rel="noreferrer"
        size="sm"
        variant="flat"
        color="primary"
        className="h-7 min-w-0 px-2 text-xs font-semibold"
        startContent={<FileText size={13} />}
        endContent={<ExternalLink size={12} />}
      >
        View PO
      </Button>
    </Tooltip>
  );
};

const ReviewInfo = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
    <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="m-0 mt-1 break-words text-sm font-semibold text-slate-800">
      {safeText(value)}
    </p>
  </div>
);

function PaymentVerification() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const paymentLegalVerification = useSelector(
    (state) =>
      state.account?.paymentLegalVerification ||
      state.accounts?.paymentLegalVerification ||
      [],
  );

  const loading = useSelector(
    (state) => state.account?.loading || state.accounts?.loading,
  );

  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reviewRemark, setReviewRemark] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(getAllPendingPayment(userId));
    }
  }, [dispatch, userId]);

  const filteredItems = useMemo(() => {
    const searchText = filterValue.trim().toLowerCase();

    if (!searchText) return paymentLegalVerification || [];

    return (paymentLegalVerification || []).filter((item) => {
      const searchable = [
        item?.unbilledNumber,
        item?.estimateNumber,
        item?.solutionName,
        item?.companyName,
        item?.unitName,
        item?.paymentTerms,
        item?.status,
        item?.requestedByName,
        item?.reviewedByName,
        item?.reviewRemark,
        item?.paymentReceiptId,
        item?.unbilledInvoiceId,
        item?.estimateId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(searchText);
    });
  }, [paymentLegalVerification, filterValue]);

  const pages = Math.ceil(filteredItems.length / Number(rowsPerPage)) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * Number(rowsPerPage);
    const end = start + Number(rowsPerPage);

    return filteredItems.slice(start, end);
  }, [filteredItems, page, rowsPerPage]);

  useEffect(() => {
    if (page > pages) {
      setPage(1);
    }
  }, [page, pages]);

  const handleSearchChange = (value) => {
    setFilterValue(value);
    setPage(1);
  };

  const handleRowsPerPageChange = (keys) => {
    const selected = Array.from(keys)?.[0] || "10";
    setRowsPerPage(String(selected));
    setPage(1);
  };

  const handleRefresh = () => {
    if (userId) {
      dispatch(getAllPendingPayment(userId));
    }
  };

  const handleOpenReview = (item) => {
    setSelectedPayment(item);
    setReviewRemark(item?.reviewRemark || "");
    setIsReviewOpen(true);
  };

  const handleCloseReview = () => {
    if (reviewLoading) return;

    setIsReviewOpen(false);
    setSelectedPayment(null);
    setReviewRemark("");
  };

  const handleApprovePayment = async () => {
    const finalRemark = reviewRemark.trim();

    if (!selectedPayment?.id) {
      addToast({
        title: "FAILED",
        description: "Invalid payment verification request.",
        color: "danger",
      });
      return;
    }

    if (!finalRemark) {
      addToast({
        title: "REMARK REQUIRED",
        description: "Please enter approval remark.",
        color: "warning",
      });
      return;
    }

    setReviewLoading(true);

    const response = await dispatch(
      reviewPendingPayment({
        requestId: selectedPayment.id,
        reviewedBy: userId,
        data: {
          approve: true,
          remark: finalRemark,
        },
      }),
    );

    if (response?.meta?.requestStatus === "fulfilled") {
      addToast({
        title: "SUCCESS",
        description: "Payment verification approved successfully.",
        color: "success",
      });

      setReviewLoading(false);
      handleCloseReview();
      handleRefresh();
    } else {
      addToast({
        title: "FAILED",
        description:
          response?.payload?.data?.message ||
          "Something went wrong while approving payment verification.",
        color: "danger",
      });

      setReviewLoading(false);
    }
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "payment":
        return (
          <div className="max-w-[190px]">
            <p className="m-0 text-sm font-semibold text-slate-900">
              Receipt ID: {safeText(item?.paymentReceiptId)}
            </p>
            <p className="m-0 mt-1 text-xs font-medium text-slate-400">
              Request ID: {safeText(item?.id)}
            </p>
          </div>
        );

      case "unbilled":
        return (
          <div className="max-w-[230px]">
            <p className="m-0 truncate text-sm font-semibold text-slate-900">
              {safeText(item?.unbilledNumber)}
            </p>
            <p className="m-0 mt-1 truncate text-xs font-medium text-slate-500">
              Estimate: {safeText(item?.estimateNumber)}
            </p>
            <p className="m-0 mt-1 text-xs font-medium text-slate-400">
              Unbilled ID: {safeText(item?.unbilledInvoiceId)}
            </p>
          </div>
        );

      case "company":
        return (
          <div className="max-w-[230px]">
            <p className="m-0 truncate text-sm font-semibold text-slate-900">
              {safeText(item?.companyName)}
            </p>
            <p className="m-0 mt-1 truncate text-xs font-medium text-slate-500">
              Unit: {safeText(item?.unitName)}
            </p>
            <p className="m-0 mt-1 text-xs font-medium text-slate-400">
              Company ID: {safeText(item?.companyId)} / Unit ID:{" "}
              {safeText(item?.unitId)}
            </p>
          </div>
        );

      case "solution":
        return (
          <p className="m-0 max-w-[220px] truncate text-sm font-medium text-slate-800">
            {safeText(item?.solutionName)}
          </p>
        );

      case "poAttachment":
        return <PoAttachmentButton url={item?.poAttachmentUrl} />;

      case "paymentTerms":
        return (
          <div className="max-w-[220px]">
            <p className="m-0 text-sm font-semibold text-slate-800">
              {safeText(item?.paymentTermsDays)} Days
            </p>
            <p className="m-0 mt-1 line-clamp-2 text-xs font-medium text-slate-500">
              {safeText(item?.paymentTerms)}
            </p>
          </div>
        );

      case "requestedBy":
        return (
          <div className="max-w-[170px]">
            <p className="m-0 truncate text-sm font-medium text-slate-800">
              {safeText(item?.requestedByName)}
            </p>
            <p className="m-0 mt-1 text-xs font-medium text-slate-400">
              ID: {safeText(item?.requestedById)}
            </p>
          </div>
        );

      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(item?.status)}
            className="font-semibold"
          >
            {safeText(item?.status)}
          </Chip>
        );

      case "dates":
        return (
          <div className="flex max-w-[210px] items-start gap-2 text-xs font-medium text-slate-600">
            <CalendarDays
              size={14}
              className="mt-0.5 shrink-0 text-slate-400"
            />
            <div>
              <p className="m-0">Created: {formatDateTime(item?.createdAt)}</p>
              <p className="m-0 mt-1 text-slate-400">
                Updated: {formatDateTime(item?.updatedAt)}
              </p>
              {item?.reviewedAt && (
                <p className="m-0 mt-1 text-slate-400">
                  Reviewed: {formatDateTime(item?.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        );

      case "remark":
        return (
          <div className="max-w-[220px]">
            <p className="m-0 truncate text-xs font-medium text-slate-500">
              {safeText(item?.reviewRemark)}
            </p>
            {item?.reviewedByName && (
              <p className="m-0 mt-1 truncate text-xs font-medium text-slate-400">
                By: {item.reviewedByName}
              </p>
            )}
          </div>
        );

      case "actions":
        return (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            className="h-8 min-w-[90px] rounded-lg text-xs font-semibold"
            startContent={<ClipboardCheck size={14} />}
            onPress={() => handleOpenReview(item)}
            isDisabled={String(item?.status || "").toUpperCase() !== "PENDING"}
          >
            Review
          </Button>
        );

      default:
        return "-";
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#f7f8fa] p-1">
      <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              Payment Verification
            </h1>
            <p className="m-0 mt-1 text-sm font-medium text-slate-500">
              Pending payment legal verification requests from account service.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center">
            <Input
              isClearable
              value={filterValue}
              onValueChange={handleSearchChange}
              placeholder="Search payment request..."
              startContent={<Search size={18} className="text-slate-500" />}
              classNames={{
                base: "w-full sm:w-[320px]",
                inputWrapper:
                  "h-12 rounded-2xl border border-slate-100 bg-white shadow-none",
                input: "text-sm",
              }}
            />

            <Button
              isIconOnly
              variant="flat"
              className="h-12 w-12 rounded-2xl bg-white"
              onPress={handleRefresh}
              isLoading={loading === "pending"}
            >
              <RefreshCcw size={17} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-sm font-medium text-slate-400">
            Total{" "}
            <span className="font-semibold text-slate-500">
              {filteredItems.length}
            </span>{" "}
            payment requests
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
              Rows per page:
            </span>

            <Select
              size="sm"
              variant="flat"
              selectedKeys={new Set([rowsPerPage])}
              onSelectionChange={handleRowsPerPageChange}
              className="w-[80px]"
              classNames={{
                trigger: "bg-transparent shadow-none",
              }}
            >
              <SelectItem key="5">5</SelectItem>
              <SelectItem key="10">10</SelectItem>
              <SelectItem key="20">20</SelectItem>
              <SelectItem key="50">50</SelectItem>
            </Select>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table
            aria-label="Payment legal verification table"
            removeWrapper
            isHeaderSticky
            classNames={{
              base: "h-full overflow-auto p-4",
              table: "min-w-[1540px]",
              thead: "[&>tr]:first:rounded-xl",
              th: "bg-[#f7f8fa] text-[11px] font-semibold uppercase text-slate-500 first:rounded-l-xl last:rounded-r-xl",
              td: "py-4 text-sm",
              tr: "border-b border-slate-100 last:border-b-0",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>

            <TableBody
              items={paginatedItems}
              isLoading={loading === "pending"}
              loadingContent={
                <div className="py-16 text-sm font-medium text-slate-400">
                  Loading payment verification requests...
                </div>
              }
              emptyContent={
                <div className="flex min-h-[150px] items-center justify-center text-sm font-medium text-slate-400">
                  No payment verification requests found
                </div>
              }
            >
              {(item) => (
                <TableRow key={item?.id || item?.paymentReceiptId}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2 pb-2">
          <p className="m-0 text-sm font-medium text-slate-400">
            Page {page} of {pages}
          </p>

          <Pagination
            showControls
            page={page}
            total={pages}
            onChange={setPage}
            classNames={{
              wrapper: "gap-1",
              item: "bg-white text-slate-500 shadow-none",
              cursor: "bg-blue-600 text-white font-semibold",
              prev: "bg-white",
              next: "bg-white",
            }}
          />
        </div>
      </div>

      <Modal
        isOpen={isReviewOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseReview();
        }}
        size="2xl"
        scrollBehavior="inside"
        isDismissable={!reviewLoading}
        isKeyboardDismissDisabled={reviewLoading}
        classNames={{
          base: "rounded-2xl",
          header: "border-b border-slate-100",
          footer: "border-t border-slate-100",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div>
              <h2 className="m-0 text-lg font-bold text-slate-900">
                Review Payment Verification
              </h2>
              <p className="m-0 mt-1 text-xs font-medium text-slate-500">
                Check payment request details and submit approval remark.
              </p>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ReviewInfo
                label="Company"
                value={selectedPayment?.companyName}
              />
              <ReviewInfo label="Unit" value={selectedPayment?.unitName} />
              <ReviewInfo
                label="Unbilled Number"
                value={selectedPayment?.unbilledNumber}
              />
              <ReviewInfo
                label="Estimate Number"
                value={selectedPayment?.estimateNumber}
              />
              <ReviewInfo
                label="Receipt ID"
                value={selectedPayment?.paymentReceiptId}
              />
              <ReviewInfo label="Request ID" value={selectedPayment?.id} />
              <ReviewInfo
                label="Solution"
                value={selectedPayment?.solutionName}
              />
              <ReviewInfo label="Status" value={selectedPayment?.status} />
              <ReviewInfo
                label="Payment Terms Days"
                value={selectedPayment?.paymentTermsDays}
              />
              <ReviewInfo
                label="Requested By"
                value={`${safeText(selectedPayment?.requestedByName)} / ID: ${safeText(
                  selectedPayment?.requestedById,
                )}`}
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-3">
              <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                PO Attachment
              </p>
              <PoAttachmentButton url={selectedPayment?.poAttachmentUrl} />
            </div>

            <Textarea
              label="Approval Remark"
              labelPlacement="outside"
              placeholder="Enter approval remark..."
              minRows={4}
              value={reviewRemark}
              onValueChange={setReviewRemark}
              isRequired
              classNames={{
                inputWrapper: "rounded-xl border border-slate-200 bg-white",
                input: "text-sm",
                label: "text-xs font-semibold text-slate-600",
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={handleCloseReview}
              isDisabled={reviewLoading}
            >
              Cancel
            </Button>

            <Button
              color="success"
              startContent={<CheckCircle2 size={16} />}
              isLoading={reviewLoading}
              onPress={handleApprovePayment}
            >
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default PaymentVerification;
