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
  Select,
  SelectItem,
  Textarea,
  Input,
  addToast,
  Chip,
  Tooltip,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ChevronDown, EllipsisVertical, Scale, Info } from "lucide-react";
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

function ProjectEscalations() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const resolveModal = useDisclosure();

  const legalRequestsResponse = useSelector(
    (state) => state.operation.legalRequestsOperations,
  );
  const loading = useSelector((state) => state.operation.loading);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolveData, setResolveData] = useState(RESOLVE_FORM_DEFAULTS);
  const [resolveErrors, setResolveErrors] = useState(RESOLVE_ERROR_DEFAULTS);
  const [isResolving, setIsResolving] = useState(false);

  const list = useMemo(() => {
    return Array.isArray(legalRequestsResponse?.content)
      ? legalRequestsResponse.content
      : [];
  }, [legalRequestsResponse]);

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
          return; // Abort — legal request resolution does not proceed.
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
                {status === "ALL" ? "All Statuses" : formatLegalStatus(status)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }, [statusFilter]);

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
    </div>
  );
}

export default ProjectEscalations;
