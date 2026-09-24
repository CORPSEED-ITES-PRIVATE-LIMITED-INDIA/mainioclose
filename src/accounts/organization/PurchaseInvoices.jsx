import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
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
  useDisclosure,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { ChevronDown, Search } from "lucide-react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { inrCurrency } from "../../common";
import PurchaseInvoiceView from "../../components/PurchaseInvoiceView";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getApprovedOrReleasedProcurementPayments } from "../../toolkit/slices/accountSlice";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "INVOICE NO.", uid: "invoiceNo" },
  { name: "INVOICE DATE", uid: "invoiceDate" },
  { name: "PO NO.", uid: "poNumber" },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "AMOUNT", uid: "amount" },
  { name: "GST TYPE", uid: "gstType" },
  { name: "GST %", uid: "gstPercentage" },
  { name: "CGST", uid: "cgstAmount" },
  { name: "SGST", uid: "sgstAmount" },
  { name: "IGST", uid: "igstAmount" },
  { name: "TOTAL GST", uid: "totalGstAmount" },
  { name: "INVOICE AMOUNT", uid: "invoiceAmount" },
  { name: "TDS %", uid: "tdsPercentage" },
  { name: "TDS AMOUNT", uid: "tdsAmount" },
  { name: "PAYABLE AMOUNT", uid: "payableAmount" },
  { name: "STATUS", uid: "status" },
  { name: "ATTACHMENTS", uid: "proofAttachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "invoiceNo",
  "invoiceDate",
  "poNumber",
  "projectName",
  "vendorName",
  "amount",
  "gstType",
  "gstPercentage",
  "totalGstAmount",
  "invoiceAmount",
  "tdsAmount",
  "payableAmount",
  "status",
  "proofAttachmentUrls",
  "actions",
];

const SEARCH_TYPE_OPTIONS = [
  { label: "Invoice number", value: "invoiceNo" },
  { label: "Vendor name", value: "vendorName" },
  { label: "PO number", value: "poNumber" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "ALL", value: "ALL" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "PAYMENT RELEASED", value: "PAYMENT_RELEASED" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";

    case "PAYMENT_RELEASED":
      return "primary";

    default:
      return "default";
  }
};

const round2 = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

// Maps one row of GET /accountService/api/procurement-payment-requests/
// approved-or-released (either the approvedPayments or releasedPayments
// list) into the shape this table and PurchaseInvoiceView.jsx expect.
// The endpoint doesn't return vendor address/GSTIN/bank details or line
// items, so those are left blank — PurchaseInvoiceView already renders
// "NA" for anything missing.
const mapPaymentRequestToRow = (row = {}) => {
  const amount = round2(row?.amount);
  const cgstAmount = round2(row?.cgstAmount);
  const sgstAmount = round2(row?.sgstAmount);
  const igstAmount = round2(row?.igstAmount);
  const totalGstAmount = round2(
    row?.totalGstAmount ?? cgstAmount + sgstAmount + igstAmount,
  );
  const invoiceAmount = round2(row?.invoiceAmount ?? amount + totalGstAmount);
  const tdsAmount = round2(row?.tdsAmount);
  const payableAmount = round2(
    row?.payableAmount ?? invoiceAmount - tdsAmount,
  );

  return {
    id: row?.id,
    rowKey: `${row?.status || "row"}-${row?.id}`,
    invoiceNo: row?.invoiceNumber || row?.poNumber || `PR-${row?.id}`,
    invoiceDate: row?.invoiceDate || row?.paymentDate || row?.submissionDate,
    poNumber: row?.poNumber || "",
    projectName: row?.projectName || "",
    projectNo: row?.projectNo || "",
    vendorName: row?.vendorName || "",
    amount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    gstPercentage: row?.gstPercentage || 0,
    gstType: row?.gstType || (igstAmount > 0 ? "IGST" : "CGST_SGST"),
    gstActive: Boolean(row?.gstActive),
    invoiceAmount,
    tdsPercentage: row?.tdsPercentage || 0,
    tdsAmount,
    tdsActive: Boolean(row?.tdsActive),
    payableAmount,
    status: row?.status || "",
    proofAttachmentUrls: Array.isArray(row?.proofAttachmentUrls)
      ? row.proofAttachmentUrls
      : [],
    lineItems: [],
  };
};

