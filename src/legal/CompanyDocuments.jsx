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
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

import {
  getAllCompanyLegalVerifications,
  reviewCompanyLegalVerifications,
} from "../toolkit/slices/leadSlice";

const columns = [
  { key: "company", label: "COMPANY" },
  { key: "pan", label: "PAN" },
  { key: "documentType", label: "DOC TYPE" },
  { key: "documents", label: "DOCUMENTS" },
  { key: "requestedBy", label: "REQUESTED BY" },
  { key: "legal", label: "LEGAL" },
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

  return "default";
};

const getDocTypeColor = (documentType) => {
  const value = String(documentType || "").toUpperCase();

  if (value === "BOTH") return "primary";
  if (value === "AGREEMENT") return "secondary";
  if (value === "NDA") return "success";

  return "default";
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

const DocumentButton = ({ url, label }) => {
  if (!url) {
    return (
      <Chip size="sm" variant="flat" color="default">
        {label}: NA
      </Chip>
    );
  }

  return (
    <Tooltip content={`Open ${label}`}>
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
        {label}
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

function CompanyDocuments() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const companyLegalVerificationList = useSelector(
    (state) => state.leads.companyLegalVerificationList,
  );

  const loading = useSelector((state) => state.leads.loading);

  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewRemark, setReviewRemark] = useState("");
  const [reviewLoading, setReviewLoading] = useState("");

  useEffect(() => {
    dispatch(getAllCompanyLegalVerifications(userId));
  }, [dispatch, userId]);

  const filteredItems = useMemo(() => {
    const searchText = filterValue.trim().toLowerCase();

    if (!searchText) return companyLegalVerificationList || [];

    return (companyLegalVerificationList || []).filter((item) => {
      const searchable = [
        item?.companyName,
        item?.panNo,
        item?.documentType,
        item?.status,
        item?.requestedByName,
        item?.assignedToLegalName,
        item?.reviewedByName,
        item?.reviewRemark,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(searchText);
    });
  }, [companyLegalVerificationList, filterValue]);

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
    dispatch(getAllCompanyLegalVerifications(userId));
  };

  const handleOpenReview = (item) => {
    setSelectedRequest(item);
    setReviewRemark(item?.reviewRemark || "");
    setIsReviewOpen(true);
  };

  const handleCloseReview = () => {
    if (reviewLoading) return;

    setIsReviewOpen(false);
    setSelectedRequest(null);
    setReviewRemark("");
    setReviewLoading("");
  };

  const handleSubmitReview = async (approve) => {
    if (!selectedRequest?.id) {
      addToast({
        title: "FAILED",
        description: "Invalid legal verification request.",
        color: "danger",
      });
      return;
    }

    const finalRemark = reviewRemark?.trim();

    if (!finalRemark) {
      addToast({
        title: "REMARK REQUIRED",
        description: "Please enter review remark before submitting.",
        color: "warning",
      });
      return;
    }

    setReviewLoading(approve ? "approve" : "reject");

    const resp = await dispatch(
      reviewCompanyLegalVerifications({
        requestId: selectedRequest.id,
        reviewedBy: userId,
        data: {
          approve,
          remark: finalRemark,
        },
      }),
    );

    if (resp?.meta?.requestStatus === "fulfilled") {
      addToast({
        title: "SUCCESS",
        description: approve
          ? "Company legal verification approved successfully."
          : "Company legal verification rejected successfully.",
        color: "success",
      });

      handleCloseReview();
      dispatch(getAllCompanyLegalVerifications(userId));
    } else {
      addToast({
        title: "FAILED",
        description:
          resp?.payload?.data?.message ||
          "Something went wrong while submitting review.",
        color: "danger",
      });

      setReviewLoading("");
    }
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "company":
        return (
          <div className="max-w-[260px]">
            <div className="flex items-center gap-2">
              <p className="truncate text-[12.5px] font-semibold text-foreground">
                {safeText(item?.companyName)}
              </p>

              {item?.rating && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 ${getRatingBadgeClass(
                    item?.rating,
                  )}`}
                >
                  {item.rating}
                </span>
              )}
            </div>

            <p className="text-[11.5px] text-default-500">
              ID: {safeText(item?.companyId)}
            </p>
          </div>
        );

      case "pan":
        return (
          <Chip size="sm" variant="flat" color="default">
            {safeText(item?.panNo)}
          </Chip>
        );

      case "documentType":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getDocTypeColor(item?.documentType)}
          >
            {safeText(item?.documentType)}
          </Chip>
        );

      case "documents":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <DocumentButton url={item?.agreementUrl} label="Agreement" />
            <DocumentButton url={item?.ndaUrl} label="NDA" />
          </div>
        );

      case "requestedBy":
        return (
          <div className="max-w-[170px]">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {safeText(item?.requestedByName)}
            </p>
            <p className="text-[11.5px] text-default-500">
              ID: {safeText(item?.requestedById)}
            </p>
          </div>
        );

      case "legal":
        return (
          <div className="max-w-[170px]">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {safeText(item?.assignedToLegalName)}
            </p>
            <p className="text-[11.5px] text-default-500">
              ID: {safeText(item?.assignedToLegalId)}
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
          <div className="flex max-w-[190px] items-start gap-2 text-[11.5px] text-default-500">
            <CalendarDays
              size={14}
              className="mt-0.5 shrink-0 text-default-400"
            />
            <div>
              <p>Created: {formatDateTime(item?.createdAt)}</p>
              <p>Updated: {formatDateTime(item?.updatedAt)}</p>
            </div>
          </div>
        );

      case "remark":
        return (
          <p className="max-w-[220px] truncate text-[11.5px] text-default-500">
            {safeText(item?.reviewRemark)}
          </p>
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
          placeholder="Search legal request..."
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
          Total {filteredItems.length} legal requests
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
        Company Legal Documents
      </h1>
      <p className="text-default-500 text-[12.5px] -mt-2 mb-1">
        Agreement and NDA verification requests sent from company profile.
      </p>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Company legal verification table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full min-w-[1380px]",
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
              Loading legal requests...
            </div>
          }
          emptyContent={
            <div className="flex min-h-[150px] items-center justify-center text-[12.5px] text-default-400">
              No legal requests found
            </div>
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
        isOpen={isReviewOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseReview();
        }}
        size="3xl"
        scrollBehavior="inside"
        isDismissable={!reviewLoading}
        isKeyboardDismissDisabled={!!reviewLoading}
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
                Review Company Legal Verification
              </h2>
              <p className="text-[11.5px] font-normal text-default-500">
                Verify Agreement/NDA documents and submit approval decision.
              </p>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ReviewInfo
                label="Company"
                value={selectedRequest?.companyName}
              />
              <ReviewInfo label="PAN" value={selectedRequest?.panNo} />
              <ReviewInfo
                label="Company ID"
                value={selectedRequest?.companyId}
              />
              <ReviewInfo
                label="Document Type"
                value={selectedRequest?.documentType}
              />
              <ReviewInfo label="Status" value={selectedRequest?.status} />
              <ReviewInfo
                label="Requested By"
                value={`${safeText(selectedRequest?.requestedByName)} / ID: ${safeText(
                  selectedRequest?.requestedById,
                )}`}
              />
              <ReviewInfo
                label="Assigned Legal"
                value={`${safeText(
                  selectedRequest?.assignedToLegalName,
                )} / ID: ${safeText(selectedRequest?.assignedToLegalId)}`}
              />
              <ReviewInfo
                label="Created At"
                value={formatDateTime(selectedRequest?.createdAt)}
              />
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-default-50 p-3">
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-default-500">
                Documents
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <DocumentButton
                  url={selectedRequest?.agreementUrl}
                  label="Agreement"
                />
                <DocumentButton url={selectedRequest?.ndaUrl} label="NDA" />
              </div>
            </div>

            <Textarea
              label="Review Remark"
              labelPlacement="outside"
              placeholder="Enter review remark..."
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
              isDisabled={!!reviewLoading}
            >
              Cancel
            </Button>

            <Button
              color="danger"
              variant="flat"
              startContent={<XCircle size={16} />}
              isLoading={reviewLoading === "reject"}
              isDisabled={reviewLoading === "approve"}
              onPress={() => handleSubmitReview(false)}
            >
              Reject
            </Button>

            <Button
              color="success"
              startContent={<CheckCircle2 size={16} />}
              isLoading={reviewLoading === "approve"}
              isDisabled={reviewLoading === "reject"}
              onPress={() => handleSubmitReview(true)}
            >
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default CompanyDocuments;
