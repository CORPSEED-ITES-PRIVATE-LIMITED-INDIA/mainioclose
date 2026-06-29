import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
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
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  EllipsisVertical,
  FileText,
  HelpCircle,
  Home,
  IdCard,
  Landmark,
  Menu,
  Pencil,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  clearLedgerError,
  createLedger,
  deleteLedger,
  fetchLedgers,
  setActiveFilter,
  setLedgerGroupIdFilter,
  setLedgerPage,
  setLedgerSearch,
  setLedgerTypeFilter,
  setSelectedLedgerId,
} from "../../toolkit/slices/organizationSlice";

const ledgerTypeOptions = [
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
  "TDS_RECEIVABLE",
  "CREDIT_NOTE",
  "REFUND_PAYABLE",
  "ROUND_OFF",
  "EXPENSE",
  "LIABILITY",
  "ASSET",
];

const initialForm = {
  ledgerName: "",
  ledgerType: "CUSTOMER",
  ledgerGroupId: "",
  companyId: "",
  unitId: "",
  contactId: "",
  gstNo: "",
  panNo: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  openingBalance: "0",
  openingBalanceType: "DEBIT",
  active: "true",
};

const menuItems = [
  { label: "Dashboard", icon: Home },
  { label: "Ledger Master", icon: BookOpen, active: true },
  { label: "Groups", icon: Users },
  { label: "Vouchers", icon: FileText },
  { label: "Invoices", icon: Receipt },
  { label: "Reports", icon: BarChart3 },
];

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "-";

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) return amount;

  return `₹${numericAmount.toLocaleString("en-IN")}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const balanceTypeLabel = (value) => {
  if (value === "DEBIT") return "Dr";
  if (value === "CREDIT") return "Cr";
  return value || "";
};

const getLedgerIcon = (ledgerType = "") => {
  if (["BANK", "CASH", "PAYMENT_GATEWAY"].includes(ledgerType)) {
    return Landmark;
  }

  if (["VENDOR", "VENDOR_PAYABLE"].includes(ledgerType)) {
    return Users;
  }

  if (
    ["SALES", "SERVICE_INCOME", "CREDIT_NOTE", "REFUND_PAYABLE"].includes(
      ledgerType,
    )
  ) {
    return Receipt;
  }

  return Building2;
};

const getGroupBadgeClass = (ledgerType = "") => {
  if (ledgerType.includes("CUSTOMER")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (ledgerType.includes("VENDOR")) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (["BANK", "CASH", "PAYMENT_GATEWAY"].includes(ledgerType)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (["SALES", "SERVICE_INCOME"].includes(ledgerType)) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (
    ledgerType.includes("OUTPUT") ||
    ledgerType.includes("TDS") ||
    ledgerType.includes("TAX")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-default-50 text-default-700 border-default-200";
};

const extractApiError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const Ledger = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    ledgers,
    selectedLedgerId,
    search,
    ledgerTypeFilter,
    ledgerGroupIdFilter,
    activeFilter,
    page,
    size,
    totalPages,
    totalElements,
    loading,
    saving,
    deletingId,
    error,
  } = useSelector((state) => state.organization);

  const [ledgers, setLedgers] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [apiError, setApiError] = useState("");

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
    dispatch,
    search,
    ledgerTypeFilter,
    ledgerGroupIdFilter,
    activeFilter,
    page,
    size,
  ]);

  const selectedLedger = useMemo(() => {
    return (
      ledgers.find((ledger) => ledger.id === selectedLedgerId) ||
      ledgers[0] ||
      null
    );
  }, [ledgers, selectedLedgerId]);

  const openAddModal = () => {
    setEditData(null);
    setFormData(initialForm);
    setApiError("");
    onOpen();
  };

  const openEditModal = (ledger) => {
    setEditData(ledger);
    setApiError("");

    setFormData({
      ledgerName: ledger.ledgerName || "",
      ledgerType: ledger.ledgerType || "CUSTOMER",
      ledgerGroupId: ledger.ledgerGroupId ?? "",
      companyId: ledger.companyId ?? "",
      unitId: ledger.unitId ?? "",
      contactId: ledger.contactId ?? "",
      gstNo: ledger.gstNo || "",
      panNo: ledger.panNo || "",
      bankName: ledger.bankName || "",
      accountHolderName: ledger.accountHolderName || "",
      accountNumber: ledger.accountNumber || "",
      ifscCode: ledger.ifscCode || "",
      branchName: ledger.branchName || "",
      openingBalance: ledger.openingBalance ?? "0",
      openingBalanceType: ledger.openingBalanceType || "DEBIT",
      active: String(ledger.active ?? true),
    });

    onOpen();
  };

  const handleChange = (key, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const buildLedgerPayload = () => {
    return {
      ledgerName: formData.ledgerName.trim(),
      ledgerType: formData.ledgerType,
      ledgerGroupId: toNumber(formData.ledgerGroupId),
      companyId: toNumber(formData.companyId),
      unitId: toNumber(formData.unitId),
      contactId: toNumber(formData.contactId),
      gstNo: formData.gstNo.trim(),
      panNo: formData.panNo.trim(),
      bankName: formData.bankName.trim(),
      accountHolderName: formData.accountHolderName.trim(),
      accountNumber: formData.accountNumber.trim(),
      ifscCode: formData.ifscCode.trim(),
      branchName: formData.branchName.trim(),
      openingBalance: toNumber(formData.openingBalance),
      openingBalanceType: formData.openingBalanceType,
      active: formData.active === "true" || formData.active === true,
    };
  };

  const validateLedgerForm = () => {
    if (!formData.ledgerName.trim()) {
      return "Ledger name is required";
    }

    if (!formData.ledgerType) {
      return "Ledger type is required";
    }

    if (!formData.ledgerGroupId) {
      return "Ledger group ID is required";
    }

    return "";
  };

  const handleSaveLedger = async (event) => {
    event.preventDefault();

    const validationError = validateLedgerForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setFormError("");
      dispatch(clearLedgerError());

      const payload = buildLedgerPayload();

      if (editData) {
        await dispatch(
          updateLedger({
            id: editData.id,
            payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createLedger(payload)).unwrap();
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
      );

      setEditData(null);
      setFormData(initialForm);
      onOpenChange(false);
    } catch (err) {
      setFormError(err || "Failed to save ledger");
    }
  };

  const handleDeleteLedger = async (ledger) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ledger "${ledger.ledgerName}"?`,
    );

    if (!confirmed) return;

    try {
      dispatch(clearLedgerError());

      await dispatch(deleteLedger(ledger.id)).unwrap();

      const nextPage = ledgers.length === 1 && page > 1 ? page - 1 : page;

      dispatch(setLedgerPage(nextPage));

      await dispatch(
        fetchLedgers({
          search,
          ledgerType: ledgerTypeFilter,
          ledgerGroupId: ledgerGroupIdFilter,
          active: activeFilter,
          page: nextPage,
          size,
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-800">
      {/* Top Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-[#064e3b] px-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" className="text-white">
            <Menu size={22} />
          </Button>

          <div>
            <h1 className="text-xl font-semibold leading-none">Accounts</h1>
            <p className="mt-1 text-xs text-emerald-100">Primary Company</p>
          </div>
        </div>

        <Input
          className="hidden max-w-xl md:flex"
          classNames={{
            inputWrapper:
              "bg-white/10 border border-white/15 text-white data-[hover=true]:bg-white/15",
            input: "text-white placeholder:text-emerald-100",
          }}
          placeholder="Search ledgers, vouchers, invoices..."
          startContent={<Search size={18} className="text-emerald-100" />}
          endContent={
            <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-emerald-100">
              Ctrl + K
            </span>
          }
        />

        <div className="flex items-center gap-3">
          <HelpCircle size={20} className="text-emerald-100" />

          <div className="relative">
            <Bell size={20} className="text-emerald-100" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-700">
              3
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              AD
            </div>
            <div className="hidden text-sm md:block">
              <p className="font-semibold leading-none">Admin</p>
              <p className="mt-1 text-xs text-emerald-100">Primary Company</p>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white p-4 lg:block">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    item.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-5 w-56 border-t border-slate-200 pt-4">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <Settings size={19} />
                Settings
              </span>
              <ChevronDown size={16} className="-rotate-90" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full p-4 lg:p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Accounts</span>
                <ChevronDown size={15} className="-rotate-90" />
                <span>Ledger Master</span>
                <ChevronDown size={15} className="-rotate-90" />
                <span className="font-medium text-slate-700">
                  {selectedLedger?.ledgerName || "Ledger"}
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-slate-900">
                Ledger Master
              </h2>
            </div>

            <Button
              color="success"
              className="bg-emerald-700 font-semibold text-white shadow-sm"
              startContent={<Plus size={18} />}
              onPress={openAddModal}
            >
              Create Ledger
            </Button>
          </div>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[390px_1fr]">
            {/* Ledger List */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    All Ledgers
                  </h3>
                  <p className="text-sm text-slate-500">
                    Total {totalElements} ledgers
                  </p>
                </div>

                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-emerald-50 text-emerald-700"
                >
                  Live API
                </Chip>
              </div>

              <Input
                isClearable
                placeholder="Search ledger..."
                value={search}
                onValueChange={(value) => dispatch(setLedgerSearch(value))}
                onClear={() => dispatch(setLedgerSearch(""))}
                startContent={<Search size={17} className="text-slate-400" />}
                className="mb-3"
              />

              <div className="mb-4 grid grid-cols-1 gap-3">
                <SelectBox
                  label="Ledger Type"
                  value={ledgerTypeFilter}
                  onChange={(value) => dispatch(setLedgerTypeFilter(value))}
                  options={[
                    { label: "All Ledger Types", value: "ALL" },
                    ...ledgerTypeOptions.map((type) => ({
                      label: type,
                      value: type,
                    })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Ledger Group ID"
                    type="number"
                    value={ledgerGroupIdFilter}
                    onValueChange={(value) =>
                      dispatch(setLedgerGroupIdFilter(value))
                    }
                  />
                  <SelectBox
                    label="Status"
                    value={activeFilter}
                    onChange={(value) => dispatch(setActiveFilter(value))}
                    options={[
                      { label: "All", value: "ALL" },
                      { label: "Active", value: "true" },
                      { label: "Inactive", value: "false" },
                    ]}
                  />
                </div>
              </div>

              <div className="max-h-[650px] space-y-3 overflow-auto pr-1">
                {loading ? (
                  <div className="flex h-56 items-center justify-center">
                    <Spinner label="Loading ledgers..." />
                  </div>
                ) : ledgers.length > 0 ? (
                  ledgers.map((ledger) => {
                    const LedgerIcon = getLedgerIcon(ledger.ledgerType);

                    return (
                      <div
                        key={ledger.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => dispatch(setSelectedLedgerId(ledger.id))}
                        className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                          selectedLedger?.id === ledger.id
                            ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                              <LedgerIcon size={20} />
                            </div>

                            <div>
                              <p className="line-clamp-1 font-semibold text-slate-900">
                                {ledger.ledgerName || "-"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {ledger.ledgerCode || "-"}
                              </p>
                            </div>
                          </div>

                          <div onClick={(event) => event.stopPropagation()}>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  isLoading={deletingId === ledger.id}
                                >
                                  <EllipsisVertical size={18} />
                                </Button>
                              </DropdownTrigger>

                              <DropdownMenu
                                aria-label="Ledger actions"
                                onAction={(key) => {
                                  if (key === "edit") openEditModal(ledger);
                                  if (key === "delete")
                                    handleDeleteLedger(ledger);
                                }}
                              >
                                <DropdownItem
                                  key="edit"
                                  startContent={<Pencil size={16} />}
                                >
                                  Edit
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  color="danger"
                                  className="text-danger"
                                  startContent={<Trash2 size={16} />}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getGroupBadgeClass(
                              ledger.ledgerType,
                            )}`}
                          >
                            {ledger.ledgerType || "-"}
                          </span>

                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {ledger.ledgerGroupName ||
                              `Group ID ${ledger.ledgerGroupId}`}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                              ledger.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {ledger.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-xs text-slate-500">
                            Current Balance
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(ledger.currentBalance)}{" "}
                            {balanceTypeLabel(ledger.currentBalanceType)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                    No ledgers found
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    showControls
                    page={page}
                    total={totalPages}
                    onChange={(value) => dispatch(setLedgerPage(value))}
                    color="success"
                  />
                </div>
              )}
            </section>

            {/* Ledger Detail */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {selectedLedger ? (
                <>
                  <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        {React.createElement(
                          getLedgerIcon(selectedLedger.ledgerType),
                          { size: 28 },
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-slate-950">
                          {selectedLedger.ledgerName || "-"}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span>{selectedLedger.ledgerType || "-"}</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span>
                            {selectedLedger.ledgerGroupName ||
                              `Group ID ${selectedLedger.ledgerGroupId}`}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span>{selectedLedger.ledgerCode || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Chip
                        color={selectedLedger.active ? "success" : "danger"}
                        variant="flat"
                        className="font-semibold"
                      >
                        {selectedLedger.active ? "ACTIVE" : "INACTIVE"}
                      </Chip>

                      <Button
                        variant="bordered"
                        startContent={<Pencil size={17} />}
                        onPress={() => openEditModal(selectedLedger)}
                      >
                        Edit
                      </Button>

                      <Button
                        color="danger"
                        variant="flat"
                        startContent={<Trash2 size={17} />}
                        isLoading={deletingId === selectedLedger.id}
                        onPress={() => handleDeleteLedger(selectedLedger)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="mb-4 text-lg font-semibold text-emerald-900">
                      Basic Information
                    </h4>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.6fr]">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoItem
                          label="Ledger Name"
                          value={selectedLedger.ledgerName}
                        />
                        <InfoItem
                          label="Ledger Code"
                          value={selectedLedger.ledgerCode}
                        />
                        <InfoItem
                          label="Ledger Type"
                          value={selectedLedger.ledgerType}
                        />
                        <InfoItem
                          label="Under Group"
                          value={
                            selectedLedger.ledgerGroupName ||
                            `Group ID ${selectedLedger.ledgerGroupId}`
                          }
                        />
                        <InfoItem
                          label="Company"
                          value={selectedLedger.companyName}
                        />
                        <InfoItem
                          label="Unit"
                          value={selectedLedger.unitName}
                        />
                        <InfoItem
                          label="Contact"
                          value={selectedLedger.contactName}
                        />
                        <InfoItem
                          label="System Created"
                          value={selectedLedger.systemCreated ? "Yes" : "No"}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                        <SummaryCard
                          label="Opening Balance"
                          value={`${formatCurrency(
                            selectedLedger.openingBalance,
                          )} ${balanceTypeLabel(
                            selectedLedger.openingBalanceType,
                          )}`}
                          icon={Wallet}
                        />
                        <SummaryCard
                          label="Current Balance"
                          value={`${formatCurrency(
                            selectedLedger.currentBalance,
                          )} ${balanceTypeLabel(
                            selectedLedger.currentBalanceType,
                          )}`}
                          icon={Wallet}
                        />
                        <SummaryCard
                          label="GST Status"
                          value={selectedLedger.gstNo ? "Registered" : "N/A"}
                          icon={ShieldCheck}
                        />
                        <SummaryCard
                          label="Created At"
                          value={formatDateTime(selectedLedger.createdAt)}
                          icon={BookOpen}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <div className="mb-6">
                    <h4 className="mb-4 text-lg font-semibold text-emerald-900">
                      Tax / Bank / Party Information
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <ContactItem
                        icon={FileText}
                        label="GST No."
                        value={selectedLedger.gstNo}
                      />
                      <ContactItem
                        icon={IdCard}
                        label="PAN No."
                        value={selectedLedger.panNo}
                      />
                      <ContactItem
                        icon={Landmark}
                        label="Bank Name"
                        value={selectedLedger.bankName}
                      />
                      <ContactItem
                        icon={Users}
                        label="Account Holder Name"
                        value={selectedLedger.accountHolderName}
                      />
                      <ContactItem
                        icon={Wallet}
                        label="Account Number"
                        value={selectedLedger.accountNumber}
                      />
                      <ContactItem
                        icon={ShieldCheck}
                        label="IFSC Code"
                        value={selectedLedger.ifscCode}
                      />
                      <ContactItem
                        icon={Landmark}
                        label="Branch Name"
                        value={selectedLedger.branchName}
                      />
                      <ContactItem
                        icon={Building2}
                        label="Company ID"
                        value={selectedLedger.companyId}
                      />
                      <ContactItem
                        icon={Building2}
                        label="Unit ID"
                        value={selectedLedger.unitId}
                      />
                    </div>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-emerald-900">
                        Recent Ledger Entries
                      </h4>

                      <Button
                        size="sm"
                        variant="light"
                        className="font-semibold text-emerald-700"
                        endContent={<ChevronDown size={16} />}
                      >
                        View All Entries
                      </Button>
                    </div>

                    <Table
                      removeWrapper
                      aria-label="Recent ledger entries"
                      classNames={{
                        th: "bg-emerald-50 text-emerald-900 font-semibold",
                        td: "text-slate-700",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>Date</TableColumn>
                        <TableColumn>Voucher No.</TableColumn>
                        <TableColumn>Particulars</TableColumn>
                        <TableColumn>Debit</TableColumn>
                        <TableColumn>Credit</TableColumn>
                        <TableColumn>Balance</TableColumn>
                      </TableHeader>

                      <TableBody
                        emptyContent="No ledger entries found from API"
                        items={selectedLedger.entries || []}
                      >
                        {(entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.voucherNo}</TableCell>
                            <TableCell>{entry.particulars}</TableCell>
                            <TableCell>{formatCurrency(entry.debit)}</TableCell>
                            <TableCell>
                              {formatCurrency(entry.credit)}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {entry.balance}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="flex h-96 items-center justify-center text-slate-500">
                  {loading ? (
                    <Spinner label="Loading ledger..." />
                  ) : (
                    "No ledger selected"
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        size="4xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSaveLedger}>
              <ModalHeader className="flex flex-col gap-1">
                {editData ? "Update Ledger" : "Create Ledger"}
                <p className="text-sm font-normal text-slate-500">
                  Ledger master information from Account Service API
                </p>
              </ModalHeader>

              <ModalBody>
                {apiError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {apiError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    isRequired
                    label="Ledger Name"
                    value={formData.ledgerName}
                    onValueChange={(value) => handleChange("ledgerName", value)}
                  />

                  <SelectBox
                    label="Ledger Type"
                    value={formData.ledgerType}
                    onChange={(value) => handleChange("ledgerType", value)}
                    options={ledgerTypeOptions}
                  />

                  <Input
                    isRequired
                    label="Ledger Group ID"
                    type="number"
                    value={String(formData.ledgerGroupId)}
                    onValueChange={(value) =>
                      handleChange("ledgerGroupId", value)
                    }
                  />

                  <SelectBox
                    label="Status"
                    value={String(formData.active)}
                    onChange={(value) => handleChange("active", value)}
                    options={[
                      { label: "Active", value: "true" },
                      { label: "Inactive", value: "false" },
                    ]}
                  />

                  <Input
                    label="Company ID"
                    type="number"
                    value={String(formData.companyId)}
                    onValueChange={(value) => handleChange("companyId", value)}
                  />

                  <Input
                    label="Unit ID"
                    type="number"
                    value={String(formData.unitId)}
                    onValueChange={(value) => handleChange("unitId", value)}
                  />

                  <Input
                    label="Contact ID"
                    type="number"
                    value={String(formData.contactId)}
                    onValueChange={(value) => handleChange("contactId", value)}
                  />

                  <Input
                    label="Opening Balance"
                    type="number"
                    value={String(formData.openingBalance)}
                    onValueChange={(value) =>
                      handleChange("openingBalance", value)
                    }
                  />

                  <SelectBox
                    label="Opening Balance Type"
                    value={formData.openingBalanceType}
                    onChange={(value) =>
                      handleChange("openingBalanceType", value)
                    }
                    options={[
                      { label: "Debit", value: "DEBIT" },
                      { label: "Credit", value: "CREDIT" },
                    ]}
                  />

                  <Input
                    label="GST No."
                    value={formData.gstNo}
                    onValueChange={(value) => handleChange("gstNo", value)}
                  />

                  <Input
                    label="PAN No."
                    value={formData.panNo}
                    onValueChange={(value) => handleChange("panNo", value)}
                  />

                  <Input
                    label="Bank Name"
                    value={formData.bankName}
                    onValueChange={(value) => handleChange("bankName", value)}
                  />

                  <Input
                    label="Account Holder Name"
                    value={formData.accountHolderName}
                    onValueChange={(value) =>
                      handleChange("accountHolderName", value)
                    }
                  />

                  <Input
                    label="Account Number"
                    value={formData.accountNumber}
                    onValueChange={(value) =>
                      handleChange("accountNumber", value)
                    }
                  />

                  <Input
                    label="IFSC Code"
                    value={formData.ifscCode}
                    onValueChange={(value) => handleChange("ifscCode", value)}
                  />

                  <Input
                    label="Branch Name"
                    value={formData.branchName}
                    onValueChange={(value) => handleChange("branchName", value)}
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={saving}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  color="success"
                  isLoading={saving}
                  className="bg-emerald-700 font-semibold text-white"
                >
                  {editData ? "Update Ledger" : "Create Ledger"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div className="border-b border-slate-200 pb-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {displayValue}
      </p>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon }) => {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {displayValue}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon: Icon, label, value }) => {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div className="flex gap-3 border-b border-slate-200 pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-900">
          {displayValue}
        </p>
      </div>
    </div>
  );
};

const SelectBox = ({ label, value, onChange, options = [] }) => {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-slate-600">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
};

export default Ledger;