const PurchaseInvoices = () => {
  const dispatch = useDispatch();
  const viewModal = useDisclosure();

  const approvedOrReleasedProcurementPayments = useSelector(
    (state) => state.account.approvedOrReleasedProcurementPayments,
  );
  const loading = useSelector(
    (state) => state.account.approvedOrReleasedProcurementPaymentsLoading,
  );

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [searchType, setSearchType] = useState("invoiceNo");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(
      getApprovedOrReleasedProcurementPayments({ page: 1, size: 100 }),
    );
  }, [dispatch]);

  // Both approved and released payments come back as two independently
  // paginated lists in one payload — flatten them into a single table,
  // each row keeping its own status so the status filter still works.
  const purchaseInvoices = useMemo(() => {
    const approved =
      approvedOrReleasedProcurementPayments?.approvedPayments?.content || [];
    const released =
      approvedOrReleasedProcurementPayments?.releasedPayments?.content || [];

    return [...approved, ...released].map(mapPaymentRequestToRow);
  }, [approvedOrReleasedProcurementPayments]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let items = [...purchaseInvoices];

    if (statusFilter !== "ALL") {
      items = items.filter((item) => item?.status === statusFilter);
    }

    if (hasSearchFilter) {
      const search = filterValue.trim().toLowerCase();
      items = items.filter((item) =>
        String(item?.[searchType] || "")
          .toLowerCase()
          .includes(search),
      );
    }

    return items;
  }, [
    purchaseInvoices,
    statusFilter,
    hasSearchFilter,
    filterValue,
    searchType,
  ]);

  const count = filteredItems.length;
  const pages = Math.max(1, Math.ceil(count / rowsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const onNextPage = useCallback(() => {
    setPage((prev) => Math.min(pages, prev + 1));
  }, [pages]);

  const handleViewInvoice = (rowData) => {
    setSelectedInvoice(rowData);
    viewModal.onOpen();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "invoiceNo":
        return (
          <p
            className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
            onClick={() => handleViewInvoice(rowData)}
          >
            {rowData?.invoiceNo}
          </p>
        );

      case "invoiceDate":
        return (
          <span className="whitespace-nowrap text-[12.5px]">
            {rowData?.invoiceDate
              ? dayjs(rowData.invoiceDate).format("DD-MM-YYYY")
              : "-"}
          </span>
        );

      case "projectName":
        return (
          <div className="flex flex-col">
            <p className="font-normal text-[12.5px] capitalize">
              {rowData?.projectName || "-"}
            </p>
            <p className="font-normal text-[11.5px] text-default-500">
              {rowData?.projectNo || "-"}
            </p>
          </div>
        );

      case "vendorName":
        return (
          <span className="font-normal text-[12.5px] capitalize">
            {rowData?.vendorName || "-"}
          </span>
        );

      case "amount":
        return (
          <span className="font-normal text-[12.5px]">
            {inrCurrency(rowData?.amount)}
          </span>
        );

      case "gstType":
        return rowData?.gstActive ? (
          <Chip size="sm" variant="flat" color="secondary">
            {rowData?.gstType?.replaceAll("_", "/")}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-default-400">-</span>
        );

      case "gstPercentage":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstActive ? `${rowData?.gstPercentage}%` : "-"}
          </span>
        );

      case "cgstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST"
              ? "-"
              : inrCurrency(rowData?.cgstAmount)}
          </span>
        );

      case "sgstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST"
              ? "-"
              : inrCurrency(rowData?.sgstAmount)}
          </span>
        );

      case "igstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST"
              ? inrCurrency(rowData?.igstAmount)
              : "-"}
          </span>
        );

      case "totalGstAmount":
        return (
          <span className="font-medium text-[12.5px]">
            {rowData?.gstActive ? inrCurrency(rowData?.totalGstAmount) : "-"}
          </span>
        );

      case "invoiceAmount":
        return (
          <span className="font-medium text-[12.5px]">
            {inrCurrency(rowData?.invoiceAmount)}
          </span>
        );

      case "tdsPercentage":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.tdsActive ? `${rowData?.tdsPercentage}%` : "-"}
          </span>
        );

      case "tdsAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.tdsActive ? inrCurrency(rowData?.tdsAmount) : "-"}
          </span>
        );

      case "payableAmount":
        return (
          <span className="font-semibold text-[12.5px]">
            {inrCurrency(rowData?.payableAmount)}
          </span>
        );

      case "status":
        return (
          <Chip
            size="sm"
            className="capitalize"
            variant="flat"
            color={getStatusColor(rowData?.status)}
          >
            {rowData?.status?.replaceAll("_", " ") || "-"}
          </Chip>
        );

      case "proofAttachmentUrls":
        return rowData?.proofAttachmentUrls?.length ? (
          <div className="flex flex-col">
            {rowData.proofAttachmentUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-blue-500 hover:underline"
              >
                Attachment {index + 1}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-[12.5px] text-default-400">-</span>
        );

      case "actions":
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="flat"
              onPress={() => handleViewInvoice(rowData)}
            >
              View
            </Button>
          </div>
        );

      default:
        return rowData?.[columnKey] ?? "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 w-full sm:max-w-[360px]">
            <Select
              size="sm"
              className="max-w-[150px] shrink-0"
              selectionMode="single"
              selectedKeys={[searchType]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                setSearchType(key || "invoiceNo");
              }}
            >
              {SEARCH_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>

            <Input
              isClearable
              size="sm"
              className="w-full"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search ..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  variant="flat"
                >
                  {statusFilter}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={[statusFilter]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  setStatusFilter(key);
                  setPage(1);
                }}
              >
                {STATUS_FILTER_OPTIONS?.map((column) => (
                  <DropdownItem key={column.value} className="capitalize">
                    {column.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
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
                {columns?.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} purchase invoices
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
    searchType,
    statusFilter,
    visibleColumns,
    rowsPerPage,
    count,
    onSearchChange,
    onClear,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
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
  }, [page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Purchase invoices
      </h1>

      {loading === "pending" && <LoadingSpinner />}

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Purchase invoices table with custom cells and pagination"
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

        <TableBody
          emptyContent={"No purchase invoices found"}
          items={paginatedItems}
        >
          {(item) => (
            <TableRow key={item.rowKey}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Purchase Invoice</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <PurchaseInvoiceView invoiceData={selectedInvoice} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PurchaseInvoices;
