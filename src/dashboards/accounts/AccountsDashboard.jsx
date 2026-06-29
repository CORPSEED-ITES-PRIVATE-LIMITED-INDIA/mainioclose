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
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  Filter,
  IndianRupee,
  ReceiptIndianRupee,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const stats = [
  {
    title: "Total Billed",
    value: "₹ 48.75L",
    icon: ReceiptIndianRupee,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    change: "↑ 14%",
    changeColor: "text-green-600",
    suffix: "vs last month",
  },
  {
    title: "Payment Received",
    value: "₹ 36.20L",
    icon: Banknote,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    change: "↑ 18%",
    changeColor: "text-green-600",
    suffix: "vs last month",
  },
  {
    title: "Outstanding",
    value: "₹ 12.55L",
    icon: WalletCards,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    change: "↓ 8%",
    changeColor: "text-red-600",
    suffix: "vs last month",
  },
  {
    title: "Pending Approvals",
    value: "18",
    icon: Clock3,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    change: "6 urgent",
    changeColor: "text-orange-600",
    suffix: "today",
  },
  {
    title: "TDS Pending",
    value: "₹ 2.40L",
    icon: FileCheck2,
    bg: "bg-red-50",
    iconColor: "text-red-600",
    change: "12 cases",
    changeColor: "text-red-600",
    suffix: "pending",
  },
];

const invoiceStatus = [
  { label: "Generated", value: 42, percent: 45, color: "bg-blue-600" },
  { label: "Paid", value: 31, percent: 33, color: "bg-green-500" },
  { label: "Partially Paid", value: 14, percent: 15, color: "bg-yellow-400" },
  { label: "Overdue", value: 7, percent: 7, color: "bg-red-500" },
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
  { title: "Tax Invoices", value: "54", amount: "₹ 48.75L", bg: "bg-green-50" },
  {
    title: "Advance Payments",
    value: "12",
    amount: "₹ 5.35L",
    bg: "bg-purple-50",
  },
  {
    title: "Cancelled Invoices",
    value: "4",
    amount: "₹ 1.10L",
    bg: "bg-red-50",
  },
];

function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-950 lg:text-[15px]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-slate-500 lg:text-xs">
            {subtitle}
          </p>
        )}
      </div>

      <button className="shrink-0 text-[11px] font-medium text-blue-600 hover:text-blue-700 lg:text-xs">
        View All
      </button>
    </div>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardBody className="p-4 lg:p-5">
        <div className="flex items-center gap-3 lg:gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full lg:h-14 lg:w-14 ${item.bg}`}
          >
            <Icon size={24} className={item.iconColor} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-600 lg:text-sm">
              {item.title}
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-slate-950 lg:text-2xl">
              {item.value}
            </h2>

            <p className="mt-1 text-[11px] lg:text-xs">
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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-bold text-slate-950 lg:text-xl">
          Accounts Dashboard
        </h1>
        <p className="text-xs text-slate-500 lg:text-sm">
          Billing, payments, outstanding, approvals and TDS overview.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="bordered"
          className="rounded-xl border-slate-200 text-xs"
          startContent={<CalendarDays size={15} />}
        >
          May 2025
        </Button>

        <Button
          size="sm"
          variant="bordered"
          className="rounded-xl border-slate-200 text-xs"
          startContent={<Filter size={15} />}
        >
          Filter
        </Button>
      </div>
    </div>
  );
}

