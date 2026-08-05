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
  Popover,
  PopoverTrigger,
  PopoverContent,
  DateRangePicker,
} from "@heroui/react";
import { ChevronDown, Import, ListFilter, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { parseZonedDateTime } from "@internationalized/date";
import { getAutomationLeads } from "../../toolkit/slices/leadSlice";
import { CSVLink } from "react-csv";
import NewSelect from "../../components/NewSelect";
import { getDashboardUsersByHeirarchy } from "../../toolkit/slices/dashboardSlice";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email" },
  { name: "PERCENTAGE", uid: "percentage" },
  { name: "STATUS", uid: "status" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "email", "percentage", "status"];

const AutomationStatus = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const data = useSelector((state) => state.leads.autoStatusList);
  const count = useSelector((state) => state.leads.autoStatusList?.length);
  const leadUsersList = useSelector((state) => state.dashboard.dashboardUsers);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const initialValues = {
    userIds: [],
    toDate: dayjs()
      .subtract(1, "month")
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:ss"),
    fromDate: dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
    currentUserId: userId,
  };
  const [dateFilter, setDateFilter] = useState(initialValues);

  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const isSmall = useMediaQuery({ maxWidth: 767 });
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAutomationLeads(dateFilter));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch, userId]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <p className="text-sm font-medium capitalize">{rowData?.name}</p>
        );
      case "email":
        return <p className="text-sm">{rowData?.email}</p>;
      case "percentage":
        return <p className="text-sm capitalize">{rowData?.percentage || 0}</p>;
      case "status":
        return (
          <div className="flex gap-1">
            <span className="text-sm rounded p-1 bg-blue-300">
              New : {rowData?.statusNew || 0}
            </span>
            <p className="text-sm rounded p-1 bg-green-300">
              Deal won : {rowData?.statusDealWon || 0}
            </p>
            <p className="text-sm rounded p-1 bg-yellow-300">
              Deal lost : {rowData?.statusDealLost || 0}
            </p>
            <p className="text-sm rounded p-1 bg-red-300">
              Bad fit : {rowData?.statusBadFit || 0}
            </p>
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

  const handleApplyFilter = () => {
    dispatch(getAutomationLeads(dateFilter));
  };

  const handleResetFilter = useCallback(() => {
    dispatch(getAutomationLeads(initialValues));
    setDateFilter(initialValues);
  }, [dispatch, initialValues]);

  const exportData = data?.map((row) => ({
    Id: row?.id,
    Name: row?.name,
    Email: row?.email,
    Percentage: row?.percentage,
    "New status": row?.statusNew,
    "Deal won status": row?.statusDealWon,
    "BadFit status": row?.statusBadFit,
  }));

  const headers = [
    "Id",
    "Name",
    "Email",
    "Percentage",
    "New status",
    "Deal won status",
    "BadFit status",
  ];

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            size={isMedium ? "sm" : isLarge ? "md" : ""}
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <CSVLink
              data={exportData}
              headers={headers}
              filename={"auto-history.csv"}
              variant="flat"
            >
              <Button
                endContent={<Import />}
                size={isMedium ? "sm" : isLarge ? "md" : ""}
              >
                Export
              </Button>
            </CSVLink>
            <Popover size={isMedium ? "sm" : isLarge ? "md" : ""} showArrow>
              <PopoverTrigger>
                <Button
                  variant="flat"
                  endContent={<ListFilter />}
                  size={isMedium ? "sm" : isLarge ? "md" : ""}
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
                    <div className="flex flex-col gap-2">
                      <NewSelect
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                        data={leadUsersList}
                        selectionMode="multiple"
                        label={"Select users"}
                        name={"userIds"}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={dateFilter?.userIds}
                        onChange={(selectedSet) => {
                          setDateFilter((prev) => ({
                            ...prev,
                            userIds: selectedSet,
                          }));
                        }}
                      />
                      <DateRangePicker
                        hideTimeZone
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                        granularity="minute"
                        hourCycle={24}
                        visibleMonths={2}
                        label="Select date range"
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
                                `${dateFilter?.toDate}[Asia/kolkata]`,
                              )
                            : null,
                          end: dateFilter?.fromDate
                            ? parseZonedDateTime(
                                `${dateFilter?.fromDate}[Asia/kolkata]`,
                              )
                            : null,
                        }}
                        onChange={(value) => {
                          const formattedStart = value.start
                            ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                            : null;
                          const formattedEnd = value.end
                            ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}` // Fixed: month -> day
                            : null;
                          setDateFilter((prev) => ({
                            ...prev,
                            toDate: formattedStart,
                            fromDate: formattedEnd,
                          }));
                        }}
                      />
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
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  size={isMedium ? "sm" : isLarge ? "md" : ""}
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
            Total {count} auto status
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
    leadUsersList,
    dateFilter,
    exportData,
    headers,
    isMedium,
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
  }, [selectedKeys, count, page, pages, hasSearchFilter, isMedium, isLarge]);

  return (
    <>
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Automation report list
      </h1>
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

export default AutomationStatus;
