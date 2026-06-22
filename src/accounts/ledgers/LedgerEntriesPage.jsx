import React, { useMemo } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
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
  FileText,
  Landmark,
  ReceiptText,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ledgerEntriesData = [
  {
    id: 1,
    ledgerCode: "LED-0001",
    name: "Corpseed ITES Pvt. Ltd.",
    ledgerType: "Company Ledger",
    ledgerCategory: "COMPANY",
    groupName: "Sundry Debtors",
    currentBalance: 245000,
    currentBalanceType: "DR",
    entries: [
      {
        id: 1,
        entryDate: "2026-04-05",
        voucherNo: "INV-001",
        voucherType: "Sales Invoice",
        particulars: "Sales Invoice - Project Service",
        debit: 250000,
        credit: 0,
        balance: 250000,
        balanceType: "DR",
      },
      {
        id: 2,
        entryDate: "2026-04-12",
        voucherNo: "RCPT-001",
        voucherType: "Receipt",
        particulars: "Payment Received",
        debit: 0,
        credit: 100000,
        balance: 150000,
        balanceType: "DR",
      },
      {
        id: 3,
        entryDate: "2026-04-18",
        voucherNo: "INV-002",
        voucherType: "Sales Invoice",
        particulars: "Consultancy Service Invoice",
        debit: 180000,
        credit: 0,
        balance: 330000,
        balanceType: "DR",
      },
      {
        id: 4,
        entryDate: "2026-04-25",
        voucherNo: "RCPT-002",
        voucherType: "Receipt",
        particulars: "Part Payment Received",
        debit: 0,
        credit: 85000,
        balance: 245000,
        balanceType: "DR",
      },
    ],
  },
  {
    id: 2,
    ledgerCode: "LED-0002",
    name: "Balaji Traders",
    ledgerType: "Vendor Ledger",
    ledgerCategory: "VENDOR",
    groupName: "Sundry Creditors",
    currentBalance: 185000,
    currentBalanceType: "CR",
    entries: [
      {
        id: 1,
        entryDate: "2026-04-08",
        voucherNo: "PUR-001",
        voucherType: "Purchase",
        particulars: "Purchase - Cement Material",
        debit: 0,
        credit: 300000,
        balance: 300000,
        balanceType: "CR",
      },
      {
        id: 2,
        entryDate: "2026-04-15",
        voucherNo: "PAY-001",
        voucherType: "Payment",
        particulars: "Vendor Payment",
        debit: 115000,
        credit: 0,
        balance: 185000,
        balanceType: "CR",
      },
      {
        id: 3,
        entryDate: "2026-04-21",
        voucherNo: "PUR-002",
        voucherType: "Purchase",
        particulars: "Purchase - Documentation Support",
        debit: 0,
        credit: 75000,
        balance: 260000,
        balanceType: "CR",
      },
      {
        id: 4,
        entryDate: "2026-04-28",
        voucherNo: "PAY-002",
        voucherType: "Payment",
        particulars: "Bank Payment To Vendor",
        debit: 75000,
        credit: 0,
        balance: 185000,
        balanceType: "CR",
      },
    ],
  },
  {
    id: 3,
    ledgerCode: "LED-0003",
    name: "HDFC Bank",
    ledgerType: "Bank Ledger",
    ledgerCategory: "BANK",
    groupName: "Bank Accounts",
    currentBalance: 1525000,
    currentBalanceType: "DR",
    entries: [
      {
        id: 1,
        entryDate: "2026-04-03",
        voucherNo: "RCPT-002",
        voucherType: "Receipt",
        particulars: "Client Receipt",
        debit: 750000,
        credit: 0,
        balance: 1750000,
        balanceType: "DR",
      },
      {
        id: 2,
        entryDate: "2026-04-10",
        voucherNo: "PAY-002",
        voucherType: "Payment",
        particulars: "Vendor Payment",
        debit: 0,
        credit: 225000,
        balance: 1525000,
        balanceType: "DR",
      },
      {
        id: 3,
        entryDate: "2026-04-17",
        voucherNo: "RCPT-003",
        voucherType: "Receipt",
        particulars: "Receipt From Customer",
        debit: 325000,
        credit: 0,
        balance: 1850000,
        balanceType: "DR",
      },
      {
        id: 4,
        entryDate: "2026-04-24",
        voucherNo: "PAY-003",
        voucherType: "Payment",
        particulars: "Office Expense Payment",
        debit: 0,
        credit: 325000,
        balance: 1525000,
        balanceType: "DR",
      },
    ],
  },
  {
    id: 4,
    ledgerCode: "LED-0004",
    name: "Sales Account",
    ledgerType: "Income Ledger",
    ledgerCategory: "INCOME",
    groupName: "Sales Accounts",
    currentBalance: 890000,
    currentBalanceType: "CR",
    entries: [
      {
        id: 1,
        entryDate: "2026-04-05",
        voucherNo: "INV-001",
        voucherType: "Sales Invoice",
        particulars: "Sales Invoice - Project Service",
        debit: 0,
        credit: 250000,
        balance: 250000,
        balanceType: "CR",
      },
      {
        id: 2,
        entryDate: "2026-04-20",
        voucherNo: "INV-002",
        voucherType: "Sales Invoice",
        particulars: "Sales Invoice - Consultancy",
        debit: 0,
        credit: 640000,
        balance: 890000,
        balanceType: "CR",
      },
      {
        id: 3,
        entryDate: "2026-04-26",
        voucherNo: "CN-001",
        voucherType: "Credit Note",
        particulars: "Sales Adjustment",
        debit: 50000,
        credit: 0,
        balance: 840000,
        balanceType: "CR",
      },
    ],
  },
];

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
  const navigate = useNavigate();
  const location = useLocation();
  const { ledgerId } = useParams();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFilterValues,
    mode: "onTouched",
  });

  const fromDate = watch("fromDate");
  const toDate = watch("toDate");
  const voucherType = watch("voucherType");
  const search = watch("search");

  const ledger = useMemo(() => {
    const foundLedger = ledgerEntriesData.find(
      (item) => String(item.id) === String(ledgerId),
    );

    return foundLedger || location?.state?.ledger || ledgerEntriesData[0];
  }, [ledgerId, location?.state?.ledger]);

  const filteredEntries = useMemo(() => {
    let rows = [...(ledger?.entries || [])];

    if (fromDate) {
      rows = rows.filter((entry) => entry.entryDate >= fromDate);
    }

    if (toDate) {
      rows = rows.filter((entry) => entry.entryDate <= toDate);
    }

    if (voucherType && voucherType !== "ALL") {
      rows = rows.filter((entry) => entry.voucherType === voucherType);
    }

    if (search?.trim()) {
      const keyword = search.toLowerCase();

      rows = rows.filter((entry) => {
        return (
          entry.voucherNo.toLowerCase().includes(keyword) ||
          entry.voucherType.toLowerCase().includes(keyword) ||
          entry.particulars.toLowerCase().includes(keyword)
        );
      });
    }

    return rows;
  }, [ledger, fromDate, toDate, voucherType, search]);

  const reportSummary = useMemo(() => {
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
  }, [filteredEntries, ledger]);

  const onApplyFilter = () => {
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
  };

  return (
    <div className="h-[calc(100vh-120px)] min-h-0 w-full overflow-hidden p-4 text-sm">
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
                        field.onChange(Array.from(keys)[0])
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
                    className="bg-emerald-700 font-semibold text-white"
                  >
                    Apply
                  </Button>

                  <Button size="sm" variant="flat" onPress={handleClearFilter}>
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
                emptyContent="No ledger entries found for selected filters"
                items={filteredEntries}
              >
                {(entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(entry.entryDate)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-semibold">
                      {entry.voucherNo}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-slate-100 text-xs text-slate-700"
                      >
                        {entry.voucherType}
                      </Chip>
                    </TableCell>

                    <TableCell>{entry.particulars}</TableCell>

                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      {entry.debit ? formatCurrency(entry.debit) : "-"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      {entry.credit ? formatCurrency(entry.credit) : "-"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-right font-bold text-slate-950">
                      {formatCurrency(entry.balance)} {entry.balanceType}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
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

  return `₹${Number(amount).toLocaleString("en-IN")}`;
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

export default LedgerEntriesPage;
