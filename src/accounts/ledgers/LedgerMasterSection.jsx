import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Spinner,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  addToast,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  EllipsisVertical,
  FileText,
  IdCard,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearLedgerError,
  createLedger,
  fetchLedgers,
  getLedgerGroups,
  setActiveFilter,
  setLedgerGroupIdFilter,
  setLedgerPage,
  setLedgerSearch,
  setLedgerTypeFilter,
  setSelectedLedgerId,
  updateLedger,
} from "../../toolkit/slices/organizationSlice";

const defaultValues = {
  name: "",
  ledgerType: "CUSTOMER",
  // ledgerCategory: "CUSTOMER",
  // partyType: "CUSTOMER",
  groupName: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  // openingBalance: "0",
  // openingBalanceType: "DR",
  // currentBalance: "0",
  // currentBalanceType: "DR",
  // totalDebit: "0",
  // totalCredit: "0",
  // currency: "INR",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  gstStatus: "Not Applicable",
  gstin: "",
  panNumber: "",
  email: "",
  mobile: "",
  billingAddress: "",
  active: "true",
};

const ledgerTypeOptions = [
  "COMPANY",
  "CUSTOMER",
  "CUSTOMER_ADVANCE",
  "VENDOR",
  "VENDOR_PAYABLE",
  "BANK",
  "CASH",
  "PAYMENT_GATEWAY",
  "SALES",
  "SERVICE_INCOME",
  "OUTPUT_IGST",
  "OUTPUT_CGST",
  "OUTPUT_SGST",
  "INPUT_IGST",
  "INPUT_CGST",
  "INPUT_SGST",
  "TDS_RECEIVABLE",
  "CREDIT_NOTE",
  "REFUND_PAYABLE",
  "ROUND_OFF",
  "EXPENSE",
  "LIABILITY",
  "ASSET",
  "TAX",
  "INCOME",
];

const ledgerCategoryOptions = [
  "COMPANY",
  "VENDOR",
  "BANK",
  "CASH",
  "TAX",
  "EXPENSE",
  "INCOME",
];

const partyTypeOptions = ["CUSTOMER", "SUPPLIER", "BOTH", "NA"];

const groupOptions = [
  "Sundry Debtors",
  "Sundry Creditors",
  "Bank Accounts",
  "Cash-in-Hand",
  "Sales Accounts",
  "Purchase Accounts",
  "Duties & Taxes",
  "Indirect Expenses",
  "Direct Expenses",
];

const gstFieldAllowedGroups = [
  "Sundry Debtors",
  "Sundry Creditors",
  "Bank Accounts",
  "Loans and Liabilities",
  "Bank OCC A/C",
  "Bank OD A/C",
  "Loans and Advance Asset",
  "Provision",
  "Secured Loans",
  "Unsecured Loans",
  "Branch / Division",
];

const balanceTypeOptions = ["DR", "CR"];
const gstStatusOptions = ["Registered", "Unregistered", "Not Applicable"];

const deriveLedgerCategory = (ledgerType = "") => {
  if (["BANK", "CASH", "PAYMENT_GATEWAY"].includes(ledgerType)) return "BANK";
  if (["VENDOR", "VENDOR_PAYABLE"].includes(ledgerType)) return "VENDOR";
  if (
    [
      "SALES",
      "SERVICE_INCOME",
      "OUTPUT_IGST",
      "OUTPUT_CGST",
      "OUTPUT_SGST",
      "TDS_RECEIVABLE",
      "CREDIT_NOTE",
      "REFUND_PAYABLE",
      "ROUND_OFF",
    ].includes(ledgerType)
  ) {
    return "INCOME";
  }

  return "COMPANY";
};

const derivePartyType = (ledgerType = "") => {
  if (ledgerType.includes("CUSTOMER")) return "CUSTOMER";
  if (ledgerType.includes("VENDOR")) return "SUPPLIER";
  return "NA";
};

const toUiBalanceType = (value) => {
  if (value === "DEBIT") return "DR";
  if (value === "CREDIT") return "CR";
  return value || "DR";
};