function RevenueCollectionChart() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950 lg:text-[15px]">
              Billing vs Collection
            </h3>
            <p className="text-[11px] text-slate-500 lg:text-xs">
              Dec 2024 - May 2025
            </p>
          </div>

          <Button
            size="sm"
            variant="bordered"
            className="h-8 rounded-lg border-slate-200 text-xs"
            endContent={<ChevronDown size={14} />}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="relative h-[240px] w-full">
          <svg viewBox="0 0 650 240" className="h-full w-full">
            {[35, 80, 125, 170].map((y) => (
              <line
                key={y}
                x1="35"
                y1={y}
                x2="630"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            <text x="0" y="38" fontSize="11" fill="#475569">
              ₹60L
            </text>
            <text x="0" y="83" fontSize="11" fill="#475569">
              ₹45L
            </text>
            <text x="0" y="128" fontSize="11" fill="#475569">
              ₹30L
            </text>
            <text x="0" y="173" fontSize="11" fill="#475569">
              ₹15L
            </text>

            <path
              d="M70 130 C120 125, 145 112, 180 100 C225 85, 245 76, 290 72 C340 68, 365 55, 410 64 C460 76, 485 88, 525 70 C565 50, 590 40, 615 36"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d="M70 155 C115 150, 145 135, 180 125 C225 115, 245 98, 290 96 C340 90, 365 82, 410 90 C460 100, 485 112, 525 95 C565 75, 590 68, 615 60"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
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
                    r="5"
                    fill="#2563eb"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x}
                    cy={received}
                    r="5"
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
                y="215"
                fontSize="11"
                fill="#475569"
                textAnchor="middle"
              >
                {month}
              </text>
            ))}
          </svg>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600">Billed</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-slate-600">Received</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function InvoiceStatusOverview() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle title="Invoice Status Overview" subtitle="This Month" />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="flex min-h-[240px] flex-col justify-center gap-5 sm:flex-row sm:items-center">
          <div
            className="relative mx-auto h-36 w-36 shrink-0 rounded-full lg:h-40 lg:w-40"
            style={{
              background:
                "conic-gradient(#2563eb 0deg 162deg, #22c55e 162deg 281deg, #facc15 281deg 335deg, #ef4444 335deg 360deg)",
            }}
          >
            <div className="absolute inset-6 rounded-full bg-white flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-slate-950 lg:text-2xl">94</p>
              <p className="text-[11px] text-slate-500 lg:text-xs">Invoices</p>
            </div>
          </div>

          <div className="w-full space-y-3">
            {invoiceStatus.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 text-xs lg:text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
                  />
                  <span className="truncate text-slate-700">{item.label}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-bold text-slate-950">{item.value}</span>
                  <span className="text-slate-500">({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ApprovalQueue() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle
          title="Approval Queue"
          subtitle="Unbilled, cancellation and receipt approvals"
        />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="space-y-2">
          {approvalQueue.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-950 lg:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-500 lg:text-xs">
                    {item.company}
                  </p>
                </div>

                <Chip size="sm" color={item.color} variant="flat">
                  {item.status}
                </Chip>
              </div>

              <p className="mt-2 text-xs font-bold text-slate-950 lg:text-sm">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function ReceivableAging() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle
          title="Receivable Aging"
          subtitle="Outstanding by due period"
        />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="space-y-5">
          {receivableAging.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-900 lg:text-sm">
                  {item.label}
                </p>
                <p className="whitespace-nowrap text-xs font-bold text-slate-950 lg:text-sm">
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
                }}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function RecentPayments() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle
          title="Recent Payments"
          subtitle="Latest receipts and collection status"
        />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="space-y-2">
          {recentPayments.map((item) => (
            <div
              key={`${item.company}-${item.date}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[minmax(0,1fr)_110px_100px_auto]"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-950 lg:text-sm">
                  {item.company}
                </p>
                <p className="truncate text-[11px] text-slate-500 lg:text-xs">
                  {item.mode}
                </p>
              </div>

              <p className="whitespace-nowrap text-xs font-bold text-slate-950 lg:text-sm">
                {item.amount}
              </p>

              <p className="hidden whitespace-nowrap text-[11px] text-slate-500 sm:block lg:text-xs">
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
    </Card>
  );
}

function TopOutstandingCompanies() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle
          title="Top Outstanding Companies"
          subtitle="Highest pending receivables"
        />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="space-y-2">
          {topOutstandingCompanies.map((item) => (
            <div
              key={item.company}
              className="flex items-center justify-between gap-3 rounded-xl py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-950 lg:text-sm">
                  {item.company}
                </p>
                <p className="text-[11px] text-red-500 lg:text-xs">
                  Overdue: {item.days}
                </p>
              </div>

              <p className="whitespace-nowrap text-xs font-bold text-slate-950 lg:text-sm">
                {item.due}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function AccountSummary() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle
          title="Account Summary"
          subtitle="Invoices and payment objects"
        />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {accountSummary.map((item) => (
            <div
              key={item.title}
              className={`${item.bg} rounded-xl p-4 text-center`}
            >
              <p className="text-lg font-bold text-slate-950 lg:text-xl">
                {item.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 lg:text-xs">
                {item.title}
              </p>
              <p className="mt-2 whitespace-nowrap text-xs font-bold text-slate-950 lg:text-sm">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function CashFlowCards() {
  const data = [
    {
      title: "Collection Rate",
      value: "74.25%",
      icon: TrendingUp,
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Overdue Rate",
      value: "18.50%",
      icon: TrendingDown,
      bg: "bg-red-50",
      iconColor: "text-red-600",
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
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 lg:px-5">
        <SectionTitle
          title="Cash Flow Health"
          subtitle="Collection performance"
        />
      </CardHeader>

      <CardBody className="px-4 pb-4 lg:px-5">
        <div className="grid grid-cols-2 gap-3">
          {data.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className={`${item.bg} rounded-xl p-4`}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <Icon size={17} className={item.iconColor} />
                </div>

                <p className="text-base font-bold text-slate-950 lg:text-lg">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 lg:text-xs">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

export default function AccountsDashboard() {
  return (
    <div className="overflow-x-hidden bg-slate-50 text-slate-900 max-h-[85vh] overflow-auto">
      <div className="w-full p-3 sm:p-4 lg:p-5 xl:p-6">
        <DashboardToolbar />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-[1.35fr_0.9fr_1fr]">
          <RevenueCollectionChart />
          <InvoiceStatusOverview />
          <div className="xl:col-span-2 2xl:col-span-1">
            <ApprovalQueue />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-[1fr_1.15fr_1fr]">
          <ReceivableAging />
          <RecentPayments />
          <TopOutstandingCompanies />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <AccountSummary />
          <CashFlowCards />
        </div>
      </div>
    </div>
  );
}
