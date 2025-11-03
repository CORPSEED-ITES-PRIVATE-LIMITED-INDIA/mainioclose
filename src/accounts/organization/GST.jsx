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
  Popover,
  PopoverTrigger,
  PopoverContent,
  DateRangePicker,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, ListFilter, Search, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getGstExportedData,
  getGstList,
  getGstListCount,
} from "../../toolkit/slices/organizationSlice";
import { inrCurrency } from "../../common";
import { useMediaQuery } from "react-responsive";
import { parseZonedDateTime } from "@internationalized/date";
import { CSVLink } from "react-csv";
import LoadingSpinner from "../../components/LoadingSpinner";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "COMPANY", uid: "company", sortable: true },
  { name: "TYPE", uid: "type" },
  { name: "GST", uid: "gst" },
  { name: "AMOUNT", uid: "amount" },
  { name: "STATUS", uid: "status" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "company",
  "type",
  "gst",
  "amount",
  "status",
];

const GST = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  const data = useSelector((state) => state.organization.gstList);
  const count = useSelector((state) => state.organization.gstListCount);
  const exportedData = useSelector(
    (state) => state.organization.gstExportedDataList
  );
  const loading = useSelector((state) => state.organization.loading);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "company",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });
  const initialDates = {
    startDate: null,
    endDate: null,
  };
  const [dateFilter, setDateFilter] = useState(initialDates);

  useEffect(() => {
    dispatch(getGstList({ page, size: rowsPerPage, ...dateFilter }));
    dispatch(getGstListCount(dateFilter));
    dispatch(getGstExportedData(dateFilter));
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
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
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

  const exportData = exportedData?.map((row) => ({
    Id: row?.id,
    Company: row?.company,
    GST: `${row?.gst}%`,
    "GST Amount": inrCurrency(row?.gstAmount),
    status: row?.status,
    type: row?.type,
  }));

  const headers = ["Id", "Company", "GST", "GST Amount", "status", "type"];

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "company":
        return (
          <p className="text-sm font-medium capitalize">{rowData?.company}</p>
        );
      case "type":
        return <p className="text-sm capitalize">{rowData?.type}</p>;
      case "gst":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-sm">{rowData?.gst} %</span>
          </div>
        );
      case "amount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.gstAmount)}
          </p>
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

  const handleReset = () => {
    dispatch(getGstExportedData(initialDates));
    dispatch(getGstList({ page, size: rowsPerPage, ...initialDates }));
    dispatch(getGstListCount(initialDates));
  };

  const handleApply = () => {
    dispatch(getGstExportedData(dateFilter));
    dispatch(getGstList({ page, size: rowsPerPage, ...dateFilter }));
    dispatch(getGstListCount(dateFilter));
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            size={isMedium ? "sm" : isLarge ? "md" : ""}
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Popover
              size={isMedium ? "sm" : isLarge ? "md" : ""}
              showArrow
              isOpen={isOpen}
              onOpenChange={(e) => {
                onOpenChange(e);
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
                            start: dateFilter?.startDate
                              ? parseZonedDateTime(
                                  `${dateFilter?.startDate}[Asia/kolkata]`
                                )
                              : null,
                            end: dateFilter?.endDate
                              ? parseZonedDateTime(
                                  `${dateFilter?.endDate}[Asia/kolkata]`
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
                              startDate: formattedStart,
                              endDate: formattedEnd,
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 my-2">
                      <Button
                        onPress={handleReset}
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                      >
                        Reset
                      </Button>
                      <Button
                        onPress={handleApply}
                        size={isMedium ? "sm" : isLarge ? "md" : ""}
                        color="primary"
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
                isDisabled={loading === "pending"}
                isLoading={loading === "pending"}
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
          <span className="text-default-400 text-small">Total {count} tds</span>
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
    isLarge,
    isMedium,
    loading,
    isOpen,
    onOpenChange
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
          size={isMedium ? "sm" : isLarge ? "md" : ""}
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
    items.length,
    page,
    pages,
    hasSearchFilter,
    isMedium,
    isLarge,
  ]);

  return (
    <>
      {loading === "pending" && <LoadingSpinner />}
      <h1 className="font-sans text-2xl font-medium mb-1">GST list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[62vh] md:max-h-[55vh] w-full",
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

export default GST;
