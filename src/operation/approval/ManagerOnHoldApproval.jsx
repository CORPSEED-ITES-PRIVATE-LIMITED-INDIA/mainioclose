import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Check, ChevronDown, EllipsisVertical, X } from "lucide-react";
import dayjs from "dayjs";

import {
  getMilestoneOnHoldReqs,
  approveMilestoneOnHoldReqs,
} from "../../toolkit/slices/operationSlice";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED"];

const decisionDefaultValues = {
  decisionReason: "",
};

const decisionSchema = z.object({
  decisionReason: z.string().min(1, "Please enter a reason for your decision"),
});

const getResolvedManagerId = (user, routeUserId) => {
  return user?.id || user?.userId || user?.employeeId || routeUserId || "";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY hh:mm A")
    : "-";
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "PENDING") return "warning";
  if (value === "APPROVED") return "success";
  if (value === "REJECTED") return "danger";

  return "default";
};

const columns = [
  { name: "PROJECT", uid: "project" },
  { name: "MILESTONE", uid: "milestone" },
  { name: "REQUESTED BY", uid: "requestedBy" },
  { name: "REASON", uid: "reason" },
  { name: "STATUS", uid: "status" },
  { name: "REQUESTED AT", uid: "requestedAt" },
  { name: "DECIDED AT", uid: "decidedAt" },
  { name: "ACTIONS", uid: "actions" },
];

// Walks common shapes of the paginated API response and returns a plain
// array of rows, so the table always has something safe to render even if
// the backend wraps/unwraps the page object differently.
const normalizePageContent = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.data)) return response.data;

  return [];
};

