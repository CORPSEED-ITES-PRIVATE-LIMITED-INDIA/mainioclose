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
import NewSelect from "../../components/NewSelect";
import DebitNoteView from "../../components/DebitNoteView";
import { getGovernmentFeeDebitNotes } from "../../toolkit/slices/accountSlice";

// This list is backed by the government-fee journal-voucher API
// (GET /accountService/api/v1/internal/project-expenses/government-fee/vouchers) —
// each posted government-fee expense creates one or more vouchers (fund
// transfer, accrual, payment), shown here as "Debit Notes" against the
// project they were raised for. The endpoint only takes `page`/`size`
// today, so the search box and status filter below only narrow the
// currently-loaded page; once the backend accepts a search/status query
// param, wire it into the dispatch below instead.
export const columns = [
  { name: "ID", uid: "operationExpenseId" },
  { name: "VOUCHER NO.", uid: "voucherNumber" },
  { name: "VOUCHER TYPE", uid: "voucherType" },
  { name: "VOUCHER DATE", uid: "voucherDate" },
  { name: "PROJECT", uid: "project" },
  { name: "SOURCE", uid: "sourceType" },
  { name: "AMOUNT", uid: "amount" },
  { name: "STATUS", uid: "status" },
  { name: "CREATED AT", uid: "createdAt" },
  { name: "NARRATION", uid: "narration" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "voucherNumber",
  "voucherType",
  "voucherDate",
  "project",
  "sourceType",
  "amount",
  "status",
  "actions",
];

const SEARCH_TYPE_OPTIONS = [
  { label: "Voucher number", value: "voucherNumber" },
  { label: "Narration / project", value: "narration" },
];

const getStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "POSTED":
      return "success";

    case "DRAFT":
    case "PENDING":
      return "warning";

    case "CANCELLED":
    case "REVERSED":
      return "danger";

    default:
      return "default";
  }
};

// Narration comes as free text, e.g. "Government fee approved for project
// PRJ-20260806-122606-0146, expense ID 22. KIKUI" — pull the project number
// out of it since the API doesn't expose it as its own field.
const parseProjectNoFromNarration = (narration) => {
  const match = String(narration || "").match(/PRJ-[\w-]+/i);
  return match ? match[0] : "";
};

// "PROJECT_EXPENSE_GOVT_FEE_PAYMENT" -> "Project expense govt fee payment"
const humanize = (value) => {
  if (!value) return "-";

  const words = String(value).toLowerCase().split("_");
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getVoucherTypeColor = (voucherType) => {
  switch (String(voucherType || "").toUpperCase()) {
    case "PAYMENT":
      return "success";

    case "JOURNAL":
      return "primary";

    case "CONTRA":
      return "secondary";

    default:
      return "default";
  }
};

const DebitNotes = () => {
  const dispatch = useDispatch();

  const governmentFeeDebitNoteList = useSelector(
    (state) => state.account.governmentFeeDebitNoteList,
  );
  const loading = useSelector(
    (state) => state.account.governmentFeeDebitNoteLoading,
  );
  const loadError = useSelector(
    (state) => state.account.governmentFeeDebitNoteError,
  );

  const viewModal = useDisclosure();
  const [selectedNote, setSelectedNote] = useState(null);

  const [filterValue, setFilterValue] = useState("");
  const [searchType, setSearchType] = useState("voucherNumber");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getGovernmentFeeDebitNotes({ page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const rows = useMemo(() => {
    const content = Array.isArray(governmentFeeDebitNoteList?.content)
      ? governmentFeeDebitNoteList.content
      : [];

    return content.map((row) => ({
      ...row,
      project: parseProjectNoFromNarration(row?.narration),
    }));
  }, [governmentFeeDebitNoteList]);

  const totalElements = governmentFeeDebitNoteList?.totalElements || 0;
  const totalPages = Math.max(1, governmentFeeDebitNoteList?.totalPages || 1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  // Client-side only — narrows the already-fetched page, see note above.
  const filteredItems = useMemo(() => {
    if (!hasSearchFilter) return rows;

    const search = filterValue.trim().toLowerCase();

    if (searchType === "narration") {
      return rows.filter((item) =>
        String(item?.narration || "")
          .toLowerCase()
          .includes(search),
      );
    }

    return rows.filter((item) =>
      String(item?.voucherNumber || "")
        .toLowerCase()
        .includes(search),
    );
  }, [rows, filterValue, hasSearchFilter, searchType]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const onNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const handleViewNote = (rowData) => {
    setSelectedNote(rowData);
    viewModal.onOpen();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "voucherNumber":
        return (
          <p
            className="text-[12.5px] font-medium text-blue-600 cursor-pointer"
            onClick={() => handleViewNote(rowData)}
          >
            {rowData?.voucherNumber || "-"}
          </p>
        );

      case "voucherDate":
        return (
          <span className="whitespace-nowrap text-[12.5px]">
            {rowData?.voucherDate
              ? dayjs(rowData.voucherDate).format("DD-MM-YYYY")
              : "-"}
          </span>
        );

      case "project":
        return <span className="text-[12.5px]">{rowData?.project || "-"}</span>;

      case "voucherType":
        return (
          <Chip
            size="sm"
            className="capitalize"
            variant="flat"
            color={getVoucherTypeColor(rowData?.voucherType)}
          >
            {rowData?.voucherType || "-"}
          </Chip>
        );

      case "sourceType":
        return (
          <span className="text-[12.5px]" title={rowData?.sourceType}>
            {humanize(rowData?.sourceType)}
          </span>
        );

      case "amount":
        return (
          <span className="font-semibold text-[12.5px]">
            {inrCurrency(rowData?.amount || 0)}
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
            {rowData?.status || "-"}
          </Chip>
        );

      case "createdAt":
        return (
          <span className="whitespace-nowrap text-[12.5px]">
            {rowData?.createdAt
              ? dayjs(rowData.createdAt).format("DD-MM-YYYY hh:mm A")
              : "-"}
          </span>
        );

      case "narration":
        return (
          <p
            className="max-w-[280px] truncate text-[12.5px]"
            title={rowData?.narration}
          >
            {rowData?.narration || "-"}
          </p>
        );

      case "actions":
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="flat"
              onPress={() => handleViewNote(rowData)}
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
          <div className="flex items-center gap-1.5 w-full sm:max-w-[380px]">
            <Select
              size="sm"
              className="max-w-[180px] shrink-0"
              selectionMode="single"
              selectedKeys={[searchType]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                setSearchType(key || "voucherNumber");
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
            Total {totalElements} debit notes
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    searchType,
    visibleColumns,
    rowsPerPage,
    totalElements,
    onSearchChange,
    onClear,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {page} of {totalPages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={totalPages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={totalPages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, totalPages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Debit notes
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Debit notes (government fee vouchers) table"
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
          isLoading={loading === "pending"}
          emptyContent={
            loading === "pending"
              ? "Loading debit notes..."
              : loadError || "No debit notes found"
          }
          items={filteredItems}
        >
          {(item) => (
            <TableRow key={item.operationExpenseId ?? item.voucherId}>
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
          <ModalHeader>Debit Note</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <DebitNoteView invoiceData={selectedNote} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DebitNotes;