const toApiBalanceType = (value) => {
  if (value === "DR") return "DEBIT";
  if (value === "CR") return "CREDIT";
  return value || "DEBIT";
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const formatVoucherType = (type) => {
  if (!type) return "-";

  return String(type)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getApiErrorMessage = (error) => {
  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Something went wrong"
  );
};

const normalizeTransaction = (transaction = {}) => {
  return {
    id: transaction.entryId,
    entryId: transaction.entryId,
    voucherId: transaction.voucherId,
    voucherNo: transaction.voucherNumber || "-",
    voucherNumber: transaction.voucherNumber || "-",
    voucherType: formatVoucherType(transaction.voucherType),
    rawVoucherType: transaction.voucherType,
    date: formatDate(transaction.voucherDate),
    entryDate: transaction.voucherDate,
    particulars: transaction.particulars,
    debit: Number(transaction.debitAmount || 0),
    credit: Number(transaction.creditAmount || 0),
    balance: `${formatCurrency(transaction.runningBalanceAmount)} ${toUiBalanceType(
      transaction.runningBalanceType,
    )}`,
    balanceAmount: Number(transaction.runningBalanceAmount || 0),
    balanceType: toUiBalanceType(transaction.runningBalanceType),
    sourceType: transaction.sourceType,
    sourceId: transaction.sourceId,
    status: transaction.status,
    raw: transaction,
  };
};

const normalizeLedger = (ledger = {}) => {
  const partyType = derivePartyType(ledger.ledgerType);
  const gstStatus = ledger.gstNo ? "Registered" : "Not Applicable";

  const entries = Array.isArray(ledger.transactions)
    ? ledger.transactions.map(normalizeTransaction)
    : [];

  const totalDebit = entries.reduce(
    (sum, entry) => sum + Number(entry.debit || 0),
    0,
  );

  const totalCredit = entries.reduce(
    (sum, entry) => sum + Number(entry.credit || 0),
    0,
  );

  return {
    ...ledger,
    raw: ledger,

    name: ledger.ledgerName || "",
    ledgerCategory: deriveLedgerCategory(ledger.ledgerType),
    partyType,

    groupName:
      ledger.ledgerGroupName ||
      (ledger.ledgerGroupId ? `Group ID ${ledger.ledgerGroupId}` : "-"),

    openingBalance: ledger.openingBalance ?? 0,
    openingBalanceType: toUiBalanceType(ledger.openingBalanceType),

    currentBalance: ledger.currentBalance ?? 0,
    currentBalanceType: toUiBalanceType(ledger.currentBalanceType),

    totalDebit,
    totalCredit,

    currency: "INR",
    effectiveFrom: ledger.createdAt || "",

    gstStatus,
    gstin: ledger.gstNo || "-",
    panNumber: ledger.panNo || "-",
    email: ledger.email || "-",
    mobile: ledger.mobile || "-",

    billingAddress:
      ledger.billingAddress ||
      ledger.fullAddress ||
      [ledger.companyName, ledger.unitName, ledger.contactName]
        .filter(Boolean)
        .join(" / ") ||
      "-",

    fullAddress: ledger.fullAddress || "-",

    entries,
    transactions: Array.isArray(ledger.transactions) ? ledger.transactions : [],
  };
};

const getVoucherDetails = (entry, ledger) => {
  if (!entry || !ledger) return null;

  const voucherNo = entry.voucherNo || "-";

  const voucherType =
    entry.voucherType ||
    formatVoucherType(entry.rawVoucherType) ||
    (voucherNo.startsWith("INV")
      ? "Sales Invoice"
      : voucherNo.startsWith("PUR")
        ? "Purchase Voucher"
        : voucherNo.startsWith("PAY")
          ? "Payment Voucher"
          : voucherNo.startsWith("RCP") || voucherNo.startsWith("RCPT")
            ? "Receipt Voucher"
            : "Accounting Voucher");

  const amount = Number(entry.debit || entry.credit || 0);
  const isBankLedger = ledger.ledgerCategory === "BANK";

  // Dummy service logic for now.
  // Later replace this with API response fields.
  const serviceName = voucherNo.startsWith("INV")
    ? "12A Registration"
    : voucherNo.startsWith("PUR")
      ? "Vendor Compliance Service"
      : voucherNo.startsWith("RCPT")
        ? "Client Payment Collection"
        : voucherNo.startsWith("PAY")
          ? "Vendor Payment Service"
          : "Accounting Service";

  const serviceCode = voucherNo.startsWith("INV")
    ? "SVC-12A-REG"
    : voucherNo.startsWith("PUR")
      ? "SVC-VENDOR-COMP"
      : voucherNo.startsWith("RCPT")
        ? "SVC-PAYMENT-COLLECTION"
        : voucherNo.startsWith("PAY")
          ? "SVC-VENDOR-PAYMENT"
          : "SVC-ACCOUNTING";

  const sacCode = voucherNo.startsWith("INV") ? "998399" : "998599";

  const taxableAmount = amount;
  const gstRate =
    voucherNo.startsWith("INV") || voucherNo.startsWith("PUR") ? 18 : 0;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);

  const cgstRate = gstRate ? gstRate / 2 : 0;
  const sgstRate = gstRate ? gstRate / 2 : 0;
  const igstRate = 0;

  const cgstAmount = Math.round((taxableAmount * cgstRate) / 100);
  const sgstAmount = Math.round((taxableAmount * sgstRate) / 100);
  const igstAmount = 0;

  const tdsApplicable =
    voucherNo.startsWith("INV") || voucherNo.startsWith("RCPT");

  const tdsRate = tdsApplicable ? 10 : 0;
  const tdsAmount = Math.round((taxableAmount * tdsRate) / 100);

  const grossAmount = taxableAmount + gstAmount;
  const netAmount = grossAmount - tdsAmount;

  const raw = entry?.raw || {};

  const rawBankName = raw?.bankName || raw?.particulars || "";
  const normalizedBankName = String(rawBankName).trim().toUpperCase();

  const isCashTransaction = normalizedBankName === "CASH";

  const isReceiptOrPayment =
    raw?.voucherType === "RECEIPT" ||
    raw?.voucherType === "PAYMENT" ||
    raw?.sourceType === "PAYMENT_RECEIPT";

  const hasRealBankDetails =
    isReceiptOrPayment && !isCashTransaction && Boolean(raw?.bankName);

  const paymentMode =
    raw?.particulars ||
    raw?.bankName ||
    (isReceiptOrPayment ? "-" : "Adjustment Entry");

  return {
    voucherNo,
    voucherType,
    date: entry.date || "-",
    particulars: entry.particulars || "-",
    debit: entry.debit,
    credit: entry.credit,
    balance: entry.balance || "-",
    amount,

    ledgerName: ledger.name || "-",
    ledgerCode: ledger.ledgerCode || "-",
    ledgerType: ledger.ledgerType || "-",
    groupName: ledger.groupName || "-",
    partyType: ledger.partyType || "-",

    address: ledger.billingAddress || "-",
    gstin: ledger.gstin || "-",
    panNumber: ledger.panNumber || "-",
    email: ledger.email || "-",
    mobile: ledger.mobile || "-",

    serviceName,
    serviceCode,
    sacCode,
    taxableAmount,
    gstRate,
    gstAmount,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    tdsApplicable,
    tdsRate,
    tdsAmount,
    grossAmount,
    netAmount,

    bankName: hasRealBankDetails ? raw?.bankName : "-",
    bankAccountNumber: hasRealBankDetails
      ? raw?.accountNumber ||
        raw?.bankAccountNumber ||
        ledger?.raw?.accountNumber ||
        "-"
      : "-",
    ifscCode: hasRealBankDetails
      ? raw?.ifscCode || ledger?.raw?.ifscCode || "-"
      : "-",
    branchName: hasRealBankDetails
      ? raw?.branchName || ledger?.raw?.branchName || "-"
      : "-",

    paymentMode,
    transactionReference: raw?.transactionReference || "-",

    actualBankReceivedAmount: raw?.actualBankReceivedAmount,
    tdsAmountFromApi: raw?.tdsAmount,
    settlementAmount: raw?.settlementAmount,

    showBankDetails: hasRealBankDetails,
    showTransactionDetails: isReceiptOrPayment,

    createdBy: "ERP Test",
    createdAt: entry.date || "-",
    remarks: `Voucher entry posted in ${ledger.name || "selected ledger"}.`,
  };
};

