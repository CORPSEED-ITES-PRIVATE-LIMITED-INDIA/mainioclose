import React, { useCallback, useEffect, useState } from "react";
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
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DateRangePicker,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, ListFilter, Search, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLeadUser,
  getSaleReportByFilter,
  getSaleReportByFilterCount,
  getSalesReportByFilterForExport,
} from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import { CSVLink } from "react-csv";
import { parseZonedDateTime } from "@internationalized/date";
import { useMediaQuery } from "react-responsive";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "LEAD ID", uid: "leadId" },
  { name: "LEAD NAME", uid: "leadname", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "ASS.DATE", uid: "assignDate" },
  { name: "REOPEN-BY", uid: "reopenBy" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "leadId",
  "leadname",
  "status",
  "assignee",
  "assignDate",
  "reopenBy",
];

const SalesReport = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  const data = useSelector((state) => state.leads.salesReportList);
  const count = useSelector((state) => state.leads.salesReportCount);
  const allLeadUser = useSelector((state) => state.leads.leadUsersList);
  const salesReportExportLoading = useSelector(
    (state) => state.leads.salesReportExportLoading
  );
  const salesReportExport = useSelector(
    (state) => state.leads.salesReportListForExport
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [department, setDepartment] = useState("All");
  const [dateFilter, setDateFilter] = useState({
    toDate: "",
    fromDate: "",
    departmentId: null,
    assigneeIds: [],
  });
  const isSmall = useMediaQuery({ maxWidth: 767 });
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(
      getSaleReportByFilter({ page, size: rowsPerPage, data: dateFilter })
    );
    dispatch(getSaleReportByFilterCount(dateFilter));
    dispatch(getSalesReportByFilterForExport(dateFilter));
  }, [dispatch, page, rowsPerPage]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "leadname":
        return (
          <div className="flex flex-col">
            <p>{rowData.leadOriginalName || "-"}</p>
            <Chip
              size="sm"
              className="text-sm"
              color={rowData.manual ? "success" : "default"}
            >
              {rowData.manual ? "Manual" : "Auto"}
            </Chip>
          </div>
        );
      case "status":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.status || "-"}</span>
          </div>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.currName || "-"}</span>
          </div>
        );
      case "assignDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {dayjs(rowData.assignDate).format("DD-MM-YYYY HH:mm ")}
            </span>
          </div>
        );
      case "reopenBy":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.reopenBy?.fullName}</span>
          </div>
        );

      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const handleApplyFilter = useCallback(() => {
    dispatch(
      getSaleReportByFilter({ page, size: rowsPerPage, data: dateFilter })
    );
    dispatch(getSaleReportByFilterCount(dateFilter));
    dispatch(getSalesReportByFilterForExport(dateFilter));
    onClose();
  }, [dateFilter, rowsPerPage, page, onClose]);

  const handleResetFilter = () => {
    dispatch(
      getSaleReportByFilter({
        page,
        size: rowsPerPage,
        data: {
          toDate: "",
          fromDate: "",
          departmentId: "",
          assigneeIds: [],
        },
      })
    );
  };

  const exportData = salesReportExport?.map((row) => ({
    Id: row?.id,
    "Lead Id": row?.leadId,
    "Lead name": row?.leadOriginalName,
    Status: row?.status,
    Manual: row?.manual ? "Manual" : "Auto",
    "Client Email": row?.clientEmail,
    "Current Assignee person": row?.currName,
    "Current Assignee email": row?.currEmail,
    "Created Date": dayjs(row?.assignDate).format("YYYY-MM-DD"),
    "Reopen by": row?.reopenBy?.fullName,
  }));

  const headers = [
    "Id",
    "Lead Id",
    "Lead name",
    "Status",
    "Manual",
    "Client Email",
    "Current Assignee person",
    "Current Assignee email",
    "Created Date",
    "Reopen by",
  ];

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search..."
            startContent={<Search />}
            value={filterValue}
            size={isMedium ? "sm" : isLarge ? "md" : ""}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown />}
                  size={isMedium ? "sm" : isLarge ? "md" : ""}
                  variant="flat"
                >
                  {department}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={[dateFilter?.departmentId]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let value = Array.from(e)[0];
                  setDateFilter((prev) => ({ ...prev, departmentId: value }));
                  dispatch(
                    getSaleReportByFilter({
                      page,
                      size: rowsPerPage,
                      data: { ...dateFilter, departmentId: value },
                    })
                  );
                  dispatch(
                    getSaleReportByFilterCount({
                      ...dateFilter,
                      departmentId: value,
                    })
                  );
                }}
              >
                {[
                  { name: "All", uid: "" },
                  { name: "Sales", uid: "2" },
                  { name: "Quality", uid: "3" },
                ].map((column) => (
                  <DropdownItem
                    key={column.uid}
                    className="capitalize"
                    onPress={() => setDepartment(column.name)}
                  >
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Popover
              size={isMedium ? "sm" : isLarge ? "md" : ""}
              showArrow
              isOpen={isOpen}
              onOpenChange={(e) => {
                onOpenChange(e);
                if (e) {
                  dispatch(getAllLeadUser(userId));
                }
              }}
            >
              <PopoverTrigger>
                <Button
                  variant="flat"
                  size={isMedium ? "sm" : isLarge ? "md" : ""}
                  endContent={<ListFilter />}
                >
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                {(titleProps) => (
                  <div className="px-1 py-2">
                    <h3 className="my-4 font-bold text-xl" {...titleProps}>
                      Filter
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <NewSelect
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                        data={allLeadUser || []}
                        selectionMode="multiple"
                        label={"Select users"}
                        name={"assigneeIds"}
                        labelKey={"fullName"}
                        valueKey={"id"}
                        value={dateFilter?.assigneeIds}
                        onChange={(selectedSet) => {
                          setDateFilter((prev) => ({
                            ...prev,
                            assigneeIds: selectedSet,
                          }));
                        }}
                      />
                      <div className="w-full max-w-xl flex flex-row gap-4">
                        <DateRangePicker
                          hideTimeZone
                          granularity="minute"
                          hourCycle={24}
                          size={isMedium ? "sm" : isLarge ? "md" : ""}
                          visibleMonths={2}
                          label="Created date"
                          popoverProps={{
                            size: isMedium ? "sm" : isLarge ? "md" : "",
                            placement: isMedium
                              ? "left"
                              : isLarge
                                ? "bottom"
                                : "",
                          }}
                          value={{
                            start: dateFilter?.toDate
                              ? parseZonedDateTime(
                                  `${dateFilter?.toDate}[Asia/kolkata]`
                                )
                              : null,
                            end: dateFilter?.fromDate
                              ? parseZonedDateTime(
                                  `${dateFilter?.fromDate}[Asia/kolkata]`
                                )
                              : null,
                          }}
                          onChange={(value) => {
                            const formattedStart = value.start
                              ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                              : null;
                            const formattedEnd = value.end
                              ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                              : null;
                            setDateFilter((prev) => ({
                              ...prev,
                              toDate: formattedStart,
                              fromDate: formattedEnd,
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 my-2">
                      <Button
                        onPress={handleResetFilter}
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                      >
                        Reset
                      </Button>
                      <Button
                        color="primary"
                        onPress={handleApplyFilter}
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <CSVLink
              data={exportData}
              headers={headers}
              filename={"salesReport.csv"}
            >
              <Button
                isDisabled={salesReportExportLoading !== "success"}
                endContent={<Upload />}
                size={isMedium ? "sm" : isLarge ? "md" : ""}
              >
                Export
              </Button>
            </CSVLink>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown />}
                  size={isMedium ? "sm" : isLarge ? "md" : ""}
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
          <span className="text-default-400 text-small">
            Total {count} sales report
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
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
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
    allLeadUser,
    dateFilter,
    handleApplyFilter,
    handleResetFilter,
    isMedium,
    exportData,
    headers,
    isLarge,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          size={isMedium ? "sm" : isLarge ? "md" : ""}
          showShadow
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
  }, [
    selectedKeys,
    page,
    pages,
    hasSearchFilter,
    data,
    count,
    isMedium,
    isLarge,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Sales report</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
        }}
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
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default SalesReport;
