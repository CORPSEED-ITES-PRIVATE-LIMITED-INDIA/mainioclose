import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Pagination,
  ScrollShadow,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
} from "@heroui/react";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Landmark,
  ReceiptText,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  getLedgerTransactions,
  resetLedgerTransactions,
  selectLedgerStatement,
  selectLedgerTransactions,
  selectLedgerTransactionsError,
  selectLedgerTransactionsLoading,
} from "../../toolkit/slices/organizationSlice";

const PAGE_SIZE = 50;

const voucherTypeOptions = [
  "ALL",
  "Sales Invoice",
  "Purchase",
  "Receipt",
  "Payment",
  "Credit Note",
  "Journal",
];

const defaultFilterValues = {
  fromDate: "",
  toDate: "",
  voucherType: "ALL",
  search: "",
};

const LedgerEntriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { ledgerId } = useParams();

  const ledgerStatement = useSelector(selectLedgerStatement);
  const transactions = useSelector(selectLedgerTransactions);
  const loading = useSelector(selectLedgerTransactionsLoading);
  const error = useSelector(selectLedgerTransactionsError);

  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: defaultFilterValues,
    mode: "onTouched",
  });

  const fromDate = watch("fromDate");
  const toDate = watch("toDate");
  const voucherType = watch("voucherType");
  const search = watch("search");

  useEffect(() => {
    if (!ledgerId) return;

    dispatch(
      getLedgerTransactions({
        ledgerId,
        fromDate: appliedFilters.fromDate,
        toDate: appliedFilters.toDate,
        page: currentPage,
        size: PAGE_SIZE,
      }),
    );
  }, [dispatch, ledgerId, appliedFilters, currentPage]);

  useEffect(() => {
    return () => {
      dispatch(resetLedgerTransactions());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      addToast({
        title: error,
        color: "danger",
      });
    }
  }, [error]);

  const ledger = useMemo(() => {
    const stateLedger = location?.state?.ledger || {};
    const rawLedgerType =
      ledgerStatement?.ledgerType || stateLedger.ledgerType || "";

    return {
      id: ledgerStatement?.ledgerId || stateLedger.id || ledgerId,
      ledgerCode: ledgerStatement?.ledgerCode || stateLedger.ledgerCode || "-",
      name:
        ledgerStatement?.ledgerName ||
        stateLedger.ledgerName ||
        stateLedger.name ||
        "Ledger",
      ledgerType: rawLedgerType || "-",
      ledgerCategory: resolveLedgerCategory(
        rawLedgerType,
        stateLedger.ledgerCategory,
      ),
      groupName:
        stateLedger.groupName ||
        stateLedger.ledgerGroupName ||
        stateLedger.ledgerGroup?.name ||
        "-",
      currentBalance:
        ledgerStatement?.closingBalanceAmount ??
        stateLedger.currentBalance ??
        stateLedger.currentBalanceAmount ??
        0,
      currentBalanceType: formatBalanceType(
        ledgerStatement?.closingBalanceType ||
          stateLedger.currentBalanceType ||
          "",
      ),
      entries: transactions.map(mapApiTransactionToEntry),
    };
  }, [ledgerStatement, transactions, location?.state?.ledger, ledgerId]);

  const filteredEntries = useMemo(() => {
    let rows = [...(ledger?.entries || [])];

    if (voucherType && voucherType !== "ALL") {
      rows = rows.filter((entry) => entry.voucherType === voucherType);
    }

    if (search?.trim()) {
      const keyword = search.trim().toLowerCase();

      rows = rows.filter((entry) => {
        return (
          String(entry.voucherNo || "")
            .toLowerCase()
            .includes(keyword) ||
          String(entry.voucherType || "")
            .toLowerCase()
            .includes(keyword) ||
          String(entry.particulars || "")
            .toLowerCase()
            .includes(keyword)
        );
      });
    }

    return rows;
  }, [ledger, voucherType, search]);

  const tableRows = useMemo(() => {
    return filteredEntries.flatMap((entry) => {
      const rows = [
        {
          rowType: "ENTRY",
          rowKey: `entry-${entry.id}`,
          entry,
        },
      ];

      if (expandedEntryId === entry.id && entry.isSalesInvoice) {
        rows.push({
          rowType: "GST",
          rowKey: `gst-${entry.id}`,
          entry,
        });
      }

      return rows;
    });
  }, [filteredEntries, expandedEntryId]);

  const handleToggleGstDetails = (entry) => {
    if (!entry?.isSalesInvoice) return;

    setExpandedEntryId((prevId) => (prevId === entry.id ? null : entry.id));
  };

  const reportSummary = useMemo(() => {
    const hasLocalFilter =
      (voucherType && voucherType !== "ALL") || Boolean(search?.trim());

    if (!hasLocalFilter) {
      return {
        totalDebit: Number(ledgerStatement?.totalDebit || 0),
        totalCredit: Number(ledgerStatement?.totalCredit || 0),
        closingBalance: Number(ledgerStatement?.closingBalanceAmount || 0),
        closingBalanceType: formatBalanceType(
          ledgerStatement?.closingBalanceType,
        ),
        totalEntries: Number(ledgerStatement?.totalElements || 0),
      };
    }

    const totalDebit = filteredEntries.reduce(
      (sum, item) => sum + Number(item.debit || 0),
      0,
    );

    const totalCredit = filteredEntries.reduce(
      (sum, item) => sum + Number(item.credit || 0),
      0,
    );

    const closingEntry = filteredEntries[filteredEntries.length - 1];

    return {
      totalDebit,
      totalCredit,
      closingBalance: closingEntry?.balance ?? ledger?.currentBalance ?? 0,
      closingBalanceType:
        closingEntry?.balanceType ?? ledger?.currentBalanceType ?? "",
      totalEntries: filteredEntries.length,
    };
  }, [filteredEntries, ledger, ledgerStatement, voucherType, search]);

  const onApplyFilter = (values) => {
    setCurrentPage(1);
    setAppliedFilters({
      fromDate: values.fromDate || "",
      toDate: values.toDate || "",
    });

    addToast({
      title: "Filter applied",
      color: "success",
    });
  };

  const onInvalid = () => {
    addToast({
      title: "Please correct date range filter",
      color: "danger",
    });
  };

  const handleClearFilter = () => {
    reset(defaultFilterValues);
    setCurrentPage(1);
    setAppliedFilters({
      fromDate: "",
      toDate: "",
    });
  };

  const totalPages = Math.max(Number(ledgerStatement?.totalPages || 1), 1);
  const totalElements = Number(ledgerStatement?.totalElements || 0);

  return (
    <div className="h-[calc(100vh-120px)] min-h-0 w-full overflow-hidden p-4 text-sm">
      <style>
        {`
    @keyframes tallyOpen {
      from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        max-height: 56px;
        transform: translateY(0);
      }
    }

    .animate-tally-open {
      animation: tallyOpen 220ms ease-out;
    }
  `}
      </style>

      <Card className="h-full border border-slate-200" shadow="none">
        <CardBody className="flex h-full min-h-0 flex-col p-0">
          {/* Header */}
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <Button isIconOnly variant="flat" onPress={() => navigate(-1)}>
                  <ArrowLeft size={18} />
                </Button>

                <LedgerIcon category={ledger.ledgerCategory} />

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-slate-950">
                    Ledger Entries
                  </h1>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {ledger.name}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span>{ledger.ledgerType}</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span>{ledger.groupName}</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span>{ledger.ledgerCode}</span>
                  </div>
                </div>
              </div>

              <Chip
                variant="flat"
                className="w-fit bg-emerald-50 font-semibold text-emerald-700"
              >
                Current Balance: {formatCurrency(ledger.currentBalance)}{" "}
                {ledger.currentBalanceType}
              </Chip>
            </div>

            {/* Filters */}
            <form onSubmit={handleSubmit(onApplyFilter, onInvalid)}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[180px_180px_220px_minmax(240px,1fr)_auto]">
                <Controller
                  name="fromDate"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || !toDate) return true;
                      return (
                        value <= toDate || "From date cannot be after To date"
                      );
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      size="sm"
                      type="date"
                      label="From Date"
                      startContent={
                        <CalendarDays size={15} className="text-slate-400" />
                      }
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="toDate"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || !fromDate) return true;
                      return (
                        value >= fromDate ||
                        "To date cannot be before From date"
                      );
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      size="sm"
                      type="date"
                      label="To Date"
                      startContent={
                        <CalendarDays size={15} className="text-slate-400" />
                      }
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="voucherType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Voucher Type"
                      selectedKeys={field.value ? [field.value] : ["ALL"]}
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] || "ALL")
                      }
                    >
                      {voucherTypeOptions.map((item) => (
                        <SelectItem key={item}>{item}</SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="search"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      isClearable
                      label="Search"
                      placeholder="Voucher no, type, particulars..."
                      startContent={
                        <Search size={15} className="text-slate-400" />
                      }
                      onClear={() => field.onChange("")}
                    />
                  )}
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={loading}
                    className="bg-emerald-700 font-semibold text-white"
                  >
                    Apply
                  </Button>

                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={loading}
                    onPress={handleClearFilter}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Entries"
              value={reportSummary.totalEntries}
              icon={ReceiptText}
            />

            <SummaryCard
              label="Total Debit"
              value={formatCurrency(reportSummary.totalDebit)}
              icon={ArrowUpRight}
            />

            <SummaryCard
              label="Total Credit"
              value={formatCurrency(reportSummary.totalCredit)}
              icon={ArrowDownRight}
            />

            <SummaryCard
              label="Closing Balance"
              value={`${formatCurrency(reportSummary.closingBalance)} ${
                reportSummary.closingBalanceType
              }`}
              icon={Wallet}
            />
          </div>

          {/* Table */}
          <ScrollShadow className="min-h-0 flex-1 overflow-auto px-5 py-4">
            <Table
              isHeaderSticky
              removeWrapper
              aria-label="Ledger entries table"
              classNames={{
                th: "bg-emerald-50 text-emerald-900 text-xs font-semibold",
                td: "text-xs text-slate-700",
                table: "min-w-[1000px]",
              }}
            >
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Voucher No.</TableColumn>
                <TableColumn>Voucher Type</TableColumn>
                <TableColumn>Particulars</TableColumn>
                <TableColumn align="end">Debit</TableColumn>
                <TableColumn align="end">Credit</TableColumn>
                <TableColumn align="end">Balance</TableColumn>
              </TableHeader>

              <TableBody
                isLoading={loading}
                loadingContent={
                  <Spinner size="sm" label="Loading entries..." />
                }
                emptyContent={
                  error || "No ledger entries found for selected filters"
                }
                items={tableRows}
              >
                {(row) => {
                  if (row.rowType === "GST") {
                    return (
                      <TableRow key={row.rowKey}>
                        <TableCell className="whitespace-nowrap align-top">
                          {formatDate(row.entry?.entryDate)}
                        </TableCell>

                        <TableCell />
                        <TableCell />

                        <TableCell className="py-0">
                          <TallyGstNestedLine entry={row.entry} />
                        </TableCell>

                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    );
                  }

                  const entry = row.entry;

                  return (
                    <TableRow key={row.rowKey}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.entryDate)}
                      </TableCell>

                      <TableCell className="whitespace-nowrap font-semibold">
                        {entry.isSalesInvoice ? (
                          <Button
                            size="sm"
                            variant="light"
                            className="h-auto min-w-0 px-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            onPress={() => handleToggleGstDetails(entry)}
                          >
                            {entry.voucherNo || "-"}
                          </Button>
                        ) : (
                          entry.voucherNo || "-"
                        )}
                      </TableCell>

                      <TableCell>
                        {entry.isSalesInvoice ? (
                          <button
                            type="button"
                            onClick={() => handleToggleGstDetails(entry)}
                            className="cursor-pointer"
                          >
                            <Chip
                              size="sm"
                              variant="flat"
                              className="bg-slate-100 text-xs text-slate-700 hover:bg-emerald-100 hover:text-emerald-700"
                            >
                              {entry.voucherType || "-"}
                            </Chip>
                          </button>
                        ) : (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="bg-slate-100 text-xs text-slate-700"
                          >
                            {entry.voucherType || "-"}
                          </Chip>
                        )}
                      </TableCell>

                      <TableCell>{entry.particulars || "-"}</TableCell>

                      <TableCell className="whitespace-nowrap text-right font-semibold">
                        {Number(entry.debit || 0)
                          ? formatCurrency(entry.debit)
                          : "-"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-right font-semibold">
                        {Number(entry.credit || 0)
                          ? formatCurrency(entry.credit)
                          : "-"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-right font-bold text-slate-950">
                        {formatCurrency(entry.balance)} {entry.balanceType}
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </ScrollShadow>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Showing page {currentPage} of {totalPages} | Total:{" "}
              {totalElements}
            </p>

            <Pagination
              showControls
              size="sm"
              page={currentPage}
              total={totalPages}
              isDisabled={loading}
              onChange={setCurrentPage}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const mapApiTransactionToEntry = (entry) => {
  const formattedVoucherType = formatVoucherType(entry.voucherType);
  const isSalesInvoice = isSalesInvoiceVoucher(entry.voucherType);

  const mappedEntry = {
    id:
      entry.entryId ||
      `${entry.voucherId || "voucher"}-${entry.sourceId || ""}`,
    entryDate: entry.voucherDate,
    voucherNo: entry.voucherNumber,
    voucherType: formattedVoucherType,
    rawVoucherType: entry.voucherType,
    particulars: entry.narration || entry.sourceType || "-",
    debit: entry.debitAmount,
    credit: entry.creditAmount,
    balance: entry.runningBalanceAmount,
    balanceType: formatBalanceType(entry.runningBalanceType),
    isSalesInvoice,
    raw: entry,
  };

  return {
    ...mappedEntry,
    gstDetails: getSalesInvoiceGstDetails(mappedEntry),
  };
};

const resolveLedgerCategory = (ledgerType, fallbackCategory) => {
  const type = String(ledgerType || fallbackCategory || "").toUpperCase();

  if (type.includes("BANK")) return "BANK";
  if (type.includes("VENDOR") || type.includes("SUPPLIER")) return "VENDOR";
  if (type.includes("CUSTOMER")) return "CUSTOMER";
  if (type.includes("SALES") || type.includes("INCOME")) return "INCOME";

  return fallbackCategory || "CUSTOMER";
};

const LedgerIcon = ({ category }) => {
  const Icon =
    category === "BANK" ? Landmark : category === "VENDOR" ? Users : Building2;

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
      <Icon size={22} />
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon }) => {
  return (
    <Card
      shadow="none"
      className="border border-emerald-100 bg-gradient-to-br from-white to-emerald-50"
    >
      <CardBody className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 whitespace-nowrap text-base font-bold text-slate-950">
              {value}
            </p>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon size={17} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "-";

  const numberValue = Number(amount);

  if (Number.isNaN(numberValue)) return "-";

  return `₹${numberValue.toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatBalanceType = (type) => {
  if (!type) return "";

  const normalized = String(type).toUpperCase();

  if (normalized === "DEBIT") return "DR";
  if (normalized === "CREDIT") return "CR";

  return normalized;
};

const formatVoucherType = (type) => {
  if (!type) return "-";

  return String(type)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const TallyGstNestedLine = ({ entry }) => {
  const gstAmount = Number(entry?.gstDetails?.gstAmount || 0);
  const suffix = Number(entry?.debit || 0) > 0 ? "Dr" : "Cr";

  return (
    <div className="animate-tally-open overflow-hidden">
      <div className="py-1 text-xs text-slate-950">
        <div className="font-bold">(as per details)</div>

        <div className="mt-0.5 flex max-w-[360px] items-center justify-between gap-8 pl-7 font-semibold">
          <span>GST</span>
          <span className="whitespace-nowrap">
            {formatCurrency(gstAmount)} {suffix}
          </span>
        </div>
      </div>
    </div>
  );
};

const isSalesInvoiceVoucher = (type) => {
  const normalized = String(type || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  return normalized === "SALES_INVOICE";
};

const getSalesInvoiceGstDetails = (entry = {}) => {
  const raw = entry.raw || {};
  const amount = Number(entry.debit || entry.credit || 0);

  const apiGstAmount =
    raw.gstAmount ??
    raw.totalGstAmount ??
    raw.totalTax ??
    raw.taxAmount ??
    entry.gstAmount;

  if (
    apiGstAmount !== null &&
    apiGstAmount !== undefined &&
    apiGstAmount !== ""
  ) {
    const gstAmount = Number(apiGstAmount);

    return {
      gstAmount: Number.isNaN(gstAmount) ? 0 : gstAmount,
    };
  }

  const gstRate = 18;
  const gstAmount = amount ? (amount * gstRate) / (100 + gstRate) : 0;

  return {
    gstAmount: Number(gstAmount.toFixed(2)),
  };
};

export default LedgerEntriesPage;