const LedgerMasterSection = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    isOpen: isVoucherDrawerOpen,
    onOpen: onVoucherDrawerOpen,
    onClose: onVoucherDrawerClose,
    onOpenChange: onVoucherDrawerOpenChange,
  } = useDisclosure();

  const [selectedVoucherEntry, setSelectedVoucherEntry] = useState(null);
  const [editData, setEditData] = useState(null);

  const {
    ledgers = [],
    selectedLedgerId,
    search = "",
    ledgerTypeFilter = "ALL",
    ledgerGroupIdFilter = "",
    activeFilter = "ALL",
    page = 1,
    size = 20,
    totalPages = 0,
    totalElements = 0,
    loading = false,
    saving = false,
    error = "",
    ledgerGroupList = [],
  } = useSelector((state) => state.organization || {});

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onTouched",
  });

  const gstStatus = watch("gstStatus");
  const selectedGroupValue = watch("groupName");
  const normalizedLedgers = useMemo(() => {
    return Array.isArray(ledgers) ? ledgers.map(normalizeLedger) : [];
  }, [ledgers]);

  const ledgerGroupOptions = useMemo(() => {
    const groupsFromApi = Array.isArray(ledgerGroupList)
      ? ledgerGroupList.map((group) => ({
          label:
            group.groupName ||
            group.ledgerGroupName ||
            group.name ||
            `Group ID ${group.id}`,
          value: String(group.id),
        }))
      : [];

    if (groupsFromApi.length > 0) return groupsFromApi;

    const groupsFromLedgerList = normalizedLedgers
      .filter((ledger) => ledger.ledgerGroupId)
      .map((ledger) => ({
        label: ledger.groupName || `Group ID ${ledger.ledgerGroupId}`,
        value: String(ledger.ledgerGroupId),
      }));

    return Array.from(
      new Map(groupsFromLedgerList.map((item) => [item.value, item])).values(),
    );
  }, [ledgerGroupList, normalizedLedgers]);

  const selectedGroupName =
    ledgerGroupOptions.find((item) => item.value === String(selectedGroupValue))
      ?.label || "";

  const shouldShowGstFields = gstFieldAllowedGroups.includes(selectedGroupName);

  useEffect(() => {
    dispatch(getLedgerGroups({ active: true, page: 1, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(
        fetchLedgers({
          search,
          ledgerType: ledgerTypeFilter,
          ledgerGroupId: ledgerGroupIdFilter,
          active: activeFilter,
          page,
          size,
        }),
      );
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [
    activeFilter,
    dispatch,
    ledgerGroupIdFilter,
    ledgerTypeFilter,
    page,
    search,
    size,
  ]);

  useEffect(() => {
    if (!error) return;

    addToast({
      title: getApiErrorMessage(error),
      color: "danger",
    });
  }, [error]);

  const selectedLedger = useMemo(() => {
    return (
      normalizedLedgers.find((item) => item.id === selectedLedgerId) ||
      normalizedLedgers[0] ||
      normalizeLedger({})
    );
  }, [normalizedLedgers, selectedLedgerId]);

  const filteredLedgers = normalizedLedgers;

  const handleOpenVoucherDrawer = (entry) => {
    setSelectedVoucherEntry(entry);
    onVoucherDrawerOpen();
  };

  const handleCloseVoucherDrawer = () => {
    setSelectedVoucherEntry(null);
    onVoucherDrawerClose();
  };

  const handleOpenCreate = () => {
    setEditData(null);
    reset(defaultValues);
    onOpen();
  };

  const handleOpenEdit = (ledger) => {
    setEditData(ledger);

    reset({
      name: ledger.name || "",
      ledgerType: String(ledger.ledgerType || "CUSTOMER")
        .trim()
        .toUpperCase(),
      // ledgerCategory: ledger.ledgerCategory || "COMPANY",
      // partyType: ledger.partyType || "CUSTOMER",
      groupName: ledger.ledgerGroupId ? String(ledger.ledgerGroupId) : "",
      bankName: ledger.raw?.bankName || "",
      accountHolderName: ledger.raw?.accountHolderName || "",
      accountNumber: ledger.raw?.accountNumber || "",
      ifscCode: ledger.raw?.ifscCode || "",
      branchName: ledger.raw?.branchName || "",
      // openingBalance: String(ledger.openingBalance ?? 0),
      // openingBalanceType: ledger.openingBalanceType || "DR",
      // currentBalance: String(ledger.currentBalance ?? 0),
      // currentBalanceType: ledger.currentBalanceType || "DR",
      // totalDebit: String(ledger.totalDebit ?? 0),
      // totalCredit: String(ledger.totalCredit ?? 0),
      // currency: ledger.currency || "INR",
      effectiveFrom:
        ledger.effectiveFrom?.slice?.(0, 10) ||
        new Date().toISOString().slice(0, 10),
      gstStatus: ledger.gstStatus || "Not Applicable",
      gstin: ledger.raw?.gstNo || "",
      panNumber: ledger.raw?.panNo || "",
      email: ledger.email === "-" ? "" : ledger.email || "",
      mobile: ledger.mobile === "-" ? "" : ledger.mobile || "",
      billingAddress:
        ledger.billingAddress === "-" ? "" : ledger.billingAddress || "",
      active: String(ledger.active ?? true),
    });

    onOpen();
  };

  const onSubmit = async (values) => {
    try {
      dispatch(clearLedgerError());

      const ledgerType = String(values.ledgerType || "")
        .trim()
        .toUpperCase();

      const payload = {
        ledgerName: values.name?.trim(),
        ledgerType,
        ledgerGroupId: toNumber(values.groupName),
        companyId: toNumber(editData?.raw?.companyId),
        unitId: toNumber(editData?.raw?.unitId),
        contactId: toNumber(editData?.raw?.contactId),
        gstNo: values.gstin?.trim() || "",
        panNo: values.panNumber?.trim() || "",
        bankName: ledgerType === "BANK" ? values.bankName?.trim() || "" : "",
        accountHolderName:
          ledgerType === "BANK" ? values.accountHolderName?.trim() || "" : "",
        accountNumber:
          ledgerType === "BANK" ? values.accountNumber?.trim() || "" : "",
        ifscCode:
          ledgerType === "BANK"
            ? values.ifscCode?.trim()?.toUpperCase() || ""
            : "",
        branchName:
          ledgerType === "BANK" ? values.branchName?.trim() || "" : "",
        // openingBalance: toNumber(values.openingBalance),
        // openingBalanceType: toApiBalanceType(values.openingBalanceType),
        active: values.active === "true",
        ...values,
      };

      let savedLedger = null;

      if (editData) {
        savedLedger = await dispatch(
          updateLedger({
            id: editData.id,
            userId,
            payload,
          }),
        ).unwrap();
      } else {
        savedLedger = await dispatch(createLedger(payload)).unwrap();
        dispatch(setLedgerPage(1));
      }

      await dispatch(
        fetchLedgers({
          search,
          ledgerType: ledgerTypeFilter,
          ledgerGroupId: ledgerGroupIdFilter,
          active: activeFilter,
          page: editData ? page : 1,
          size,
        }),
      ).unwrap();

      if (savedLedger?.id) {
        dispatch(setSelectedLedgerId(savedLedger.id));
      }

      addToast({
        title: editData
          ? "Ledger updated successfully"
          : "Ledger created successfully",
        color: "success",
      });

      reset(defaultValues);
      setEditData(null);
      onClose();
    } catch (error) {
      addToast({
        title: getApiErrorMessage(error),
        color: "danger",
      });
    }
  };

  const onInvalid = () => {
    addToast({
      title: "Please fill all required fields correctly",
      color: "danger",
    });
  };

  return (
    <div className="w-full max-w-full overflow-hidden text-sm">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">
            Ledger Master
          </h1>
        </div>

        <Button
          size="md"
          className="bg-emerald-700 px-5 font-semibold text-white"
          startContent={<Plus size={17} />}
          onPress={handleOpenCreate}
        >
          Create Ledger
        </Button>
      </div>

      <div className="grid h-[calc(100vh-190px)] min-h-0 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[350px_minmax(0,1fr)]">
        <Card className="h-full min-h-0 border border-slate-200" shadow="none">
          <CardBody className="flex min-h-0 flex-col p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  All Ledgers
                </h2>
                <p className="text-xs text-slate-500">
                  Total {totalElements} ledgers
                </p>
              </div>
            </div>

            <Input
              isClearable
              size="sm"
              placeholder="Search ledger..."
              value={search}
              onValueChange={(value) => dispatch(setLedgerSearch(value))}
              onClear={() => dispatch(setLedgerSearch(""))}
              startContent={<Search size={15} className="text-slate-400" />}
              className="mb-3"
            />

            <div className="mb-3 grid grid-cols-1 gap-2">
              <Select
                size="sm"
                label="Ledger Type"
                selectedKeys={[ledgerTypeFilter]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] || "ALL";
                  dispatch(setLedgerTypeFilter(value));
                }}
              >
                <SelectItem key="ALL">All Ledger Types</SelectItem>
                {ledgerTypeOptions.map((type) => (
                  <SelectItem key={type}>{type}</SelectItem>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  size="sm"
                  label="Under Group"
                  selectedKeys={
                    ledgerGroupIdFilter
                      ? [String(ledgerGroupIdFilter)]
                      : ["ALL"]
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] || "ALL";
                    dispatch(
                      setLedgerGroupIdFilter(value === "ALL" ? "" : value),
                    );
                  }}
                >
                  <SelectItem key="ALL">All Groups</SelectItem>
                  {ledgerGroupOptions.map((group) => (
                    <SelectItem key={group.value}>{group.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  size="sm"
                  label="Status"
                  selectedKeys={[activeFilter]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] || "ALL";
                    dispatch(setActiveFilter(value));
                  }}
                >
                  <SelectItem key="ALL">All</SelectItem>
                  <SelectItem key="true">Active</SelectItem>
                  <SelectItem key="false">Inactive</SelectItem>
                </Select>
              </div>
            </div>

            <ScrollShadow className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-3">
                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Spinner size="sm" label="Loading ledgers..." />
                  </div>
                ) : filteredLedgers.length > 0 ? (
                  filteredLedgers.map((ledger) => (
                    <Card
                      key={ledger.id}
                      isPressable
                      shadow="none"
                      onPress={() => dispatch(setSelectedLedgerId(ledger.id))}
                      className={`w-full border transition ${
                        selectedLedger?.id === ledger.id
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                      }`}
                    >
                      <CardBody className="p-3">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="flex min-w-0 gap-3">
                            <LedgerIcon
                              category={ledger.ledgerCategory}
                              size="sm"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-950">
                                {ledger.name}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {ledger.ledgerCode}
                              </p>
                            </div>
                          </div>

                          {adminRole && (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={(e) => e?.continuePropagation?.()}
                                >
                                  <EllipsisVertical size={16} />
                                </Button>
                              </DropdownTrigger>

                              <DropdownMenu
                                aria-label="Ledger actions"
                                onAction={(key) => {
                                  if (key === "edit") handleOpenEdit(ledger);
                                }}
                              >
                                <DropdownItem key="edit">Edit</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            className="bg-emerald-50 text-xs text-emerald-700"
                          >
                            {ledger.ledgerType}
                          </Chip>

                          <Chip
                            size="sm"
                            variant="flat"
                            className="bg-slate-100 text-xs text-slate-600"
                          >
                            {ledger.groupName}
                          </Chip>
                        </div>

                        <Divider />

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">
                            Current Balance
                          </span>
                          <span className="text-sm font-semibold text-slate-950">
                            {formatCurrency(ledger.currentBalance)}{" "}
                            {ledger.currentBalanceType}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No ledgers found
                  </div>
                )}
              </div>
            </ScrollShadow>

            {totalPages > 1 && (
              <div className="mt-3 flex justify-center">
                <Pagination
                  size="sm"
                  showControls
                  page={page}
                  total={totalPages}
                  onChange={(value) => dispatch(setLedgerPage(value))}
                  color="success"
                />
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="h-full min-w-0 border border-slate-200" shadow="none">
          <CardBody className="min-h-0 overflow-hidden p-0">
            <ScrollShadow className="h-full overflow-y-auto px-5 py-4">
              <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-start">
                <div className="flex min-w-0 gap-4">
                  <LedgerIcon
                    category={selectedLedger.ledgerCategory}
                    size="lg"
                  />

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-slate-950">
                      {selectedLedger.name}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{selectedLedger.ledgerType}</span>
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span>{selectedLedger.groupName}</span>
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span>{selectedLedger.ledgerCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Chip
                    size="sm"
                    color={selectedLedger.active ? "success" : "danger"}
                    variant="flat"
                    className="font-semibold"
                  >
                    {selectedLedger.active ? "ACTIVE" : "INACTIVE"}
                  </Chip>

                  {adminRole && (
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<Pencil size={15} />}
                      onPress={() => handleOpenEdit(selectedLedger)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              <section>
                <h3 className="mb-3 text-base font-semibold text-emerald-900">
                  Basic Information
                </h3>

                {/* Basic Ledger Information */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <InfoItem label="Ledger Name" value={selectedLedger.name} />

                  <InfoItem
                    label="Ledger Type"
                    value={selectedLedger.ledgerType}
                  />

                  <InfoItem
                    label="Under Group"
                    value={selectedLedger.groupName}
                  />

                  <InfoItem
                    label="Opening Balance"
                    value={`${formatCurrency(selectedLedger.openingBalance)} ${
                      selectedLedger.openingBalanceType
                    }`}
                  />

                  <InfoItem label="Currency" value={selectedLedger.currency} />

                  <InfoItem
                    label="Effective From"
                    value={formatDate(selectedLedger.effectiveFrom)}
                  />
                </div>

                {/* Financial Summary */}
                <div className="mt-5">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Financial Summary
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                      label="Current Balance"
                      value={`${formatCurrency(selectedLedger.currentBalance)} ${
                        selectedLedger.currentBalanceType
                      }`}
                      icon={Wallet}
                    />

                    <SummaryCard
                      label="Total Debit"
                      value={formatCurrency(selectedLedger.totalDebit)}
                      icon={ArrowUpRight}
                    />

                    <SummaryCard
                      label="Total Credit"
                      value={formatCurrency(selectedLedger.totalCredit)}
                      icon={ArrowDownRight}
                    />

                    <SummaryCard
                      label="GST Status"
                      value={selectedLedger.gstStatus}
                      icon={ShieldCheck}
                      textOnly
                    />
                  </div>
                </div>
              </section>

              <Divider className="my-5" />

              <section>
                <h3 className="mb-3 text-base font-semibold text-emerald-900">
                  Tax / Contact / Address
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <ContactItem
                    icon={FileText}
                    label="GSTIN"
                    value={selectedLedger.gstin}
                  />
                  <ContactItem
                    icon={IdCard}
                    label="PAN"
                    value={selectedLedger.panNumber}
                  />
                  <ContactItem
                    icon={Mail}
                    label="Email"
                    value={selectedLedger.email}
                  />
                  {/* <ContactItem
                    icon={Phone}
                    label="Mobile"
                    value={selectedLedger.mobile}
                  /> */}
                  <div className="md:col-span-2">
                    <ContactItem
                      icon={MapPin}
                      label="Billing Address"
                      value={selectedLedger.fullAddress || "-"}
                    />
                  </div>
                </div>
              </section>

              <Divider className="my-5" />

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-emerald-900">
                    Recent Ledger Entries
                  </h3>

                  <Button
                    size="sm"
                    variant="light"
                    className="font-semibold text-emerald-700"
                    endContent={<ChevronDown size={15} />}
                    onPress={() =>
                      navigate(`${selectedLedger.id}/entries`, {
                        state: {
                          ledger: selectedLedger,
                        },
                      })
                    }
                  >
                    View All Entries
                  </Button>
                </div>

                <Table
                  removeWrapper
                  aria-label="Recent Ledger Entries"
                  classNames={{
                    th: "bg-emerald-50 text-emerald-900 text-xs font-semibold",
                    td: "text-xs text-slate-700",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Voucher No.</TableColumn>
                    <TableColumn>Voucher Type</TableColumn>
                    <TableColumn>Particulars</TableColumn>
                    <TableColumn>Debit</TableColumn>
                    <TableColumn>Credit</TableColumn>
                    <TableColumn>Balance</TableColumn>
                  </TableHeader>

                  <TableBody
                    emptyContent="No ledger entries found"
                    items={selectedLedger.entries || []}
                  >
                    {(entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-auto min-w-0 px-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            onPress={() => handleOpenVoucherDrawer(entry)}
                          >
                            {entry.voucherNo}
                          </Button>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            className="bg-slate-100 text-xs text-slate-700"
                          >
                            {entry.voucherType || "-"}
                          </Chip>
                        </TableCell>

                        <TableCell>{entry.particulars}</TableCell>

                        <TableCell>{formatCurrency(entry.debit)}</TableCell>

                        <TableCell>{formatCurrency(entry.credit)}</TableCell>

                        <TableCell className="font-semibold">
                          {entry.balance}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </section>
            </ScrollShadow>
          </CardBody>
        </Card>
      </div>

      <LedgerModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        editData={editData}
        control={control}
        errors={errors}
        gstStatus={gstStatus}
        selectedGroupName={selectedGroupName}
        shouldShowGstFields={shouldShowGstFields}
        ledgerGroupOptions={ledgerGroupOptions}
        saving={saving}
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        onCancel={() => {
          reset(defaultValues);
          setEditData(null);
          onClose();
        }}
      />

      <VoucherDetailsDrawer
        isOpen={isVoucherDrawerOpen}
        onOpenChange={onVoucherDrawerOpenChange}
        onClose={handleCloseVoucherDrawer}
        entry={selectedVoucherEntry}
        ledger={selectedLedger}
      />
    </div>
  );
};

const LedgerModal = ({
  isOpen,
  onOpenChange,
  editData,
  control,
  gstStatus,
  selectedGroupName,
  shouldShowGstFields,
  ledgerGroupOptions,
  saving,
  onSubmit,
  onCancel,
}) => {
  const selectedLedgerType = useWatch({
    control,
    name: "ledgerType",
  });

  const normalizedSelectedLedgerType = String(selectedLedgerType || "")
    .trim()
    .toUpperCase();

  const isBankLedgerType = normalizedSelectedLedgerType === "BANK";

  return (
    <Modal
      size="4xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      scrollBehavior="inside"
      isDismissable={false}
      classNames={{
        base: "max-h-[88vh]",
        header: "border-b border-slate-200 px-5 py-4",
        body: "p-0 overflow-hidden",
        footer: "border-t border-slate-200 px-5 py-3",
      }}
    >
      <ModalContent>
        {() => (
          <form onSubmit={onSubmit} className="flex max-h-[88vh] flex-col">
            <ModalHeader>
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {editData ? "Update Ledger" : "Create Ledger"}
                </p>
                <p className="text-xs font-normal text-slate-500">
                  Add Tally-style ledger master details
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <ScrollShadow className="max-h-[calc(88vh-145px)] overflow-y-auto px-5 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <RHFInput
                    name="name"
                    label="Ledger Name"
                    control={control}
                    rules={{
                      required: "Ledger name is required",
                      minLength: {
                        value: 3,
                        message: "Ledger name must be at least 3 characters",
                      },
                    }}
                    isRequired
                  />

                  <RHFSelect
                    name="groupName"
                    label="Under Group"
                    control={control}
                    options={ledgerGroupOptions}
                    rules={{ required: "Under group is required" }}
                    isRequired
                  />

                  {/* <RHFSelect
                    name="ledgerType"
                    label="Ledger Type"
                    control={control}
                    options={ledgerTypeOptions}
                    rules={{ required: "Ledger type is required" }}
                    isRequired
                  /> */}

                  {isBankLedgerType && (
                    <>
                      <div className="md:col-span-2 mt-2">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                          <p className="text-xs font-semibold text-emerald-800">
                            Bank Details
                          </p>
                          <p className="mt-0.5 text-[11px] text-emerald-700">
                            These fields are required because selected ledger
                            type is BANK.
                          </p>
                        </div>
                      </div>

                      <RHFInput
                        name="bankName"
                        label="Bank Name"
                        control={control}
                        rules={{
                          required: "Bank name is required",
                          minLength: {
                            value: 2,
                            message: "Bank name must be at least 2 characters",
                          },
                        }}
                        isRequired
                      />

                      <RHFInput
                        name="accountHolderName"
                        label="Account Holder Name"
                        control={control}
                        rules={{
                          required: "Account holder name is required",
                          minLength: {
                            value: 2,
                            message:
                              "Account holder name must be at least 2 characters",
                          },
                        }}
                        isRequired
                      />

                      <RHFInput
                        name="accountNumber"
                        label="Account Number"
                        control={control}
                        rules={{
                          required: "Account number is required",
                          pattern: {
                            value: /^[0-9]{6,20}$/,
                            message: "Account number must be 6 to 20 digits",
                          },
                        }}
                        isRequired
                      />

                      <RHFInput
                        name="ifscCode"
                        label="IFSC Code"
                        control={control}
                        maxLength={11}
                        rules={{
                          required: "IFSC code is required",
                          pattern: {
                            value: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
                            message: "Enter a valid IFSC code",
                          },
                        }}
                        isRequired
                      />

                      <div className="md:col-span-2">
                        <RHFInput
                          name="branchName"
                          label="Branch Name"
                          control={control}
                          rules={{
                            required: "Branch name is required",
                            minLength: {
                              value: 2,
                              message:
                                "Branch name must be at least 2 characters",
                            },
                          }}
                          isRequired
                        />
                      </div>
                    </>
                  )}

                  {/* <RHFSelect
                    name="ledgerCategory"
                    label="Ledger Category"
                    control={control}
                    options={ledgerCategoryOptions}
                    rules={{ required: "Ledger category is required" }}
                    isRequired
                  /> */}

                  {/* <RHFSelect
                    name="partyType"
                    label="Party Type"
                    control={control}
                    options={partyTypeOptions}
                    rules={{ required: "Party type is required" }}
                    isRequired
                  /> */}

                  {/* <RHFInput
                    name="openingBalance"
                    label="Opening Balance"
                    type="number"
                    control={control}
                    rules={{
                      required: "Opening balance is required",
                      min: {
                        value: 0,
                        message: "Opening balance cannot be negative",
                      },
                    }}
                    isRequired
                  /> */}

                  {/* <RHFSelect
                    name="openingBalanceType"
                    label="Opening Balance Type"
                    control={control}
                    options={balanceTypeOptions}
                    rules={{ required: "Opening balance type is required" }}
                    isRequired
                  /> */}

                  {/* <RHFInput
                    name="currentBalance"
                    label="Current Balance"
                    type="number"
                    control={control}
                    rules={{
                      required: "Current balance is required",
                      min: {
                        value: 0,
                        message: "Current balance cannot be negative",
                      },
                    }}
                    isRequired
                  /> */}

                  {/* <RHFSelect
                    name="currentBalanceType"
                    label="Current Balance Type"
                    control={control}
                    options={balanceTypeOptions}
                    rules={{ required: "Current balance type is required" }}
                    isRequired
                  /> */}

                  {/* <RHFInput
                    name="totalDebit"
                    label="Total Debit"
                    type="number"
                    control={control}
                    rules={{
                      required: "Total debit is required",
                      min: {
                        value: 0,
                        message: "Total debit cannot be negative",
                      },
                    }}
                    isRequired
                  /> */}

                  {/* <RHFInput
                    name="totalCredit"
                    label="Total Credit"
                    type="number"
                    control={control}
                    rules={{
                      required: "Total credit is required",
                      min: {
                        value: 0,
                        message: "Total credit cannot be negative",
                      },
                    }}
                    isRequired
                  /> */}

                  {/* <RHFInput
                    name="currency"
                    label="Currency"
                    control={control}
                    rules={{ required: "Currency is required" }}
                    isRequired
                  /> */}

                  <RHFInput
                    name="effectiveFrom"
                    label="Effective From"
                    type="date"
                    control={control}
                    rules={{ required: "Effective from date is required" }}
                    isRequired
                  />

                  <Controller
                    name="active"
                    control={control}
                    rules={{ required: "Status is required" }}
                    render={({ field, fieldState }) => (
                      <Select
                        size="sm"
                        label="Status"
                        isRequired
                        selectedKeys={field.value ? [String(field.value)] : []}
                        onSelectionChange={(keys) =>
                          field.onChange(Array.from(keys)[0])
                        }
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                      >
                        <SelectItem key="true">Active</SelectItem>
                        <SelectItem key="false">Inactive</SelectItem>
                      </Select>
                    )}
                  />

                  {shouldShowGstFields && (
                    <>
                      <div className="md:col-span-2 mt-2">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                          <p className="text-xs font-semibold text-emerald-800">
                            GST / Contact Details
                          </p>
                          <p className="mt-0.5 text-[11px] text-emerald-700">
                            These fields are shown because selected group is{" "}
                            {selectedGroupName}.
                          </p>
                        </div>
                      </div>

                      <RHFSelect
                        name="gstStatus"
                        label="GST Status"
                        control={control}
                        options={gstStatusOptions}
                        rules={{ required: "GST status is required" }}
                        isRequired
                      />

                      <RHFInput
                        name="gstin"
                        label="GSTIN"
                        control={control}
                        maxLength={15}
                        rules={{
                          validate: (value) => {
                            if (gstStatus !== "Registered") return true;

                            if (!value || value.trim() === "") {
                              return "GSTIN is required for registered ledger";
                            }

                            if (value.length !== 15) {
                              return "GSTIN must be 15 characters";
                            }

                            return true;
                          },
                        }}
                      />

                      <RHFInput
                        name="panNumber"
                        label="PAN Number"
                        control={control}
                        maxLength={10}
                        rules={{
                          validate: (value) => {
                            if (!value || value === "-") return true;

                            if (value.length !== 10) {
                              return "PAN must be 10 characters";
                            }

                            return true;
                          },
                        }}
                      />

                      <RHFInput
                        name="email"
                        label="Email"
                        type="email"
                        control={control}
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        }}
                        isRequired
                      />

                      <RHFInput
                        name="mobile"
                        label="Mobile"
                        control={control}
                        maxLength={10}
                        rules={{
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Mobile number must be 10 digits",
                          },
                        }}
                        isRequired
                      />

                      <div className="md:col-span-2">
                        <Controller
                          name="billingAddress"
                          control={control}
                          rules={{
                            required: "Billing address is required",
                            minLength: {
                              value: 5,
                              message:
                                "Billing address must be at least 5 characters",
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <Textarea
                              {...field}
                              size="sm"
                              label="Billing Address"
                              placeholder="Enter billing address"
                              minRows={3}
                              isRequired
                              isInvalid={!!fieldState.error}
                              errorMessage={fieldState.error?.message}
                            />
                          )}
                        />
                      </div>
                    </>
                  )}
                </div>
              </ScrollShadow>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onCancel}>
                Cancel
              </Button>

              <Button
                type="submit"
                isLoading={saving}
                isDisabled={saving}
                className="bg-emerald-700 font-semibold text-white"
              >
                {editData ? "Update Ledger" : "Create Ledger"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

const VoucherDetailsDrawer = ({
  isOpen,
  onOpenChange,
  onClose,
  entry,
  ledger,
}) => {
  const details = useMemo(() => {
    return getVoucherDetails(entry, ledger);
  }, [entry, ledger]);

  if (!details) return null;

  return (
    <Drawer
      size="4xl"
      placement="right"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      classNames={{
        header: "border-b border-slate-200",
        footer: "border-t border-slate-200",
      }}
    >
      <DrawerContent>
        {(close) => (
          <>
            <DrawerHeader>
              <div className="flex w-full items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    Voucher Details
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Detailed information for voucher entry.
                  </p>
                </div>

                <Chip size="sm" color="primary" variant="flat">
                  {details.voucherType}
                </Chip>
              </div>
            </DrawerHeader>

            <DrawerBody>
              <div className="space-y-5">
                <Card
                  shadow="none"
                  className="border border-emerald-100 bg-emerald-50"
                >
                  <CardBody className="p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <VoucherInfoItem
                        label="Voucher No."
                        value={details.voucherNo}
                      />

                      <VoucherInfoItem
                        label="Voucher Type"
                        value={details.voucherType}
                      />

                      <VoucherInfoItem
                        label="Voucher Date"
                        value={details.date}
                      />

                      <VoucherInfoItem
                        label="Amount"
                        value={formatCurrency(details.amount)}
                      />
                    </div>
                  </CardBody>
                </Card>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-emerald-900">
                    Ledger / Party Details
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <VoucherInfoItem
                      label="Ledger Name"
                      value={details.ledgerName}
                    />
                    <VoucherInfoItem
                      label="Ledger Code"
                      value={details.ledgerCode}
                    />
                    <VoucherInfoItem
                      label="Ledger Type"
                      value={details.ledgerType}
                    />
                    <VoucherInfoItem
                      label="Under Group"
                      value={details.groupName}
                    />
                    <VoucherInfoItem
                      label="Party Type"
                      value={details.partyType}
                    />
                    <VoucherInfoItem label="Balance" value={details.balance} />
                  </div>
                </section>

                <Divider />

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-emerald-900">
                    Tax / Contact / Address
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <VoucherInfoItem label="GSTIN" value={details.gstin} />
                    <VoucherInfoItem
                      label="PAN Number"
                      value={details.panNumber}
                    />
                    <VoucherInfoItem label="Email" value={details.email} />
                    <VoucherInfoItem label="Mobile" value={details.mobile} />

                    <div className="sm:col-span-2">
                      <VoucherInfoItem
                        label="Billing Address"
                        value={details.address}
                        multiline
                      />
                    </div>
                  </div>
                </section>

                {details.showTransactionDetails && (
                  <>
                    <Divider />

                    <section>
                      <h3 className="mb-3 text-sm font-semibold text-emerald-900">
                        {details.showBankDetails
                          ? "Bank / Transaction Details"
                          : "Transaction Details"}
                      </h3>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {details.showBankDetails && (
                          <>
                            <VoucherInfoItem
                              label="Bank Name"
                              value={details.bankName}
                            />
                            <VoucherInfoItem
                              label="Bank Account No."
                              value={details.bankAccountNumber}
                            />
                            <VoucherInfoItem
                              label="IFSC Code"
                              value={details.ifscCode}
                            />
                            <VoucherInfoItem
                              label="Branch"
                              value={details.branchName}
                            />
                          </>
                        )}

                        <VoucherInfoItem
                          label="Payment Mode"
                          value={details.paymentMode}
                        />

                        <VoucherInfoItem
                          label="Transaction Ref."
                          value={details.transactionReference}
                        />

                        <VoucherInfoItem
                          label="Actual Received Amount"
                          value={formatCurrency(
                            details.actualBankReceivedAmount,
                          )}
                        />

                        <VoucherInfoItem
                          label="TDS Amount"
                          value={formatCurrency(details.tdsAmountFromApi)}
                        />

                        <VoucherInfoItem
                          label="Settlement Amount"
                          value={formatCurrency(details.settlementAmount)}
                        />
                      </div>
                    </section>
                  </>
                )}

                <Divider />

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-emerald-900">
                    Entry Details
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <VoucherInfoItem
                      label="Particulars"
                      value={details.particulars}
                      multiline
                    />
                    <VoucherInfoItem
                      label="Created By"
                      value={details.createdBy}
                    />
                    <VoucherInfoItem
                      label="Created At"
                      value={details.createdAt}
                    />
                    <VoucherInfoItem
                      label="Debit"
                      value={formatCurrency(details.debit)}
                    />
                    <VoucherInfoItem
                      label="Credit"
                      value={formatCurrency(details.credit)}
                    />
                    <VoucherInfoItem
                      label="Remarks"
                      value={details.remarks}
                      multiline
                    />
                  </div>
                </section>
              </div>
            </DrawerBody>

            <DrawerFooter>
              <Button
                variant="flat"
                onPress={() => {
                  onClose?.();
                  close();
                }}
              >
                Close
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

const RHFInput = ({
  name,
  label,
  control,
  rules,
  type = "text",
  isRequired = false,
  maxLength,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          size="sm"
          type={type}
          label={label}
          isRequired={isRequired}
          maxLength={maxLength}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
};

const RHFSelect = ({
  name,
  label,
  control,
  options = [],
  rules,
  isRequired = false,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <Select
          size="sm"
          label={label}
          isRequired={isRequired}
          selectionMode="single"
          selectedKeys={
            field.value ? new Set([String(field.value)]) : new Set([])
          }
          onSelectionChange={(keys) => {
            const selectedValue = Array.from(keys || [])?.[0] || "";
            field.onChange(String(selectedValue));
          }}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        >
          {options.map((item) => {
            const itemKey =
              typeof item === "string" ? item : String(item.value ?? item.key);
            const itemLabel =
              typeof item === "string" ? item : item.label || item.name;

            return <SelectItem key={itemKey}>{itemLabel}</SelectItem>;
          })}
        </Select>
      )}
    />
  );
};

const LedgerIcon = ({ category, size = "sm" }) => {
  const iconSize = size === "lg" ? 25 : 18;
  const boxSize =
    size === "lg" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl";

  const Icon =
    category === "BANK" ? Landmark : category === "VENDOR" ? Users : Building2;

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-emerald-100 text-emerald-700 ${boxSize}`}
    >
      <Icon size={iconSize} />
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-950">
        {value || "-"}
      </p>
    </div>
  );
};

const VoucherInfoItem = ({ label, value, multiline = false }) => {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold text-slate-950 ${
          multiline ? "whitespace-normal break-words" : "truncate"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, textOnly = false }) => {
  return (
    <Card
      shadow="none"
      className="border border-emerald-100 bg-gradient-to-br from-white to-emerald-50"
    >
      <CardBody className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">{label}</p>

            <p
              className={`mt-1 font-bold leading-tight text-slate-950 ${
                textOnly
                  ? "text-sm whitespace-normal break-words"
                  : "text-base whitespace-nowrap"
              }`}
            >
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

const ContactItem = ({ icon: Icon, label, value }) => {
  console.log("ContactItem value:", value); // Debugging line to check the value
  return (
    <div className="flex min-w-0 gap-3 border-b border-slate-200 pb-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-950">
          {value}
        </p>
      </div>
    </div>
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

export default LedgerMasterSection;
