import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
} from "@heroui/react";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileCheck2,
  Filter,
  ReceiptIndianRupee,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const stats = [
  {
    title: "Total Billed",
    value: "₹ 48.75L",
    icon: ReceiptIndianRupee,
    tone: "blue",
    change: "↑ 14%",
    changeColor: "text-emerald-600",
    suffix: "vs last month",
  },
  {
    title: "Payment Received",
    value: "₹ 36.20L",
    icon: Banknote,
    tone: "emerald",
    change: "↑ 18%",
    changeColor: "text-emerald-600",
    suffix: "vs last month",
  },
  {
    title: "Outstanding",
    value: "₹ 12.55L",
    icon: WalletCards,
    tone: "amber",
    change: "↓ 8%",
    changeColor: "text-rose-600",
    suffix: "vs last month",
  },
  {
    title: "Pending Approvals",
    value: "18",
    icon: Clock3,
    tone: "violet",
    change: "6 urgent",
    changeColor: "text-orange-600",
    suffix: "today",
  },
  {
    title: "TDS Pending",
    value: "₹ 2.40L",
    icon: FileCheck2,
    tone: "rose",
    change: "12 cases",
    changeColor: "text-rose-600",
    suffix: "pending",
  },
];

const invoiceStatus = [
  { label: "Generated", value: 42, percent: 45, color: "bg-blue-600" },
  { label: "Paid", value: 31, percent: 33, color: "bg-emerald-500" },
  { label: "Partially Paid", value: 14, percent: 15, color: "bg-amber-400" },
  { label: "Overdue", value: 7, percent: 7, color: "bg-rose-500" },
];

const approvalQueue = [
  {
    title: "Unbilled Invoice Approval",
    company: "ABC Foundation",
    amount: "₹ 1,80,000",
    status: "Pending",
    color: "warning",
  },
  {
    title: "Cancel Request",
    company: "Green Earth Pvt. Ltd.",
    amount: "₹ 90,000",
    status: "Urgent",
    color: "danger",
  },
  {
    title: "Payment Receipt Verification",
    company: "Helping Hands Trust",
    amount: "₹ 1,20,000",
    status: "Review",
    color: "secondary",
  },
  {
    title: "TDS Registration",
    company: "Sunrise Enterprises",
    amount: "₹ 45,000",
    status: "Pending",
    color: "warning",
  },
];

const receivableAging = [
  { label: "0-30 Days", amount: "₹ 4.25L", value: 70, color: "primary" },
  { label: "31-60 Days", amount: "₹ 3.10L", value: 52, color: "warning" },
  { label: "61-90 Days", amount: "₹ 2.20L", value: 36, color: "secondary" },
  { label: "90+ Days", amount: "₹ 3.00L", value: 48, color: "danger" },
];

const recentPayments = [
  {
    company: "ABC Foundation",
    mode: "Bank Transfer",
    amount: "₹ 1,80,000",
    date: "20 May 2025",
    status: "Received",
  },
  {
    company: "Green Earth Pvt. Ltd.",
    mode: "UPI",
    amount: "₹ 90,000",
    date: "19 May 2025",
    status: "Received",
  },
  {
    company: "Helping Hands Trust",
    mode: "Cheque",
    amount: "₹ 1,20,000",
    date: "18 May 2025",
    status: "Clearing",
  },
  {
    company: "Sunrise Enterprises",
    mode: "NEFT",
    amount: "₹ 75,000",
    date: "16 May 2025",
    status: "Received",
  },
];

const topOutstandingCompanies = [
  { company: "ABC Foundation", due: "₹ 2,40,000", days: "12 Days" },
  { company: "Green Earth Pvt. Ltd.", due: "₹ 1,85,000", days: "24 Days" },
  { company: "Helping Hands Trust", due: "₹ 1,20,000", days: "31 Days" },
  { company: "Sunrise Enterprises", due: "₹ 95,000", days: "45 Days" },
];

