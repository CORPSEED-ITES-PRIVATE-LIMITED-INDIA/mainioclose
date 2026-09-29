import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Select,
  SelectItem,
  Textarea,
  Input,
  addToast,
  Chip,
  Tooltip,
  Divider,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  EllipsisVertical,
  Scale,
  Info,
  Eye,
  CheckCircle2,
  Circle,
  Building2,
  User,
  CalendarClock,
  Receipt,
  FileText,
  Search,
} from "lucide-react";
import dayjs from "dayjs";
import {
  getAllLegalRequestOperations,
  resolveLegalRequestOperations,
} from "../toolkit/slices/operationSlice.js";
import { issueUnbilledInvoiceRefund } from "../toolkit/slices/accountSlice.js";

const LEGAL_STATUS_COLOR = {
  RAISED: "warning",
  REFUND: "success",
  NON_REFUNDED: "danger",
  SERVICE_CHANGE: "primary",
  NONE: "default",
};

const INACTIVE_LEGAL_STATUSES = new Set([undefined, null, "", "NONE"]);

function isLegalRequestActive(status) {
  return !INACTIVE_LEGAL_STATUSES.has(status);
}

function formatLegalStatus(status) {
  if (!status || status === "NONE") return "-";
  return status
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

// Statuses the "status" filter dropdown offers
const STATUS_FILTER_OPTIONS = [
  "ALL",
  "RAISED",
  "REFUND",
  "NON_REFUNDED",
  "SERVICE_CHANGE",
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

// Statuses legal can resolve a request into
const RESOLUTION_STATUS_OPTIONS = ["REFUND", "NON_REFUNDED", "SERVICE_CHANGE"];

const columns = [
  { name: "PROJECT", uid: "project" },
  { name: "COMPANY", uid: "company" },
  { name: "REQUEST TITLE", uid: "title" },
  { name: "ASSIGNED TO", uid: "assignedTo" },
  { name: "RAISED BY / DATE", uid: "raised" },
  { name: "STATUS", uid: "status" },
  { name: "RESOLUTION", uid: "resolution" },
  { name: "ACTIONS", uid: "actions" },
];

const RESOLVE_FORM_DEFAULTS = {
  status: "",
  statusReason: "",
  refundAmount: "",
};

const RESOLVE_ERROR_DEFAULTS = {
  status: "",
  statusReason: "",
  refundAmount: "",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return currencyFormatter.format(Number(value));
}

/**
 * Vertical line-and-point milestone timeline, built for the legal detail
 * view. Purely presentational — takes the `milestones` array as-is.
 */
function MilestoneTimeline({ milestones }) {
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return (
      <p className="text-[12.5px] text-default-400">
        No milestones recorded for this project.
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col">
      {milestones.map((milestone, index) => {
        const isCompleted = milestone?.status === "COMPLETED";
        const isLast = index === milestones.length - 1;

        return (
          <li
            key={milestone?.id ?? index}
            className="relative pb-6 pl-8 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[9px] top-5 h-[calc(100%-4px)] w-px ${
                  isCompleted ? "bg-primary/40" : "bg-gray-200 dark:bg-white/10"
                }`}
              />
            )}

            <span
              aria-hidden="true"
              className={`absolute left-0 top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full ${
                isCompleted
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-neutral-900 text-default-300 border-2 border-gray-200 dark:border-white/15"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-[13px] w-[13px]" strokeWidth={2.5} />
              ) : (
                <Circle className="h-[7px] w-[7px] fill-current" />
              )}
            </span>

            <div className="flex flex-col gap-0.5">
              <span
                className={`text-[12.5px] font-medium ${
                  isCompleted ? "text-foreground" : "text-default-400"
                }`}
              >
                {milestone?.name || "Untitled milestone"}
              </span>
              <span className="text-[11px] uppercase tracking-wide text-default-400">
                {isCompleted ? "Completed" : "Pending"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-50 dark:bg-white/5 text-default-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] uppercase tracking-wide text-default-400">
          {label}
        </span>
        <span className="text-[12.5px] font-medium text-foreground truncate">
          {value || "-"}
        </span>
      </div>
    </div>
  );
}

function ProjectEscalations() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const resolveModal = useDisclosure();
  const detailDrawer = useDisclosure();

  const legalRequestsResponse = useSelector(
    (state) => state.operation.legalRequestsOperations,
  );
  const loading = useSelector((state) => state.operation.loading);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  // Frontend-only search: filters whatever rows are currently loaded on
  // this page (backend has no search/keyword param yet).
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolveData, setResolveData] = useState(RESOLVE_FORM_DEFAULTS);
  const [resolveErrors, setResolveErrors] = useState(RESOLVE_ERROR_DEFAULTS);
  const [isResolving, setIsResolving] = useState(false);

  // Row currently shown in the read-only legal detail drawer.
  const [viewedRequest, setViewedRequest] = useState(null);

  const list = useMemo(() => {
    const rows = Array.isArray(legalRequestsResponse?.content)
      ? legalRequestsResponse.content
      : [];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const haystack = [
        row?.projectNo,
        row?.name,
        row?.companyName,
        row?.contactName,
        row?.legalRequestTitle,
        row?.legalRequestAssignedToLegalName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [legalRequestsResponse, searchQuery]);

  const totalPages = legalRequestsResponse?.totalPages || 1;
  const totalElements = legalRequestsResponse?.totalElements || 0;

  const fetchLegalRequests = useCallback(() => {
    dispatch(
      getAllLegalRequestOperations({
        userId: Number(userId),
        page: pagination.page, // 1-based, matches controller's expectation
        size: pagination.size,
        status: statusFilter === "ALL" ? "" : statusFilter,
      }),
    );
  }, [dispatch, userId, pagination.page, pagination.size, statusFilter]);

  useEffect(() => {
    fetchLegalRequests();
  }, [fetchLegalRequests]);

  function isLegalRequestResolvable(status) {
    return status === "RAISED";
  }

  const openResolveModal = (request) => {
    if (!isLegalRequestResolvable(request?.legalRequestStatus)) {
      addToast({
        title: "Already resolved",
        description: "This legal request has already been resolved.",
        color: "warning",
      });
      return;
    }

    setSelectedRequest(request);
    setResolveData(RESOLVE_FORM_DEFAULTS);
    setResolveErrors(RESOLVE_ERROR_DEFAULTS);
    resolveModal.onOpen();
  };

  const openDetailDrawer = (request) => {
    setViewedRequest(request);
    detailDrawer.onOpen();
  };

  const handleResolveSubmit = async (event) => {
    event.preventDefault();

    const isRefund = resolveData.status === "REFUND";

    const errors = {
      status: resolveData.status ? "" : "Please select a resolution status",
      statusReason: resolveData.statusReason.trim()
        ? ""
        : "Please provide a reason / remark",
      refundAmount:
        isRefund &&
        (!resolveData.refundAmount || Number(resolveData.refundAmount) <= 0)
          ? "Please enter a valid refund amount"
          : "",
    };

    setResolveErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setIsResolving(true);

    try {
      // Refund is issued FIRST, directly on the unbilled invoice, looked
      // up by unbilledNumber (not the row's internal id). If it fails, we
      // abort the whole process: the legal request stays unresolved, no
      // resolve call is made.
      if (isRefund) {
        if (!selectedRequest?.unbilledNumber) {
          addToast({
            title: "ERROR",
            description:
              "This request is missing its unbilled number, so a refund can't be issued.",
            color: "danger",
          });
          setIsResolving(false);
          return;
        }

        const refundPayload = {
          refundAmount: Number(resolveData.refundAmount),
          reason: resolveData.statusReason.trim(),
          resolvedById: Number(userId),
        };

        const refundResponse = await dispatch(
          issueUnbilledInvoiceRefund({
            unbilledNumber: selectedRequest?.unbilledNumber,
            data: refundPayload,
          }),
        );

        if (refundResponse.meta.requestStatus !== "fulfilled") {
          addToast({
            title: "ERROR",
            description:
              typeof refundResponse?.payload === "string"
                ? refundResponse.payload
                : "Unable to issue refund. Legal request was not resolved.",
            color: "danger",
          });
          return;
        }
      }

      // Refund succeeded (or resolution isn't a refund) — now resolve the request.
      const resolvePayload = {
        status: resolveData.status,
        statusReason: resolveData.statusReason.trim(),
        resolvedById: Number(userId),
      };

      const response = await dispatch(
        resolveLegalRequestOperations({
          projectId: Number(selectedRequest?.id),
          userId: Number(userId),
          data: resolvePayload,
        }),
      );

      if (response.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            typeof response?.payload === "string"
              ? response.payload
              : isRefund
                ? "Refund was issued, but the legal request could not be resolved. Please retry."
                : "Unable to resolve legal request.",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "SUCCESS",
        description: isRefund
          ? "Refund issued and legal request resolved successfully."
          : "Legal request resolved successfully.",
        color: "success",
      });

      resolveModal.onClose();
      setSelectedRequest(null);
      fetchLegalRequests();
    } catch (error) {
      addToast({
        title: "ERROR",
        description: "Unable to complete resolution.",
        color: "danger",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "project":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12.5px] font-medium">
              {rowData?.projectNo}
            </span>
            <span className="text-[11.5px] text-default-500">
              {rowData?.name}
            </span>
          </div>
        );

      case "company":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12.5px]">{rowData?.companyName || "-"}</span>
            <span className="text-[11.5px] text-default-400">
              {rowData?.contactName || "-"}
            </span>
          </div>
        );

      case "title":
        return (
          <div className="max-w-[220px]">
            <p className="text-[12.5px] font-medium truncate">
              {rowData?.legalRequestTitle || "-"}
            </p>
            {rowData?.legalRequestNotes && (
              <Tooltip content={rowData.legalRequestNotes}>
                <p className="text-[11.5px] text-default-500 truncate flex items-center gap-1 cursor-pointer">
                  <Info className="w-3 h-3 shrink-0" />
                  {rowData.legalRequestNotes}
                </p>
              </Tooltip>
            )}
          </div>
        );

      case "assignedTo":
        return (
          <span className="text-[12.5px]">
            {rowData?.legalRequestAssignedToLegalName || "-"}
          </span>
        );

      case "raised": {
        const raisedByName = rowData?.legalRequestCreatedById
          ? `User #${rowData.legalRequestCreatedById}`
          : "-";

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12.5px]">{raisedByName}</span>
            <span className="text-[11.5px] text-default-400">
              {rowData?.legalRequestCreatedDate
                ? dayjs(rowData.legalRequestCreatedDate).format(
                    "DD MMM YYYY, hh:mm A",
                  )
                : "-"}
            </span>
          </div>
        );
      }

      case "status": {
        const status = rowData?.legalRequestStatus;

        return (
          <Chip
            size="sm"
            variant="flat"
            color={LEGAL_STATUS_COLOR[status] || "default"}
          >
            {formatLegalStatus(status)}
          </Chip>
        );
      }

      case "resolution": {
        if (
          !rowData?.legalRequestResolvedDate &&
          !rowData?.legalRequestStatusReason
        ) {
          return <span className="text-[12.5px] text-default-400">-</span>;
        }

        return (
          <div className="flex flex-col gap-0.5 max-w-[220px]">
            {rowData?.legalRequestStatusReason && (
              <p className="text-[12.5px] truncate">
                {rowData.legalRequestStatusReason}
              </p>
            )}
            {rowData?.legalRequestResolvedDate && (
              <span className="text-[11.5px] text-default-400">
                {dayjs(rowData.legalRequestResolvedDate).format(
                  "DD MMM YYYY, hh:mm A",
                )}
              </span>
            )}
          </div>
        );
      }

      case "actions": {
        const isResolvable = isLegalRequestResolvable(
          rowData?.legalRequestStatus,
        );

        return (
          <div className="flex justify-center">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Legal request actions"
                >
                  <EllipsisVertical className="w-4 h-4 text-default-300" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Legal request actions">
                <DropdownItem
                  key="view"
                  description="Open the professional summary for legal"
                  startContent={<Eye className="w-3.5 h-3.5" />}
                  onPress={() => openDetailDrawer(rowData)}
                >
                  View Details
                </DropdownItem>

                <DropdownItem
                  key="resolve"
                  description={
                    isResolvable
                      ? "Set the outcome of this legal request"
                      : "This request has already been resolved"
                  }
                  isDisabled={!isResolvable}
                  onPress={() => openResolveModal(rowData)}
                >
                  Resolve Request
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      }

      default:
        return rowData?.[columnKey] || "-";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2.5">
        <Input
          size="sm"
          placeholder="Search acc. to project, company, title, assignee"
          startContent={<Search className="w-3.5 h-3.5 text-default-400" />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-xs"
        />

        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-default-500" />
            <h1 className="font-sans text-lg font-semibold">
              Project Legal Escalations
            </h1>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                endContent={<ChevronDown className="w-3.5 h-3.5" />}
              >
                {statusFilter === "ALL"
                  ? "All Statuses"
                  : formatLegalStatus(statusFilter)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Status filter"
              selectionMode="single"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                setStatusFilter(key);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              {STATUS_FILTER_OPTIONS.map((status) => (
                <DropdownItem key={status}>
                  {status === "ALL"
                    ? "All Statuses"
                    : formatLegalStatus(status)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  }, [statusFilter, searchQuery]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="text-[12.5px] text-default-400">
          Total {totalElements} legal requests
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={pagination.page}
          total={totalPages}
          onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </div>
    );
  }, [totalElements, pagination.page, totalPages]);

  const isRefundSelected = resolveData.status === "REFUND";

  return (
    <div className="flex flex-col gap-3">
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Legal escalations table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-280px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
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
          emptyContent={
            loading === "pending" ? "Loading..." : "No legal requests found"
          }
          items={list}
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

      {/* Resolve modal — unchanged */}
      <Modal
        isOpen={resolveModal.isOpen}
        onOpenChange={resolveModal.onOpenChange}
        size="lg"
        isDismissable={!isResolving}
        hideCloseButton={isResolving}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleResolveSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                <span className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Resolve Legal Request
                </span>
                <span className="text-xs font-normal text-default-500">
                  Project: {selectedRequest?.projectNo || "-"} —{" "}
                  {selectedRequest?.legalRequestTitle || "-"}
                </span>
              </ModalHeader>

              <ModalBody className="gap-4">
                <div className="rounded-lg bg-default-50 p-3 text-[12.5px] flex flex-col gap-1">
                  <span>
                    Current Status:{" "}
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        LEGAL_STATUS_COLOR[
                          selectedRequest?.legalRequestStatus
                        ] || "default"
                      }
                    >
                      {formatLegalStatus(selectedRequest?.legalRequestStatus)}
                    </Chip>
                  </span>
                  {selectedRequest?.legalRequestNotes && (
                    <span className="text-default-500">
                      Notes: {selectedRequest.legalRequestNotes}
                    </span>
                  )}
                </div>

                <Select
                  label="Resolution Status"
                  placeholder="Select the outcome"
                  isRequired
                  selectedKeys={
                    resolveData.status
                      ? new Set([resolveData.status])
                      : new Set([])
                  }
                  isInvalid={Boolean(resolveErrors.status)}
                  errorMessage={resolveErrors.status}
                  onSelectionChange={(keys) => {
                    const status = Array.from(keys)[0] || "";

                    setResolveData((previous) => ({ ...previous, status }));
                    setResolveErrors((previous) => ({
                      ...previous,
                      status: "",
                    }));
                  }}
                >
                  {RESOLUTION_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status}>
                      {formatLegalStatus(status)}
                    </SelectItem>
                  ))}
                </Select>

                {isRefundSelected && (
                  <div className="flex flex-col gap-4 rounded-lg border border-default-200 p-3">
                    <span className="text-[11.5px] font-medium text-default-500 uppercase tracking-wide">
                      Refund Details
                    </span>

                    <Input
                      type="number"
                      min={0}
                      label="Refund Amount"
                      placeholder="Enter refund amount"
                      isRequired
                      value={resolveData.refundAmount}
                      isInvalid={Boolean(resolveErrors.refundAmount)}
                      errorMessage={resolveErrors.refundAmount}
                      onChange={(event) => {
                        setResolveData((previous) => ({
                          ...previous,
                          refundAmount: event.target.value,
                        }));
                        setResolveErrors((previous) => ({
                          ...previous,
                          refundAmount: "",
                        }));
                      }}
                    />
                  </div>
                )}

                <Textarea
                  label="Reason / Remarks"
                  placeholder="Explain the resolution decision"
                  minRows={4}
                  isRequired
                  value={resolveData.statusReason}
                  isInvalid={Boolean(resolveErrors.statusReason)}
                  errorMessage={resolveErrors.statusReason}
                  onChange={(event) => {
                    setResolveData((previous) => ({
                      ...previous,
                      statusReason: event.target.value,
                    }));

                    setResolveErrors((previous) => ({
                      ...previous,
                      statusReason: "",
                    }));
                  }}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isResolving}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit" isLoading={isResolving}>
                  Submit Resolution
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Legal-facing read-only detail drawer with milestone timeline */}
      <Drawer
        isOpen={detailDrawer.isOpen}
        onOpenChange={detailDrawer.onOpenChange}
        size="md"
        placement="right"
        classNames={{
          base: "border-l border-gray-200 dark:border-white/10",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-white/10 px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[13.5px] font-semibold">
                    <Scale className="w-4 h-4 text-default-500" />
                    Legal Request Summary
                  </span>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      LEGAL_STATUS_COLOR[viewedRequest?.legalRequestStatus] ||
                      "default"
                    }
                  >
                    {formatLegalStatus(viewedRequest?.legalRequestStatus)}
                  </Chip>
                </div>
                <span className="text-[11.5px] font-normal text-default-400">
                  {viewedRequest?.projectNo || "-"}
                </span>
              </DrawerHeader>

              <DrawerBody className="px-5 py-4 gap-6">
                {/* Project / company snapshot */}
                <section className="flex flex-col gap-3">
                  <span className="text-[11px] uppercase tracking-wide text-default-400 font-medium">
                    Project
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow
                      icon={FileText}
                      label="Project"
                      value={viewedRequest?.name}
                    />
                    <DetailRow
                      icon={Building2}
                      label="Company"
                      value={viewedRequest?.companyName}
                    />
                    <DetailRow
                      icon={User}
                      label="Contact"
                      value={viewedRequest?.contactName}
                    />
                    <DetailRow
                      icon={Receipt}
                      label="Total Value"
                      value={formatCurrency(viewedRequest?.totalAmount)}
                    />
                  </div>
                </section>

                <Divider />

                {/* Legal request details */}
                <section className="flex flex-col gap-3">
                  <span className="text-[11px] uppercase tracking-wide text-default-400 font-medium">
                    Escalation
                  </span>

                  <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 flex flex-col gap-2">
                    <span className="text-[12.5px] font-medium">
                      {viewedRequest?.legalRequestTitle || "-"}
                    </span>
                    {viewedRequest?.legalRequestNotes && (
                      <p className="text-[12px] text-default-500 leading-relaxed">
                        {viewedRequest.legalRequestNotes}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow
                      icon={User}
                      label="Assigned To"
                      value={viewedRequest?.legalRequestAssignedToLegalName}
                    />
                    <DetailRow
                      icon={CalendarClock}
                      label="Raised On"
                      value={
                        viewedRequest?.legalRequestCreatedDate
                          ? dayjs(viewedRequest.legalRequestCreatedDate).format(
                              "DD MMM YYYY, hh:mm A",
                            )
                          : "-"
                      }
                    />
                  </div>

                  {isLegalRequestActive(viewedRequest?.legalRequestStatus) &&
                    viewedRequest?.legalRequestStatus !== "RAISED" && (
                      <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3 flex flex-col gap-2 mt-1">
                        <span className="text-[11px] uppercase tracking-wide text-default-400 font-medium">
                          Resolution
                        </span>
                        {viewedRequest?.legalRequestStatusReason && (
                          <p className="text-[12px] text-default-600 leading-relaxed">
                            {viewedRequest.legalRequestStatusReason}
                          </p>
                        )}
                        {viewedRequest?.legalRequestResolvedDate && (
                          <span className="text-[11.5px] text-default-400">
                            Resolved{" "}
                            {dayjs(
                              viewedRequest.legalRequestResolvedDate,
                            ).format("DD MMM YYYY, hh:mm A")}
                          </span>
                        )}
                      </div>
                    )}
                </section>

                <Divider />

                {/* Milestone timeline */}
                <section className="flex flex-col gap-3">
                  <span className="text-[11px] uppercase tracking-wide text-default-400 font-medium">
                    Project Milestones
                  </span>
                  <MilestoneTimeline milestones={viewedRequest?.milestones} />
                </section>
              </DrawerBody>

              <DrawerFooter className="border-t border-gray-200 dark:border-white/10 px-5 py-3">
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                {isLegalRequestResolvable(
                  viewedRequest?.legalRequestStatus,
                ) && (
                  <Button
                    color="primary"
                    onPress={() => {
                      onClose();
                      openResolveModal(viewedRequest);
                    }}
                  >
                    Resolve Request
                  </Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default ProjectEscalations;
