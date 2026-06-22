import React, { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  ArrowDownRight,
  ArrowUpRight,
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
  Mail,
  MapPin,
  Menu,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";

const dummyLedgers = [
  {
    id: 1,
    ledgerCode: "LED-0001",
    name: "Corpseed ITES Pvt. Ltd.",
    alias: "Corpseed",
    ledgerType: "Company Ledger",
    ledgerCategory: "COMPANY",
    partyType: "CUSTOMER",
    groupName: "Sundry Debtors",
    openingBalance: 0,
    openingBalanceType: "DR",
    currentBalance: 245000,
    currentBalanceType: "DR",
    totalDebit: 890000,
    totalCredit: 645000,
    currency: "INR",
    effectiveFrom: "01-Apr-2026",
    gstRegistered: true,
    gstStatus: "Registered",
    gstin: "07ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    email: "accounts@corpseed.com",
    mobile: "9876543210",
    billingAddress: "A-154A, Sector 63, Noida, Uttar Pradesh - 201301",
    active: true,
    entries: [
      {
        id: 1,
        date: "05-Apr-26",
        voucherNo: "INV-001",
        particulars: "Sales Invoice - Project Service",
        debit: 250000,
        credit: null,
        balance: "₹2,50,000 Dr",
      },
      {
        id: 2,
        date: "12-Apr-26",
        voucherNo: "RCPT-001",
        particulars: "Payment Received",
        debit: null,
        credit: 100000,
        balance: "₹1,50,000 Dr",
      },
    ],
  },
  {
    id: 2,
    ledgerCode: "LED-0002",
    name: "Balaji Traders",
    alias: "Balaji",
    ledgerType: "Vendor Ledger",
    ledgerCategory: "VENDOR",
    partyType: "SUPPLIER",
    groupName: "Sundry Creditors",
    openingBalance: 50000,
    openingBalanceType: "CR",
    currentBalance: 185000,
    currentBalanceType: "CR",
    totalDebit: 315000,
    totalCredit: 500000,
    currency: "INR",
    effectiveFrom: "01-Apr-2026",
    gstRegistered: true,
    gstStatus: "Registered",
    gstin: "09AAFCB1234K1Z2",
    panNumber: "AAFCB1234K",
    email: "balaji.traders@gmail.com",
    mobile: "9876543211",
    billingAddress:
      "Plot 42, Industrial Area, Ghaziabad, Uttar Pradesh - 201001",
    active: true,
    entries: [
      {
        id: 1,
        date: "08-Apr-26",
        voucherNo: "PUR-001",
        particulars: "Purchase - Cement Material",
        debit: null,
        credit: 300000,
        balance: "₹3,00,000 Cr",
      },
      {
        id: 2,
        date: "15-Apr-26",
        voucherNo: "PAY-001",
        particulars: "Vendor Payment",
        debit: 115000,
        credit: null,
        balance: "₹1,85,000 Cr",
      },
    ],
  },
  {
    id: 3,
    ledgerCode: "LED-0003",
    name: "HDFC Bank",
    alias: "HDFC",
    ledgerType: "Bank Ledger",
    ledgerCategory: "BANK",
    partyType: "NA",
    groupName: "Bank Accounts",
    openingBalance: 1000000,
    openingBalanceType: "DR",
    currentBalance: 1525000,
    currentBalanceType: "DR",
    totalDebit: 2250000,
    totalCredit: 725000,
    currency: "INR",
    effectiveFrom: "01-Apr-2026",
    gstRegistered: false,
    gstStatus: "Not Applicable",
    gstin: "-",
    panNumber: "-",
    email: "banking@corpseed.com",
    mobile: "9876543212",
    billingAddress: "HDFC Bank, Sector 63 Branch, Noida",
    active: true,
    entries: [
      {
        id: 1,
        date: "03-Apr-26",
        voucherNo: "RCPT-002",
        particulars: "Client Receipt",
        debit: 750000,
        credit: null,
        balance: "₹17,50,000 Dr",
      },
      {
        id: 2,
        date: "10-Apr-26",
        voucherNo: "PAY-002",
        particulars: "Vendor Payment",
        debit: null,
        credit: 225000,
        balance: "₹15,25,000 Dr",
      },
    ],
  },
  {
    id: 4,
    ledgerCode: "LED-0004",
    name: "Sales Account",
    alias: "Sales",
    ledgerType: "Income Ledger",
    ledgerCategory: "INCOME",
    partyType: "NA",
    groupName: "Sales Accounts",
    openingBalance: 0,
    openingBalanceType: "CR",
    currentBalance: 890000,
    currentBalanceType: "CR",
    totalDebit: 0,
    totalCredit: 890000,
    currency: "INR",
    effectiveFrom: "01-Apr-2026",
    gstRegistered: false,
    gstStatus: "Not Applicable",
    gstin: "-",
    panNumber: "-",
    email: "accounts@corpseed.com",
    mobile: "9876543213",
    billingAddress: "Primary Company Ledger",
    active: true,
    entries: [
      {
        id: 1,
        date: "05-Apr-26",
        voucherNo: "INV-001",
        particulars: "Sales Invoice - Project Service",
        debit: null,
        credit: 250000,
        balance: "₹2,50,000 Cr",
      },
      {
        id: 2,
        date: "20-Apr-26",
        voucherNo: "INV-002",
        particulars: "Sales Invoice - Consultancy",
        debit: null,
        credit: 640000,
        balance: "₹8,90,000 Cr",
      },
    ],
  },
];

const initialForm = {
  name: "",
  alias: "",
  ledgerType: "Company Ledger",
  ledgerCategory: "COMPANY",
  partyType: "CUSTOMER",
  groupName: "Sundry Debtors",
  openingBalance: "",
  openingBalanceType: "DR",
  currentBalance: "",
  currentBalanceType: "DR",
  totalDebit: "",
  totalCredit: "",
  currency: "INR",
  effectiveFrom: "01-Apr-2026",
  gstRegistered: true,
  gstStatus: "Registered",
  gstin: "",
  panNumber: "",
  email: "",
  mobile: "",
  billingAddress: "",
  active: true,
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

  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const getGroupBadgeClass = (category) => {
  switch (category) {
    case "COMPANY":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "VENDOR":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "BANK":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "INCOME":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-default-50 text-default-700 border-default-200";
  }
};

const Ledger = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [ledgers, setLedgers] = useState(dummyLedgers);
  const [selectedLedgerId, setSelectedLedgerId] = useState(1);
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const selectedLedger = useMemo(() => {
    return (
      ledgers.find((ledger) => ledger.id === selectedLedgerId) || ledgers[0]
    );
  }, [ledgers, selectedLedgerId]);

  const filteredLedgers = useMemo(() => {
    if (!search.trim()) return ledgers;

    const keyword = search.toLowerCase();

    return ledgers.filter((ledger) => {
      return (
        ledger.name.toLowerCase().includes(keyword) ||
        ledger.groupName.toLowerCase().includes(keyword) ||
        ledger.ledgerType.toLowerCase().includes(keyword) ||
        ledger.ledgerCategory.toLowerCase().includes(keyword)
      );
    });
  }, [ledgers, search]);

  const openAddModal = () => {
    setEditData(null);
    setFormData(initialForm);
    onOpen();
  };

  const openEditModal = (ledger) => {
    setEditData(ledger);
    setFormData({
      name: ledger.name || "",
      alias: ledger.alias || "",
      ledgerType: ledger.ledgerType || "Company Ledger",
      ledgerCategory: ledger.ledgerCategory || "COMPANY",
      partyType: ledger.partyType || "CUSTOMER",
      groupName: ledger.groupName || "Sundry Debtors",
      openingBalance: ledger.openingBalance ?? "",
      openingBalanceType: ledger.openingBalanceType || "DR",
      currentBalance: ledger.currentBalance ?? "",
      currentBalanceType: ledger.currentBalanceType || "DR",
      totalDebit: ledger.totalDebit ?? "",
      totalCredit: ledger.totalCredit ?? "",
      currency: ledger.currency || "INR",
      effectiveFrom: ledger.effectiveFrom || "01-Apr-2026",
      gstRegistered: ledger.gstRegistered ?? true,
      gstStatus: ledger.gstStatus || "Registered",
      gstin: ledger.gstin || "",
      panNumber: ledger.panNumber || "",
      email: ledger.email || "",
      mobile: ledger.mobile || "",
      billingAddress: ledger.billingAddress || "",
      active: ledger.active ?? true,
    });
    onOpen();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveLedger = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      openingBalance: Number(formData.openingBalance || 0),
      currentBalance: Number(formData.currentBalance || 0),
      totalDebit: Number(formData.totalDebit || 0),
      totalCredit: Number(formData.totalCredit || 0),
      gstRegistered:
        formData.gstRegistered === true || formData.gstRegistered === "true",
      active: formData.active === true || formData.active === "true",
    };

    if (editData) {
      setLedgers((prev) =>
        prev.map((ledger) =>
          ledger.id === editData.id
            ? {
                ...ledger,
                ...payload,
              }
            : ledger,
        ),
      );
    } else {
      const newId = Math.max(...ledgers.map((ledger) => ledger.id)) + 1;

      const newLedger = {
        id: newId,
        ledgerCode: `LED-${String(newId).padStart(4, "0")}`,
        ...payload,
        entries: [],
      };

      setLedgers((prev) => [newLedger, ...prev]);
      setSelectedLedgerId(newId);
    }

    setEditData(null);
    setFormData(initialForm);
    onOpenChange(false);
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
                  Company Ledger
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

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
            {/* Ledger List */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    All Ledgers
                  </h3>
                  <p className="text-sm text-slate-500">
                    Total {ledgers.length} ledgers
                  </p>
                </div>

                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-emerald-50 text-emerald-700"
                >
                  Dummy Data
                </Chip>
              </div>

              <Input
                isClearable
                placeholder="Search ledger..."
                value={search}
                onValueChange={setSearch}
                onClear={() => setSearch("")}
                startContent={<Search size={17} className="text-slate-400" />}
                className="mb-4"
              />

              <div className="max-h-[650px] space-y-3 overflow-auto pr-1">
                {filteredLedgers.map((ledger) => (
                  <button
                    key={ledger.id}
                    type="button"
                    onClick={() => setSelectedLedgerId(ledger.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedLedger?.id === ledger.id
                        ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          {ledger.ledgerCategory === "BANK" ? (
                            <Landmark size={20} />
                          ) : ledger.ledgerCategory === "VENDOR" ? (
                            <Users size={20} />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </div>

                        <div>
                          <p className="line-clamp-1 font-semibold text-slate-900">
                            {ledger.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {ledger.ledgerCode}
                          </p>
                        </div>
                      </div>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={(e) => e?.continuePropagation?.()}
                          >
                            <EllipsisVertical size={18} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Ledger actions"
                          onAction={(key) => {
                            if (key === "edit") openEditModal(ledger);
                          }}
                        >
                          <DropdownItem key="edit">Edit</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getGroupBadgeClass(
                          ledger.ledgerCategory,
                        )}`}
                      >
                        {ledger.ledgerType}
                      </span>

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {ledger.groupName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-500">
                        Current Balance
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(ledger.currentBalance)}{" "}
                        {ledger.currentBalanceType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Ledger Detail */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {selectedLedger ? (
                <>
                  {/* Detail Header */}
                  <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        {selectedLedger.ledgerCategory === "BANK" ? (
                          <Landmark size={28} />
                        ) : selectedLedger.ledgerCategory === "VENDOR" ? (
                          <Users size={28} />
                        ) : (
                          <Building2 size={28} />
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-slate-950">
                          {selectedLedger.name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span>{selectedLedger.ledgerType}</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span>{selectedLedger.groupName}</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span>{selectedLedger.ledgerCode}</span>
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
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="mb-6">
                    <h4 className="mb-4 text-lg font-semibold text-emerald-900">
                      Basic Information
                    </h4>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.6fr]">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoItem
                          label="Ledger Name"
                          value={selectedLedger.name}
                        />
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
                          value={`${formatCurrency(
                            selectedLedger.openingBalance,
                          )} ${selectedLedger.openingBalanceType}`}
                        />
                        <InfoItem
                          label="Currency"
                          value={selectedLedger.currency}
                        />
                        <InfoItem
                          label="Effective From"
                          value={selectedLedger.effectiveFrom}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                        <SummaryCard
                          label="Current Balance"
                          value={`${formatCurrency(
                            selectedLedger.currentBalance,
                          )} ${selectedLedger.currentBalanceType}`}
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
                        />
                      </div>
                    </div>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  {/* Tax Contact Address */}
                  <div className="mb-6">
                    <h4 className="mb-4 text-lg font-semibold text-emerald-900">
                      Tax / Contact / Address
                    </h4>

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
                      <ContactItem
                        icon={Phone}
                        label="Mobile"
                        value={selectedLedger.mobile}
                      />
                      <div className="md:col-span-2">
                        <ContactItem
                          icon={MapPin}
                          label="Billing Address"
                          value={selectedLedger.billingAddress}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  {/* Recent Entries */}
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
                        emptyContent="No ledger entries found"
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
                  No ledger selected
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
                  Tally-style ledger master information
                </p>
              </ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    isRequired
                    label="Ledger Name"
                    value={formData.name}
                    onValueChange={(value) => handleChange("name", value)}
                  />

                  <Input
                    label="Alias"
                    value={formData.alias}
                    onValueChange={(value) => handleChange("alias", value)}
                  />

                  <SelectBox
                    label="Ledger Type"
                    value={formData.ledgerType}
                    onChange={(value) => handleChange("ledgerType", value)}
                    options={[
                      "Company Ledger",
                      "Vendor Ledger",
                      "Bank Ledger",
                      "Income Ledger",
                      "Expense Ledger",
                      "Tax Ledger",
                    ]}
                  />

                  <SelectBox
                    label="Ledger Category"
                    value={formData.ledgerCategory}
                    onChange={(value) => handleChange("ledgerCategory", value)}
                    options={[
                      "COMPANY",
                      "VENDOR",
                      "BANK",
                      "CASH",
                      "TAX",
                      "EXPENSE",
                      "INCOME",
                    ]}
                  />

                  <SelectBox
                    label="Party Type"
                    value={formData.partyType}
                    onChange={(value) => handleChange("partyType", value)}
                    options={["CUSTOMER", "SUPPLIER", "BOTH", "NA"]}
                  />

                  <SelectBox
                    label="Under Group"
                    value={formData.groupName}
                    onChange={(value) => handleChange("groupName", value)}
                    options={[
                      "Sundry Debtors",
                      "Sundry Creditors",
                      "Bank Accounts",
                      "Cash-in-Hand",
                      "Sales Accounts",
                      "Purchase Accounts",
                      "Duties & Taxes",
                      "Indirect Expenses",
                      "Direct Expenses",
                    ]}
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
                    options={["DR", "CR"]}
                  />

                  <Input
                    label="Current Balance"
                    type="number"
                    value={String(formData.currentBalance)}
                    onValueChange={(value) =>
                      handleChange("currentBalance", value)
                    }
                  />

                  <SelectBox
                    label="Current Balance Type"
                    value={formData.currentBalanceType}
                    onChange={(value) =>
                      handleChange("currentBalanceType", value)
                    }
                    options={["DR", "CR"]}
                  />

                  <Input
                    label="Total Debit"
                    type="number"
                    value={String(formData.totalDebit)}
                    onValueChange={(value) => handleChange("totalDebit", value)}
                  />

                  <Input
                    label="Total Credit"
                    type="number"
                    value={String(formData.totalCredit)}
                    onValueChange={(value) =>
                      handleChange("totalCredit", value)
                    }
                  />

                  <Input
                    label="Currency"
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  />

                  <Input
                    label="Effective From"
                    value={formData.effectiveFrom}
                    onValueChange={(value) =>
                      handleChange("effectiveFrom", value)
                    }
                  />

                  <SelectBox
                    label="GST Registered"
                    value={String(formData.gstRegistered)}
                    onChange={(value) => handleChange("gstRegistered", value)}
                    options={["true", "false"]}
                  />

                  <Input
                    label="GSTIN"
                    value={formData.gstin}
                    onValueChange={(value) => handleChange("gstin", value)}
                  />

                  <Input
                    label="PAN Number"
                    value={formData.panNumber}
                    onValueChange={(value) => handleChange("panNumber", value)}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onValueChange={(value) => handleChange("email", value)}
                  />

                  <Input
                    label="Mobile"
                    value={formData.mobile}
                    onValueChange={(value) => handleChange("mobile", value)}
                  />

                  <SelectBox
                    label="Status"
                    value={String(formData.active)}
                    onChange={(value) => handleChange("active", value)}
                    options={["true", "false"]}
                  />

                  <div className="md:col-span-2">
                    <Textarea
                      label="Billing Address"
                      value={formData.billingAddress}
                      onValueChange={(value) =>
                        handleChange("billingAddress", value)
                      }
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="success"
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
  return (
    <div className="border-b border-slate-200 pb-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex gap-3 border-b border-slate-200 pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
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
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Ledger;
