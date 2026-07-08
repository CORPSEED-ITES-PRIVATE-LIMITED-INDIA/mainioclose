import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
} from "@heroui/react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  FolderOpen,
  Grid2X2,
  Headphones,
  IndianRupee,
  LayoutDashboard,
  ListTodo,
  Package,
  PieChart,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getDashboardSummaryCards,
  getLeadsBySolution,
  getLeadsFunnel,
  getPaymentSummaryDashboard,
  getProjectOverviewCards,
  getRevenueCardsDashboard,
  getRevenueTrendDashboard,
  getTopSellingServicesDashboard,
  getUserProjectDashboard,
} from "../../toolkit/slices/dashboardSlice";
import { useParams } from "react-router-dom";
import TopSellingServices from "./TopSellingService";
import TopConvertedLeads from "./TopConvertedLeads";
import TopCompanies from "./TopCompanies";
import RevenueByService from "./RevenueByService";

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthStartDate = () => {
  const today = new Date();
  return formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
};

const getCurrentMonthName = () =>
  new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value) => safeNumber(value).toLocaleString("en-IN");

const formatPercentage = (value) => {
  const numberValue = safeNumber(value);
  return `${Number.isInteger(numberValue) ? numberValue : numberValue.toFixed(2)}%`;
};

const formatGrowth = (value) => {
  const numberValue = safeNumber(value);

  if (numberValue > 0) return `↑ ${formatPercentage(numberValue)}`;
  if (numberValue < 0) return `↓ ${formatPercentage(Math.abs(numberValue))}`;

  return "0%";
};

const getGrowthColor = (value) => {
  const numberValue = safeNumber(value);

  if (numberValue > 0) return "text-green-600";
  if (numberValue < 0) return "text-red-600";

  return "text-slate-500";
};

const getLoggedInUserId = () => {
  if (typeof window === "undefined") return 12;

  const directUserId = window.localStorage.getItem("userId");
  const numericDirectUserId = Number(directUserId);

  if (Number.isFinite(numericDirectUserId) && numericDirectUserId > 0) {
    return numericDirectUserId;
  }

  const possibleKeys = ["user", "authUser", "loggedInUser", "userDetails"];

  for (const key of possibleKeys) {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) continue;

    try {
      const parsedValue = JSON.parse(rawValue);
      const possibleId =
        parsedValue?.id ??
        parsedValue?.userId ??
        parsedValue?.user?.id ??
        parsedValue?.user?.userId ??
        parsedValue?.data?.id ??
        parsedValue?.data?.userId;

      const numericId = Number(possibleId);
      if (Number.isFinite(numericId) && numericId > 0) return numericId;
    } catch (error) {
      // Ignore invalid localStorage JSON and continue checking other keys.
    }
  }

  return 12;
};

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Leads", icon: Users },
  { label: "My Conversions", icon: PieChart },
  { label: "Projects", icon: FolderOpen },
  { label: "Payments", icon: CreditCard },
  { label: "Tasks", icon: ListTodo, count: 5 },
  { label: "Companies", icon: Building2 },
  { label: "Reports", icon: BarChart3 },
  { label: "Calendar", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Products / Services", icon: Package },
  { label: "Support", icon: Headphones },
];

