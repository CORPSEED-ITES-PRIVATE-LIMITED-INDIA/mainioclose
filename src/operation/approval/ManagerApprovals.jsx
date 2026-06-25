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
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@heroui/react";
import {
  CalendarDays,
  ChevronDown,
  EllipsisVertical,
  Eye,
  Search,
} from "lucide-react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getPendingResponsibleManagerReopenRequests,
  updateResponsibleManagerReopenDecision,
} from "../../toolkit/slices/operationSlice";

const columns = [
  { name: "PROJECT", uid: "project" },
  { name: "DETECTED AT", uid: "detectedAt" },
  { name: "RESPONSIBLE", uid: "responsible" },
  { name: "REQUESTED BY", uid: "requestedBy" },
  { name: "REASON", uid: "reason" },
  { name: "STATUS", uid: "status" },
  { name: "REQUESTED AT", uid: "requestedAt" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "project",
  "detectedAt",
  "responsible",
  "requestedBy",
  "reason",
  "status",
  "requestedAt",
  "actions",
];

const decisionOptions = [
  {
    label: "Approved",
    value: "APPROVED",
  },
  {
    label: "Disapproved",
    value: "DISAPPROVED",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "DISAPPROVED":
    case "REJECTED":
      return "danger";
    case "PENDING_RESPONSIBLE_MANAGER_APPROVAL":
    case "PENDING_REQUESTER_MANAGER_APPROVAL":
      return "warning";
    default:
      return "default";
  }
};

const getDecisionColor = (decision) => {
  switch (decision) {
    case "APPROVED":
      return "success";
    case "DISAPPROVED":
      return "danger";
    default:
      return "primary";
  }
};

const formatStatus = (value = "") => {
  return String(value || "-")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = dayjs(value);
  return date.isValid() ? date.format("DD-MM-YYYY hh:mm A") : "-";
};

const ManagerApprovals = () => {
  const dispatch = useDispatch();
  const { userId, managerId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);

  const resolvedManagerId =
    managerId ||
    userId ||
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.employeeId;

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionData, setDecisionData] = useState({
    decision: "",
    remarks: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPendingRequests = useCallback(() => {
    if (!resolvedManagerId) {
      addToast({
        title: "Manager missing",
        description: "Manager ID not found.",
        color: "danger",
      });
      return;
    }

    setLoading(true);

    dispatch(
      getPendingResponsibleManagerReopenRequests(resolvedManagerId),
    ).then((resp) => {
      setLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        setRequests(Array.isArray(resp.payload) ? resp.payload : []);
      } else {
        addToast({
          title: "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch pending reopen requests.",
          color: "danger",
        });
      }
    });
  }, [dispatch, resolvedManagerId]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtered = [...requests];

    if (filterValue?.trim()) {
      const search = filterValue.toLowerCase();

      filtered = filtered.filter((item) =>
        [
          item?.projectName,
          item?.projectNo,
          item?.detectedAtMilestoneName,
          item?.responsibleMilestoneName,
          item?.requestedByName,
          item?.requesterManagerName,
          item?.responsibleManagerName,
          item?.requestReason,
          item?.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search)),
      );
    }

    return filtered;
  }, [requests, filterValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  const handleOpenDecisionModal = (request) => {
    setSelectedRequest(request);
    setDecisionData({
      decision: "",
      remarks: "",
    });
    setDecisionModalOpen(true);
  };

  const handleSubmitDecision = () => {
    if (!selectedRequest?.id) {
      addToast({
        title: "Request missing",
        description: "Reopen request ID not found.",
        color: "danger",
      });
      return;
    }

    if (!decisionData.decision) {
      addToast({
        title: "Decision required",
        description: "Please select approved or disapproved.",
        color: "danger",
      });
      return;
    }

    if (!decisionData.remarks?.trim()) {
      addToast({
        title: "Remarks required",
        description: "Please enter remarks.",
        color: "danger",
      });
      return;
    }

    const payload = {
      actionById: Number(resolvedManagerId),
      decision: decisionData.decision,
      remarks: decisionData.remarks.trim(),
    };

    setSubmitLoading(true);

    dispatch(
      updateResponsibleManagerReopenDecision({
        requestId: Number(selectedRequest.id),
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Decision updated successfully!",
          color: "success",
        });

        setDecisionModalOpen(false);
        setSelectedRequest(null);
        setDecisionData({
          decision: "",
          remarks: "",
        });

        fetchPendingRequests();
      } else {
        addToast({
          title: resp?.payload?.status || "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to update decision.",
          color: "danger",
        });
      }
    });
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "project":
        return (
          <div className="flex max-w-[240px] flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {rowData?.projectName || "-"}
            </span>
            <span className="text-xs text-default-500">
              {rowData?.projectNo || "-"}
            </span>
          </div>
        );

      case "detectedAt":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {rowData?.detectedAtMilestoneName || "-"}
            </span>
            <span className="text-xs text-default-500">
              Assignment ID: {rowData?.detectedAtAssignmentId || "-"}
            </span>
          </div>
        );

      case "responsible":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {rowData?.responsibleMilestoneName || "-"}
            </span>
            <span className="text-xs text-default-500">
              Assignment ID: {rowData?.responsibleAssignmentId || "-"}
            </span>
          </div>
        );

      case "requestedBy":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {rowData?.requestedByName || "-"}
            </span>
            <span className="text-xs text-default-500">
              Manager: {rowData?.requesterManagerName || "-"}
            </span>
          </div>
        );

      case "reason":
        return (
          <p
            className="max-w-[260px] truncate text-sm text-default-700"
            title={rowData?.requestReason || "-"}
          >
            {rowData?.requestReason || "-"}
          </p>
        );

      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(rowData?.status)}
          >
            {formatStatus(rowData?.status)}
          </Chip>
        );

      case "requestedAt":
        return (
          <div className="flex items-center gap-2 text-xs text-default-600">
            <CalendarDays className="h-4 w-4 text-default-400" />
            <span>{formatDateTime(rowData?.requestedAt)}</span>
          </div>
        );

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisVertical size={18} />
              </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Manager approval actions">
              <DropdownItem
                key="update"
                startContent={<Eye size={15} />}
                onPress={() => handleOpenDecisionModal(rowData)}
              >
                Update Status
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={() => {
              setFilterValue("");
              setFilteration((prev) => ({ ...prev, page: 1 }));
            }}
            onValueChange={(value) => {
              setFilterValue(value || "");
              setFilteration((prev) => ({ ...prev, page: 1 }));
            }}
          />

          <div className="flex gap-3">
            <Button
              color="primary"
              variant="flat"
              onPress={fetchPendingRequests}
            >
              Refresh
            </Button>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown size={16} />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Visible columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid}>{column.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {filteredItems.length} pending requests
          </span>

          <label className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
              value={filteration.size}
              onChange={(e) => {
                setFilteration({
                  page: 1,
                  size: Number(e.target.value),
                });
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    filteredItems.length,
    filteration.size,
    visibleColumns,
    fetchPendingRequests,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-small text-default-400">
          Page {filteration.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={filteration.page}
          total={pages}
          onChange={(page) => {
            setFilteration((prev) => ({
              ...prev,
              page,
            }));
          }}
        />
      </div>
    );
  }, [filteration.page, pages]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-sans text-2xl font-medium">Manager Approvals</h1>
        </div>

        <Table
          isHeaderSticky
          aria-label="Manager reopen approvals table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
            table: "w-full",
          }}
        >
          <TableHeader columns={headerColumns}>
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
            emptyContent={loading ? "Loading..." : "No pending requests found"}
            items={paginatedItems}
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
        isOpen={decisionModalOpen}
        onOpenChange={(open) => {
          setDecisionModalOpen(open);

          if (!open) {
            setSelectedRequest(null);
            setDecisionData({
              decision: "",
              remarks: "",
            });
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b">
                Responsible Manager Decision
                <span className="text-xs font-normal text-default-500">
                  Approve or disapprove the project reopen request.
                </span>
              </ModalHeader>

              <ModalBody className="space-y-4 py-5">
                <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Project
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedRequest?.projectName || "-"}
                      </p>
                      <p className="text-xs text-default-500">
                        {selectedRequest?.projectNo || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Current Status
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(selectedRequest?.status)}
                      >
                        {formatStatus(selectedRequest?.status)}
                      </Chip>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Detected At
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedRequest?.detectedAtMilestoneName || "-"}
                      </p>
                      <p className="text-xs text-default-500">
                        Assignment ID:{" "}
                        {selectedRequest?.detectedAtAssignmentId || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-default-400">
                        Responsible Milestone
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedRequest?.responsibleMilestoneName || "-"}
                      </p>
                      <p className="text-xs text-default-500">
                        Assignment ID:{" "}
                        {selectedRequest?.responsibleAssignmentId || "-"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-default-400">
                        Request Reason
                      </p>
                      <p className="mt-1 whitespace-pre-wrap rounded-lg bg-content1 p-3 text-sm text-default-700">
                        {selectedRequest?.requestReason || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <Select
                  label="Decision"
                  placeholder="Select decision"
                  isRequired
                  selectedKeys={
                    decisionData.decision
                      ? new Set([decisionData.decision])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)?.[0];

                    setDecisionData((prev) => ({
                      ...prev,
                      decision: selected ? String(selected) : "",
                    }));
                  }}
                >
                  {decisionOptions.map((item) => (
                    <SelectItem key={item.value} textValue={item.label}>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getDecisionColor(item.value)}
                      >
                        {item.label}
                      </Chip>
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  label="Remarks"
                  placeholder="Enter approval/disapproval remarks..."
                  isRequired
                  minRows={4}
                  value={decisionData.remarks}
                  onChange={(e) =>
                    setDecisionData((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                />
              </ModalBody>

              <ModalFooter className="border-t">
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  color={getDecisionColor(decisionData.decision)}
                  isLoading={submitLoading}
                  onPress={handleSubmitDecision}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ManagerApprovals;
