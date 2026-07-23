import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  getApprovalQueueDashboard,
  getBillingOverview,
  getBillingVsCollection,
  getInvoiceStatusOverviewDashboard,
  getAccountSummary,
  getTopOutstandingCompanies,
  getClientGSTCollected,
} from "../../toolkit/slices/dashboardSlice";
import { useParams } from "react-router-dom";

const getInvoiceStatusMeta = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "generated") {
    return {
      color: "#2563eb",
      dotClass: "bg-blue-600",
    };
  }

  if (value === "paid") {
    return {
      color: "#22c55e",
      dotClass: "bg-emerald-500",
    };
  }

  if (value === "partially paid") {
    return {
      color: "#facc15",
      dotClass: "bg-amber-400",
    };
  }

  if (value === "overdue") {
    return {
      color: "#ef4444",
      dotClass: "bg-rose-500",
    };
  }

  return {
    color: "#64748b",
    dotClass: "bg-slate-500",
  };
};

const buildInvoiceConicGradient = (statuses, totalInvoices) => {
  if (!Array.isArray(statuses) || statuses.length === 0 || !totalInvoices) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let currentDegree = 0;

  const parts = statuses
    .filter((item) => Number(item?.count || 0) > 0)
    .map((item) => {
      const meta = getInvoiceStatusMeta(item?.status);
      const percentage =
        item?.percentage !== undefined
          ? Number(item.percentage || 0)
          : (Number(item?.count || 0) / totalInvoices) * 100;

      const nextDegree = currentDegree + (percentage / 100) * 360;
      const segment = `${meta.color} ${currentDegree}deg ${nextDegree}deg`;

      currentDegree = nextDegree;
      return segment;
    });

  if (parts.length === 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  return `conic-gradient(${parts.join(", ")})`;
};

const formatAmount = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)}Cr`;
  }

  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)}L`;
  }

  if (amount >= 1000) {
    return `₹ ${(amount / 1000).toFixed(2)}K`;
  }

  return `₹ ${amount.toLocaleString("en-IN")}`;
};

const formatDateShort = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

const getApprovalChipColor = (priority) => {
  const value = String(priority || "").toUpperCase();

  if (value === "URGENT" || value === "HIGH") return "danger";
  if (value === "REVIEW") return "secondary";
  if (value === "PENDING") return "warning";

  return "default";
};

const buildLinePath = (points) => {
  if (!points.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
};

const formatPercentage = (value) => {
  const percentage = Number(value || 0);
  return Number.isInteger(percentage)
    ? percentage
    : percentage.toFixed(2).replace(/\.?0+$/, "");
};

const getSafePercentage = (amount, total) => {
  const safeAmount = Number(amount || 0);
  const safeTotal = Number(total || 0);

  if (safeTotal <= 0) return 0;

  return Math.min(100, Math.max(0, (safeAmount / safeTotal) * 100));
};

const getGrowthMeta = (item) => {
  const direction = String(item?.growthDirection || "").toUpperCase();
  const isDown = direction.includes("DOWN");
  const isBad = direction.includes("BAD");

  return {
    arrow: isDown ? "↓" : "↑",
    color: isBad ? "text-rose-600" : "text-emerald-600",
  };
};

const getLoggedInUserId = () => {
  try {
    const possibleKeys = ["user", "authUser", "loggedInUser", "userInfo"];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      const id =
        parsed?.id ||
        parsed?.userId ||
        parsed?.payload?.id ||
        parsed?.data?.id ||
        parsed?.user?.id;

      if (id) return id;
    }
  } catch (error) {
    return null;
  }

  return null;
};