const topSellingServices = [
  {
    service: "12A Registration",
    leads: "12 Leads",
    amount: "₹ 2,40,000",
    icon: FileText,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    service: "80G Registration",
    leads: "8 Leads",
    amount: "₹ 1,60,000",
    icon: ShieldCheck,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  {
    service: "LLP Registration",
    leads: "6 Leads",
    amount: "₹ 1,20,000",
    icon: BriefcaseBusiness,
    bg: "bg-orange-50",
    color: "text-orange-500",
  },
  {
    service: "Private Limited Co.",
    leads: "5 Leads",
    amount: "₹ 90,000",
    icon: Building2,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    service: "IEC Registration",
    leads: "3 Leads",
    amount: "₹ 45,000",
    icon: Package,
    bg: "bg-purple-50",
    color: "text-purple-600",
  },
];

const topConvertedLeads = [
  {
    company: "ABC Foundation",
    service: "12A Registration",
    amount: "₹ 1,80,000",
    date: "20 May 2025",
    icon: Users,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  {
    company: "Green Earth Pvt. Ltd.",
    service: "Private Limited Co.",
    amount: "₹ 1,50,000",
    date: "18 May 2025",
    icon: Building2,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    company: "Helping Hands Trust",
    service: "80G Registration",
    amount: "₹ 1,20,000",
    date: "15 May 2025",
    icon: ShieldCheck,
    bg: "bg-orange-50",
    color: "text-orange-500",
  },
  {
    company: "Sunrise Enterprises",
    service: "LLP Registration",
    amount: "₹ 95,000",
    date: "12 May 2025",
    icon: ClipboardCheck,
    bg: "bg-teal-50",
    color: "text-teal-600",
  },
  {
    company: "Bright Future Org.",
    service: "12A Registration",
    amount: "₹ 75,000",
    date: "10 May 2025",
    icon: Users,
    bg: "bg-yellow-50",
    color: "text-yellow-600",
  },
];

const projectStatus = [
  {
    title: "In Progress",
    count: 22,
    value: 55,
    color: "primary",
    icon: FolderOpen,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Pending",
    subtitle: "Waiting for Docs/Info",
    count: 13,
    value: 32,
    color: "warning",
    icon: BriefcaseBusiness,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    title: "On Hold",
    count: 4,
    value: 10,
    color: "danger",
    icon: Clock3,
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    title: "Completed",
    subtitle: "This Month",
    count: 8,
    value: 75,
    color: "success",
    icon: CheckCircle2,
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
];

const revenueByService = [
  { service: "12A Registration", amount: "₹ 2,40,000", value: 92 },
  { service: "80G Registration", amount: "₹ 1,60,000", value: 72 },
  { service: "LLP Registration", amount: "₹ 1,20,000", value: 52 },
  { service: "Private Limited Co.", amount: "₹ 90,000", value: 38 },
  { service: "IEC Registration", amount: "₹ 45,000", value: 20 },
];

const activities = [
  {
    dot: "bg-green-500",
    title: "Lead converted: ABC Foundation",
    desc: "12A Registration",
    time: "20 May 2025, 11:30 AM",
  },
  {
    dot: "bg-blue-500",
    title: "Payment received: ₹ 90,000",
    desc: "from Green Earth Pvt. Ltd.",
    time: "19 May 2025, 04:15 PM",
  },
  {
    dot: "bg-yellow-500",
    title: "Task due today: Follow up",
    desc: "with Sunrise Enterprises",
    time: "19 May 2025, 10:00 AM",
  },
];

const topCompanies = [
  { name: "ABC Foundation", amount: "₹ 1,80,000" },
  { name: "Green Earth Pvt. Ltd.", amount: "₹ 1,50,000" },
  { name: "Helping Hands Trust", amount: "₹ 1,20,000" },
];

const leadFunnelData = [
  { label: "Total Leads", value: 148, color: "#2563eb" },
  { label: "Contacted", value: 96, color: "#14b8a6" },
  { label: "Qualified", value: 64, color: "#f59e0b" },
  { label: "Client Agreed", value: 42, color: "#8b5cf6" },
  { label: "Payment Received", value: 30, color: "#22c55e" },
];

const leadsByServiceData = [
  {
    service: "12A Registration",
    leads: 45,
    percentage: "35.7%",
    color: "bg-blue-600",
  },
  {
    service: "80G Registration",
    leads: 36,
    percentage: "28.6%",
    color: "bg-teal-500",
  },
  {
    service: "ALMM Compliance",
    leads: 27,
    percentage: "21.4%",
    color: "bg-yellow-400",
  },
  {
    service: "LLP Registration",
    leads: 18,
    percentage: "14.3%",
    color: "bg-purple-500",
  },
];

function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-semibold text-slate-950">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>
        )}
      </div>

      <button className="shrink-0 text-[10px] font-medium text-blue-600 hover:text-blue-700">
        View All
      </button>
    </div>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.bg}`}
          >
            <Icon size={19} className={item.iconColor} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-600">
              {item.title}
            </p>

            <h2 className="mt-1 truncate text-lg font-bold leading-6 text-slate-950">
              {item.value}
            </h2>

            <p className="mt-0.5 truncate text-[10px]">
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

const formatCurrencyCompact = (value) => {
  const numberValue = safeNumber(value);

  if (numberValue >= 10000000) {
    const valueInCr = numberValue / 10000000;
    return `₹${Number.isInteger(valueInCr) ? valueInCr : valueInCr.toFixed(1)}Cr`;
  }

  if (numberValue >= 100000) {
    const valueInLakh = numberValue / 100000;
    return `₹${Number.isInteger(valueInLakh) ? valueInLakh : valueInLakh.toFixed(1)}L`;
  }

  if (numberValue >= 1000) {
    const valueInThousand = numberValue / 1000;
    return `₹${Number.isInteger(valueInThousand) ? valueInThousand : valueInThousand.toFixed(1)}K`;
  }

  return `₹${formatNumber(numberValue)}`;
};

const getNiceMaxValue = (value) => {
  const numberValue = safeNumber(value);

  if (numberValue <= 0) return 100;

  const power = Math.pow(10, Math.floor(Math.log10(numberValue)));
  const normalized = numberValue / power;

  let niceMultiplier = 10;

  if (normalized <= 1) niceMultiplier = 1;
  else if (normalized <= 2) niceMultiplier = 2;
  else if (normalized <= 5) niceMultiplier = 5;

  return niceMultiplier * power;
};

const buildRevenueTrendChartData = (data) => {
  const points = Array.isArray(data?.points) ? data.points : [];

  return points.map((item) => ({
    monthKey: item?.monthKey,
    label: item?.label || item?.monthKey || "-",
    revenue: safeNumber(item?.revenue),
  }));
};

const buildSmoothSvgPath = (points) => {
  if (!points.length) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const controlX = (previous.x + current.x) / 2;

    path += ` C ${controlX} ${previous.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
};

