import {
  addToast,
  Button,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  EllipsisVertical,
  Eye,
  IndianRupee,
  Search,
  User2,
} from "lucide-react";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getSalesProjectStatusDashboard } from "../../toolkit/slices/operationSlice";

const columns = [
  { name: "PROJECT NO.", uid: "projectNo", sortable: true },
  { name: "DATE", uid: "projectDate", sortable: true },
  { name: "PROJECT", uid: "projectName", sortable: true },
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "CONTACT", uid: "contactName" },
  { name: "AMOUNT", uid: "totalAmount", sortable: true },
  { name: "PAYMENT", uid: "paymentTypeName" },
  { name: "PROGRESS", uid: "progress" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "projectNo",
  "projectDate",
  "projectName",
  "companyName",
  "contactName",
  "totalAmount",
  "paymentTypeName",
  "progress",
  "status",
  "actions",
];

const statusOptions = [
  { label: "ALL", uid: "ALL" },
  { label: "OPEN", uid: "OPEN" },
  { label: "IN PROGRESS", uid: "IN_PROGRESS" },
  { label: "COMPLETED", uid: "COMPLETED" },
  { label: "CANCELLED", uid: "CANCELLED" },
];

const capitalize = (s = "") => {
  return String(s)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("DD-MM-YYYY") : "-";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("DD-MM-YYYY HH:mm") : "-";
};

const inrCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const getProjectStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "warning";
    case "IN_PROGRESS":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "REJECTED":
      return "danger";
    default:
      return "default";
  }
};

const getMilestoneStatusColor = (status) => {
  switch (status) {
    case "NEW":
      return "default";
    case "IN_PROGRESS":
      return "primary";
    case "COMPLETED":
      return "success";
    case "ON_HOLD":
      return "warning";
    case "REWORK":
    case "REJECTED":
      return "danger";
    default:
      return "default";
  }
};

