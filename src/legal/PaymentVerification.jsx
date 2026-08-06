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
      <Chip size="sm" variant="flat" color="default">
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
        startContent={<FileText size={13} />}
        endContent={<ExternalLink size={12} />}
      >
        View PO
      </Button>
    </Tooltip>
  );
};

const ReviewInfo = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-default-50 px-3 py-2">
    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-default-400">
      {label}
    </p>
    <p className="mt-1 break-words text-[12.5px] font-semibold text-foreground">
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
            <p className="text-[12.5px] font-semibold text-foreground">
              Receipt ID: {safeText(item?.paymentReceiptId)}
            </p>
          </div>
        );

      case "unbilled":
        return (
          <div className="max-w-[230px]">
            <p className="truncate text-[12.5px] font-semibold text-foreground">
              {safeText(item?.unbilledNumber)}
            </p>
            <p className="truncate text-[11.5px] text-default-500">
              Estimate: {safeText(item?.estimateNumber)}
            </p>
          </div>
        );

      case "company":
        return (
          <div className="max-w-[230px]">
            <p className="truncate text-[12.5px] font-semibold text-foreground">
              {safeText(item?.companyName)}
            </p>
            <p className="truncate text-[11.5px] text-default-500">
              Unit: {safeText(item?.unitName)}
            </p>
          </div>
        );

      case "solution":
        return (
          <p className="max-w-[220px] truncate text-[12.5px] font-medium text-foreground">
            {safeText(item?.solutionName)}
          </p>
        );

      case "poAttachment":
        return <PoAttachmentButton url={item?.poAttachmentUrl} />;

      case "paymentTerms":
        return (
          <div className="max-w-[220px]">
            <p className="text-[12.5px] font-semibold text-foreground">
              {safeText(item?.paymentTermsDays)} Days
            </p>
            <p className="line-clamp-2 text-[11.5px] text-default-500">
              {safeText(item?.paymentTerms)}
            </p>
          </div>
        );

      case "requestedBy":
        return (
          <div className="max-w-[170px]">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {safeText(item?.requestedByName)}
            </p>
          </div>
        );

      case "status":
        return (
          <Chip size="sm" variant="flat" color={getStatusColor(item?.status)}>
            {safeText(item?.status)}
          </Chip>
        );

      case "dates":
        return (
          <div className="flex max-w-[210px] items-start gap-2 text-[11.5px] text-default-500">
            <CalendarDays
              size={14}
              className="mt-0.5 shrink-0 text-default-400"
            />
            <div>
              <p>Created: {formatDateTime(item?.createdAt)}</p>
              <p>Updated: {formatDateTime(item?.updatedAt)}</p>
              {item?.reviewedAt && (
                <p>Reviewed: {formatDateTime(item?.reviewedAt)}</p>
              )}
            </div>
          </div>
        );

      case "remark":
        return (
          <div className="max-w-[220px]">
            <p className="truncate text-[11.5px] text-default-500">
              {safeText(item?.reviewRemark)}
            </p>
            {item?.reviewedByName && (
              <p className="truncate text-[11.5px] text-default-500">
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
            startContent={<ClipboardCheck className="w-3.5 h-3.5" />}
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

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <Input
          isClearable
          size="sm"
          className="w-full sm:max-w-[280px]"
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          value={filterValue}
          onValueChange={handleSearchChange}
          placeholder="Search payment request..."
          startContent={<Search className="w-4 h-4 text-default-400" />}
        />

        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={handleRefresh}
          isLoading={loading === "pending"}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {filteredItems.length} payment requests
        </span>

        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(e.target.value);
              setPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="w-[30%] text-[12.5px] text-default-400">
        Page {page} of {pages}
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />

      <div className="hidden sm:flex w-[30%]" />
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Payment Verification
      </h1>
      <p className="text-default-500 text-[12.5px] -mt-2 mb-1">
        Pending payment legal verification requests from account service.
      </p>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Payment legal verification table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full min-w-[1540px]",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
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
            <div className="py-16 text-[12.5px] text-default-400">
              Loading payment verification requests...
            </div>
          }
          emptyContent={
            <div className="flex min-h-[150px] items-center justify-center text-[12.5px] text-default-400">
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
              <h2 className="text-lg font-semibold text-foreground">
                Review Payment Verification
              </h2>
              <p className="text-[11.5px] font-normal text-default-500">
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

            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-default-50 p-3">
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-default-500">
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
