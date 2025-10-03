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
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TimeInput,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DateRangePicker,
} from "@heroui/react";
import {
  ChevronDown,
  Clock,
  Import,
  ListFilter,
  Plus,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { getAllIvrWithPage } from "../toolkit/slices/commonSlice";
import dayjs from "dayjs";
import {
  getAllLeadUser,
  getQualityLeadsReport,
} from "../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import NewSelect from "../components/NewSelect";
import {
  getLocalTimeZone,
  now,
  parseDateTime,
  parseZonedDateTime,
  toCalendarDateTime,
  today,
} from "@internationalized/date";
import { getDashboardUsersByHeirarchy } from "../toolkit/slices/dashboardSlice";
import { formatedDateTime } from "../common";
import { CSVLink } from "react-csv";

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

const IVRReport = () => {
  const tz = "Asia/Kolkata";
  const end = now(tz);
  const dispatch = useDispatch();
  const { userId } = useParams();
  const data = useSelector((state) => state.leads.qualityReportList);
  const count = useSelector((state) => state.leads.qualityReportList?.length);
  const leadUsersList = useSelector((state) => state.dashboard.dashboardUsers);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const initialValues = {
    userIds: [],
    toDate: formatedDateTime(
      end.subtract({ months: 1 }).set({ day: 1, hour: 0, minute: 45 })
    ),
    fromDate: formatedDateTime(now(tz)),
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

  useEffect(() => {
    dispatch(getQualityLeadsReport(dateFilter));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch, userId]);

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
          String(val)?.toLowerCase().includes(filterValue.toLowerCase())
        )
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
        return (
          <p className="text-sm capitalize">{rowData?.percentage || "-"}</p>
        );
      case "status":
        return (
          <div className="flex gap-1">
            <span className="text-sm rounded p-1 bg-blue-300">
              New : {rowData?.statusNew}
            </span>
            <p className="text-sm rounded p-1 bg-red-300">
              Deal lost : {rowData?.statusDealLost}
            </p>
            <p className="text-sm rounded p-1 bg-orange-300">
              Bad fit : {rowData?.statusBadFit}
            </p>
            <p className="text-sm rounded p-1 bg-green-300">
              Move on : {rowData?.statusMoveOn}
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
    dispatch(getQualityLeadsReport(dateFilter));
  };

  const handleResetFilter = useCallback(() => {
    dispatch(getQualityLeadsReport(initialValues));
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
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
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
              <Button endContent={<Import />}>Export</Button>
            </CSVLink>
            <Popover size="lg" showArrow>
              <PopoverTrigger>
                <Button variant="flat" endContent={<ListFilter />}>
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
                        size={"lg"}
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
                        granularity="minute"
                        hourCycle={24}
                        visibleMonths={2}
                        label="Select date range"
                        defaultValue={{
                          start: parseZonedDateTime(
                            `${dateFilter?.toDate}[Asia/Kolkata]`
                          ),
                          end: parseZonedDateTime(
                            `${dateFilter?.fromDate}[Asia/Kolkata]`
                          ),
                        }}
                        onChange={(range) => {
                          setDateFilter((prev) => ({
                            ...prev,
                            toDate: formatedDateTime(range?.start),
                            fromDate: formatedDateTime(range?.end),
                          }));
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2 my-2">
                      <Button onPress={handleResetFilter}>Reset</Button>
                      <Button color="primary" onPress={handleApplyFilter}>
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDown />} variant="flat">
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
            Total {count} IVR report
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
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">IVR report list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh]",
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

export default IVRReport;