const getUniqueMilestones = (milestones = []) => {
  const map = new Map();

  milestones.forEach((milestone) => {
    const key = `${milestone?.assignmentId || ""}-${milestone?.milestoneId || ""}`;

    if (!map.has(key)) {
      map.set(key, milestone);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => Number(a?.milestoneOrder || 0) - Number(b?.milestoneOrder || 0),
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-default-200 bg-content1 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-default-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value || "-"}
      </p>
    </div>
  );
};

const SalesProject = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const projectDrawer = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 1,
  });

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "projectDate",
    direction: "descending",
  });

  const [filteration, setFilteration] = useState({
    userId,
    salesPersonId: userId,
    status: "ALL",
    search: "",
    page: 1,
    size: 10,
  });

  const [selectedProject, setSelectedProject] = useState(null);

  const projects = dashboardData?.content || [];
  const count = dashboardData?.totalElements || 0;
  const pages = dashboardData?.totalPages || 1;

  const fetchSalesProjects = useCallback(() => {
    setLoading(true);

    dispatch(getSalesProjectStatusDashboard(filteration)).then((resp) => {
      setLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        setDashboardData(resp.payload || {});
      } else {
        addToast({
          title: "Failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch sales project dashboard.",
          color: "danger",
        });
      }
    });
  }, [dispatch, filteration]);

  useEffect(() => {
    fetchSalesProjects();
  }, [fetchSalesProjects]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const getSortValue = (item, key) => {
    switch (key) {
      case "projectNo":
        return item?.projectNo || "";
      case "projectDate":
        return item?.projectDate || item?.createdDate || "";
      case "projectName":
        return item?.projectName || "";
      case "companyName":
        return item?.companyName || "";
      case "totalAmount":
        return Number(item?.totalAmount || 0);
      case "status":
        return item?.projectStatusName || "";
      default:
        return item?.[key] || "";
    }
  };

  const sortedItems = useMemo(() => {
    return [...projects].sort((a, b) => {
      const first = getSortValue(a, sortDescriptor.column);
      const second = getSortValue(b, sortDescriptor.column);

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [projects, sortDescriptor]);

  const handleActionsClick = (key, rowData) => {
    if (key === "view") {
      setSelectedProject(rowData);
      projectDrawer.onOpen();
    }
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "projectNo":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-foreground">
              {rowData?.projectNo || "-"}
            </p>
            <p className="text-[11px] text-default-500">
              {rowData?.estimateNumber || "-"}
            </p>
          </div>
        );

      case "projectDate":
        return (
          <div className="flex items-center gap-2 text-xs">
            <CalendarDays className="h-4 w-4 text-default-400" />
            <span>
              {formatDate(rowData?.projectDate || rowData?.createdDate)}
            </span>
          </div>
        );

      case "projectName":
        return (
          <div className="flex flex-col gap-1">
            <p className="max-w-[220px] truncate text-sm font-medium text-foreground">
              {rowData?.projectName || "-"}
            </p>
            <p className="max-w-[220px] truncate text-xs text-default-500">
              {rowData?.productName || "-"}
            </p>
          </div>
        );

      case "companyName":
        return (
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-default-400" />
            <div className="min-w-0">
              <p className="max-w-[220px] truncate text-sm font-medium">
                {rowData?.companyName || "-"}
              </p>
              <p className="max-w-[220px] truncate text-xs text-default-500">
                {rowData?.unitName || "-"}
              </p>
            </div>
          </div>
        );

      case "contactName":
        return (
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-default-400" />
            <span className="text-sm">{rowData?.contactName || "-"}</span>
          </div>
        );

      case "totalAmount":
        return (
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-1 text-sm font-semibold">
              <IndianRupee className="h-3.5 w-3.5" />
              {inrCurrency(rowData?.totalAmount)}
            </p>
            <p className="text-xs text-default-500">
              Due: {inrCurrency(rowData?.dueAmount)}
            </p>
          </div>
        );

      case "paymentTypeName":
        return (
          <Chip size="sm" variant="flat" color="primary">
            {rowData?.paymentTypeName || "-"}
          </Chip>
        );

      case "progress": {
        const percentage = Number(rowData?.milestoneCompletionPercentage || 0);

        return (
          <div className="min-w-[160px]">
            <div className="mb-1 flex justify-between text-xs">
              <span>
                {rowData?.completedMilestones || 0}/
                {rowData?.totalMilestones || 0}
              </span>
              <span>{percentage}%</span>
            </div>
            <Progress
              size="sm"
              value={percentage}
              color={percentage === 100 ? "success" : "primary"}
              aria-label="Milestone progress"
            />
          </div>
        );
      }

      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getProjectStatusColor(rowData?.projectStatusName)}
          >
            {capitalize(rowData?.projectStatusName || "-")}
          </Chip>
        );

      case "actions":
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-400" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  handleActionsClick(key, rowData);
                }}
              >
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                >
                  View Details
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (filteration.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filteration.page, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filteration.page]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");

    setFilteration((prev) => ({
      ...prev,
      search: value || "",
      page: 1,
    }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");

    setFilteration((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {capitalize(filteration.status)}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Project status filter"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];

                  setFilteration((prev) => ({
                    ...prev,
                    status: selected || prev.status,
                    page: 1,
                  }));
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.label)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown />} variant="flat">
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
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {count} projects
          </span>

          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
              onChange={onRowsPerPageChange}
              value={filteration.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    count,
    filterValue,
    filteration.status,
    filteration.size,
    onClear,
    onRowsPerPageChange,
    onSearchChange,
    visibleColumns,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={filteration.page}
          total={pages}
          onChange={(page) => {
            setFilteration((prev) => ({ ...prev, page }));
          }}
        />

        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={pages === 1 || filteration.page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={pages === 1 || filteration.page === pages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    count,
    filteration.page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  const selectedDepartments = selectedProject?.departments || [];

  return (
    <>
      {loading && <LoadingSpinner />}

      <div>
        <div className="mb-4">
          <h1 className="font-sans text-2xl font-medium">Sales Projects</h1>
        </div>

        <Table
          isHeaderSticky
          aria-label="Sales project dashboard table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "max-h-[62vh] w-full",
            table: "w-full",
          }}
          selectedKeys={selectedKeys}
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody emptyContent="No sales projects found" items={sortedItems}>
            {(item) => (
              <TableRow key={item.projectId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Drawer
        size="5xl"
        placement="right"
        isOpen={projectDrawer.isOpen}
        onOpenChange={(open) => {
          projectDrawer.onOpenChange(open);

          if (!open) {
            setSelectedProject(null);
          }
        }}
        classNames={{
          base: "max-w-[92vw]",
          body: "p-0",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="border-b border-default-200 px-6 py-4">
                <div className="flex w-full flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Project Details
                    </h2>
                    <p className="mt-1 text-sm text-default-500">
                      {selectedProject?.projectNo || "-"} •{" "}
                      {selectedProject?.projectName || "-"}
                    </p>
                  </div>

                  {/* <Button variant="flat" onPress={onClose}>
                    Close
                  </Button> */}
                </div>
              </DrawerHeader>

              <DrawerBody className="bg-default-50">
                <div className="h-full overflow-auto p-5">
                  <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <DetailItem
                        label="Status"
                        value={capitalize(selectedProject?.projectStatusName)}
                      />
                      <DetailItem
                        label="Sales Person"
                        value={selectedProject?.salesPersonName}
                      />
                      <DetailItem
                        label="Total Amount"
                        value={inrCurrency(selectedProject?.totalAmount)}
                      />
                      <DetailItem
                        label="Due Amount"
                        value={inrCurrency(selectedProject?.dueAmount)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <DetailItem
                        label="Company"
                        value={selectedProject?.companyName}
                      />
                      <DetailItem
                        label="Unit"
                        value={selectedProject?.unitName}
                      />
                      <DetailItem
                        label="Contact"
                        value={selectedProject?.contactName}
                      />
                      <DetailItem
                        label="Unbilled No."
                        value={selectedProject?.unbilledNumber}
                      />
                      <DetailItem
                        label="Estimate No."
                        value={selectedProject?.estimateNumber}
                      />
                      <DetailItem
                        label="Payment Type"
                        value={selectedProject?.paymentTypeName}
                      />
                    </div>

                    <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            Overall Milestone Progress
                          </h3>
                          <p className="mt-1 text-xs text-default-500">
                            Completed{" "}
                            {selectedProject?.completedMilestones || 0} of{" "}
                            {selectedProject?.totalMilestones || 0} milestones
                          </p>
                        </div>

                        <Chip
                          color={
                            Number(
                              selectedProject?.milestoneCompletionPercentage ||
                                0,
                            ) === 100
                              ? "success"
                              : "primary"
                          }
                          variant="flat"
                        >
                          {selectedProject?.milestoneCompletionPercentage || 0}%
                        </Chip>
                      </div>

                      <Progress
                        value={Number(
                          selectedProject?.milestoneCompletionPercentage || 0,
                        )}
                        color={
                          Number(
                            selectedProject?.milestoneCompletionPercentage || 0,
                          ) === 100
                            ? "success"
                            : "primary"
                        }
                        aria-label="Project milestone progress"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          Department Wise Milestones
                        </h3>
                        <p className="mt-1 text-xs text-default-500">
                          Current assignment status for each department.
                        </p>
                      </div>

                      {selectedDepartments.length > 0 ? (
                        selectedDepartments.map((department) => {
                          const milestones = getUniqueMilestones(
                            department?.milestones || [],
                          );

                          return (
                            <div
                              key={department?.departmentId}
                              className="overflow-hidden rounded-2xl border border-default-200 bg-content1 shadow-sm"
                            >
                              <div className="border-b border-default-200 bg-default-100 px-5 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {department?.departmentName || "-"}
                                    </p>
                                    <p className="mt-1 text-xs text-default-500">
                                      {milestones.length} unique milestones
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Chip
                                      size="sm"
                                      color="success"
                                      variant="flat"
                                    >
                                      Completed:{" "}
                                      {department?.completedMilestones || 0}
                                    </Chip>
                                    <Chip
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                    >
                                      In Progress:{" "}
                                      {department?.inProgressMilestones || 0}
                                    </Chip>
                                    <Chip
                                      size="sm"
                                      color="warning"
                                      variant="flat"
                                    >
                                      Pending:{" "}
                                      {department?.pendingMilestones || 0}
                                    </Chip>
                                  </div>
                                </div>
                              </div>

                              <div className="overflow-x-auto p-4">
                                <table className="w-full min-w-[900px] text-left text-sm">
                                  <thead>
                                    <tr className="border-b border-default-200 text-xs uppercase text-default-400">
                                      <th className="px-3 py-2">Order</th>
                                      <th className="px-3 py-2">Milestone</th>
                                      <th className="px-3 py-2">Status</th>
                                      <th className="px-3 py-2">Visible</th>
                                      <th className="px-3 py-2">Assignee</th>
                                      <th className="px-3 py-2">Started</th>
                                      <th className="px-3 py-2">Completed</th>
                                      <th className="px-3 py-2">Reason</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {milestones.length > 0 ? (
                                      milestones.map((milestone) => (
                                        <tr
                                          key={`${milestone?.assignmentId}-${milestone?.milestoneId}`}
                                          className="border-b border-default-100 last:border-b-0"
                                        >
                                          <td className="px-3 py-3">
                                            {milestone?.milestoneOrder || "-"}
                                          </td>
                                          <td className="px-3 py-3">
                                            <div>
                                              <p className="font-medium text-foreground">
                                                {milestone?.milestoneName ||
                                                  "-"}
                                              </p>
                                              <p className="text-xs text-default-500">
                                                Assignment ID:{" "}
                                                {milestone?.assignmentId || "-"}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="px-3 py-3">
                                            <Chip
                                              size="sm"
                                              variant="flat"
                                              color={getMilestoneStatusColor(
                                                milestone?.milestoneStatusName,
                                              )}
                                            >
                                              {capitalize(
                                                milestone?.milestoneStatusName ||
                                                  "-",
                                              )}
                                            </Chip>
                                          </td>
                                          <td className="px-3 py-3">
                                            <Chip
                                              size="sm"
                                              variant="flat"
                                              color={
                                                milestone?.visible
                                                  ? "success"
                                                  : "default"
                                              }
                                            >
                                              {milestone?.visible
                                                ? "Visible"
                                                : "Hidden"}
                                            </Chip>
                                            {!milestone?.visible &&
                                              milestone?.visibilityReason && (
                                                <p className="mt-1 text-xs text-default-500">
                                                  {milestone.visibilityReason}
                                                </p>
                                              )}
                                          </td>
                                          <td className="px-3 py-3">
                                            {milestone?.assignedUserName || "-"}
                                          </td>
                                          <td className="px-3 py-3">
                                            {formatDateTime(
                                              milestone?.startedDate,
                                            )}
                                          </td>
                                          <td className="px-3 py-3">
                                            {formatDateTime(
                                              milestone?.completedDate,
                                            )}
                                          </td>
                                          <td className="max-w-[220px] px-3 py-3">
                                            <Tooltip
                                              content={
                                                milestone?.statusReason || "-"
                                              }
                                            >
                                              <p className="truncate text-default-600">
                                                {milestone?.statusReason || "-"}
                                              </p>
                                            </Tooltip>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={8}
                                          className="px-3 py-8 text-center text-default-400"
                                        >
                                          No milestones found
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-dashed border-default-300 bg-content1 p-8 text-center">
                          <p className="text-sm font-semibold text-default-600">
                            No department milestone data found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SalesProject;
