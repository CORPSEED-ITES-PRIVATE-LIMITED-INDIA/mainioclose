import React, { useMemo, useState } from "react";
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
  ScrollShadow,
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
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
    effectiveFrom: "2026-04-01",
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
        balance: "₹2,50,000 DR",
      },
      {
        id: 2,
        date: "12-Apr-26",
        voucherNo: "RCPT-001",
        particulars: "Payment Received",
        debit: null,
        credit: 100000,
        balance: "₹1,50,000 DR",
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
    effectiveFrom: "2026-04-01",
    gstStatus: "Registered",
    gstin: "09AAFCB1234K1Z2",
    panNumber: "AAFCB1234K",
    email: "balaji.traders@gmail.com",
    mobile: "9876543211",
    billingAddress: "Industrial Area, Ghaziabad, Uttar Pradesh - 201001",
    active: true,
    entries: [
      {
        id: 1,
        date: "08-Apr-26",
        voucherNo: "PUR-001",
        particulars: "Purchase - Cement Material",
        debit: null,
        credit: 300000,
        balance: "₹3,00,000 CR",
      },
      {
        id: 2,
        date: "15-Apr-26",
        voucherNo: "PAY-001",
        particulars: "Vendor Payment",
        debit: 115000,
        credit: null,
        balance: "₹1,85,000 CR",
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
    effectiveFrom: "2026-04-01",
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
        balance: "₹17,50,000 DR",
      },
      {
        id: 2,
        date: "10-Apr-26",
        voucherNo: "PAY-002",
        particulars: "Vendor Payment",
        debit: null,
        credit: 225000,
        balance: "₹15,25,000 DR",
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
    effectiveFrom: "2026-04-01",
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
        balance: "₹2,50,000 CR",
      },
      {
        id: 2,
        date: "20-Apr-26",
        voucherNo: "INV-002",
        particulars: "Sales Invoice - Consultancy",
        debit: null,
        credit: 640000,
        balance: "₹8,90,000 CR",
      },
    ],
  },
];

const defaultValues = {
  name: "",
  alias: "",
  ledgerType: "Company Ledger",
  ledgerCategory: "COMPANY",
  partyType: "CUSTOMER",
  groupName: "Sundry Debtors",
  openingBalance: "0",
  openingBalanceType: "DR",
  currentBalance: "0",
  currentBalanceType: "DR",
  totalDebit: "0",
  totalCredit: "0",
  currency: "INR",
  effectiveFrom: "2026-04-01",
  gstStatus: "Registered",
  gstin: "",
  panNumber: "",
  email: "",
  mobile: "",
  billingAddress: "",
  active: "true",
};