const accountSummary = [
  {
    title: "Unbilled Invoices",
    value: "26",
    amount: "₹ 9.80L",
    bg: "bg-blue-50",
  },
  {
    title: "Tax Invoices",
    value: "54",
    amount: "₹ 48.75L",
    bg: "bg-emerald-50",
  },
  {
    title: "Advance Payments",
    value: "12",
    amount: "₹ 5.35L",
    bg: "bg-violet-50",
  },
  {
    title: "Cancelled Invoices",
    value: "4",
    amount: "₹ 1.10L",
    bg: "bg-rose-50",
  },
];

const gstClientVendor = [
  {
    title: "GST Client / Output GST",
    subtitle: "Collected from clients",
    taxable: "₹ 42.10L",
    gstAmount: "₹ 7.58L",
    pending: "₹ 1.25L",
    filed: "84%",
    color: "primary",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "GST Vendor / Input GST",
    subtitle: "Claimable from vendor bills",
    taxable: "₹ 18.75L",
    gstAmount: "₹ 3.38L",
    pending: "₹ 82,000",
    filed: "71%",
    color: "success",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const tdsClientVendor = [
  {
    title: "TDS Client Receivable",
    subtitle: "Deducted by clients",
    amount: "₹ 2.40L",
    pendingCases: "12",
    claimed: "₹ 1.65L",
    pending: "₹ 75,000",
    color: "warning",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "TDS Vendor Payable",
    subtitle: "Deducted on vendor payments",
    amount: "₹ 1.10L",
    pendingCases: "7",
    claimed: "₹ 70,000",
    pending: "₹ 40,000",
    color: "secondary",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

const toneClass = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
};

function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-semibold leading-5 text-slate-950 sm:text-sm">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      <button className="shrink-0 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700">
        View All
      </button>
    </div>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <Card
      shadow="none"
      className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
    >
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClass[item.tone]}`}
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium leading-4 text-slate-500">
              {item.title}
            </p>

            <h2 className="mt-0.5 truncate text-[20px] font-bold leading-7 tracking-tight text-slate-950">
              {item.value}
            </h2>

            <p className="mt-0.5 truncate text-[11px] leading-4">
              <span className={`font-semibold ${item.changeColor}`}>
                {item.change}
              </span>{" "}
              <span className="text-slate-500">{item.suffix}</span>
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function DashboardToolbar() {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-bold leading-6 text-slate-950">
          Accounts Dashboard
        </h1>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          Billing, payments, GST, TDS, outstanding and approvals overview.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="bordered"
          className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium"
          startContent={<CalendarDays size={14} />}
        >
          May 2025
        </Button>

        <Button
          size="sm"
          variant="bordered"
          className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium"
          startContent={<Filter size={14} />}
        >
          Filter
        </Button>
      </div>
    </div>
  );
}

function DashboardCard({ children, className = "" }) {
  return (
    <Card
      shadow="none"
      className={`rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </Card>
  );
}