const buildBillingStats = (billingOverview, approvalQueueData) => {
  const totalBilled = billingOverview?.totalBilled || {};
  const paymentReceived = billingOverview?.paymentReceived || {};
  const outstanding = billingOverview?.outstanding || {};
  const pendingApprovals = billingOverview?.pendingApprovals || {};

  const totalBilledGrowth = getGrowthMeta(totalBilled);
  const paymentReceivedGrowth = getGrowthMeta(paymentReceived);
  const outstandingGrowth = getGrowthMeta(outstanding);

  const approvalItems = approvalQueueData?.items || [];

  const pendingApprovalCount =
    approvalQueueData?.totalPendingApprovals ?? pendingApprovals.count ?? 0;

  const urgentCount =
    approvalQueueData?.urgentCount ?? pendingApprovals.urgentTodayCount ?? 0;

  const tdsItems = approvalItems.filter(
    (item) => item?.itemType === "TDS_REGISTRATION",
  );

  const tdsPendingAmount = tdsItems.reduce(
    (sum, item) => sum + Number(item?.amount || 0),
    0,
  );

  return [
    {
      title: "Total Billed",
      value: formatAmount(totalBilled.value),
      icon: ReceiptIndianRupee,
      tone: "blue",
      change: `${totalBilledGrowth.arrow} ${formatPercentage(
        totalBilled.growthPercentage,
      )}%`,
      changeColor: totalBilledGrowth.color,
      suffix: totalBilled.comparisonLabel || "vs last month",
    },
    {
      title: "Payment Received",
      value: formatAmount(paymentReceived.value),
      icon: Banknote,
      tone: "emerald",
      change: `${paymentReceivedGrowth.arrow} ${formatPercentage(
        paymentReceived.growthPercentage,
      )}%`,
      changeColor: paymentReceivedGrowth.color,
      suffix: paymentReceived.comparisonLabel || "vs last month",
    },
    {
      title: "Outstanding",
      value: formatAmount(outstanding.value),
      icon: WalletCards,
      tone: "amber",
      change: `${outstandingGrowth.arrow} ${formatPercentage(
        outstanding.growthPercentage,
      )}%`,
      changeColor: outstandingGrowth.color,
      suffix: outstanding.comparisonLabel || "vs last month",
    },
    {
      title: "Pending Approvals",
      value: String(pendingApprovalCount),
      icon: Clock3,
      tone: "violet",
      change: `${urgentCount} urgent`,
      changeColor: "text-orange-600",
      suffix: "today",
    },
    {
      title: "TDS Pending",
      value: formatAmount(tdsPendingAmount),
      icon: FileCheck2,
      tone: "rose",
      change: `${tdsItems.length} cases`,
      changeColor: "text-rose-600",
      suffix: "pending",
    },
  ];
};

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

      {/* <button className="shrink-0 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700">
        View All
      </button> */}
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

