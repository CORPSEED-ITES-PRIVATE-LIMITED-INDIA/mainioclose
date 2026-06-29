import React from "react";
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

const stats = [
  {
    title: "Total Leads",
    value: "148",
    icon: Users,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    change: "↑ 18%",
    changeColor: "text-green-600",
    suffix: "vs Apr",
  },
  {
    title: "Converted Leads",
    value: "36",
    icon: ClipboardCheck,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    change: "↑ 20%",
    changeColor: "text-green-600",
    suffix: "vs Apr",
  },
  {
    title: "Lead Conversion %",
    value: "24.3%",
    icon: PieChart,
    bg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    change: "36 / 148",
    changeColor: "text-cyan-600",
    suffix: "converted",
  },
  {
    title: "Revenue",
    value: "₹ 7.20L",
    icon: IndianRupee,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    change: "↑ 22%",
    changeColor: "text-green-600",
    suffix: "vs Apr",
  },
  {
    title: "Revenue Pipeline",
    value: "₹ 2.10L",
    icon: TrendingUp,
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    change: "12 deals",
    changeColor: "text-indigo-600",
    suffix: "expected",
  },
  {
    title: "Projects Running",
    value: "22",
    icon: BriefcaseBusiness,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    change: "—",
    changeColor: "text-slate-500",
    suffix: "vs Apr",
  },
  {
    title: "Payment Pending",
    value: "₹ 2.35L",
    icon: Clock3,
    bg: "bg-red-50",
    iconColor: "text-red-600",
    change: "↓ 12%",
    changeColor: "text-red-600",
    suffix: "vs Apr",
  },
];
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

