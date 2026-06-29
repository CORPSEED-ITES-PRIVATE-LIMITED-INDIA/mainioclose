import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  ModalContent,
  ModalHeader,
  ModalBody,
  addToast,
  ModalFooter,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  IndianRupee,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAccountingVoucher,
  getAccountingVouchers,
  fetchLedgers,
} from "../../toolkit/slices/organizationSlice";
import NewSelect from "../../components/NewSelect";
import { inrCurrency, safeNum } from "../../common";

export const columns = [
  { name: "VOUCHER NO", uid: "voucherNumber", sortable: true },
  { name: "VOUCHER TYPE", uid: "voucherType" },
  { name: "SOURCE", uid: "sourceType" },
  { name: "DATE", uid: "voucherDate", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "AMOUNT", uid: "amount" },
  { name: "ENTRIES", uid: "entries" },
  { name: "NARRATION", uid: "narration" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "voucherNumber",
  "voucherType",
  "sourceType",
  "voucherDate",
  "status",
  "amount",
  "entries",
  "actions",
];

const voucherTypeOptions = [
  "RECEIPT",
  "SALES_INVOICE",
  "ADVANCE_ADJUSTMENT",
  "CREDIT_NOTE",
  "REFUND",
  "JOURNAL",
  "CONTRA",
  "PAYMENT",
];

const sourceTypeOptions = [
  "PAYMENT_RECEIPT",
  "INVOICE",
  "UNBILLED_INVOICE",
  "CREDIT_NOTE",
  "REFUND",
  "MANUAL",
];

const statusOptions = ["DRAFT", "POSTED", "CANCELLED", "REVERSED"];

const defaultVoucherData = {
  voucherType: "RECEIPT",
  voucherDate: new Date().toISOString().slice(0, 10),
  sourceType: "MANUAL",
  sourceId: "",
  narration: "",
};

const defaultEntries = [
  {
    ledgerId: "",
    debitAmount: "",
    creditAmount: "",
    narration: "",
  },
  {
    ledgerId: "",
    debitAmount: "",
    creditAmount: "",
    narration: "",
  },
];

const getApiErrorMessage = (error) => {
  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Something went wrong"
  );
};

