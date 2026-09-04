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
import { Link, useParams } from "react-router-dom";
import {
  Check,
  ChevronDown,
  EllipsisVertical,
  Search,
  X,
} from "lucide-react";
import dayjs from "dayjs";

import {
  approveOrRejectClientPortalDetails,
  getPortalDetailsApprovalQueue,
} from "../../toolkit/slices/operationSlice";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const decisionDefaultValues = {
  approvalRemarks: "",
};

const decisionSchema = z.object({
  approvalRemarks: z.string().trim().min(1, "Please enter a remark"),
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
  { name: "PORTAL", uid: "portal" },
  { name: "USERNAME", uid: "username" },
  { name: "REMARKS", uid: "remarks" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "STATUS", uid: "status" },
  { name: "APPROVAL", uid: "approval" },
  { name: "ACTIONS", uid: "actions" },
];

const PortalCredentialsApproval = () => {
  const dispatch = useDispatch();
  const { userId: routeUserId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const managerId = getResolvedManagerId(currentUser, routeUserId);

  const approvalQueue = useSelector(
    (state) => state.operation.portalDetailsApprovalQueue,
  );
  const loading = useSelector(
    (state) => state.operation.portalDetailsApprovalQueueLoading,
  );

  const decisionModal = useDisclosure();

  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null); // "APPROVED" | "REJECTED"
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
    () => (Array.isArray(approvalQueue?.requests) ? approvalQueue.requests : []),
    [approvalQueue],
  );

  // Quick filter over the currently loaded page — the API itself has no
  // search param, only userId/status/page/size.
  const filteredRequestList = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    if (!search) {
      return requestList;
    }

    return requestList.filter((item) => {
      const searchableValues = [
        item?.id,
        item?.projectId,
        item?.portalName,
        item?.portalUrl,
        item?.username,
        item?.remarks,
        item?.createdByName,
        item?.updatedByName,
        item?.status,
        item?.approvedByName,
        item?.approvalRemarks,
      ];

      return searchableValues
        .filter((value) => value !== null && value !== undefined && value !== "")
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [requestList, searchValue]);

  const totalPages = approvalQueue?.totalPages || 1;

  const fetchApprovalQueue = useCallback(() => {
    if (!managerId) return;

    dispatch(
      getPortalDetailsApprovalQueue({
        userId: managerId,
        status: statusFilter,
        page: pagination.page,
        size: pagination.size,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch portal credential requests.",
          color: "danger",
        });
      }
    });
  }, [dispatch, managerId, statusFilter, pagination.page, pagination.size]);

  useEffect(() => {
    fetchApprovalQueue();
  }, [fetchApprovalQueue]);

  const handleOpenDecision = (rowData, decision) => {
    if (!rowData?.id || !rowData?.projectId) {
      addToast({
        title: "ERROR",
        description: "Project ID or request ID is missing.",
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
    if (!selectedRequest?.id || !selectedRequest?.projectId) {
      addToast({
        title: "ERROR",
        description: "Project ID or request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!managerId) {
      addToast({
        title: "ERROR",
        description: "User ID is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    setSubmitLoading(true);

    dispatch(
      approveOrRejectClientPortalDetails({
        projectId: selectedRequest.projectId,
        detailId: selectedRequest.id,
        userId: managerId,
        data: {
          status: selectedDecision,
          approvalRemarks: values.approvalRemarks.trim(),
        },
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description:
            selectedDecision === "APPROVED"
              ? "Portal credentials approved successfully."
              : "Portal credentials rejected successfully.",
          color: "success",
        });

        decisionModal.onClose();
        setSelectedRequest(null);
        setSelectedDecision(null);
        resetDecisionForm(decisionDefaultValues);
        fetchApprovalQueue();
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
    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const onNextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(totalPages, prev.page + 1),
    }));
  }, [totalPages]);

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "project":
          return (
            <Link
              to={`/erp/${routeUserId}/operation/projects/${rowData?.projectId}/projectDetail`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Project #{rowData?.projectId || "-"}
            </Link>
          );

        case "portal":
          return (
            <div className="flex max-w-[220px] flex-col">
              <span
                className="truncate text-sm font-semibold text-foreground"
                title={rowData?.portalName}
              >
                {rowData?.portalName || "-"}
              </span>
              <span
                className="truncate text-xs text-default-500"
                title={rowData?.portalUrl}
              >
                {rowData?.portalUrl || "-"}
              </span>
            </div>
          );

        case "username":
          return <span className="text-sm">{rowData?.username || "-"}</span>;

        case "remarks":
          return (
            <p
              className="max-w-[220px] truncate text-sm"
              title={rowData?.remarks}
            >
              {rowData?.remarks || "-"}
            </p>
          );

        case "createdBy":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {rowData?.createdByName || "-"}
              </span>
              <span className="text-xs text-default-500">
                {formatDateTime(rowData?.createdDate)}
              </span>
            </div>
          );

        case "status":
          return (
            <Chip size="sm" color={getStatusColor(rowData?.status)} variant="flat">
              {rowData?.status || "-"}
            </Chip>
          );

        case "approval":
          return (
            <div className="flex max-w-[220px] flex-col">
              <span className="text-sm font-medium">
                {rowData?.approvedByName || "-"}
              </span>
              <span className="text-xs text-default-500">
                {formatDateTime(rowData?.approvalDate)}
              </span>
              {rowData?.approvalRemarks && (
                <span
                  className="truncate text-xs text-default-500"
                  title={rowData.approvalRemarks}
                >
                  {rowData.approvalRemarks}
                </span>
              )}
            </div>
          );

        case "actions": {
          const isPending =
            String(rowData?.status || "").toUpperCase() === "PENDING";

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

                <DropdownMenu aria-label="Portal credential actions">
                  <DropdownItem
                    key="approve"
                    startContent={<Check size={15} />}
                    onPress={() => handleOpenDecision(rowData, "APPROVED")}
                  >
                    Approve
                  </DropdownItem>

                  <DropdownItem
                    key="reject"
                    color="danger"
                    startContent={<X size={15} />}
                    onPress={() => handleOpenDecision(rowData, "REJECTED")}
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
    },
    [routeUserId],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
          Client Portal Credentials Approval
        </h1>

        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search portal, username, project..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchValue}
            onClear={() => setSearchValue("")}
            onValueChange={(value) => setSearchValue(value || "")}
          />

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
                  setPagination((prev) => ({ ...prev, page: 1 }));
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
          Total {approvalQueue?.totalRequests || requestList.length} requests
          {searchValue.trim()
            ? ` (${filteredRequestList.length} matching on this page)`
            : ""}
        </span>
      </div>
    );
  }, [
    statusFilter,
    searchValue,
    approvalQueue,
    requestList.length,
    filteredRequestList.length,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {pagination.page} of {totalPages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={pagination.page}
          total={totalPages}
          onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pagination.page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pagination.page >= totalPages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [pagination.page, totalPages, onPreviousPage, onNextPage]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Table
          isHeaderSticky
          removeWrapper={false}
          aria-label="Client portal credentials approval queue table"
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
            isLoading={loading}
            emptyContent={
              loading ? "Loading..." : "No portal credential requests found"
            }
            items={filteredRequestList}
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
                    {selectedDecision === "APPROVED"
                      ? "Approve Portal Credentials"
                      : "Reject Portal Credentials"}
                  </h2>
                  <p className="mt-1 text-xs font-normal text-default-500">
                    {selectedRequest?.portalName || "-"} •{" "}
                    {selectedRequest?.portalUrl || "-"}
                  </p>
                </div>
              </ModalHeader>

              <form
                onSubmit={handleDecisionSubmit(onSubmitDecision, () => {
                  addToast({
                    title: "ERROR",
                    description: "Please enter a remark.",
                    color: "danger",
                  });
                })}
              >
                <ModalBody className="space-y-4 px-6 py-5">
                  <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-600">
                    <p>Username: {selectedRequest?.username || "-"}</p>
                    <p>Remarks: {selectedRequest?.remarks || "-"}</p>
                  </div>

                  <Controller
                    name="approvalRemarks"
                    control={decisionControl}
                    render={({ field }) => (
                      <Textarea
                        label="Approval Remarks"
                        isRequired
                        minRows={3}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!decisionErrors.approvalRemarks}
                        errorMessage={decisionErrors.approvalRemarks?.message}
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
                      selectedDecision === "APPROVED" ? "success" : "danger"
                    }
                    type="submit"
                    isLoading={submitLoading}
                  >
                    {selectedDecision === "APPROVED" ? "Approve" : "Reject"}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PortalCredentialsApproval;
