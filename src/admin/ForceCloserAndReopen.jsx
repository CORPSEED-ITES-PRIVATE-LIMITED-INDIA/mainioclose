import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
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
  useDisclosure,
  addToast,
} from "@heroui/react";
import { Check, ChevronDown, EllipsisVertical, Search, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  decideProjectLifecycleRequest,
  getPendingProjectLifecycleRequests,
} from "../toolkit/slices/operationSlice";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PROJECT NO.", uid: "projectNumber" },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "ACTION TYPE", uid: "actionType" },
  { name: "CURRENT STATUS", uid: "currentStatus" },
  { name: "REQUESTED BY", uid: "requestedBy" },
  { name: "REASON", uid: "requestReason" },
  { name: "REQUESTED AT", uid: "requestedAt" },
  { name: "STATUS", uid: "requestStatus" },
  { name: "ACTION", uid: "actions" },
];

const initialVisibleColumns = [
  "id",
  "projectNumber",
  "projectName",
  "actionType",
  "currentStatus",
  "requestedBy",
  "requestReason",
  "requestedAt",
  "requestStatus",
  "actions",
];

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ForceCloserAndReopen = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const decisionModal = useDisclosure();

  const [requestList, setRequestList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [searchBy, setSearchBy] = useState("projectNumber");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(initialVisibleColumns),
  );

  // As requested: page starts at 1 and size is 50.
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [decisionData, setDecisionData] = useState({
    decision: "",
    reviewRemark: "",
  });

  const [decisionErrors, setDecisionErrors] = useState({
    decision: "",
    reviewRemark: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await dispatch(
        getPendingProjectLifecycleRequests({
          adminUserId: Number(userId),
          page: paginationData.page,
          size: paginationData.size,
        }),
      ).unwrap();

      setRequestList(response?.content || []);
      setTotalElements(response?.totalElements || 0);
      setTotalPages(response?.totalPages || 1);
    } catch (error) {
      setRequestList([]);

      addToast({
        title: "ERROR",
        description:
          error?.message || "Unable to fetch pending lifecycle requests.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, paginationData.page, paginationData.size, userId]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = filterValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return requestList;
    }

    return requestList.filter((item) => {
      const valueBySearchType = {
        projectNumber: item?.projectNumber,
        projectName: item?.projectName,
        requestedBy: item?.requestedByName,
        actionType: item?.actionType,
      };

      return String(valueBySearchType[searchBy] || "")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [filterValue, requestList, searchBy]);

  const openDecisionModal = (request, decision) => {
    setSelectedRequest(request);

    setDecisionData({
      decision,
      reviewRemark: "",
    });

    setDecisionErrors({
      decision: "",
      reviewRemark: "",
    });

    decisionModal.onOpen();
  };

  const handleDecisionSubmit = async (event) => {
    event.preventDefault();

    const errors = {
      decision: decisionData.decision ? "" : "Decision is required",
      reviewRemark: decisionData.reviewRemark.trim()
        ? ""
        : "Review remark is required",
    };

    setDecisionErrors(errors);

    if (errors.decision || errors.reviewRemark) {
      return;
    }

    if (!selectedRequest?.id) {
      addToast({
        title: "ERROR",
        description: "No lifecycle request selected.",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        decideProjectLifecycleRequest({
          requestId: Number(selectedRequest.id),
          data: {
            decision: decisionData.decision,
            reviewedById: Number(userId),
            reviewRemark: decisionData.reviewRemark.trim(),
          },
        }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description: `Request ${
          decisionData.decision === "APPROVE" ? "approved" : "rejected"
        } successfully.`,
        color: "success",
      });

      decisionModal.onClose();
      fetchPendingRequests();
    } catch (error) {
      addToast({
        title: "ERROR",
        description:
          error?.message || "Unable to update the lifecycle request.",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onNextPage = () => {
    if (paginationData.page < totalPages) {
      setPaginationData((previous) => ({
        ...previous,
        page: previous.page + 1,
      }));
    }
  };

  const onPreviousPage = () => {
    if (paginationData.page > 1) {
      setPaginationData((previous) => ({
        ...previous,
        page: previous.page - 1,
      }));
    }
  };

  const renderCell = (request, columnKey) => {
    switch (columnKey) {
      case "id":
        return (
          <span className="text-[12.5px] font-medium">
            {request?.id || "-"}
          </span>
        );

      case "projectNumber":
        return (
          <span className="text-[12.5px] whitespace-nowrap font-medium text-primary">
            {request?.projectNumber || "-"}
          </span>
        );

      case "projectName":
        return (
          <span className="text-[12.5px]">{request?.projectName || "-"}</span>
        );

      case "actionType":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={request?.actionType === "FORCE_CLOSE" ? "danger" : "primary"}
          >
            {request?.actionType === "FORCE_CLOSE" ? "Force Close" : "Reopen"}
          </Chip>
        );

      case "currentStatus":
        return (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-medium">
              {request?.currentProjectStatusName || "-"}
            </span>

            {request?.previousProjectStatusName && (
              <span className="text-[11.5px] text-default-400">
                Previous: {request.previousProjectStatusName}
              </span>
            )}
          </div>
        );

      case "requestedBy":
        return (
          <div className="flex flex-col">
            <span className="text-[12.5px]">
              {request?.requestedByName || "-"}
            </span>
            <span className="text-[11.5px] text-default-400">
              ID: {request?.requestedById || "-"}
            </span>
          </div>
        );

      case "requestReason":
        return (
          <p className="max-w-[250px] whitespace-normal text-[12.5px]">
            {request?.requestReason || "-"}
          </p>
        );

      case "requestedAt":
        return (
          <span className="text-[12.5px] whitespace-nowrap">
            {formatDateTime(request?.requestedAt)}
          </span>
        );

      case "requestStatus":
        return (
          <Chip size="sm" color="warning" variant="flat">
            {request?.requestStatus || "PENDING"}
          </Chip>
        );

      case "actions":
        return (
          <div className="flex justify-center">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Request actions"
                >
                  <EllipsisVertical className="w-4 h-4 text-default-300" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Request actions">
                <DropdownItem
                  key="approve"
                  color="success"
                  startContent={<Check className="w-3.5 h-3.5" />}
                  onPress={() => openDecisionModal(request, "APPROVE")}
                >
                  Approve
                </DropdownItem>

                <DropdownItem
                  key="reject"
                  color="danger"
                  className="text-danger"
                  startContent={<X className="w-3.5 h-3.5" />}
                  onPress={() => openDecisionModal(request, "REJECT")}
                >
                  Reject
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return "-";
    }
  };

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <Select
            aria-label="Search by"
            size="sm"
            className="w-[150px]"
            selectedKeys={new Set([searchBy])}
            onSelectionChange={(keys) => {
              setSearchBy(Array.from(keys)[0] || "projectNumber");
              setFilterValue("");
            }}
          >
            <SelectItem key="projectNumber">Project number</SelectItem>
            <SelectItem key="projectName">Project name</SelectItem>
            <SelectItem key="requestedBy">Requested by</SelectItem>
            <SelectItem key="actionType">Action type</SelectItem>
          </Select>

          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search ..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
        </div>

        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
            <Button
              size="sm"
              variant="flat"
              endContent={<ChevronDown className="w-3.5 h-3.5" />}
            >
              Columns
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="Table columns"
            closeOnSelect={false}
            disallowEmptySelection
            selectionMode="multiple"
            selectedKeys={visibleColumns}
            onSelectionChange={setVisibleColumns}
          >
            {columns.map((column) => (
              <DropdownItem key={column.uid}>{column.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {totalElements} pending requests
        </span>

        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
            value={paginationData.size}
            onChange={(e) => {
              setPaginationData((previous) => ({
                ...previous,
                size: Number(e.target.value),
                page: 1,
              }));
            }}
          >
            <option value="15">15</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="w-[30%] text-[12.5px] text-default-400">
        Showing {filteredRequests.length} of {totalElements} pending requests
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        page={paginationData.page}
        total={totalPages}
        onChange={(page) =>
          setPaginationData((previous) => ({
            ...previous,
            page,
          }))
        }
      />

      <div className="hidden sm:flex w-[30%] justify-end gap-2">
        <Button
          size="sm"
          variant="flat"
          isDisabled={paginationData.page <= 1}
          onPress={onPreviousPage}
        >
          Previous
        </Button>

        <Button
          size="sm"
          variant="flat"
          isDisabled={paginationData.page >= totalPages}
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Project Reopen and Close Approval
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Pending lifecycle request table"
        topContent={topContent}
        topContentPlacement="outside"
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
          items={filteredRequests}
          isLoading={isLoading}
          loadingContent={<span>Loading pending requests...</span>}
          emptyContent="No pending force-close or reopen requests found."
        >
          {(request) => (
            <TableRow key={request.id}>
              {(columnKey) => (
                <TableCell>{renderCell(request, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={decisionModal.isOpen}
        onOpenChange={decisionModal.onOpenChange}
        size="lg"
        isDismissable={!isSubmitting}
        hideCloseButton={isSubmitting}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleDecisionSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                {decisionData.decision === "APPROVE"
                  ? "Approve Lifecycle Request"
                  : "Reject Lifecycle Request"}

                <span className="text-xs font-normal text-default-500">
                  Project: {selectedRequest?.projectNumber || "-"}
                </span>
              </ModalHeader>

              <ModalBody className="gap-4">
                <div className="rounded-lg border border-default-200 bg-default-50 p-3 text-sm">
                  <p>
                    <span className="text-default-500">Action: </span>
                    <span className="font-semibold">
                      {selectedRequest?.actionType === "FORCE_CLOSE"
                        ? "Force Close"
                        : "Reopen"}
                    </span>
                  </p>

                  <p className="mt-2">
                    <span className="text-default-500">Request Reason: </span>
                    <span className="font-medium">
                      {selectedRequest?.requestReason || "-"}
                    </span>
                  </p>
                </div>

                <Select
                  label="Decision"
                  isRequired
                  selectedKeys={
                    decisionData.decision
                      ? new Set([decisionData.decision])
                      : new Set([])
                  }
                  isInvalid={Boolean(decisionErrors.decision)}
                  errorMessage={decisionErrors.decision}
                  onSelectionChange={(keys) => {
                    const decision = Array.from(keys)[0] || "";

                    setDecisionData((previous) => ({
                      ...previous,
                      decision,
                    }));

                    setDecisionErrors((previous) => ({
                      ...previous,
                      decision: "",
                    }));
                  }}
                >
                  <SelectItem key="APPROVE">Approve</SelectItem>
                  <SelectItem key="REJECT">Reject</SelectItem>
                </Select>

                <Textarea
                  label="Review Remark"
                  placeholder="Enter review remark"
                  isRequired
                  minRows={4}
                  value={decisionData.reviewRemark}
                  isInvalid={Boolean(decisionErrors.reviewRemark)}
                  errorMessage={decisionErrors.reviewRemark}
                  onChange={(event) => {
                    setDecisionData((previous) => ({
                      ...previous,
                      reviewRemark: event.target.value,
                    }));

                    setDecisionErrors((previous) => ({
                      ...previous,
                      reviewRemark: "",
                    }));
                  }}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  color={
                    decisionData.decision === "REJECT" ? "danger" : "success"
                  }
                >
                  {decisionData.decision === "REJECT"
                    ? "Reject Request"
                    : "Approve Request"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ForceCloserAndReopen;