function RevenueCollectionChart() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            <h3 className="text-[13px] font-semibold leading-5 text-slate-950 sm:text-sm">
              Billing vs Collection
            </h3>
            <p className="text-[11px] leading-4 text-slate-500">
              Dec 2024 - May 2025
            </p>
          </div>

          <Button
            size="sm"
            variant="bordered"
            className="h-7 rounded-lg border-slate-200 px-2 text-[11px]"
            endContent={<ChevronDown size={13} />}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        <div className="relative h-[176px] w-full sm:h-[190px]">
          <svg viewBox="0 0 650 220" className="h-full w-full">
            {[35, 78, 121, 164].map((y) => (
              <line
                key={y}
                x1="36"
                y1={y}
                x2="630"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            <text x="0" y="39" fontSize="10" fill="#64748b">
              ₹60L
            </text>
            <text x="0" y="82" fontSize="10" fill="#64748b">
              ₹45L
            </text>
            <text x="0" y="125" fontSize="10" fill="#64748b">
              ₹30L
            </text>
            <text x="0" y="168" fontSize="10" fill="#64748b">
              ₹15L
            </text>

            <path
              d="M70 130 C120 125, 145 112, 180 100 C225 85, 245 76, 290 72 C340 68, 365 55, 410 64 C460 76, 485 88, 525 70 C565 50, 590 40, 615 36"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <path
              d="M70 155 C115 150, 145 135, 180 125 C225 115, 245 98, 290 96 C340 90, 365 82, 410 90 C460 100, 485 112, 525 95 C565 75, 590 68, 615 60"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {[70, 180, 290, 410, 525, 615].map((x, index) => {
              const billed = [130, 100, 72, 64, 70, 36][index];
              const received = [155, 125, 96, 90, 95, 60][index];

              return (
                <g key={x}>
                  <circle
                    cx={x}
                    cy={billed}
                    r="4"
                    fill="#2563eb"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x}
                    cy={received}
                    r="4"
                    fill="#22c55e"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {["Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((month, index) => (
              <text
                key={month}
                x={70 + index * 109}
                y="202"
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {month}
              </text>
            ))}
          </svg>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-slate-600">Billed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Received</span>
          </div>
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function InvoiceStatusOverview() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle title="Invoice Status Overview" subtitle="This Month" />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        <div className="flex min-h-[215px] flex-col justify-center gap-4 sm:flex-row sm:items-center">
          <div
            className="relative mx-auto h-32 w-32 shrink-0 rounded-full"
            style={{
              background:
                "conic-gradient(#2563eb 0deg 162deg, #22c55e 162deg 281deg, #facc15 281deg 335deg, #ef4444 335deg 360deg)",
            }}
          >
            <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
              <p className="text-xl font-bold leading-6 text-slate-950">94</p>
              <p className="text-[11px] text-slate-500">Invoices</p>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            {invoiceStatus.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
                  />
                  <span className="truncate text-slate-700">{item.label}</span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="font-bold text-slate-950">{item.value}</span>
                  <span className="text-slate-500">({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function ApprovalQueue() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Approval Queue"
          subtitle="Unbilled, cancellation and receipt approvals"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        <div className="space-y-2">
          {approvalQueue.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 bg-white p-2.5 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] leading-4 text-slate-500">
                    {item.company}
                  </p>
                </div>

                <Chip size="sm" color={item.color} variant="flat">
                  {item.status}
                </Chip>
              </div>

              <p className="mt-1.5 text-xs font-bold leading-5 text-slate-950">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function ReceivableAging() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Receivable Aging"
          subtitle="Outstanding by due period"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="space-y-3.5">
          {receivableAging.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-900">
                  {item.label}
                </p>
                <p className="whitespace-nowrap text-xs font-bold text-slate-950">
                  {item.amount}
                </p>
              </div>

              <Progress
                aria-label={item.label}
                value={item.value}
                color={item.color}
                size="sm"
                radius="full"
                classNames={{
                  track: "bg-slate-100",
                  indicator: "h-1.5",
                }}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function RecentPayments() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Recent Payments"
          subtitle="Latest receipts and collection status"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        <div className="space-y-2">
          {recentPayments.map((item) => (
            <div
              key={`${item.company}-${item.date}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl border border-slate-100 bg-white p-2.5 sm:grid-cols-[minmax(0,1fr)_95px_90px_auto]"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                  {item.company}
                </p>
                <p className="truncate text-[11px] leading-4 text-slate-500">
                  {item.mode}
                </p>
              </div>

              <p className="whitespace-nowrap text-xs font-bold leading-5 text-slate-950">
                {item.amount}
              </p>

              <p className="hidden whitespace-nowrap text-[11px] leading-5 text-slate-500 sm:block">
                {item.date}
              </p>

              <Chip
                size="sm"
                color={item.status === "Received" ? "success" : "warning"}
                variant="flat"
              >
                {item.status}
              </Chip>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function TopOutstandingCompanies() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Top Outstanding Companies"
          subtitle="Highest pending receivables"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        <div className="divide-y divide-slate-100">
          {topOutstandingCompanies.map((item) => (
            <div
              key={item.company}
              className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                  {item.company}
                </p>
                <p className="text-[11px] leading-4 text-rose-500">
                  Overdue: {item.days}
                </p>
              </div>

              <p className="whitespace-nowrap text-xs font-bold text-slate-950">
                {item.due}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function AccountSummary() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Account Summary"
          subtitle="Invoices and payment objects"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {accountSummary.map((item) => (
            <div
              key={item.title}
              className={`${item.bg} rounded-xl p-3 text-center ring-1 ring-slate-100`}
            >
              <p className="text-lg font-bold leading-6 text-slate-950">
                {item.value}
              </p>
              <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-500">
                {item.title}
              </p>
              <p className="mt-1.5 whitespace-nowrap text-xs font-bold text-slate-950">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function GstClientVendorSection() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="GST Client & Vendor"
          subtitle="Output GST, input GST and pending claim summary"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {gstClientVendor.map((item) => (
            <div
              key={item.title}
              className={`${item.bg} rounded-xl p-3 ring-1 ring-slate-100`}
            >
              <div className="mb-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] leading-4 text-slate-500">
                    {item.subtitle}
                  </p>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <ShieldCheck size={15} className={item.iconColor} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Taxable
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-950">
                    {item.taxable}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    GST
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-950">
                    {item.gstAmount}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Pending
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-950">
                    {item.pending}
                  </p>
                </div>
              </div>

              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Filed / Reconciled</span>
                  <span className="font-bold text-slate-950">{item.filed}</span>
                </div>
                <Progress
                  aria-label={item.title}
                  value={Number(item.filed.replace("%", ""))}
                  color={item.color}
                  size="sm"
                  radius="full"
                  classNames={{
                    track: "bg-white/70",
                    indicator: "h-1.5",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function TdsClientVendorSection() {
  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="TDS Client & Vendor"
          subtitle="TDS receivable, payable, claim and pending cases"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {tdsClientVendor.map((item) => (
            <div
              key={item.title}
              className={`${item.bg} rounded-xl p-3 ring-1 ring-slate-100`}
            >
              <div className="mb-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] leading-4 text-slate-500">
                    {item.subtitle}
                  </p>
                </div>

                <Chip size="sm" color={item.color} variant="flat">
                  {item.pendingCases} Cases
                </Chip>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Amount
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-950">
                    {item.amount}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Claimed
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-emerald-700">
                    {item.claimed}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Pending
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-rose-600">
                    {item.pending}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function CashFlowCards() {
  const data = [
    {
      title: "Collection Rate",
      value: "74.25%",
      icon: TrendingUp,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Overdue Rate",
      value: "18.50%",
      icon: TrendingDown,
      bg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      title: "Avg. Collection Days",
      value: "24 Days",
      icon: CalendarDays,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Failed / Rejected",
      value: "3",
      icon: AlertCircle,
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Cash Flow Health"
          subtitle="Collection performance"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          {data.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`${item.bg} rounded-xl p-3 ring-1 ring-slate-100`}
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon size={15} className={item.iconColor} />
                </div>

                <p className="text-base font-bold leading-6 text-slate-950">
                  {item.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

export default function AccountsDashboard() {
  return (
    <div className="h-full max-h-[calc(100vh-76px)] overflow-auto bg-slate-50 text-slate-900">
      <div className="w-full p-2.5 sm:p-3 lg:p-4">
        <DashboardToolbar />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-[1.25fr_0.85fr_0.95fr]">
          <RevenueCollectionChart />
          <InvoiceStatusOverview />
          <div className="xl:col-span-2 2xl:col-span-1">
            <ApprovalQueue />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-[0.95fr_1.1fr_0.95fr]">
          <ReceivableAging />
          <RecentPayments />
          <TopOutstandingCompanies />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <GstClientVendorSection />
          <TdsClientVendorSection />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_0.65fr]">
          <AccountSummary />
          <CashFlowCards />
        </div>
      </div>
    </div>
  );
}