function DashboardToolbar({
  period,
  fromDate,
  toDate,
  onPeriodChange,
  onFromDateChange,
  onToDateChange,
  onRefresh,
  loading,
}) {
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
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium outline-none"
        >
          <option value="TODAY">TODAY</option>
          <option value="WEEK">WEEK</option>
          <option value="MONTH">MONTH</option>
          <option value="YEAR">YEAR</option>
          <option value="CUSTOM">CUSTOM</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium outline-none"
        />

        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => onToDateChange(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium outline-none"
        />

        <Button
          size="sm"
          variant="bordered"
          isLoading={loading}
          className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium"
          startContent={!loading && <Filter size={14} />}
          onPress={onRefresh}
        >
          Apply
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

function RevenueCollectionChart({ data, loading }) {
  const points = Array.isArray(data?.points) ? data.points : [];

  const chartData = useMemo(() => {
    const safePoints = points.length
      ? points
      : [
          {
            label: "",
            billed: 0,
            collected: 0,
          },
        ];

    const maxValue = Math.max(
      1,
      ...safePoints.map((item) =>
        Math.max(Number(item?.billed || 0), Number(item?.collected || 0)),
      ),
    );

    const roundedMax = Math.ceil(maxValue / 1000) * 1000;

    const left = 48;
    const right = 625;
    const top = 30;
    const bottom = 178;
    const height = bottom - top;
    const width = right - left;

    const xForIndex = (index) => {
      if (safePoints.length === 1) return left + width / 2;
      return left + (index * width) / (safePoints.length - 1);
    };

    const yForValue = (value) => {
      return bottom - (Number(value || 0) / roundedMax) * height;
    };

    const billedPoints = safePoints.map((item, index) => ({
      x: xForIndex(index),
      y: yForValue(item?.billed),
      value: Number(item?.billed || 0),
    }));

    const collectedPoints = safePoints.map((item, index) => ({
      x: xForIndex(index),
      y: yForValue(item?.collected),
      value: Number(item?.collected || 0),
    }));

    const ticks = [
      roundedMax,
      roundedMax * 0.75,
      roundedMax * 0.5,
      roundedMax * 0.25,
    ];

    return {
      safePoints,
      billedPoints,
      collectedPoints,
      billedPath: buildLinePath(billedPoints),
      collectedPath: buildLinePath(collectedPoints),
      ticks: ticks.map((value) => ({
        value,
        y: yForValue(value),
      })),
    };
  }, [points]);

  const subtitle =
    data?.fromDate && data?.toDate
      ? `${formatDateShort(data.fromDate)} - ${formatDateShort(data.toDate)}`
      : "Last 6 months";

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            <h3 className="text-[13px] font-semibold leading-5 text-slate-950 sm:text-sm">
              Billing vs Collection
            </h3>
            <p className="text-[11px] leading-4 text-slate-500">
              {loading ? "Loading..." : subtitle}
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
            {chartData.ticks.map((tick) => (
              <g key={tick.value}>
                <line
                  x1="48"
                  y1={tick.y}
                  x2="625"
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text x="0" y={tick.y + 4} fontSize="10" fill="#64748b">
                  {formatAmount(tick.value)}
                </text>
              </g>
            ))}

            <path
              d={chartData.billedPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={chartData.collectedPath}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chartData.billedPoints.map((point, index) => (
              <g key={`point-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#2563eb"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <circle
                  cx={chartData.collectedPoints[index].x}
                  cy={chartData.collectedPoints[index].y}
                  r="4"
                  fill="#22c55e"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </g>
            ))}

            {chartData.safePoints.map((item, index) => (
              <text
                key={`${item?.label}-${index}`}
                x={chartData.billedPoints[index].x}
                y="202"
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {item?.label || "-"}
              </text>
            ))}
          </svg>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-slate-600">
              Billed: {formatAmount(data?.totalBilled || 0)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">
              Received: {formatAmount(data?.totalCollected || 0)}
            </span>
          </div>
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function InvoiceStatusOverview({ data, loading }) {
  const statuses = Array.isArray(data?.statuses) ? data.statuses : [];

  const totalInvoices =
    Number(data?.totalInvoices || 0) ||
    statuses.reduce((sum, item) => sum + Number(item?.count || 0), 0);

  const conicGradient = useMemo(
    () => buildInvoiceConicGradient(statuses, totalInvoices),
    [statuses, totalInvoices],
  );

  const subtitle =
    data?.fromDate && data?.toDate
      ? `${data.fromDate} - ${data.toDate}`
      : "This Month";

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Invoice Status Overview"
          subtitle={loading ? "Loading..." : subtitle}
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        {loading ? (
          <div className="flex min-h-[215px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
            Loading invoice status...
          </div>
        ) : (
          <div className="flex min-h-[215px] flex-col justify-center gap-4 sm:flex-row sm:items-center">
            <div
              className="relative mx-auto h-32 w-32 shrink-0 rounded-full"
              style={{
                background: conicGradient,
              }}
            >
              <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                <p className="text-xl font-bold leading-6 text-slate-950">
                  {totalInvoices}
                </p>
                <p className="text-[11px] text-slate-500">Invoices</p>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {statuses.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500">
                  No invoice status data found.
                </div>
              ) : (
                statuses.map((item) => {
                  const meta = getInvoiceStatusMeta(item?.status);

                  return (
                    <div
                      key={item?.status}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`}
                        />
                        <span className="truncate text-slate-700">
                          {item?.status || "-"}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="font-bold text-slate-950">
                          {item?.count || 0}
                        </span>
                        <span className="text-slate-500">
                          ({formatPercentage(item?.percentage)}%)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </CardBody>
    </DashboardCard>
  );
}

function ApprovalQueue({ data, loading }) {
  const items = Array.isArray(data?.items) ? data.items : [];

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Approval Queue"
          subtitle={`${data?.totalPendingApprovals || 0} pending, ${
            data?.urgentCount || 0
          } urgent`}
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-2">
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500">
            Loading approval queue...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500">
            No pending approvals found.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item?.itemType}-${item?.itemId}`}
                className="rounded-xl border border-slate-100 bg-white p-2.5 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                      {item?.title || "-"}
                    </p>
                    <p className="truncate text-[11px] leading-4 text-slate-500">
                      {item?.companyName || item?.subTitle || "-"}
                    </p>
                  </div>

                  <Chip
                    size="sm"
                    color={getApprovalChipColor(item?.priority)}
                    variant="flat"
                  >
                    {item?.badge || item?.sourceStatus || "Pending"}
                  </Chip>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] leading-4 text-slate-500">
                    {item?.referenceNumber || "-"}
                  </p>

                  <p className="whitespace-nowrap text-xs font-bold leading-5 text-slate-950">
                    {formatAmount(item?.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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

function TopOutstandingCompanies({ data }) {
  const companies = Array.isArray(data?.topOutstandingCompanies)
    ? data.topOutstandingCompanies
    : [];

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
          {companies.map((item) => (
            <div
              key={item?.companyId}
              className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                  {item?.companyName || "-"}
                </p>

                <p className="text-[11px] leading-4 text-rose-500">
                  Overdue: {item?.overdueDays || 0} Days
                </p>
              </div>

              <p className="whitespace-nowrap text-xs font-bold text-slate-950">
                {formatAmount(item?.outstandingAmount)}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function AccountSummary({ data }) {
  const summaryCards = Array.isArray(data?.summaryCards)
    ? data.summaryCards
    : [];

  const backgrounds = [
    "bg-blue-50",
    "bg-emerald-50",
    "bg-violet-50",
    "bg-rose-50",
  ];

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="Account Summary"
          subtitle="Invoices and payment objects"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-2">
          {summaryCards.map((item, index) => (
            <div
              key={item?.title || index}
              className={`${
                backgrounds[index % backgrounds.length]
              } rounded-xl p-3 text-center ring-1 ring-slate-100`}
            >
              <p className="text-lg font-bold leading-6 text-slate-950">
                {item?.count || 0}
              </p>

              <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-500">
                {item?.title || "-"}
              </p>

              <p className="mt-1.5 whitespace-nowrap text-xs font-bold text-slate-950">
                {formatAmount(item?.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function GstClientVendorSection({ data }) {
  const taxableAmount = Number(data?.taxableAmount || 0);
  const gstAmount = Number(data?.gstAmount || 0);
  const pendingAmount = Number(data?.pendingAmount || 0);
  const filedAmount = Number(data?.filedAmount || 0);
  const reconciledAmount = Number(data?.reconciledAmount || 0);

  const filedPercentage = getSafePercentage(filedAmount, gstAmount);
  const reconciledPercentage = getSafePercentage(reconciledAmount, gstAmount);

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="GST Client / Output GST"
          subtitle="GST collected, filed and reconciled from client invoices"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-slate-100">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-5 text-slate-950">
                GST Client / Output GST
              </p>

              <p className="truncate text-[11px] leading-4 text-slate-500">
                Collected from clients
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <ShieldCheck size={15} className="text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Taxable
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-950">
                {formatAmount(taxableAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                GST
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-950">
                {formatAmount(gstAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Pending
              </p>
              <p className="mt-0.5 text-xs font-bold text-rose-600">
                {formatAmount(pendingAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Filed
              </p>
              <p className="mt-0.5 text-xs font-bold text-emerald-700">
                {formatAmount(filedAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Reconciled
              </p>
              <p className="mt-0.5 text-xs font-bold text-violet-700">
                {formatAmount(reconciledAmount)}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Filed</span>
                <span className="font-bold text-slate-950">
                  {formatPercentage(filedPercentage)}%
                </span>
              </div>

              <Progress
                aria-label="GST filed percentage"
                value={filedPercentage}
                color="primary"
                size="sm"
                radius="full"
                classNames={{
                  track: "bg-white/70",
                  indicator: "h-1.5",
                }}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Reconciled</span>
                <span className="font-bold text-slate-950">
                  {formatPercentage(reconciledPercentage)}%
                </span>
              </div>

              <Progress
                aria-label="GST reconciled percentage"
                value={reconciledPercentage}
                color="secondary"
                size="sm"
                radius="full"
                classNames={{
                  track: "bg-white/70",
                  indicator: "h-1.5",
                }}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </DashboardCard>
  );
}

function TdsClientVendorSection({ data }) {
  const totalTdsAmount = Number(data?.totalTdsAmount || 0);
  const pendingAmount = Number(data?.pendingAmount || 0);
  const claimedAmount = Number(data?.claimedAmount || 0);

  const totalCount = Number(data?.totalCount || 0);
  const pendingCount = Number(data?.pendingCount || 0);
  const claimedCount = Number(data?.claimedCount || 0);

  const claimedPercentage = getSafePercentage(claimedAmount, totalTdsAmount);

  const pendingPercentage = getSafePercentage(pendingAmount, totalTdsAmount);

  return (
    <DashboardCard>
      <CardHeader className="px-3 pb-0 pt-3">
        <SectionTitle
          title="TDS Collection Summary"
          subtitle="Claimed vs Pending TDS"
        />
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        <div className="rounded-xl bg-violet-50 p-3 ring-1 ring-slate-100">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-950">Total TDS</p>
              <p className="text-[11px] text-slate-500">
                {totalCount} Registrations
              </p>
            </div>

            <Chip color="secondary" variant="flat">
              {totalCount} Cases
            </Chip>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-950">
                {formatAmount(totalTdsAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Claimed
              </p>
              <p className="mt-0.5 text-xs font-bold text-emerald-700">
                {formatAmount(claimedAmount)}
              </p>
              <p className="text-[10px] text-slate-500">{claimedCount} Cases</p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Pending
              </p>
              <p className="mt-0.5 text-xs font-bold text-rose-600">
                {formatAmount(pendingAmount)}
              </p>
              <p className="text-[10px] text-slate-500">{pendingCount} Cases</p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Success Rate
              </p>
              <p className="mt-0.5 text-xs font-bold text-violet-700">
                {formatPercentage(getSafePercentage(claimedCount, totalCount))}%
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Claimed</span>
                <span className="font-bold text-slate-950">
                  {formatPercentage(claimedPercentage)}%
                </span>
              </div>

              <Progress
                value={claimedPercentage}
                color="success"
                size="sm"
                radius="full"
                classNames={{
                  track: "bg-white/70",
                  indicator: "h-1.5",
                }}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Pending</span>
                <span className="font-bold text-slate-950">
                  {formatPercentage(pendingPercentage)}%
                </span>
              </div>

              <Progress
                value={pendingPercentage}
                color="danger"
                size="sm"
                radius="full"
                classNames={{
                  track: "bg-white/70",
                  indicator: "h-1.5",
                }}
              />
            </div>
          </div>
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
  const dispatch = useDispatch();
  const params = useParams();

  const {
    billingOverview,
    billingOverviewLoading,
    billingOverviewError,

    billingVsCollection,
    billingVsCollectionLoading,
    billingVsCollectionError,

    approvalQueueData,
    approvalQueueLoading,
    approvalQueueError,
    invoiceStatusOverviewData,
    invoiceStatusOverviewLoading,
    invoiceStatusOverviewError,

    accountSummary,
    topOutstandingCompanies,
    clientGST,
    tdsCollectionSummary,
  } = useSelector((state) => state.dashboard);

  const [period, setPeriod] = useState("MONTH");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const userId = useMemo(() => {
    return Number(params?.userId || params?.id || getLoggedInUserId());
  }, [params?.userId, params?.id]);

  const loadDashboardData = useCallback(() => {
    if (!userId) return;

    const commonPayload = {
      userId,
      period,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    };

    dispatch(getBillingOverview(commonPayload));

    dispatch(
      getBillingVsCollection({
        userId,
        months: 6,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    );

    dispatch(
      getApprovalQueueDashboard({
        ...commonPayload,
        limit: 4,
      }),
    );

    dispatch(getInvoiceStatusOverviewDashboard(commonPayload));

    dispatch(
      getAccountSummary({
        userId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    );

    dispatch(
      getTopOutstandingCompanies({
        userId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        limit: 4,
      }),
    );

    const today = new Date();

    const defaultToDate = today.toISOString().split("T")[0];

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const defaultFromDate = firstDayOfMonth.toISOString().split("T")[0];

    dispatch(
      getClientGSTCollected({
        userId,
        fromDate: fromDate || defaultFromDate,
        toDate: toDate || defaultToDate,
      }),
    );

    // dispatch(getTDSCollectionSummary());
  }, [dispatch, userId, period, fromDate, toDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const billingStats = useMemo(
    () => buildBillingStats(billingOverview, approvalQueueData),
    [billingOverview, approvalQueueData],
  );

  return (
    <div className="h-full max-h-[calc(100vh-76px)] overflow-auto bg-slate-50 text-slate-900">
      <div className="w-full p-2.5 sm:p-3 lg:p-4">
        <DashboardToolbar
          period={period}
          fromDate={fromDate}
          toDate={toDate}
          loading={
            billingOverviewLoading ||
            billingVsCollectionLoading ||
            approvalQueueLoading ||
            invoiceStatusOverviewLoading
          }
          onPeriodChange={setPeriod}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onRefresh={loadDashboardData}
        />

        {(billingOverviewError ||
          billingVsCollectionError ||
          approvalQueueError ||
          invoiceStatusOverviewError) && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {billingOverviewError ||
              billingVsCollectionError ||
              approvalQueueError ||
              invoiceStatusOverviewError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {billingStats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          <RevenueCollectionChart
            data={billingVsCollection}
            loading={billingVsCollectionLoading}
          />
          <InvoiceStatusOverview
            data={invoiceStatusOverviewData}
            loading={invoiceStatusOverviewLoading}
          />
          <ApprovalQueue
            data={approvalQueueData}
            loading={approvalQueueLoading}
          />
          <ReceivableAging />
          <RecentPayments />
          <TopOutstandingCompanies data={topOutstandingCompanies} />
          <GstClientVendorSection data={clientGST} />
          <TdsClientVendorSection data={tdsCollectionSummary} />
          <AccountSummary data={accountSummary} />
          <CashFlowCards />
        </div>
      </div>
    </div>
  );
}
