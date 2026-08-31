import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  useDisclosure,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Chip,
  addToast,
} from "@heroui/react";
import { ChevronDown, Search, EllipsisVertical } from "lucide-react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  assignTechnicalResearchCase,
  getAllTechnicalResearchCases,
} from "../../toolkit/slices/operationSlice";
import { getDashboardUsersByHeirarchy } from "../../toolkit/slices/dashboardSlice";
import NewSelect from "../../components/NewSelect";
import {
  capitalize,
  formatStatusLabel,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_COLOR_CODE,
  PRIORITY_COLOR_CODE,
} from "./technicalResearchShared";

export const columns = [
  { name: "CASE NUMBER", uid: "caseNumber" },
  { name: "SUBJECT", uid: "subject" },
  { name: "PRODUCT", uid: "productName" },
  { name: "RAISED BY", uid: "raisedByName" },
  { name: "STATUS", uid: "status" },
  { name: "PRIORITY", uid: "priority" },
  { name: "DUE DATE", uid: "dueDate" },
  { name: "CREATED", uid: "createdAt" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "caseNumber",
  "subject",
  "productName",
  "raisedByName",
  "status",
  "priority",
  "dueDate",
  "createdAt",
  "actions",
];

const TechnicalResearch = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const viewModal = useDisclosure();
  const assignModal = useDisclosure();
  const [selectedCase, setSelectedCase] = useState(null);
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const data = useSelector((state) => state.operation.technicalResearchList);
  const count = useSelector((state) => state.operation.technicalResearchCount);
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("--");
  const [priority, setPriority] = useState("--");

  useEffect(() => {
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch, userId]);

  const fetchList = React.useCallback(() => {
    dispatch(
      getAllTechnicalResearchCases({
        userId,
        status,
        priority,
        search: filterValue,
        page,
        size: rowsPerPage,
      }),
    );
  }, [dispatch, userId, page, rowsPerPage, status, priority, filterValue]);

  useEffect(() => {
    const timer = setTimeout(fetchList, 300);

    return () => clearTimeout(timer);
  }, [fetchList]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const handleAssignSubmit = () => {
    if (!assigneeUserId) {
      addToast({ title: "Please select an assignee", color: "danger" });
      return;
    }

    setIsAssigning(true);
    dispatch(
      assignTechnicalResearchCase({
        caseId: selectedCase?.id,
        assigneeUserId,
        assignedByUserId: userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Assignee updated successfully.",
            color: "success",
          });
          assignModal.onClose();
          setAssigneeUserId("");
          setSelectedCase(null);
          fetchList();
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload || "Failed to update assignee.",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong.",
          color: "danger",
        }),
      )
      .finally(() => setIsAssigning(false));
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "caseNumber":
        return (
          <p className="text-[12.5px] font-medium">
            {rowData?.caseNumber || "-"}
          </p>
        );
      case "subject":
        return (
          <p
            className="text-[12.5px] max-w-[260px] truncate"
            title={rowData?.subject}
          >
            {rowData?.subject || "-"}
          </p>
        );
      case "productName":
        return (
          <p className="text-[12.5px] capitalize">
            {rowData?.productName || "-"}
          </p>
        );
      case "raisedByName":
        return (
          <p className="text-[12.5px] capitalize">
            {rowData?.raisedByName || "-"}
          </p>
        );
      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={STATUS_COLOR_CODE[rowData?.status] || "default"}
          >
            {formatStatusLabel(rowData?.status)}
          </Chip>
        );
      case "priority":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={PRIORITY_COLOR_CODE[rowData?.priority] || "default"}
          >
            {capitalize(rowData?.priority)}
          </Chip>
        );
      case "dueDate":
        return (
          <p className="text-[12.5px]">
            {rowData?.dueDate
              ? dayjs(rowData.dueDate).format("DD-MM-YYYY")
              : "-"}
          </p>
        );
      case "createdAt":
        return (
          <p className="text-[12.5px]">
            {rowData?.createdAt
              ? dayjs(rowData.createdAt).format("DD-MM-YYYY hh:mm A")
              : "-"}
          </p>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="w-4 h-4 text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Research case actions"
                onAction={(key) => {
                  setSelectedCase(rowData);
                  if (key === "view") {
                    viewModal.onOpen();
                  } else if (key === "assign") {
                    setAssigneeUserId(String(rowData?.assigneeUserId || ""));
                    assignModal.onOpen();
                  }
                }}
              >
                <DropdownItem key="view">View details</DropdownItem>
                <DropdownItem key="assign">Update assignee</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) setPage(page + 1);
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search by case number, subject..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {STATUS_OPTIONS.find((s) => s.key === status)?.label ||
                    "ALL"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filter by status"
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  const key = Array.from(e)[0];
                  setStatus(key);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {PRIORITY_OPTIONS.find((p) => p.key === priority)?.label ||
                    "ALL"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filter by priority"
                selectedKeys={[priority]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  const key = Array.from(e)[0];
                  setPriority(key);
                  setPage(1);
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} research case{count === 1 ? "" : "s"}
          </span>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
              Rows per page:
              <select
                className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
                onChange={onRowsPerPageChange}
                value={rowsPerPage}
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    onClear,
    status,
    priority,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400" />
        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, pages]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Research
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Technical research cases table with pagination and filters"
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
        <TableBody emptyContent={"No research cases found"} items={data || []}>
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
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="2xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedCase?.caseNumber || "Research case"}
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto gap-3">
                <div className="flex flex-wrap gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={STATUS_COLOR_CODE[selectedCase?.status] || "default"}
                  >
                    {formatStatusLabel(selectedCase?.status)}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      PRIORITY_COLOR_CODE[selectedCase?.priority] || "default"
                    }
                  >
                    {capitalize(selectedCase?.priority)}
                  </Chip>
                </div>
                <div>
                  <p className="text-[11.5px] text-default-400">Subject</p>
                  <p className="text-[13px]">{selectedCase?.subject || "-"}</p>
                </div>
                <div>
                  <p className="text-[11.5px] text-default-400">
                    Business context
                  </p>
                  <p className="text-[13px] whitespace-pre-wrap">
                    {selectedCase?.businessContext || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[11.5px] text-default-400">
                    Research scope
                  </p>
                  <p className="text-[13px] whitespace-pre-wrap">
                    {selectedCase?.researchScope || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11.5px] text-default-400">Product</p>
                    <p className="text-[13px]">
                      {selectedCase?.productName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-default-400">
                      Raised by
                    </p>
                    <p className="text-[13px]">
                      {selectedCase?.raisedByName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-default-400">Due date</p>
                    <p className="text-[13px]">
                      {selectedCase?.dueDate
                        ? dayjs(selectedCase.dueDate).format("DD-MM-YYYY")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-default-400">
                      Assignment count
                    </p>
                    <p className="text-[13px]">
                      {selectedCase?.assignmentCount ?? 0}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={assignModal.isOpen}
        onOpenChange={(open) => {
          assignModal.onOpenChange(open);
          if (!open) {
            setAssigneeUserId("");
            setSelectedCase(null);
          }
        }}
        size="md"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Assignee
                <span className="text-xs font-normal text-default-500">
                  {selectedCase?.caseNumber}
                </span>
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto">
                <NewSelect
                  label="Assignee"
                  isRequired
                  data={dashboardUsers}
                  labelKey="name"
                  valueKey="id"
                  value={assigneeUserId}
                  onChange={(value) => setAssigneeUserId(value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={!assigneeUserId}
                  isLoading={isAssigning}
                  onPress={handleAssignSubmit}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TechnicalResearch;