function ManagerOnHoldApproval() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const managerId = getResolvedManagerId(currentUser, userId);

  const milestoneOnHoldReqsResponse = useSelector(
    (state) => state.operation.milestoneOnHoldReqs,
  );
  const loading = useSelector((state) => state.operation.loading);

  const decisionModal = useDisclosure();

  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [filteration, setFilteration] = useState({ page: 0, size: 10 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null); // "APPROVE" | "REJECT"
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    control: decisionControl,
    handleSubmit: handleDecisionSubmit,
    reset: resetDecisionForm,
    formState: { errors: decisionErrors },
  } = useForm({
    resolver: zodResolver(decisionSchema),
    defaultValues: decisionDefaultValues,
  });

  const requestList = useMemo(
    () => normalizePageContent(milestoneOnHoldReqsResponse),
    [milestoneOnHoldReqsResponse],
  );

  const totalPages = useMemo(
    () =>
      milestoneOnHoldReqsResponse?.totalPages ||
      Math.ceil(
        (milestoneOnHoldReqsResponse?.totalElements || requestList.length) /
          filteration.size,
      ) ||
      1,
    [milestoneOnHoldReqsResponse, requestList.length, filteration.size],
  );

  const fetchOnHoldRequests = useCallback(() => {
    if (!managerId) return;

    dispatch(
      getMilestoneOnHoldReqs({
        managerId,
        page: filteration.page,
        size: filteration.size,
        status: statusFilter,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch on hold requests.",
          color: "danger",
        });
      }
    });
  }, [dispatch, managerId, filteration.page, filteration.size, statusFilter]);

  useEffect(() => {
    fetchOnHoldRequests();
  }, [fetchOnHoldRequests]);

  const handleOpenDecision = (rowData, decision) => {
    if (!rowData?.requestId) {
      addToast({
        title: "ERROR",
        description: "Request ID is missing.",
        color: "danger",
      });
      return;
    }

    setSelectedRequest(rowData);
    setSelectedDecision(decision);
    resetDecisionForm(decisionDefaultValues);
    decisionModal.onOpen();
  };

  const onSubmitDecision = (values) => {
    if (!selectedRequest?.requestId) {
      addToast({
        title: "ERROR",
        description: "Request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!managerId) {
      addToast({
        title: "ERROR",
        description: "Manager ID is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    const payload = {
      managerId: Number(managerId),
      decision: selectedDecision,
      decisionReason: values.decisionReason,
    };

    setSubmitLoading(true);

    dispatch(
      approveMilestoneOnHoldReqs({
        requestId: selectedRequest.requestId,
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description:
            selectedDecision === "APPROVE"
              ? "Request approved successfully."
              : "Request rejected successfully.",
          color: "success",
        });

        decisionModal.onClose();
        setSelectedRequest(null);
        setSelectedDecision(null);
        resetDecisionForm(decisionDefaultValues);
        fetchOnHoldRequests();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Failed to record decision.",
          color: "danger",
        });
      }
    });
  };

  const onPreviousPage = useCallback(() => {
    setFilteration((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }));
  }, []);

  const onNextPage = useCallback(() => {
    setFilteration((prev) => ({
      ...prev,
      page: Math.min(totalPages - 1, prev.page + 1),
    }));
  }, [totalPages]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "project":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {rowData?.projectName || "-"}
            </span>
            <span className="text-xs text-default-500">
              {rowData?.projectNumber || "-"}
            </span>
          </div>
        );

      case "milestone":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {rowData?.milestoneName || "-"}
            </span>
            <span className="text-xs text-default-500">
              Current: {rowData?.currentMilestoneStatus || "-"}
            </span>
          </div>
        );

      case "requestedBy":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {rowData?.requestedByName || "-"}
            </span>
            <span className="text-xs text-default-500">
              ID: {rowData?.requestedById || "-"}
            </span>
          </div>
        );

      case "reason":
        return (
          <div className="max-w-[220px]">
            <p className="truncate text-sm" title={rowData?.requestReason}>
              {rowData?.requestReason || "-"}
            </p>
            {rowData?.decisionReason && (
              <p
                className="mt-0.5 truncate text-xs text-default-500"
                title={rowData?.decisionReason}
              >
                Decision: {rowData.decisionReason}
              </p>
            )}
          </div>
        );

      case "status":
        return (
          <Chip
            size="sm"
            color={getStatusColor(rowData?.approvalStatus)}
            variant="flat"
          >
            {rowData?.approvalStatus || "-"}
          </Chip>
        );

      case "requestedAt":
        return (
          <span className="text-xs">
            {formatDateTime(rowData?.requestedAt)}
          </span>
        );

      case "decidedAt":
        return (
          <span className="text-xs">{formatDateTime(rowData?.decidedAt)}</span>
        );

      case "actions": {
        const isPending =
          String(rowData?.approvalStatus || "").toUpperCase() === "PENDING";

        if (!isPending) {
          return (
            <div className="flex justify-center">
              <Chip size="sm" variant="flat">
                No Action
              </Chip>
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" isIconOnly variant="light">
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="On hold request actions">
                <DropdownItem
                  key="approve"
                  startContent={<Check size={15} />}
                  onPress={() => handleOpenDecision(rowData, "APPROVE")}
                >
                  Approve
                </DropdownItem>

                <DropdownItem
                  key="reject"
                  color="danger"
                  startContent={<X size={15} />}
                  onPress={() => handleOpenDecision(rowData, "REJECT")}
                >
                  Reject
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      }

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <h1 className="font-sans text-lg font-semibold">
            Milestone On Hold Approvals
          </h1>

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                endContent={<ChevronDown className="w-3.5 h-3.5" />}
                variant="flat"
              >
                {statusFilter}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Status Filter"
              closeOnSelect
              selectionMode="single"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)?.[0];

                if (value) {
                  setStatusFilter(value);
                  setFilteration((prev) => ({ ...prev, page: 0 }));
                }
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <DropdownItem key={option}>{option}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <span className="text-default-400 text-[12.5px]">
          Total{" "}
          {milestoneOnHoldReqsResponse?.totalElements || requestList.length}{" "}
          requests
        </span>
      </div>
    );
  }, [statusFilter, milestoneOnHoldReqsResponse, requestList.length]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {filteration.page + 1} of {totalPages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={filteration.page + 1}
          total={totalPages}
          onChange={(page) =>
            setFilteration((prev) => ({ ...prev, page: page - 1 }))
          }
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={filteration.page === 0}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={filteration.page + 1 >= totalPages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [filteration.page, totalPages, onPreviousPage, onNextPage]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Table
          isHeaderSticky
          removeWrapper={false}
          aria-label="Milestone on hold requests table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            base: "gap-2.5",
            wrapper:
              "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
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
              loading === "pending" ? "Loading..." : "No on hold requests found"
            }
            items={requestList}
          >
            {(item) => (
              <TableRow key={item?.requestId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={decisionModal.isOpen}
        onOpenChange={decisionModal.onOpenChange}
        size="lg"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedDecision === "APPROVE"
                      ? "Approve On Hold Request"
                      : "Reject On Hold Request"}
                  </h2>
                  <p className="mt-1 text-xs font-normal text-default-500">
                    {selectedRequest?.projectName || "-"} •{" "}
                    {selectedRequest?.milestoneName || "-"}
                  </p>
                </div>
              </ModalHeader>

              <form
                onSubmit={handleDecisionSubmit(onSubmitDecision, () => {
                  addToast({
                    title: "ERROR",
                    description: "Please enter a decision reason.",
                    color: "danger",
                  });
                })}
              >
                <ModalBody className="space-y-4 px-6 py-5">
                  <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-600">
                    <p>
                      Requested By: {selectedRequest?.requestedByName || "-"}
                    </p>
                    <p>
                      Request Reason: {selectedRequest?.requestReason || "-"}
                    </p>
                  </div>

                  <Controller
                    name="decisionReason"
                    control={decisionControl}
                    render={({ field }) => (
                      <Textarea
                        label="Decision Reason"
                        isRequired
                        minRows={3}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!decisionErrors.decisionReason}
                        errorMessage={decisionErrors.decisionReason?.message}
                      />
                    )}
                  />
                </ModalBody>

                <ModalFooter className="border-t px-6 py-4">
                  <Button
                    variant="flat"
                    type="button"
                    onPress={() => {
                      onClose();
                      setSelectedRequest(null);
                      setSelectedDecision(null);
                      resetDecisionForm(decisionDefaultValues);
                    }}
                    isDisabled={submitLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    color={
                      selectedDecision === "APPROVE" ? "success" : "danger"
                    }
                    type="submit"
                    isLoading={submitLoading}
                  >
                    {selectedDecision === "APPROVE" ? "Approve" : "Reject"}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ManagerOnHoldApproval;
