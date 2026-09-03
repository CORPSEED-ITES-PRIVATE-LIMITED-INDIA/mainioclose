import React, { useEffect } from "react";
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
} from "@heroui/react";
import { ChevronDown, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { getVendorTransactionsByUser } from "../toolkit/slices/operationSlice";
import { useParams } from "react-router-dom";
import { inrCurrency } from "../common";

export const columns = [
  { name: "PO NO.", uid: "purchaseOrderNumber", sortable: true },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "INVOICE", uid: "invoice" },
  { name: "TAXABLE AMOUNT", uid: "taxableAmount" },
  { name: "GST AMOUNT", uid: "gstAmount" },
  { name: "GST %", uid: "gstPercentage" },
  { name: "INVOICE AMOUNT", uid: "invoiceAmount" },
  { name: "TDS AMOUNT", uid: "tdsAmount" },
  { name: "TDS %", uid: "tdsPercentage" },
  { name: "AMOUNT PAID TO VENDOR", uid: "amountPaidToVendor" },
  { name: "SETTLEMENT AMOUNT", uid: "settlementAmount" },
  { name: "PAYMENT MODE", uid: "paymentMode" },
  { name: "TRANSACTION REF.", uid: "transactionReference" },
  { name: "STATUS", uid: "status" },
  { name: "PAYMENT RELEASED DATE", uid: "paymentReleasedDate" },
  { name: "PROOF", uid: "paymentProof" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

// The API returns GST/TDS as absolute amounts only, so the rate is derived
// from the taxable amount (e.g. 18 gstAmount on 100 taxableAmount => 18%).
function computePercentage(amount, base) {
  if (amount == null || base == null || Number(base) === 0) return null;
  return Number(((Number(amount) / Number(base)) * 100).toFixed(2));
}

const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "default";

    case "PENDING_APPROVAL":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "PAYMENT_RELEASED":
      return "primary";

    case "PAYMENT_DONE":
    case "COMPLETED":
      return "success";

    default:
      return "default";
  }
};

const INITIAL_VISIBLE_COLUMNS = [
  "purchaseOrderNumber",
  "vendorName",
  "invoice",
  "invoiceAmount",
  "gstAmount",
  "gstPercentage",
  "tdsAmount",
  "tdsPercentage",
  "amountPaidToVendor",
  "paymentMode",
  "transactionReference",
  "status",
  "paymentReleasedDate",
  "paymentProof",
];

const VendorPaymentForProcurement = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const data = useSelector(
    (state) => state.operation.vendorTransactionsByUser?.content,
  );
  const count = useSelector(
    (state) => state.operation.vendorTransactionsByUser?.totalElements || 0,
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "paymentReleasedDate",
    direction: "descending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    if (userId) {
      dispatch(
        getVendorTransactionsByUser({ userId, page, size: rowsPerPage }),
      );
    }
  }, [dispatch, userId, page, rowsPerPage]);

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
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
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
      case "purchaseOrderNumber":
        return (
          <p className="text-[12.5px] font-normal whitespace-nowrap">
            {rowData?.purchaseOrderNumber || "-"}
          </p>
        );
      case "vendorName":
        return (
          <p className="text-[12.5px] font-normal whitespace-nowrap">
            {rowData?.vendorName || "-"}
          </p>
        );
      case "invoice":
        return (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-normal">
              {rowData?.invoiceNumber || "-"}
            </span>
            {rowData?.invoiceDate && (
              <span className="text-[11.5px] text-default-500">
                {dayjs(rowData?.invoiceDate).format("DD MMM YYYY")}
              </span>
            )}
          </div>
        );
      case "taxableAmount":
        return (
          <span className="text-[12.5px] font-normal">
            {inrCurrency(rowData?.taxableAmount) || "-"}
          </span>
        );
      case "gstAmount":
        return (
          <span className="text-[12.5px] font-normal">
            {inrCurrency(rowData?.gstAmount) || "-"}
          </span>
        );
      case "gstPercentage": {
        const gstPercentage = computePercentage(
          rowData?.gstAmount,
          rowData?.taxableAmount,
        );
        return (
          <span className="text-[12.5px] font-normal">
            {gstPercentage != null ? `${gstPercentage}%` : "-"}
          </span>
        );
      }
      case "invoiceAmount":
        return (
          <span className="text-[12.5px] font-normal">
            {inrCurrency(rowData?.invoiceAmount) || "-"}
          </span>
        );
      case "tdsAmount":
        return (
          <span className="text-[12.5px] font-normal">
            {inrCurrency(rowData?.tdsAmount) || "-"}
          </span>
        );
      case "tdsPercentage": {
        const tdsPercentage = computePercentage(
          rowData?.tdsAmount,
          rowData?.taxableAmount,
        );
        return (
          <span className="text-[12.5px] font-normal">
            {tdsPercentage != null ? `${tdsPercentage}%` : "-"}
          </span>
        );
      }
      case "amountPaidToVendor":
        return (
          <span className="text-[12.5px] font-normal">
            {inrCurrency(rowData?.amountPaidToVendor) || "-"}
          </span>
        );
      case "settlementAmount":
        return (
          <span className="text-[12.5px] font-normal">
            {inrCurrency(rowData?.settlementAmount) || "-"}
          </span>
        );
      case "paymentMode":
        return (
          <p className="text-[12.5px] font-normal capitalize">
            {rowData?.paymentMode || "-"}
          </p>
        );
      case "transactionReference":
        return (
          <p className="text-[12.5px] font-normal">
            {rowData?.transactionReference || "-"}
          </p>
        );
      case "status":
        return (
          <Chip
            size="sm"
            className="capitalize"
            variant="flat"
            color={getStatusColor(rowData?.status)}
          >
            {rowData?.status || "-"}
          </Chip>
        );
      case "paymentReleasedDate":
        return (
          <div className="flex flex-col text-[12.5px]">
            {rowData?.paymentReleasedDate
              ? dayjs(rowData?.paymentReleasedDate).format(
                  "DD MMM YYYY hh:mm A",
                )
              : "-"}
          </div>
        );
      case "paymentProof":
        return rowData?.paymentProof ? (
          <a
            href={rowData.paymentProof}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] text-blue-500 hover:underline"
          >
            View
          </a>
        ) : (
          "-"
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search vendor's payments..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
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
            Total {count} vendor's payments
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
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
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {page} of {pages}
        </span>
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
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Vendor's payment list
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Vendor's payments table with custom cells, pagination and sorting"
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
              align="start"
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.paymentRequestId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorPaymentForProcurement;