function RevenueTrendChart({
  data,
  loading = false,
  months = 6,
  onApplyMonths,
}) {
  const [monthInput, setMonthInput] = useState(String(months || 6));

  useEffect(() => {
    setMonthInput(String(months || 6));
  }, [months]);

  const chartData = useMemo(() => buildRevenueTrendChartData(data), [data]);

  const totalRevenue = safeNumber(data?.totalRevenue);
  const maxRevenueFromPoints = Math.max(
    ...chartData.map((item) => safeNumber(item.revenue)),
    0,
  );

  const maxRevenue = getNiceMaxValue(maxRevenueFromPoints);

  const svgWidth = 650;
  const svgHeight = 245;

  const chartLeft = 45;
  const chartRight = 25;
  const chartTop = 28;
  const chartBottom = 180;

  const chartWidth = svgWidth - chartLeft - chartRight;
  const chartHeight = chartBottom - chartTop;

  const svgPoints = chartData.map((item, index) => {
    const x =
      chartData.length === 1
        ? chartLeft + chartWidth / 2
        : chartLeft + (index / (chartData.length - 1)) * chartWidth;

    const y =
      chartBottom -
      (safeNumber(item.revenue) / Math.max(maxRevenue, 1)) * chartHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath = buildSmoothSvgPath(svgPoints);

  const areaPath =
    svgPoints.length > 0
      ? `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${chartBottom} L ${svgPoints[0].x} ${chartBottom} Z`
      : "";

  const yTicks = [
    { value: maxRevenue, y: chartTop },
    { value: maxRevenue * 0.75, y: chartTop + chartHeight * 0.25 },
    { value: maxRevenue * 0.5, y: chartTop + chartHeight * 0.5 },
    { value: maxRevenue * 0.25, y: chartTop + chartHeight * 0.75 },
    { value: 0, y: chartBottom },
  ];

  const handleApplyMonths = () => {
    const safeMonths = Math.max(1, safeNumber(monthInput) || 6);
    setMonthInput(String(safeMonths));
    onApplyMonths?.(safeMonths);
  };

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="px-3 pt-3 pb-0">
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-950">
              Revenue Trend
            </h3>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Total Revenue:{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrencyCompact(totalRevenue)}
              </span>
            </p>
          </div>

          <div className="flex items-end gap-2">
            <label className="text-[10px] font-medium text-slate-600">
              Months
              <input
                type="number"
                min="1"
                value={monthInput}
                onChange={(event) => setMonthInput(event.target.value)}
                className="mt-1 h-9 w-24 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            <Button
              size="sm"
              color="primary"
              className="h-9 rounded-lg text-xs font-semibold"
              isLoading={loading}
              onPress={handleApplyMonths}
            >
              Apply
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-3">
        {loading ? (
          <div className="flex h-[200px] items-center justify-center text-xs font-medium text-slate-500">
            Loading revenue trend...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-500">
            No revenue trend data found.
          </div>
        ) : (
          <div className="relative h-[200px] w-full">
            <svg viewBox="0 0 650 245" className="h-full w-full">
              <defs>
                <linearGradient
                  id="revenueLineFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>

              {yTicks.map((tick) => (
                <g key={tick.value}>
                  <line
                    x1={chartLeft}
                    y1={tick.y}
                    x2={svgWidth - chartRight}
                    y2={tick.y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />

                  <text x="0" y={tick.y + 4} fontSize="12" fill="#475569">
                    {formatCurrencyCompact(tick.value)}
                  </text>
                </g>
              ))}

              {areaPath && <path d={areaPath} fill="url(#revenueLineFill)" />}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}

              {svgPoints.map((point) => (
                <circle
                  key={point.monthKey || point.label}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {svgPoints.map((point) => (
                <text
                  key={`label-${point.monthKey || point.label}`}
                  x={point.x}
                  y="215"
                  fontSize="12"
                  fill="#475569"
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              ))}
            </svg>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function buildLeadFunnelChartData(data) {
  const funnel = data?.funnel || {};

  return [
    {
      label: "Total Leads",
      value: safeNumber(funnel.totalLeads),
      color: "#2563eb",
    },
    {
      label: "Contacted",
      value: safeNumber(funnel.contacted),
      color: "#14b8a6",
    },
    {
      label: "Qualified",
      value: safeNumber(funnel.qualified),
      color: "#f59e0b",
    },
    {
      label: "Client Agreed",
      value: safeNumber(funnel.clientAgreed),
      color: "#8b5cf6",
    },
    {
      label: "Payment Received",
      value: safeNumber(funnel.paymentReceived),
      color: "#22c55e",
    },
  ];
}

function LeadsFunnel({ data, loading = false }) {
  const items = buildLeadFunnelChartData(data);

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Leads Funnel" subtitle="Current conversion flow" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading lead funnel...
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 lg:flex-row">
            <div className="w-full max-w-[205px]">
              <svg viewBox="0 0 280 220" className="h-full w-full">
                <path
                  d="M20 15 H260 L225 58 H55 Z"
                  fill="#2563eb"
                  opacity="0.95"
                />
                <path
                  d="M55 62 H225 L195 105 H85 Z"
                  fill="#14b8a6"
                  opacity="0.95"
                />
                <path
                  d="M85 109 H195 L168 152 H112 Z"
                  fill="#f59e0b"
                  opacity="0.95"
                />
                <path
                  d="M112 156 H168 L155 198 H125 Z"
                  fill="#8b5cf6"
                  opacity="0.95"
                />
                <path
                  d="M125 202 H155 L148 218 H132 Z"
                  fill="#22c55e"
                  opacity="0.95"
                />

                <line
                  x1="20"
                  y1="59"
                  x2="260"
                  y2="59"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <line
                  x1="55"
                  y1="106"
                  x2="225"
                  y2="106"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <line
                  x1="85"
                  y1="153"
                  x2="195"
                  y2="153"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <line
                  x1="112"
                  y1="199"
                  x2="168"
                  y2="199"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="w-full space-y-3">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-slate-600">
                      {item.label}
                    </span>
                  </div>

                  <span className="shrink-0 font-bold text-slate-950">
                    {formatNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function buildLeadsByServiceChartData(solutions = []) {
  const colors = [
    "#2563eb",
    "#14b8a6",
    "#f59e0b",
    "#8b5cf6",
    "#22c55e",
    "#ef4444",
    "#6366f1",
    "#06b6d4",
  ];

  const validSolutions = Array.isArray(solutions) ? solutions : [];

  const totalLeads = validSolutions.reduce(
    (total, item) => total + safeNumber(item?.leadCount),
    0,
  );

  return validSolutions.map((item, index) => {
    const leadCount = safeNumber(item?.leadCount);
    const percentage =
      totalLeads > 0
        ? Number(((leadCount / totalLeads) * 100).toFixed(2))
        : safeNumber(item?.percentage);

    return {
      id: item?.solutionId ?? item?.solutionName ?? index,
      service: item?.solutionName || "Unknown Service",
      leads: leadCount,
      percentage,
      color: colors[index % colors.length],
    };
  });
}

function LeadsByService({ solutions = [], loading = false }) {
  const chartData = buildLeadsByServiceChartData(solutions);

  const totalLeads = chartData.reduce(
    (total, item) => total + safeNumber(item.leads),
    0,
  );

  const conicGradient =
    chartData.length > 0 && totalLeads > 0
      ? chartData
          .reduce(
            (acc, item) => {
              const start = acc.currentDegree;
              const degrees = (safeNumber(item.leads) / totalLeads) * 360;
              const end = start + degrees;

              acc.parts.push(`${item.color} ${start}deg ${end}deg`);
              acc.currentDegree = end;

              return acc;
            },
            { parts: [], currentDegree: 0 },
          )
          .parts.join(", ")
      : "#e2e8f0 0deg 360deg";

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <div className="flex w-full items-center justify-between gap-3">
          <SectionTitle title="Leads by Service" subtitle="This Month" />

          <Chip size="sm" variant="flat" color="primary">
            Total {formatNumber(totalLeads)}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-3">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading leads by service...
          </div>
        ) : chartData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs font-medium text-slate-500">
            No service-wise lead data found.
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-5 lg:flex-row">
            <div
              className="relative h-28 w-28 shrink-0 rounded-full lg:h-32 lg:w-32"
              style={{
                background: `conic-gradient(${conicGradient})`,
              }}
            >
              <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
                <p className="text-xl font-bold text-slate-950 lg:text-2xl">
                  {formatNumber(totalLeads)}
                </p>
                <p className="text-[11px] text-slate-500 lg:text-xs">Total</p>
              </div>
            </div>

            <div className="w-full space-y-3">
              {chartData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="truncate font-medium text-slate-700">
                      {item.service}
                    </span>
                  </div>

                  <span className="shrink-0 font-semibold text-slate-950">
                    {formatNumber(item.leads)} (
                    {formatPercentage(item.percentage)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-8 text-xs">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-slate-700">{label}</span>
      </div>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function buildTopSellingServicesData(services = []) {
  const iconConfig = [
    { icon: FileText, bg: "bg-blue-50", color: "text-blue-600" },
    { icon: ShieldCheck, bg: "bg-green-50", color: "text-green-600" },
    { icon: BriefcaseBusiness, bg: "bg-orange-50", color: "text-orange-500" },
    { icon: Building2, bg: "bg-blue-50", color: "text-blue-600" },
    { icon: Package, bg: "bg-purple-50", color: "text-purple-600" },
  ];

  return (Array.isArray(services) ? services : []).map((item, index) => {
    const style = iconConfig[index % iconConfig.length];

    return {
      id: item?.solutionId ?? item?.solutionName ?? index,
      service: item?.solutionName || "Unknown Service",
      leads: `${formatNumber(item?.leadCount)} Leads`,
      amount: `₹ ${formatNumber(item?.totalRevenue)}`,
      invoiceCount: item?.invoiceCount || 0,
      ...style,
    };
  });
}

function ProjectsOverview({ cards = [], totalProjects = 0, loading = false }) {
  const iconMap = {
    IN_PROGRESS: FolderOpen,
    AWAITING_DOCUMENTS: BriefcaseBusiness,
    DELAYED: Clock3,
  };

  const colorMap = {
    IN_PROGRESS: {
      color: "primary",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    AWAITING_DOCUMENTS: {
      color: "warning",
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    DELAYED: {
      color: "danger",
      bg: "bg-red-50",
      iconColor: "text-red-600",
    },
  };

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <div className="flex w-full items-center justify-between">
          <SectionTitle title="Projects Overview" />
          <Chip size="sm" variant="flat" color="primary">
            Total {formatNumber(totalProjects)}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-3">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading project overview...
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((item) => {
              const Icon = iconMap[item.type] || FolderOpen;
              const style = colorMap[item.type] || colorMap.IN_PROGRESS;

              return (
                <div
                  key={item.type}
                  className="rounded-xl border border-slate-100 px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg}`}
                    >
                      <Icon size={17} className={style.iconColor} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-bold text-slate-950">
                      {formatNumber(item.count)}
                    </p>

                    <p className="shrink-0 text-[11px] text-slate-500">
                      {formatPercentage(item.percentage)}
                    </p>
                  </div>

                  <div className="mt-3 pl-12">
                    <Progress
                      aria-label={item.label}
                      value={safeNumber(item.percentage)}
                      color={style.color}
                      size="sm"
                      radius="full"
                      classNames={{
                        track: "bg-slate-100",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function TargetCard() {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardBody className="p-5">
        <h3 className="text-xs font-semibold text-center text-slate-950">
          My Target (May 2025)
        </h3>

        <div className="flex justify-center mt-5">
          <div
            className="relative h-32 w-32 rounded-full"
            style={{
              background:
                "conic-gradient(#22c55e 0deg 260deg, #f1f5f9 260deg 360deg)",
            }}
          >
            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
              <span className="text-3xl font-bold text-slate-950">72%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-950">₹ 7,20,000</p>
            <p className="text-xs text-slate-500 mt-1">Achieved</p>
          </div>

          <div className="text-center border-l border-slate-200">
            <p className="text-xs font-bold text-slate-950">₹ 10,00,000</p>
            <p className="text-xs text-slate-500 mt-1">Target</p>
          </div>
        </div>

        <Divider className="my-4" />

        <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-blue-600">
          View Target vs Achievement
          <span>→</span>
        </button>
      </CardBody>
    </Card>
  );
}

function PaymentSummary({ data, loading = false }) {
  const boxes = [
    {
      label: "Total Billed",
      value: formatCurrencyCompact(data?.totalBilled),
      bg: "bg-blue-50",
    },
    {
      label: "Received",
      value: formatCurrencyCompact(data?.received),
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: formatCurrencyCompact(data?.pending),
      bg: "bg-yellow-50",
    },
    {
      label: "Collection %",
      value: formatPercentage(data?.collectionPercentage),
      bg: "bg-red-50",
    },
  ];

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <h3 className="text-xs font-semibold text-slate-950 lg:text-[13px]">
          Payment Summary{" "}
          <span className="font-normal text-slate-500">(This Month)</span>
        </h3>
      </CardHeader>

      <CardBody className="px-3 pb-3">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading payment summary...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {boxes.map((box) => (
              <div
                key={box.label}
                className={`${box.bg} rounded-xl px-3 py-4 text-center`}
              >
                <p className="whitespace-nowrap text-base font-bold text-slate-950 lg:text-lg">
                  {box.value}
                </p>

                <p className="mt-1 text-[11px] text-slate-500 lg:text-xs">
                  {box.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function DateRangeFilter({
  fromDate,
  toDate,
  period,
  loading,
  error,
  onFromDateChange,
  onToDateChange,
  onRefresh,
}) {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardBody className="p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                <Filter size={17} className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Sales Dashboard
                </h2>
                <p className="text-[11px] text-slate-500">
                  Period sent to API:{" "}
                  <span className="font-semibold">{period}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] lg:max-w-[620px]">
            <label className="text-[11px] font-medium text-slate-600">
              From Date
              <input
                type="date"
                value={fromDate}
                onChange={(event) => onFromDateChange(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-[11px] font-medium text-slate-600">
              To Date
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => onToDateChange(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            <Button
              color="primary"
              className="h-10 self-end rounded-lg text-xs font-semibold"
              isLoading={loading}
              onPress={onRefresh}
            >
              Apply
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function LeadStatusCard({ statusCounts }) {
  const excludedStatuses = [
    "awaiting document",
    "awaiting documents",
    "future service",
    "future services",
    "final bad fit",
    "final deal lost",
  ];

  const chartData = useMemo(() => {
    const data = Array.isArray(statusCounts) ? statusCounts : [];

    const colors = [
      "#2563eb",
      "#14b8a6",
      "#f59e0b",
      "#8b5cf6",
      "#22c55e",
      "#ef4444",
      "#06b6d4",
      "#64748b",
    ];

    return data
      .map((item) => ({
        statusId: item?.statusId,
        statusName: item?.statusName || "Unknown Status",
        leadCount: safeNumber(item?.leadCount),
      }))
      .filter((item) => {
        const name = String(item.statusName || "")
          .trim()
          .toLowerCase();

        return item.leadCount > 0 && !excludedStatuses.includes(name);
      })
      .sort((a, b) => {
        if (b.leadCount !== a.leadCount) return b.leadCount - a.leadCount;
        return safeNumber(a.statusId) - safeNumber(b.statusId);
      })
      .map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
  }, [statusCounts]);

  const totalStatusLeads = chartData.reduce(
    (total, item) => total + safeNumber(item.leadCount),
    0,
  );

  const maxLeadCount = Math.max(
    ...chartData.map((item) => safeNumber(item.leadCount)),
    1,
  );

  const conicGradient =
    chartData.length > 0 && totalStatusLeads > 0
      ? chartData
          .reduce(
            (acc, item) => {
              const start = acc.currentDegree;
              const degrees =
                (safeNumber(item.leadCount) / totalStatusLeads) * 360;
              const end = start + degrees;

              acc.parts.push(`${item.color} ${start}deg ${end}deg`);
              acc.currentDegree = end;

              return acc;
            },
            { parts: [], currentDegree: 0 },
          )
          .parts.join(", ")
      : "#e2e8f0 0deg 360deg";

  const topStatus = chartData[0];

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-semibold text-slate-950">
              Lead Status Distribution
            </h3>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Active lead statuses for selected period
            </p>
          </div>

          <Chip
            size="sm"
            variant="flat"
            color="primary"
            className="shrink-0 font-semibold"
          >
            Total {formatNumber(totalStatusLeads)}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-3 pt-3">
        {chartData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-xs font-medium text-slate-500">
            No active lead status data found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[170px_minmax(0,1fr)]">
            <div className="flex items-center justify-center">
              <div
                className="relative h-32 w-32 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(${conicGradient})`,
                }}
              >
                <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                  <p className="text-2xl font-bold leading-7 text-slate-950">
                    {formatNumber(totalStatusLeads)}
                  </p>
                  <p className="text-[11px] text-slate-500">Leads</p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-blue-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium text-blue-700">
                    Active Statuses
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-slate-950">
                    {formatNumber(chartData.length)}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium text-green-700">
                    Highest Status
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-950">
                    {topStatus?.statusName || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {chartData.slice(0, 6).map((item) => {
                  const count = safeNumber(item.leadCount);
                  const percentage =
                    totalStatusLeads > 0 ? (count / totalStatusLeads) * 100 : 0;

                  const barWidth = count > 0 ? (count / maxLeadCount) * 100 : 0;

                  return (
                    <div key={item.statusId ?? item.statusName}>
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {item.statusName}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs font-bold text-slate-950">
                          {formatNumber(count)}{" "}
                          <span className="font-medium text-slate-500">
                            ({formatPercentage(percentage)})
                          </span>
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function SalesDashboard() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const selectedUserId = useMemo(() => userId || getLoggedInUserId(), [userId]);
  const currentPeriod = useMemo(() => getCurrentMonthName(), []);

  const [fromDate, setFromDate] = useState(getMonthStartDate());
  const [toDate, setToDate] = useState(formatDateForInput(new Date()));
  const [dateError, setDateError] = useState("");
  const [revenueMonths, setRevenueMonths] = useState(6);

  const {
    summaryCards: summaryCardsFromStore = {},
    leadStatusCounts = [],
    summaryCardsLoading = "",
    summaryCardsError = null,
    projectOverviewCards = [],
    projectOverviewLoading = "",
    projectOverviewData,
    userProjectDashboard = null,
    leadsFunnelData = null,
    leadsFunnelLoading = "",
    leadsBySolutionList = [],
    leadsBySolutionLoading = "",
    topSellingServicesDashboard = [],
    topSellingServicesDashboardLoading = "",
    revenueTrendData = null,
    revenueTrendLoading = "",
    revenueCardsData = null,
    revenueCardsLoading = "",
    paymentSummaryData = null,
    paymentSummaryLoading = "",
  } = useSelector((state) => state.dashboard || {});

  const isSummaryLoading = summaryCardsLoading === "pending";
  const error = dateError || summaryCardsError;
  const statusCounts = Array.isArray(leadStatusCounts) ? leadStatusCounts : [];
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  const formatCurrencyCompact = (value) => {
    const numberValue = safeNumber(value);

    if (numberValue >= 10000000) {
      const valueInCr = numberValue / 10000000;
      return `₹ ${Number.isInteger(valueInCr) ? valueInCr : valueInCr.toFixed(1)}Cr`;
    }

    if (numberValue >= 100000) {
      const valueInLakh = numberValue / 100000;
      return `₹ ${Number.isInteger(valueInLakh) ? valueInLakh : valueInLakh.toFixed(1)}L`;
    }

    if (numberValue >= 1000) {
      const valueInThousand = numberValue / 1000;
      return `₹ ${Number.isInteger(valueInThousand) ? valueInThousand : valueInThousand.toFixed(1)}K`;
    }

    return `₹ ${formatNumber(numberValue)}`;
  };

  const fetchDashboardSummary = () => {
    if (!selectedUserId) {
      setDateError("User ID is required to load dashboard summary.");
      return;
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setDateError("From Date cannot be greater than To Date.");
      return;
    }

    setDateError("");

    dispatch(
      getDashboardSummaryCards({
        userId: selectedUserId,
        period: currentPeriod, // Example: JULY
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getProjectOverviewCards({
        userId: selectedUserId,
        currentMonth: false,
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getUserProjectDashboard({
        userId: selectedUserId,
        currentMonth: false,
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getLeadsFunnel({
        userId: selectedUserId,
        period: currentPeriod,
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getLeadsBySolution({
        userId: selectedUserId,
        period: currentPeriod,
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getTopSellingServicesDashboard({
        userId: selectedUserId,
        period: currentPeriod,
        fromDate,
        toDate,
        limit: 5,
      }),
    );

    dispatch(
      getRevenueCardsDashboard({
        userId: selectedUserId,
        period: currentPeriod,
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getPaymentSummaryDashboard({
        userId: selectedUserId,
        period: currentPeriod,
        fromDate,
        toDate,
      }),
    );

    setDashboardRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    dispatch(
      getProjectOverviewCards({
        userId: selectedUserId,
        currentMonth: true,
      }),
    );
    dispatch(
      getUserProjectDashboard({
        userId: selectedUserId,
        currentMonth: true,
      }),
    );

    dispatch(
      getLeadsFunnel({
        userId: selectedUserId,
        period: currentPeriod,
      }),
    );

    dispatch(
      getLeadsBySolution({
        userId: selectedUserId,
        period: currentPeriod,
      }),
    );

    dispatch(
      getRevenueCardsDashboard({
        userId: selectedUserId,
        period: currentPeriod,
      }),
    );

    dispatch(
      getPaymentSummaryDashboard({
        userId: selectedUserId,
        period: currentPeriod,
      }),
    );
  }, []);

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setDateError("");
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setDateError("");
  };

  const dashboardStats = useMemo(() => {
    const totalLeads = safeNumber(summaryCardsFromStore.totalLeads);
    const convertedLeads = safeNumber(summaryCardsFromStore.convertedLeads);

    const revenueAmount = safeNumber(revenueCardsData?.revenue?.amount);
    const revenueGrowthPercentage = safeNumber(
      revenueCardsData?.revenue?.growthPercentage,
    );

    const revenuePipelineAmount = safeNumber(
      revenueCardsData?.revenuePipeline?.amount,
    );

    const revenuePipelineDealCount = safeNumber(
      revenueCardsData?.revenuePipeline?.dealCount,
    );

    const paymentPendingAmount = safeNumber(
      revenueCardsData?.paymentPending?.amount,
    );

    const paymentPendingGrowthPercentage = safeNumber(
      revenueCardsData?.paymentPending?.growthPercentage,
    );

    return [
      {
        title: "Total Leads",
        value: formatNumber(totalLeads),
        icon: Users,
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        change: formatGrowth(summaryCardsFromStore.totalLeadsGrowthPercentage),
        changeColor: getGrowthColor(
          summaryCardsFromStore.totalLeadsGrowthPercentage,
        ),
        suffix: "vs previous month",
      },
      {
        title: "Converted Leads",
        value: formatNumber(convertedLeads),
        icon: ClipboardCheck,
        bg: "bg-green-50",
        iconColor: "text-green-600",
        change: formatGrowth(
          summaryCardsFromStore.convertedLeadsGrowthPercentage,
        ),
        changeColor: getGrowthColor(
          summaryCardsFromStore.convertedLeadsGrowthPercentage,
        ),
        suffix: "vs previous month",
      },
      {
        title: "Lead Conversion %",
        value: formatPercentage(summaryCardsFromStore.leadConversionPercentage),
        icon: PieChart,
        bg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        change: `${formatNumber(convertedLeads)} / ${formatNumber(totalLeads)}`,
        changeColor: "text-cyan-600",
        suffix: "converted",
      },
      {
        title: "Projects Running",
        value: formatNumber(userProjectDashboard?.runningProjects || 0),
        icon: BriefcaseBusiness,
        bg: "bg-yellow-50",
        iconColor: "text-yellow-600",
        change: `${formatNumber(userProjectDashboard?.totalProjects || 0)} total`,
        changeColor: "text-yellow-600",
        suffix: "projects",
      },

      // Revenue API card
      {
        title: "Revenue",
        value: formatCurrencyCompact(revenueAmount),
        icon: IndianRupee,
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
        change: formatGrowth(revenueGrowthPercentage),
        changeColor: getGrowthColor(revenueGrowthPercentage),
        suffix:
          revenueCardsData?.revenue?.comparisonLabel || "vs previous period",
      },

      // Revenue Pipeline API card
      {
        title: "Revenue Pipeline",
        value: formatCurrencyCompact(revenuePipelineAmount),
        icon: TrendingUp,
        bg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        change: `${formatNumber(revenuePipelineDealCount)} deals`,
        changeColor: "text-indigo-600",
        suffix: revenueCardsData?.revenuePipeline?.label || "expected",
      },

      // Payment Pending fallback
      {
        title: "Payment Pending",
        value: formatCurrencyCompact(paymentPendingAmount),
        icon: Clock3,
        bg: "bg-red-50",
        iconColor: "text-red-600",
        change: revenueCardsData?.paymentPending
          ? formatGrowth(paymentPendingGrowthPercentage)
          : "—",
        changeColor: revenueCardsData?.paymentPending
          ? getGrowthColor(paymentPendingGrowthPercentage)
          : "text-slate-500",
        suffix: revenueCardsData?.paymentPending
          ? "vs previous period"
          : "not in API",
      },
    ];
  }, [summaryCardsFromStore, userProjectDashboard, revenueCardsData]);

  useEffect(() => {
    if (!selectedUserId) return;

    dispatch(
      getDashboardSummaryCards({
        userId: selectedUserId,
        period: currentPeriod, // Example: JULY
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getTopSellingServicesDashboard({
        userId: selectedUserId,
        period: currentPeriod,
        limit: 5,
        fromDate,
        toDate,
      }),
    );

    dispatch(
      getRevenueTrendDashboard({
        userId: selectedUserId,
        months: 6,
      }),
    );
    // Run only on first load / user change. Date filter is applied through Apply button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedUserId, currentPeriod]);

  const handleRevenueMonthsApply = (monthsValue) => {
    setRevenueMonths(monthsValue);

    dispatch(
      getRevenueTrendDashboard({
        userId: selectedUserId,
        months: monthsValue,
      }),
    );
  };

  return (
    <div className="max-h-[85vh] overflow-auto overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="w-full p-2 sm:p-3 lg:p-4">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          period={currentPeriod}
          loading={isSummaryLoading}
          error={error}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
          onRefresh={fetchDashboardSummary}
        />

        {/* Top Stats */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>

        {/* First Row */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[1.25fr_0.85fr_0.9fr]">
          <RevenueTrendChart
            data={revenueTrendData}
            loading={revenueTrendLoading === "pending"}
            months={revenueMonths}
            onApplyMonths={handleRevenueMonthsApply}
          />
          <LeadsFunnel
            data={leadsFunnelData}
            loading={leadsFunnelLoading === "pending"}
          />

          <LeadStatusCard statusCounts={statusCounts} />

          <LeadsByService
            solutions={leadsBySolutionList}
            loading={leadsBySolutionLoading === "pending"}
          />
          <TopSellingServices
            userId={selectedUserId}
            period={currentPeriod}
            fromDate={fromDate}
            toDate={toDate}
            cardLimit={5}
            fetchTrigger={dashboardRefreshKey}
          />
          <TopConvertedLeads
            userId={selectedUserId}
            period={currentPeriod}
            fromDate={fromDate}
            toDate={toDate}
            cardLimit={5}
            fetchTrigger={dashboardRefreshKey}
          />
          <ProjectsOverview
            cards={projectOverviewCards}
            totalProjects={projectOverviewData?.totalProjects || 0}
            loading={projectOverviewLoading === "pending"}
          />
          <RevenueByService
            userId={selectedUserId}
            period={currentPeriod}
            fromDate={fromDate}
            toDate={toDate}
            cardLimit={5}
            fetchTrigger={dashboardRefreshKey}
          />
          <PaymentSummary
            data={paymentSummaryData}
            loading={paymentSummaryLoading === "pending"}
          />
          <TopCompanies
            userId={selectedUserId}
            period={currentPeriod}
            fromDate={fromDate}
            toDate={toDate}
            cardLimit={5}
            fetchTrigger={dashboardRefreshKey}
          />
        </div>
      </div>
    </div>
  );
}
