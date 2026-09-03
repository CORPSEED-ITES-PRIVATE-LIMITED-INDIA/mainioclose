import React, { useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  FileWarning,
  Handshake,
  Receipt,
  Scale,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  getLegalSummary,
  getVendorQuotationLegalSummary,
  getCompanyLegalSummary,
  getPaymentLegalSummary,
  getPendingQueue,
} from "../../toolkit/slices/dashboardSlice.js";

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatDateTime(isoDate) {
  if (!isoDate) return "-";

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="min-w-0">
      <h3 className="truncate text-[13px] font-semibold text-slate-950">
        {title}
      </h3>

      {subtitle && (
        <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

const summaryCardConfig = {
  project: {
    title: "Project Legal Requests",
    icon: FileWarning,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    barColor: "#2563eb",
  },

  vendor: {
    title: "Vendor Agreement Requests",
    icon: Handshake,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    barColor: "#9333ea",
  },

  company: {
    title: "Company Verification",
    icon: Building2,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    barColor: "#d97706",
  },

  payment: {
    title: "PO / Payment Verification",
    icon: Receipt,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    barColor: "#16a34a",
  },
};

function SummaryCard({ type, value, loading }) {
  const config = summaryCardConfig[type];

  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardBody className="p-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}
          >
            <Icon size={18} className={config.iconColor} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-600">
              {config.title}
            </p>

            {loading ? (
              <div className="mt-1 h-5 w-10 animate-pulse rounded bg-slate-200" />
            ) : (
              <h2 className="mt-0.5 truncate text-lg font-bold leading-5 text-slate-950">
                {value}
              </h2>
            )}

            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              pending review
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================
// Bar chart — pending load per legal area
// ============================================================

function PendingByAreaChart({ summary, loading }) {
  const data = useMemo(
    () => [
      {
        name: "Project",
        value: toFiniteNumber(summary?.project),
        color: summaryCardConfig.project.barColor,
      },
      {
        name: "Vendor",
        value: toFiniteNumber(summary?.vendor),
        color: summaryCardConfig.vendor.barColor,
      },
      {
        name: "Company",
        value: toFiniteNumber(summary?.company),
        color: summaryCardConfig.company.barColor,
      },
      {
        name: "Payment",
        value: toFiniteNumber(summary?.payment),
        color: summaryCardConfig.payment.barColor,
      },
    ],
    [summary],
  );

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pb-0 pt-2.5">
        <SectionTitle
          title="Pending Load by Area"
          subtitle="Open requests waiting on Legal, by workflow"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    borderColor: "#e2e8f0",
                  }}
                />

                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================
// Pie chart — overall status mix across every legal workflow
// ============================================================

const STATUS_GROUP_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Resolved: "#22c55e",
};

function StatusMixChart({ statusMix = [], loading }) {
  const safeStatusMix = Array.isArray(statusMix) ? statusMix : [];

  const total = safeStatusMix.reduce(
    (sum, item) => sum + toFiniteNumber(item?.value),
    0,
  );

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pb-0 pt-2.5">
        <SectionTitle
          title="Overall Status Mix"
          subtitle="Every legal request, grouped by resolution stage"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-lg bg-slate-100" />
        ) : total === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-slate-500">
            No data to display
          </div>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeStatusMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {safeStatusMix.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_GROUP_COLORS[entry.name] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    borderColor: "#e2e8f0",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================
// Pending legal queue
// ============================================================

const queueTypeConfig = {
  PROJECT: {
    label: "Project Legal",
    dot: "bg-blue-500",
  },

  VENDOR: {
    label: "Vendor Agreement",
    dot: "bg-purple-500",
  },

  COMPANY: {
    label: "Company Verification",
    dot: "bg-amber-500",
  },

  PAYMENT: {
    label: "PO Verification",
    dot: "bg-green-500",
  },
};

const DEFAULT_QUEUE_TYPE_CONFIG = {
  label: "Legal Review",
  dot: "bg-slate-400",
};

function PendingLegalQueue({ items = [], loading = false }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pb-0 pt-2.5">
        <SectionTitle
          title="Pending Legal Queue"
          subtitle="Open items awaiting review across all legal workflows"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="h-[360px] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            [1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-100 px-3 py-2"
              >
                <div className="h-3 w-40 rounded bg-slate-200" />
                <div className="mt-2 h-2.5 w-56 rounded bg-slate-100" />
              </div>
            ))
          ) : !safeItems.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
              <p className="text-xs font-semibold text-slate-700">
                Nothing pending
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                All legal requests across every workflow are resolved.
              </p>
            </div>
          ) : (
            safeItems.map((item, index) => {
              const normalizedType = String(item?.type ?? "")
                .trim()
                .toUpperCase();

              const typeCfg =
                queueTypeConfig[normalizedType] ?? DEFAULT_QUEUE_TYPE_CONFIG;

              const itemId = item?.id ?? item?._id ?? item?.requestId ?? index;

              const title =
                item?.title ?? item?.name ?? item?.subject ?? "Legal request";

              const subtitle =
                item?.subtitle ?? item?.description ?? item?.details ?? "-";

              const date =
                item?.date ??
                item?.createdAt ??
                item?.created_at ??
                item?.updatedAt;

              return (
                <div
                  key={`${normalizedType || "LEGAL"}-${itemId}-${index}`}
                  className="rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1 block h-2 w-2 shrink-0 rounded-full ${typeCfg.dot}`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {title}
                        </p>

                        <span className="shrink-0 text-[10px] font-medium text-slate-500">
                          {typeCfg.label}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-[11px] text-slate-600">
                        {subtitle}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {formatDateTime(date)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================
// Status grouping
// ============================================================

const PENDING_STATUSES = new Set([
  "INITIATED",
  "PENDING",
  "SERVICE_AGREEMENT_REQUESTED",
]);

const IN_PROGRESS_STATUSES = new Set([
  "NEED_MORE_INFO",
  "AGREEMENT_SENT_TO_PROCUREMENT",
]);

function buildStatusMix(statusCountsByArea = {}) {
  const buckets = {
    Pending: 0,
    "In Progress": 0,
    Resolved: 0,
  };

  if (!statusCountsByArea || typeof statusCountsByArea !== "object") {
    return [];
  }

  Object.values(statusCountsByArea).forEach((rows) => {
    if (!Array.isArray(rows)) {
      return;
    }

    rows.forEach((row) => {
      if (!row || typeof row !== "object") {
        return;
      }

      const status = String(row.status ?? "")
        .trim()
        .toUpperCase();

      const value = toFiniteNumber(row.count);

      if (PENDING_STATUSES.has(status)) {
        buckets.Pending += value;
      } else if (IN_PROGRESS_STATUSES.has(status)) {
        buckets["In Progress"] += value;
      } else if (status) {
        buckets.Resolved += value;
      }
    });
  });

  return Object.entries(buckets)
    .map(([name, value]) => ({
      name,
      value: toFiniteNumber(value),
    }))
    .filter((entry) => entry.value > 0);
}

// ============================================================
// Main dashboard
// ============================================================

export default function LegalDashboard() {
  const dispatch = useDispatch();
  const routeParams = useParams();

  const rawUserId = routeParams.userId ?? routeParams.id;

  const parsedUserId = Number(rawUserId);

  const userId =
    rawUserId && Number.isFinite(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : null;

  const {
    legalSummary = null,
    vendorQuotationLegalSummary = null,
    companyLegalSummary = null,
    paymentLegalSummary = null,
    pendingQueue = [],
    loading = false,
  } = useSelector((state) => state.dashboard || {});

  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(getLegalSummary({ userId }));
    dispatch(getVendorQuotationLegalSummary({ userId }));
    dispatch(getCompanyLegalSummary({ userId }));
    dispatch(getPaymentLegalSummary({ userId }));
    dispatch(getPendingQueue({ userId }));
  }, [dispatch, userId]);

  // ============================================================
  // Summary
  // ============================================================

  const summary = useMemo(
    () => ({
      project: toFiniteNumber(legalSummary?.totalPending),

      vendor: toFiniteNumber(vendorQuotationLegalSummary?.totalPending),

      company: toFiniteNumber(companyLegalSummary?.totalPending),

      payment: toFiniteNumber(paymentLegalSummary?.totalPending),
    }),
    [
      legalSummary,
      vendorQuotationLegalSummary,
      companyLegalSummary,
      paymentLegalSummary,
    ],
  );

  // ============================================================
  // Status counts
  // ============================================================

  const statusCounts = useMemo(
    () => ({
      project: Array.isArray(legalSummary?.statusCounts)
        ? legalSummary.statusCounts
        : [],

      vendor: Array.isArray(vendorQuotationLegalSummary?.statusCounts)
        ? vendorQuotationLegalSummary.statusCounts
        : [],

      company: Array.isArray(companyLegalSummary?.statusCounts)
        ? companyLegalSummary.statusCounts
        : [],

      payment: Array.isArray(paymentLegalSummary?.statusCounts)
        ? paymentLegalSummary.statusCounts
        : [],
    }),
    [
      legalSummary,
      vendorQuotationLegalSummary,
      companyLegalSummary,
      paymentLegalSummary,
    ],
  );

  const statusMix = useMemo(() => buildStatusMix(statusCounts), [statusCounts]);

  // ============================================================
  // Total pending
  // ============================================================

  const totalPending = useMemo(
    () => summary.project + summary.vendor + summary.company + summary.payment,
    [summary],
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="max-h-[85vh] overflow-auto overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="w-full p-2 sm:p-2.5 lg:p-3">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Scale size={20} className="text-blue-600" />

              <h1 className="text-base font-bold text-slate-950">
                Legal Dashboard
              </h1>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              {totalPending} item
              {totalPending === 1 ? "" : "s"} pending review across project,
              vendor, company and payment legal workflows.
            </p>
          </div>
        </div>

        {/* Missing user ID */}
        {!userId && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle size={14} />
            User ID is missing from the route.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryCard
            type="project"
            value={summary.project}
            loading={loading}
          />

          <SummaryCard type="vendor" value={summary.vendor} loading={loading} />

          <SummaryCard
            type="company"
            value={summary.company}
            loading={loading}
          />

          <SummaryCard
            type="payment"
            value={summary.payment}
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
          <PendingByAreaChart summary={summary} loading={loading} />

          <StatusMixChart statusMix={statusMix} loading={loading} />
        </div>

        {/* Queue */}
        <div className="mt-2">
          <PendingLegalQueue items={pendingQueue} loading={loading} />
        </div>
      </div>
    </div>
  );
}