const ledgerTypeOptions = [
  "Company Ledger",
  "Vendor Ledger",
  "Bank Ledger",
  "Income Ledger",
  "Expense Ledger",
  "Tax Ledger",
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

const balanceTypeOptions = ["DR", "CR"];
const gstStatusOptions = ["Registered", "Unregistered", "Not Applicable"];

const LedgerMasterSection = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const [ledgers, setLedgers] = useState(dummyLedgers);
  const [selectedLedgerId, setSelectedLedgerId] = useState(1);
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState(null);

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

  const selectedLedger = useMemo(() => {
    return ledgers.find((item) => item.id === selectedLedgerId) || ledgers[0];
  }, [ledgers, selectedLedgerId]);

  const filteredLedgers = useMemo(() => {
    if (!search.trim()) return ledgers;

    const keyword = search.toLowerCase();

    return ledgers.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.ledgerCode.toLowerCase().includes(keyword) ||
        item.ledgerType.toLowerCase().includes(keyword) ||
        item.groupName.toLowerCase().includes(keyword)
      );
    });
  }, [ledgers, search]);

  const handleOpenCreate = () => {
    setEditData(null);
    reset(defaultValues);
    onOpen();
  };

  const handleOpenEdit = (ledger) => {
    setEditData(ledger);

    reset({
      name: ledger.name || "",
      alias: ledger.alias || "",
      ledgerType: ledger.ledgerType || "Company Ledger",
      ledgerCategory: ledger.ledgerCategory || "COMPANY",
      partyType: ledger.partyType || "CUSTOMER",
      groupName: ledger.groupName || "Sundry Debtors",
      openingBalance: String(ledger.openingBalance ?? 0),
      openingBalanceType: ledger.openingBalanceType || "DR",
      currentBalance: String(ledger.currentBalance ?? 0),
      currentBalanceType: ledger.currentBalanceType || "DR",
      totalDebit: String(ledger.totalDebit ?? 0),
      totalCredit: String(ledger.totalCredit ?? 0),
      currency: ledger.currency || "INR",
      effectiveFrom: ledger.effectiveFrom || "2026-04-01",
      gstStatus: ledger.gstStatus || "Registered",
      gstin: ledger.gstin || "",
      panNumber: ledger.panNumber || "",
      email: ledger.email || "",
      mobile: ledger.mobile || "",
      billingAddress: ledger.billingAddress || "",
      active: String(ledger.active ?? true),
    });

    onOpen();
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      openingBalance: Number(values.openingBalance || 0),
      currentBalance: Number(values.currentBalance || 0),
      totalDebit: Number(values.totalDebit || 0),
      totalCredit: Number(values.totalCredit || 0),
      active: values.active === "true",
      entries: editData?.entries || [],
    };

    if (editData) {
      setLedgers((prev) =>
        prev.map((item) =>
          item.id === editData.id
            ? {
                ...item,
                ...payload,
              }
            : item,
        ),
      );
      setSelectedLedgerId(editData.id);
    } else {
      const newId = Math.max(...ledgers.map((item) => item.id)) + 1;

      const newLedger = {
        id: newId,
        ledgerCode: `LED-${String(newId).padStart(4, "0")}`,
        ...payload,
      };

      setLedgers((prev) => [newLedger, ...prev]);
      setSelectedLedgerId(newId);
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
  };

  const onInvalid = () => {
    addToast({
      title: "Please fill all required fields correctly",
      color: "danger",
    });
  };

  return (
    <div className="w-full max-w-full overflow-hidden text-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1 text-xs text-slate-500">
            <span>Accounts</span>
            <ChevronDown size={13} className="-rotate-90" />
            <span>Ledger Master</span>
            <ChevronDown size={13} className="-rotate-90" />
            <span className="font-medium text-slate-700">Company Ledger</span>
          </div>

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
                  Total {ledgers.length} ledgers
                </p>
              </div>

              <Chip
                size="sm"
                variant="flat"
                className="bg-emerald-50 text-xs text-emerald-700"
              >
                Dummy Data
              </Chip>
            </div>

            <Input
              isClearable
              size="sm"
              placeholder="Search ledger..."
              value={search}
              onValueChange={setSearch}
              onClear={() => setSearch("")}
              startContent={<Search size={15} className="text-slate-400" />}
              className="mb-3"
            />

            <ScrollShadow className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-3">
                {filteredLedgers.map((ledger) => (
                  <Card
                    key={ledger.id}
                    isPressable
                    shadow="none"
                    onPress={() => setSelectedLedgerId(ledger.id)}
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
                ))}
              </div>
            </ScrollShadow>
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

                  <Button
                    size="sm"
                    variant="bordered"
                    startContent={<Pencil size={15} />}
                    onPress={() => handleOpenEdit(selectedLedger)}
                  >
                    Edit
                  </Button>
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
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        onCancel={() => {
          reset(defaultValues);
          setEditData(null);
          onClose();
        }}
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
  onSubmit,
  onCancel,
}) => {
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

                  <RHFInput name="alias" label="Alias" control={control} />

                  <RHFSelect
                    name="ledgerType"
                    label="Ledger Type"
                    control={control}
                    options={ledgerTypeOptions}
                    rules={{ required: "Ledger type is required" }}
                    isRequired
                  />

                  <RHFSelect
                    name="ledgerCategory"
                    label="Ledger Category"
                    control={control}
                    options={ledgerCategoryOptions}
                    rules={{ required: "Ledger category is required" }}
                    isRequired
                  />

                  <RHFSelect
                    name="partyType"
                    label="Party Type"
                    control={control}
                    options={partyTypeOptions}
                    rules={{ required: "Party type is required" }}
                    isRequired
                  />

                  <RHFSelect
                    name="groupName"
                    label="Under Group"
                    control={control}
                    options={groupOptions}
                    rules={{ required: "Under group is required" }}
                    isRequired
                  />

                  <RHFInput
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
                  />

                  <RHFSelect
                    name="openingBalanceType"
                    label="Opening Balance Type"
                    control={control}
                    options={balanceTypeOptions}
                    rules={{ required: "Opening balance type is required" }}
                    isRequired
                  />

                  <RHFInput
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
                  />

                  <RHFSelect
                    name="currentBalanceType"
                    label="Current Balance Type"
                    control={control}
                    options={balanceTypeOptions}
                    rules={{ required: "Current balance type is required" }}
                    isRequired
                  />

                  <RHFInput
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
                  />

                  <RHFInput
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
                  />

                  <RHFInput
                    name="currency"
                    label="Currency"
                    control={control}
                    rules={{ required: "Currency is required" }}
                    isRequired
                  />

                  <RHFInput
                    name="effectiveFrom"
                    label="Effective From"
                    type="date"
                    control={control}
                    rules={{ required: "Effective from date is required" }}
                    isRequired
                  />

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

                  <Controller
                    name="active"
                    control={control}
                    rules={{ required: "Status is required" }}
                    render={({ field, fieldState }) => (
                      <Select
                        size="sm"
                        label="Status"
                        isRequired
                        selectedKeys={field.value ? [field.value] : []}
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
                </div>
              </ScrollShadow>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onCancel}>
                Cancel
              </Button>

              <Button
                type="submit"
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
          selectedKeys={field.value ? [field.value] : []}
          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        >
          {options.map((item) => (
            <SelectItem key={item}>{item}</SelectItem>
          ))}
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