const Voucher = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const accountingVoucherList = useSelector(
    (state) => state.organization.accountingVoucherList,
  );
  const accountingVoucherTotalElements = useSelector(
    (state) => state.organization.accountingVoucherTotalElements,
  );
  const accountingVoucherTotalPages = useSelector(
    (state) => state.organization.accountingVoucherTotalPages,
  );
  const accountingVoucherLoading = useSelector(
    (state) => state.organization.accountingVoucherLoading,
  );
  const accountingVoucherSaving = useSelector(
    (state) => state.organization.accountingVoucherSaving,
  );
  const ledgerApiList = useSelector((state) => state.organization.ledgers);
  const legacyLedgerList = useSelector(
    (state) => state.organization.ledgerList,
  );

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "voucherDate",
    direction: "descending",
  });

  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [voucherData, setVoucherData] = useState(defaultVoucherData);
  const [entries, setEntries] = useState(defaultEntries);
  const [editData, setEditData] = useState(null);
  const [page, setPage] = useState(1);

  const data = Array.isArray(accountingVoucherList)
    ? accountingVoucherList
    : [];
  const count = Number(accountingVoucherTotalElements || data.length || 0);
  const pages = Number(accountingVoucherTotalPages || 1);

  const ledgerListOption = useMemo(() => {
    const list = Array.isArray(ledgerApiList)
      ? ledgerApiList
      : Array.isArray(legacyLedgerList)
        ? legacyLedgerList
        : [];

    return list.map((ledger) => ({
      ...ledger,
      displayName: `${ledger.ledgerName || ledger.name || "-"}${
        ledger.ledgerCode ? ` (${ledger.ledgerCode})` : ""
      }`,
    }));
  }, [ledgerApiList, legacyLedgerList]);

  const totalDebit = useMemo(() => {
    return entries.reduce((sum, entry) => sum + safeNum(entry.debitAmount), 0);
  }, [entries]);

  const totalCredit = useMemo(() => {
    return entries.reduce((sum, entry) => sum + safeNum(entry.creditAmount), 0);
  }, [entries]);

  const difference = totalDebit - totalCredit;

  const fetchVoucherList = useCallback(() => {
    dispatch(
      getAccountingVouchers({
        voucherType: voucherTypeFilter,
        sourceType: sourceTypeFilter,
        status: statusFilter,
        fromDate,
        toDate,
        page,
        size: rowsPerPage,
      }),
    );
  }, [
    dispatch,
    voucherTypeFilter,
    sourceTypeFilter,
    statusFilter,
    fromDate,
    toDate,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchVoucherList();
  }, [fetchVoucherList]);

  useEffect(() => {
    dispatch(fetchLedgers({ page: 1, size: 500, active: "true" }));
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    const list = [...data];

    if (!filterValue.trim()) return list;

    const keyword = filterValue.toLowerCase();

    return list.filter((item) => {
      return (
        item.voucherNumber?.toLowerCase().includes(keyword) ||
        item.voucherType?.toLowerCase().includes(keyword) ||
        item.sourceType?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword) ||
        item.narration?.toLowerCase().includes(keyword) ||
        item.entries?.some((entry) =>
          String(entry.ledgerName || "")
            .toLowerCase()
            .includes(keyword),
        )
      );
    });
  }, [data, filterValue]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const resetVoucherForm = () => {
    setVoucherData(defaultVoucherData);
    setEntries(defaultEntries);
    setEditData(null);
  };

  const handleOpenCreate = () => {
    resetVoucherForm();
    onOpen();
  };

  const updateEntry = (index, key, value) => {
    setEntries((previousEntries) =>
      previousEntries.map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              [key]: value,
            }
          : entry,
      ),
    );
  };

  const addEntryRow = () => {
    setEntries((previousEntries) => [
      ...previousEntries,
      {
        ledgerId: "",
        debitAmount: "",
        creditAmount: "",
        narration: "",
      },
    ]);
  };

  const removeEntryRow = (index) => {
    if (entries.length <= 2) {
      addToast({
        title: "Minimum 2 entries are required",
        color: "danger",
      });
      return;
    }

    setEntries((previousEntries) =>
      previousEntries.filter((_, entryIndex) => entryIndex !== index),
    );
  };

  const buildPayload = () => {
    return {
      voucherType: voucherData.voucherType,
      voucherDate: voucherData.voucherDate,
      sourceType: voucherData.sourceType,
      sourceId: voucherData.sourceId ? Number(voucherData.sourceId) : 0,
      narration: voucherData.narration || "",
      entries: entries.map((entry) => ({
        ledgerId: Number(entry.ledgerId),
        debitAmount: safeNum(entry.debitAmount),
        creditAmount: safeNum(entry.creditAmount),
        narration: entry.narration || "",
      })),
    };
  };

  const validateVoucher = () => {
    if (!voucherData.voucherType) return "Voucher type is required";
    if (!voucherData.voucherDate) return "Voucher date is required";
    if (!voucherData.sourceType) return "Source type is required";

    if (entries.length < 2) {
      return "At least 2 voucher entries are required";
    }

    const invalidEntry = entries.find((entry) => {
      const debitAmount = safeNum(entry.debitAmount);
      const creditAmount = safeNum(entry.creditAmount);

      return (
        !entry.ledgerId ||
        (debitAmount <= 0 && creditAmount <= 0) ||
        (debitAmount > 0 && creditAmount > 0)
      );
    });

    if (invalidEntry) {
      return "Each row must have ledger and either debit or credit amount";
    }

    if (totalDebit <= 0 || totalCredit <= 0) {
      return "Voucher must have both debit and credit entries";
    }

    if (Number(difference.toFixed(2)) !== 0) {
      return "Total debit and total credit must be equal";
    }

    return "";
  };

  const handleSubmit = useCallback(async () => {
    const validationError = validateVoucher();

    if (validationError) {
      addToast({ title: validationError, color: "danger" });
      return;
    }

    try {
      const payload = buildPayload();

      await dispatch(createAccountingVoucher(payload)).unwrap();

      addToast({
        title: "Voucher created successfully!",
        color: "success",
      });

      fetchVoucherList();
      resetVoucherForm();
      onClose();
    } catch (error) {
      addToast({
        title: getApiErrorMessage(error),
        color: "danger",
      });
    }
  }, [
    dispatch,
    voucherData,
    entries,
    totalDebit,
    totalCredit,
    difference,
    fetchVoucherList,
    onClose,
  ]);

  const renderCell = useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "voucherNumber":
        return (
          <span className="text-sm font-medium">
            {rowData?.voucherNumber || "-"}
          </span>
        );

      case "voucherType":
        return <p className="text-sm">{rowData?.voucherType || "-"}</p>;

      case "sourceType":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm">{rowData?.sourceType || "-"}</p>
            <p className="text-xs text-default-400">
              Source ID: {rowData?.sourceId ?? "-"}
            </p>
          </div>
        );

      case "voucherDate":
        return <p className="text-sm">{rowData?.voucherDate || "-"}</p>;

      case "status":
        return (
          <Chip
            size="sm"
            color={rowData?.status === "POSTED" ? "success" : "default"}
            variant="flat"
          >
            {rowData?.status || "-"}
          </Chip>
        );

      case "amount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm">
              Debit: {inrCurrency(rowData?.totalDebit) || "-"}
            </p>
            <p className="text-sm">
              Credit: {inrCurrency(rowData?.totalCredit) || "-"}
            </p>
          </div>
        );

      case "entries":
        return (
          <div className="flex flex-col gap-1">
            {(rowData?.entries || []).slice(0, 3).map((entry) => (
              <p
                key={entry.id || `${entry.ledgerId}-${entry.displayOrder}`}
                className="text-xs"
              >
                {entry.debitAmount > 0 ? "Dr" : "Cr"} {entry.ledgerName || "-"}{" "}
                - {inrCurrency(entry.debitAmount || entry.creditAmount)}
              </p>
            ))}
            {(rowData?.entries || []).length > 3 && (
              <p className="text-xs text-default-400">
                +{rowData.entries.length - 3} more
              </p>
            )}
          </div>
        );

      case "narration":
        return (
          <p className="max-w-[250px] truncate text-sm">
            {rowData?.narration || "-"}
          </p>
        );

      case "actions":
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selectedAction = Array.from(keys)[0];

                  if (selectedAction === "view") {
                    addToast({
                      title: "Voucher entries are shown in the Entries column",
                      color: "primary",
                    });
                  }
                }}
              >
                <DropdownItem key="view">View Entries</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return cellValue || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (page < pages) setPage(page + 1);
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

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
            <Button
              color="primary"
              endContent={<Plus />}
              onPress={handleOpenCreate}
            >
              Add voucher
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Select
            label="Voucher type"
            size="sm"
            selectedKeys={[voucherTypeFilter]}
            onSelectionChange={(keys) =>
              handleFilterChange(setVoucherTypeFilter)(Array.from(keys)[0])
            }
          >
            <SelectItem key="ALL">All</SelectItem>
            {voucherTypeOptions.map((type) => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>

          <Select
            label="Source type"
            size="sm"
            selectedKeys={[sourceTypeFilter]}
            onSelectionChange={(keys) =>
              handleFilterChange(setSourceTypeFilter)(Array.from(keys)[0])
            }
          >
            <SelectItem key="ALL">All</SelectItem>
            {sourceTypeOptions.map((type) => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>

          <Select
            label="Status"
            size="sm"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) =>
              handleFilterChange(setStatusFilter)(Array.from(keys)[0])
            }
          >
            <SelectItem key="ALL">All</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status}>{status}</SelectItem>
            ))}
          </Select>

          <Input
            label="From date"
            size="sm"
            type="date"
            value={fromDate}
            onValueChange={handleFilterChange(setFromDate)}
          />

          <Input
            label="To date"
            size="sm"
            type="date"
            value={toDate}
            onValueChange={handleFilterChange(setToDate)}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {count} vouchers
          </span>
          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-hidden"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="15">15</option>
              <option value="20">20</option>
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
    voucherTypeFilter,
    sourceTypeFilter,
    statusFilter,
    fromDate,
    toDate,
    rowsPerPage,
    count,
    onRowsPerPageChange,
    onSearchChange,
    onClear,
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
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
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
  }, [selectedKeys, count, page, pages, onPreviousPage, onNextPage]);

  const tableTopContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Select
            label="Voucher type"
            selectedKeys={
              voucherData.voucherType ? [voucherData.voucherType] : []
            }
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              setVoucherData((prev) => ({ ...prev, voucherType: key }));
            }}
          >
            {voucherTypeOptions.map((type) => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>

          <Input
            label="Voucher date"
            type="date"
            value={voucherData.voucherDate}
            onValueChange={(value) =>
              setVoucherData((prev) => ({ ...prev, voucherDate: value }))
            }
          />

          <Select
            label="Source type"
            selectedKeys={
              voucherData.sourceType ? [voucherData.sourceType] : []
            }
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              setVoucherData((prev) => ({ ...prev, sourceType: key }));
            }}
          >
            {sourceTypeOptions.map((type) => (
              <SelectItem key={type}>{type}</SelectItem>
            ))}
          </Select>

          <Input
            label="Source ID"
            type="number"
            value={voucherData.sourceId}
            onValueChange={(value) =>
              setVoucherData((prev) => ({ ...prev, sourceId: value }))
            }
          />

          <Input
            label="Narration"
            value={voucherData.narration}
            onValueChange={(value) =>
              setVoucherData((prev) => ({ ...prev, narration: value }))
            }
          />
        </div>
      </div>
    );
  }, [voucherData]);

  return (
    <>
      <h1 className="mb-1 font-sans text-2xl font-medium">Vouchers list</h1>
      <Table
        isHeaderSticky
        aria-label="Accounting vouchers table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh] w-full overflow-auto",
          table: "w-full",
        }}
        isLoading={accountingVoucherLoading}
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
        <TableBody emptyContent="No data found" items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader>
                {editData ? "Update voucher" : "Add voucher"}
              </ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <Table
                  aria-label="Create accounting voucher table"
                  topContent={tableTopContent}
                >
                  <TableHeader>
                    <TableColumn width={80}>S.No</TableColumn>
                    <TableColumn>LEDGER</TableColumn>
                    <TableColumn>NARRATION</TableColumn>
                    <TableColumn width={230}>DEBIT AMOUNT</TableColumn>
                    <TableColumn width={230}>CREDIT AMOUNT</TableColumn>
                    <TableColumn width={80}>ACTION</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow key={`entry-${index}`}>
                        <TableCell>{index + 1}.</TableCell>
                        <TableCell>
                          <NewSelect
                            label="Select ledger"
                            data={ledgerListOption}
                            labelKey="displayName"
                            valueKey="id"
                            value={String(entry.ledgerId || "")}
                            onChange={(value) =>
                              updateEntry(index, "ledgerId", value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Entry narration"
                            value={entry.narration}
                            onValueChange={(value) =>
                              updateEntry(index, "narration", value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            startContent={<IndianRupee className="h-4 w-4" />}
                            type="number"
                            value={entry.debitAmount}
                            onValueChange={(value) => {
                              updateEntry(index, "debitAmount", value);
                              if (safeNum(value) > 0) {
                                updateEntry(index, "creditAmount", "");
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            startContent={<IndianRupee className="h-4 w-4" />}
                            type="number"
                            value={entry.creditAmount}
                            onValueChange={(value) => {
                              updateEntry(index, "creditAmount", value);
                              if (safeNum(value) > 0) {
                                updateEntry(index, "debitAmount", "");
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={() => removeEntryRow(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow key="total-row">
                      <TableCell></TableCell>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell
                        className={
                          difference === 0 ? "text-success" : "text-danger"
                        }
                      >
                        Difference: {inrCurrency(Math.abs(difference))}
                      </TableCell>
                      <TableCell className="font-medium pl-6">
                        {inrCurrency(totalDebit)}
                      </TableCell>
                      <TableCell className="font-medium pl-6">
                        {inrCurrency(totalCredit)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <ModalFooter className="flex items-center justify-between gap-2">
                  <Button variant="flat" onPress={addEntryRow}>
                    Add Entry Row
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button onPress={modalClose}>Cancel</Button>
                    <Button
                      onPress={handleSubmit}
                      color="primary"
                      isLoading={accountingVoucherSaving}
                    >
                      Submit
                    </Button>
                  </div>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Voucher;
