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
  DateRangePicker,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, FileUp, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDailyBookRecord } from "../../toolkit/slices/organizationSlice";
import dayjs from "dayjs";
import { parseZonedDateTime } from "@internationalized/date";
import { CSVLink } from "react-csv";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "LEDGER", uid: "ledgerName", sortable: true },
  { name: "COMPANY", uid: "companyName" },
  { name: "VOUCHER TYPE", uid: "voucherType" },
  { name: "PAYMENT TYPE", uid: "paymentType" },
  { name: "DATE", uid: "date" },
  { name: "AMOUNT", uid: "amount" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "ledgerName",
  "companyName",
  "voucherType",
  "paymentType",
  "date",
  "amount",
  "actions",
];

const DailyBook = () => {
  const dispatch = useDispatch();
  const bookDetail = useSelector((state) => state.organization.dailybookDetail);
  const data = useSelector(
    (state) => state.organization.dailybookDetail?.result
  );
  const count = useSelector(
    (state) => state.organization.dailybookDetail?.result?.length
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
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm");
  const [dateRange, setDateRange] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllDailyBookRecord(dateRange));
  }, [dispatch, dateRange]);

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
        item.ledgerName.toLowerCase().includes(filterValue.toLowerCase())
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

  const exportData = (data || [])?.map((row) => ({
    "Ledger name": row?.ledgerName,
    "Company name": row?.companyName,
    "Voucher type": row?.voucherType?.name,
    "Payment type": row?.paymentType,
    Date: dayjs(rowData?.date).format("DD-MM-YYYY"),
    "Credit amount": row?.creditAmount,
    "Debit amount": row?.debitAmount,
  }));

  const headers = [
    "Ledger name",
    "Company name",
    "Voucher type",
    "Payment type",
    "Date",
    "Credit amount",
    "Debit amount",
  ];

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "ledgerName":
        return (
          <p className="text-sm font-medium capitalize">
            {rowData?.ledgerName}
          </p>
        );
      case "companyName":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium capitalize">
              {rowData?.companyName}
            </p>
          </div>
        );
      case "voucherType":
        return (
          <p className="text-sm capitalize">{rowData?.voucherType?.name}</p>
        );
      case "paymentType":
        return <p className="text-sm capitalize">{rowData?.paymentType}</p>;
      case "date":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.date).format("YYYY-MM-DD")}
          </p>
        );
      case "amount":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-sm">Credit : ₹ {rowData?.creditAmount}</span>
            <span className="text-sm">Debit : ₹ {rowData?.debitAmount}</span>
          </div>
        );

      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {/* <DropdownItem key="viewEstimate">View estimate</DropdownItem>
                <DropdownItem key="edit">Edit</DropdownItem> */}
              </DropdownMenu>
            </Dropdown>
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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search by name..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <CSVLink
              className="text-white"
              data={exportData}
              headers={headers}
              filename={"daybook.csv"}
            >
              <Button variant="flat">
                <FileUp className="h-4 w-4" />
                Export
              </Button>
            </CSVLink>
            <DateRangePicker
              hideTimeZone
              visibleMonths={2}
              size="md"
              value={{
                start: parseZonedDateTime(
                  `${dateRange?.startDate}[Asia/kolkata]`
                ),
                end: parseZonedDateTime(`${dateRange?.endDate}[Asia/kolkata]`),
              }}
              onChange={(value) => {
                const formattedStart = value.start
                  ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                  : null;
                const formattedEnd = value.end
                  ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                  : null;
                setDateRange({
                  startDate: formattedStart,
                  endDate: formattedEnd,
                });
              }}
            />

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
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
            Total {count} day book items
          </span>
          <div className="flex gap-4">
            <div className="flex gap-1">
              <span className="font-medium text-muted-foreground">
                Total amount
              </span>
              <span className="font-medium text-muted-foreground">:</span>
              <span className="font-medium ">
                ₹ {bookDetail?.totalAmount || "-"}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="font-medium text-muted-foreground">
                Total credit
              </span>
              <span className="font-medium text-muted-foreground">:</span>
              <span className="font-medium ">
                ₹ {bookDetail?.totalCredit || "-"}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="font-medium text-muted-foreground">
                Total debit
              </span>
              <span className="font-medium text-muted-foreground">:</span>
              <span className="font-medium ">
                ₹ {bookDetail?.totalDebit || "-"}
              </span>
            </div>
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
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
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
      <h1 className="font-sans text-2xl font-medium mb-1">Day book list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh] overflow-scroll",
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

export default DailyBook;