function RevenueTrendChart() {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="px-3 pt-3 pb-0">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-slate-950">
            Revenue Trend
          </h3>

          <Button
            size="sm"
            variant="bordered"
            className="h-9 rounded-lg text-xs border-slate-200"
            endContent={<ChevronDown size={14} />}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="relative h-[200px] w-full">
          <svg viewBox="0 0 650 245" className="h-full w-full">
            {[30, 80, 130, 180].map((y) => (
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

            <text x="0" y="34" fontSize="12" fill="#475569">
              ₹10L
            </text>
            <text x="0" y="84" fontSize="12" fill="#475569">
              ₹7.5L
            </text>
            <text x="0" y="134" fontSize="12" fill="#475569">
              ₹2.5L
            </text>
            <text x="0" y="184" fontSize="12" fill="#475569">
              ₹0
            </text>

            <defs>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M70 135 C120 135, 130 122, 170 118 C220 108, 230 82, 280 78 C330 78, 345 58, 390 58 C435 58, 440 85, 485 76 C525 68, 535 28, 575 28 C600 28, 610 28, 615 28 L615 180 L70 180 Z"
              fill="url(#lineFill)"
            />

            <path
              d="M70 135 C120 135, 130 122, 170 118 C220 108, 230 82, 280 78 C330 78, 345 58, 390 58 C435 58, 440 85, 485 76 C525 68, 535 28, 575 28 C600 28, 610 28, 615 28"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {[
              [70, 135],
              [170, 118],
              [280, 78],
              [390, 58],
              [485, 76],
              [575, 28],
              [615, 28],
            ].map(([x, y], index) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
            ))}

            <line
              x1="575"
              y1="30"
              x2="575"
              y2="180"
              stroke="#dbeafe"
              strokeWidth="2"
            />

            <rect
              x="540"
              y="56"
              width="92"
              height="55"
              rx="10"
              fill="#ffffff"
              stroke="#e2e8f0"
            />
            <text x="555" y="78" fontSize="12" fontWeight="600" fill="#0f172a">
              May '25
            </text>
            <text x="555" y="98" fontSize="12" fontWeight="700" fill="#0f172a">
              ₹ 7,20,000
            </text>

            {[
              "Dec '24",
              "Jan '25",
              "Feb '25",
              "Mar '25",
              "Apr '25",
              "May '25",
            ].map((month, index) => (
              <text
                key={month}
                x={70 + index * 105}
                y="215"
                fontSize="12"
                fill="#475569"
                textAnchor="middle"
              >
                {month}
              </text>
            ))}
          </svg>
        </div>
      </CardBody>
    </Card>
  );
}

function LeadsFunnel() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Leads Funnel" subtitle="Current conversion flow" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
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
            </svg>
          </div>

          <div className="w-full space-y-3">
            {leadFunnelData.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 text-xs lg:text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-slate-600">{item.label}</span>
                </div>

                <span className="shrink-0 font-bold text-slate-950">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function LeadsByService() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Leads by Service" subtitle="This Month" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-5 lg:flex-row">
          <div
            className="relative h-28 w-28 shrink-0 rounded-full lg:h-32 lg:w-32"
            style={{
              background:
                "conic-gradient(#2563eb 0deg 129deg, #14b8a6 129deg 232deg, #facc15 232deg 309deg, #8b5cf6 309deg 360deg)",
            }}
          >
            <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
              <p className="text-xl font-bold text-slate-950 lg:text-2xl">
                126
              </p>
              <p className="text-[11px] text-slate-500 lg:text-xs">Total</p>
            </div>
          </div>

          <div className="w-full space-y-3">
            {leadsByServiceData.map((item) => (
              <div
                key={item.service}
                className="flex items-center justify-between gap-3 text-xs lg:text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
                  />
                  <span className="truncate font-medium text-slate-700">
                    {item.service}
                  </span>
                </div>

                <span className="shrink-0 font-semibold text-slate-950">
                  {item.leads} ({item.percentage})
                </span>
              </div>
            ))}
          </div>
        </div>
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

function TopSellingServices() {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Top Selling Services" subtitle="This Month" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="space-y-1">
          {topSellingServices.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.service}
                className="flex items-center justify-between gap-4 rounded-xl px-2 py-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center`}
                  >
                    <Icon size={20} className={item.color} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-950">
                      {item.service}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-[150px] items-center justify-between gap-5 text-xs">
                  <span className="text-slate-500">{item.leads}</span>
                  <span className="font-semibold text-slate-950">
                    {item.amount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function TopConvertedLeads() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Top Converted Leads" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="space-y-2">
          {topConvertedLeads.map((lead, index) => {
            const Icon = lead.icon;

            return (
              <div
                key={lead.company}
                className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-xl py-2.5 sm:grid-cols-[28px_minmax(0,1fr)_auto] xl:grid-cols-[28px_minmax(0,1fr)_auto_auto] xl:items-center"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {index + 1}
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${lead.bg}`}
                  >
                    <Icon size={16} className={lead.color} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-950 lg:text-xs">
                      {lead.company}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 lg:text-xs">
                      {lead.service}
                    </p>
                  </div>
                </div>

                <p className="col-start-2 whitespace-nowrap text-xs font-semibold text-slate-950 sm:col-start-auto lg:text-xs">
                  {lead.amount}
                </p>

                <p className="col-start-2 whitespace-nowrap text-[11px] font-medium text-green-600 xl:col-start-auto lg:text-xs">
                  {lead.date}
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function ProjectsOverview() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Projects Overview" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="space-y-3">
          {projectStatus.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-100 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.bg}`}
                  >
                    <Icon size={17} className={item.iconColor} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900 lg:text-xs">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-[11px] text-slate-500 lg:text-xs">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-xs font-bold text-slate-950 lg:text-xs">
                    {item.count}
                  </p>

                  <p className="shrink-0 text-[11px] text-slate-500 lg:text-xs">
                    {item.value}%
                  </p>
                </div>

                <div className="mt-3 pl-12">
                  <Progress
                    aria-label={item.title}
                    value={item.value}
                    color={item.color}
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
      </CardBody>
    </Card>
  );
}

function RevenueByService() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Revenue by Service" subtitle="This Month" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="space-y-4">
          {revenueByService.map((item) => (
            <div
              key={item.service}
              className="grid grid-cols-[minmax(105px,150px)_minmax(70px,1fr)_auto] items-center gap-3"
            >
              <p className="truncate text-xs font-semibold text-slate-900 lg:text-xs">
                {item.service}
              </p>

              <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${item.value}%` }}
                />
              </div>

              <p className="whitespace-nowrap text-xs font-semibold text-slate-950 lg:text-xs">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
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

function RecentActivities() {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="px-3 pt-3 pb-0">
        <h3 className="text-[13px] font-semibold text-slate-950">
          Recent Activities
        </h3>
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.title} className="flex gap-3">
              <div className="pt-1">
                <span
                  className={`block h-2.5 w-2.5 rounded-full ${activity.dot}`}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {activity.title}{" "}
                  <span className="font-normal text-slate-600">
                    ({activity.desc})
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function PaymentSummary() {
  const boxes = [
    { label: "Total Billed", value: "₹ 9.55L", bg: "bg-blue-50" },
    { label: "Received", value: "₹ 7.20L", bg: "bg-green-50" },
    { label: "Pending", value: "₹ 2.35L", bg: "bg-yellow-50" },
    { label: "Collection %", value: "75%", bg: "bg-red-50" },
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
      </CardBody>
    </Card>
  );
}

function TopCompanies() {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="px-3 pt-3 pb-0">
        <SectionTitle title="Top Companies" />
      </CardHeader>

      <CardBody className="px-3 pb-3">
        <div className="space-y-1">
          {topCompanies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-between rounded-lg py-3"
            >
              <p className="text-xs font-medium text-slate-900">
                {company.name}
              </p>
              <p className="text-xs font-semibold text-slate-950">
                {company.amount}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default function SalesDashboard() {
  return (
    <div className="max-h-[85vh] overflow-auto overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="w-full p-2 sm:p-3 lg:p-4">
        {/* Top Stats */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>

        {/* First Row */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-[1.25fr_0.85fr_0.9fr]">
          <RevenueTrendChart />
          <LeadsFunnel />

          <div className="xl:col-span-2 2xl:col-span-1">
            <LeadsByService />
          </div>
        </div>

        {/* Second Row */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          <TopSellingServices />
          <TopConvertedLeads />
          <ProjectsOverview />
        </div>

        {/* Third Row */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          <RevenueByService />
          <RecentActivities />
          <PaymentSummary />
        </div>

        {/* Fourth Row */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <TopCompanies />
        </div>
      </div>
    </div>
  );
}
