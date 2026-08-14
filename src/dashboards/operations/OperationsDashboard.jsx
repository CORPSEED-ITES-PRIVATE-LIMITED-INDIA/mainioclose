import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getDashboardUsersByHeirarchy,
  getProjectOverviewCards,
  getUserProjectDashboard,
} from "../../toolkit/slices/dashboardSlice.js";
import NewSelect from "../../components/NewSelect";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const PROJECT_STATUS_ORDER = [
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "REOPENED",
];

const topCardConfig = {
  OPEN: {
    title: "Open",
    icon: FolderOpen,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    changeColor: "text-blue-600",
  },
  IN_PROGRESS: {
    title: "In Progress",
    icon: Workflow,
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    changeColor: "text-indigo-600",
  },
  COMPLETED: {
    title: "Completed",
    icon: CheckCircle2,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    changeColor: "text-green-600",
  },
  CANCELLED: {
    title: "Cancelled",
    icon: AlertTriangle,
    bg: "bg-red-50",
    iconColor: "text-red-600",
    changeColor: "text-red-600",
  },
  REFUNDED: {
    title: "Refunded",
    icon: BriefcaseBusiness,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    changeColor: "text-amber-600",
  },
  REOPENED: {
    title: "Reopened",
    icon: FileText,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    changeColor: "text-purple-600",
  },
};

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatPercentage(value) {
  const percentage = toFiniteNumber(value);
  return `${percentage.toFixed(2).replace(/\.00$/, "")}%`;
}

function getRootDashboardData(response) {
  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  return response || {};
}

function buildTopCards(response) {
  const root = getRootDashboardData(response);
  const totalProjects = toFiniteNumber(root?.totalProjects);
  const statusCounts = Array.isArray(root?.statusCounts)
    ? root.statusCounts
    : [];

  const countByStatus = statusCounts.reduce((result, item) => {
    const status = String(item?.status || "")
      .trim()
      .toUpperCase();

    if (status) {
      result[status] = toFiniteNumber(item?.count);
    }

    return result;
  }, {});

  return PROJECT_STATUS_ORDER.map((status) => {
    const config = topCardConfig[status];
    const count = countByStatus[status] ?? 0;
    const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;

    return {
      ...config,
      type: status,
      value: String(count),
      change: formatPercentage(percentage),
      suffix: "of total",
    };
  });
}

const milestoneOverview = [
  {
    title: "Documentation",
    count: 31,
    completed: 18,
    avgCompletion: 72,
    icon: FileText,
    color: "primary",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Filing",
    count: 24,
    completed: 11,
    avgCompletion: 58,
    icon: FileCheck2,
    color: "secondary",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "Procurement",
    count: 17,
    completed: 7,
    avgCompletion: 46,
    icon: PackageCheck,
    color: "warning",
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    title: "Legal Review",
    count: 12,
    completed: 5,
    avgCompletion: 41,
    icon: ShieldCheck,
    color: "danger",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    title: "Final Approval",
    count: 15,
    completed: 10,
    avgCompletion: 81,
    icon: CheckCircle2,
    color: "success",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
];

const projectStageConfig = {
  NEW: {
    icon: FileText,
    color: "default",
    bg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  IN_PROGRESS: {
    icon: FolderOpen,
    color: "primary",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  AWAITING_DOCUMENTS: {
    icon: FileText,
    color: "warning",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  DELAYED: {
    icon: AlertTriangle,
    color: "danger",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: "success",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  REWORK: {
    icon: AlertTriangle,
    color: "warning",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
};

const defaultProjectStageConfig = {
  icon: Workflow,
  color: "default",
  bg: "bg-slate-100",
  iconColor: "text-slate-600",
};

const projects = [
  {
    id: 1,
    projectNo: "PRJ-2026-0018",
    company: "ABC Recycling Pvt. Ltd.",
    service: "Lithium Battery Recycling Authorization",
    owner: "Nabeela",
    status: "IN_PROGRESS",
    priority: "High",
    dueDate: "08 Jul 2026",
    overallCompletion: 76,
    currentMilestone: "Filing",
    pendingDocs: 2,
    amount: "₹ 1,80,000",
    milestones: [
      { name: "Documentation", completion: 100 },
      { name: "Filing", completion: 65 },
      { name: "Procurement", completion: 40 },
      { name: "Legal", completion: 0 },
      { name: "Approval", completion: 0 },
    ],
  },
  {
    id: 2,
    projectNo: "PRJ-2026-0019",
    company: "Green Earth Industries",
    service: "EPR Registration",
    owner: "Shruti",
    status: "NEW",
    priority: "Medium",
    dueDate: "10 Jul 2026",
    overallCompletion: 12,
    currentMilestone: "Documentation",
    pendingDocs: 5,
    amount: "₹ 95,000",
    milestones: [
      { name: "Documentation", completion: 45 },
      { name: "Filing", completion: 0 },
      { name: "Procurement", completion: 0 },
      { name: "Legal", completion: 0 },
      { name: "Approval", completion: 0 },
    ],
  },
  {
    id: 3,
    projectNo: "PRJ-2026-0020",
    company: "Sunrise Metals LLP",
    service: "CTE / CTO Assistance",
    owner: "Shaurya",
    status: "REWORK",
    priority: "High",
    dueDate: "04 Jul 2026",
    overallCompletion: 52,
    currentMilestone: "Legal Review",
    pendingDocs: 1,
    amount: "₹ 1,25,000",
    milestones: [
      { name: "Documentation", completion: 100 },
      { name: "Filing", completion: 80 },
      { name: "Procurement", completion: 60 },
      { name: "Legal", completion: 20 },
      { name: "Approval", completion: 0 },
    ],
  },
  {
    id: 4,
    projectNo: "PRJ-2026-0021",
    company: "Bright Future Foundation",
    service: "12A / 80G Registration",
    owner: "Priya",
    status: "COMPLETED",
    priority: "Low",
    dueDate: "01 Jul 2026",
    overallCompletion: 100,
    currentMilestone: "Completed",
    pendingDocs: 0,
    amount: "₹ 75,000",
    milestones: [
      { name: "Documentation", completion: 100 },
      { name: "Filing", completion: 100 },
      { name: "Procurement", completion: 100 },
      { name: "Legal", completion: 100 },
      { name: "Approval", completion: 100 },
    ],
  },
];

const dueProjects = [
  {
    company: "Sunrise Metals LLP",
    projectNo: "PRJ-2026-0020",
    due: "04 Jul 2026",
    milestone: "Legal Review",
    owner: "Shaurya",
    risk: "High",
  },
  {
    company: "ABC Recycling Pvt. Ltd.",
    projectNo: "PRJ-2026-0018",
    due: "08 Jul 2026",
    milestone: "Filing",
    owner: "Nabeela",
    risk: "Medium",
  },
  {
    company: "Green Earth Industries",
    projectNo: "PRJ-2026-0019",
    due: "10 Jul 2026",
    milestone: "Documentation",
    owner: "Shruti",
    risk: "Medium",
  },
];

const departmentWorkload = [
  { name: "Documentation Team", assigned: 31, completed: 18, value: 58 },
  { name: "Filing Team", assigned: 24, completed: 11, value: 46 },
  { name: "Procurement Team", assigned: 17, completed: 7, value: 41 },
  { name: "Legal Team", assigned: 12, completed: 5, value: 42 },
  { name: "Accounts Team", assigned: 14, completed: 9, value: 64 },
];

const activities = [
  {
    dot: "bg-green-500",
    title: "Milestone completed",
    desc: "Documentation completed for ABC Recycling Pvt. Ltd.",
    time: "03 Jul 2026, 10:45 AM",
  },
  {
    dot: "bg-blue-500",
    title: "Project moved to In Progress",
    desc: "EPR Registration - Green Earth Industries",
    time: "03 Jul 2026, 09:35 AM",
  },
  {
    dot: "bg-yellow-500",
    title: "Project sent for Rework",
    desc: "Legal review correction required for Sunrise Metals LLP",
    time: "02 Jul 2026, 05:10 PM",
  },
  {
    dot: "bg-green-500",
    title: "Project completed",
    desc: "12A / 80G Registration completed for Bright Future Foundation",
    time: "02 Jul 2026, 03:20 PM",
  },
];

const statusConfig = {
  NEW: {
    label: "New",
    color: "default",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "primary",
  },
  COMPLETED: {
    label: "Completed",
    color: "success",
  },
  REWORK: {
    label: "Rework",
    color: "warning",
  },
};

const priorityConfig = {
  High: "danger",
  Medium: "warning",
  Low: "success",
};

function SectionTitle({ title, subtitle, action = "View All" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-semibold text-slate-950">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>
        )}
      </div>

      {action && (
        <button className="shrink-0 text-[10px] font-medium text-blue-600 hover:text-blue-700">
          {action}
        </button>
      )}
    </div>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardBody className="p-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.bg}`}
          >
            <Icon size={18} className={item.iconColor} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-600">
              {item.title}
            </p>

            <h2 className="mt-0.5 truncate text-lg font-bold leading-5 text-slate-950">
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

function TopProjectCards({
  cards,
  loading = "idle",
  error = null,
  userId,
  onRetry,
}) {
  const isLoading = loading === "pending";
  const hasError = loading === "error";

  if (!userId) {
    return (
      <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-4 text-center">
        <p className="text-xs font-semibold text-amber-800">
          User ID is missing from the route.
        </p>
        <p className="mt-1 text-[11px] text-amber-700">
          Open this page using a route containing :userId.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return Array.from({ length: 6 }, (_, index) => (
      <Card
        key={index}
        className="animate-pulse rounded-xl border border-slate-200 shadow-sm"
      >
        <CardBody className="p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-5 w-14 rounded bg-slate-200" />
              <div className="mt-2 h-2.5 w-20 rounded bg-slate-100" />
            </div>
          </div>
        </CardBody>
      </Card>
    ));
  }

  if (hasError) {
    return (
      <div className="col-span-full flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-3 py-4 text-center">
        <AlertTriangle size={22} className="text-red-500" />
        <p className="mt-2 text-xs font-semibold text-red-700">
          Unable to load project summary
        </p>
        <p className="mt-1 text-[11px] text-red-600">
          {error || "Something went wrong while fetching project summary."}
        </p>
        <Button
          size="sm"
          color="danger"
          variant="flat"
          className="mt-2"
          onPress={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm">
        <p className="text-xs font-semibold text-slate-700">
          No project summary found
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          The API returned no values for the top cards.
        </p>
      </div>
    );
  }

  return cards.map((item, index) => (
    <StatCard key={`${item.type || item.title}-${index}`} item={item} />
  ));
}

function MilestoneOverview() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Milestone Overview"
          subtitle="Completion status across all projects"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="space-y-2">
          {milestoneOverview.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.bg}`}
                  >
                    <Icon size={16} className={item.iconColor} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {item.completed} completed out of {item.count}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-bold text-slate-950">
                    {item.avgCompletion}%
                  </p>
                </div>

                <div className="mt-2 pl-[42px]">
                  <Progress
                    aria-label={item.title}
                    value={item.avgCompletion}
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

function ProjectStatusOverview({
  cards = [],
  totalProjects = 0,
  loading = "idle",
  error = null,
  userId,
  onRetry,
}) {
  const isLoading = loading === "pending";
  const hasError = loading === "error";

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Project Stage Overview"
          subtitle={
            totalProjects > 0
              ? `${totalProjects} projects in the selected period`
              : "Live project stage distribution"
          }
          action={null}
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5" aria-live="polite">
        {!userId ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center">
            <p className="text-xs font-semibold text-amber-800">
              User information is not available.
            </p>
            <p className="mt-1 text-[11px] text-amber-700">
              Open this page using a route containing :userId.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="mt-2 h-2.5 w-40 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-8 rounded bg-slate-200" />
                  <div className="h-3 w-10 rounded bg-slate-100" />
                </div>
                <div className="mt-2 ml-[42px] h-1.5 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={22} />
            <p className="mt-2 text-xs font-semibold text-red-700">
              Unable to load project stages
            </p>
            <p className="mt-1 text-[11px] text-red-600">
              {error || "Something went wrong while fetching the overview."}
            </p>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              className="mt-2"
              onPress={onRetry}
            >
              Retry
            </Button>
          </div>
        ) : !Array.isArray(cards) || cards.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
            <p className="text-xs font-semibold text-slate-700">
              No project stage data found
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              There are no projects for the selected period.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((item, index) => {
              const config =
                projectStageConfig[item.type] || defaultProjectStageConfig;
              const Icon = config.icon;
              const count = Number(item.count) || 0;
              const percentage = Math.min(
                100,
                Math.max(0, Number(item.percentage) || 0),
              );

              return (
                <div
                  key={item.type || index}
                  className="rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                    >
                      <Icon size={16} className={config.iconColor} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {item.label || item.type}
                      </p>
                      {item.description && (
                        <p className="truncate text-[11px] text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-xs font-bold text-slate-950">
                      {count}
                    </p>

                    <p className="w-14 shrink-0 text-right text-[11px] text-slate-500">
                      {percentage.toFixed(2).replace(/\.00$/, "")}%
                    </p>
                  </div>

                  <div className="mt-2 pl-[42px]">
                    <Progress
                      aria-label={item.label || item.type}
                      value={percentage}
                      color={config.color}
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

function PortfolioCompletionChart() {
  const bars = [
    { label: "0-25%", count: 12, value: 25 },
    { label: "26-50%", count: 21, value: 48 },
    { label: "51-75%", count: 28, value: 70 },
    { label: "76-99%", count: 17, value: 85 },
    { label: "100%", count: 18, value: 100 },
  ];

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <div className="flex w-full items-center justify-between">
          <SectionTitle
            title="Project Completion Distribution"
            subtitle="Projects grouped by overall completion"
            action={null}
          />

          <Button
            size="sm"
            variant="bordered"
            className="h-8 rounded-lg border-slate-200 text-xs"
            endContent={<ChevronDown size={14} />}
          >
            This Month
          </Button>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="space-y-2.5">
          {bars.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[70px_minmax(0,1fr)_45px] items-center gap-2.5"
            >
              <p className="text-xs font-semibold text-slate-700">
                {item.label}
              </p>

              <div className="h-7 overflow-hidden rounded-lg bg-slate-100">
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-blue-600 pr-2"
                  style={{ width: `${item.value}%` }}
                >
                  <span className="text-[10px] font-semibold text-white">
                    {item.count}
                  </span>
                </div>
              </div>

              <p className="text-right text-xs font-semibold text-slate-950">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function DepartmentWorkload() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Team Workload"
          subtitle="Assigned vs completed milestone work"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="space-y-2.5">
          {departmentWorkload.map((item) => (
            <div key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.completed} completed / {item.assigned} assigned
                  </p>
                </div>

                <p className="shrink-0 text-xs font-bold text-slate-950">
                  {item.value}%
                </p>
              </div>

              <Progress
                aria-label={item.name}
                value={item.value}
                color={item.value >= 60 ? "success" : "warning"}
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

function MilestoneMiniProgress({ milestones = [] }) {
  return (
    <div className="flex min-w-[260px] flex-col gap-1.5">
      {milestones.map((milestone) => {
        const isCompleted = milestone.completion === 100;

        return (
          <div
            key={milestone.name}
            className="grid grid-cols-[85px_minmax(70px,1fr)_38px] items-center gap-2"
          >
            <p className="truncate text-[10px] font-medium text-slate-600">
              {milestone.name}
            </p>

            <Progress
              aria-label={milestone.name}
              value={milestone.completion}
              color={isCompleted ? "success" : "primary"}
              size="sm"
              radius="full"
              classNames={{
                track: "bg-slate-100",
              }}
            />

            <p
              className={`text-right text-[10px] font-semibold ${
                isCompleted ? "text-green-600" : "text-slate-700"
              }`}
            >
              {milestone.completion}%
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ProjectsTable() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            title="All Projects Milestone Tracker"
            subtitle="A milestone is completed only when completion reaches 100%"
            action={null}
          />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="bordered"
              className="h-8 rounded-lg border-slate-200 text-xs"
              startContent={<Filter size={14} />}
            >
              Filter
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="bordered"
                  className="h-8 rounded-lg border-slate-200 text-xs"
                  endContent={<ChevronDown size={14} />}
                >
                  Stage
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Stage filter">
                <DropdownItem key="all">All</DropdownItem>
                <DropdownItem key="new">New</DropdownItem>
                <DropdownItem key="in_progress">In Progress</DropdownItem>
                <DropdownItem key="completed">Completed</DropdownItem>
                <DropdownItem key="rework">Rework</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <Table
          aria-label="Projects milestone table"
          removeWrapper
          classNames={{
            th: "bg-slate-50 text-[11px] text-slate-600 h-8 py-0",
            td: "text-xs py-2",
          }}
        >
          <TableHeader>
            <TableColumn>PROJECT</TableColumn>
            <TableColumn>COMPANY / SERVICE</TableColumn>
            <TableColumn>STAGE</TableColumn>
            <TableColumn>OVERALL</TableColumn>
            <TableColumn>CURRENT MILESTONE</TableColumn>
            <TableColumn>MILESTONES</TableColumn>
            <TableColumn>DUE</TableColumn>
            <TableColumn>OWNER</TableColumn>
          </TableHeader>

          <TableBody>
            {projects.map((project) => {
              const stage = statusConfig[project.status] || {
                label: project.status || "Unknown",
                color: "default",
              };

              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="whitespace-nowrap font-semibold text-slate-950">
                        {project.projectNo}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Value: {project.amount}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[220px]">
                      <p className="truncate font-semibold text-slate-950">
                        {project.company}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {project.service}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={stage.color}
                      className="text-[10px] font-medium"
                    >
                      {stage.label}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-[110px]">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-900">
                          {project.overallCompletion}%
                        </span>
                      </div>

                      <Progress
                        aria-label="Overall completion"
                        value={project.overallCompletion}
                        color={
                          project.overallCompletion === 100
                            ? "success"
                            : project.overallCompletion >= 70
                              ? "primary"
                              : "warning"
                        }
                        size="sm"
                        radius="full"
                        classNames={{
                          track: "bg-slate-100",
                        }}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="whitespace-nowrap font-semibold text-slate-950">
                        {project.currentMilestone}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Pending docs: {project.pendingDocs}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <MilestoneMiniProgress milestones={project.milestones} />
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="whitespace-nowrap font-semibold text-slate-950">
                        {project.dueDate}
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={priorityConfig[project.priority] || "default"}
                        className="mt-0.5 text-[10px]"
                      >
                        {project.priority}
                      </Chip>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="whitespace-nowrap font-semibold text-slate-950">
                      {project.owner}
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

function DueProjects() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Due / Risk Queue"
          subtitle="Projects requiring immediate attention"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="space-y-2">
          {dueProjects.map((item) => (
            <div
              key={item.projectNo}
              className="rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-950">
                    {item.company}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {item.projectNo} • {item.milestone}
                  </p>
                </div>

                <Chip
                  size="sm"
                  variant="flat"
                  color={item.risk === "High" ? "danger" : "warning"}
                  className="text-[10px]"
                >
                  {item.risk}
                </Chip>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">Due Date</p>
                  <p className="mt-0.5 font-semibold text-slate-950">
                    {item.due}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">Owner</p>
                  <p className="mt-0.5 font-semibold text-slate-950">
                    {item.owner}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function RecentActivities() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle title="Recent Project Activities" action={null} />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="space-y-2.5">
          {activities.map((activity) => (
            <div key={activity.title} className="flex gap-2.5">
              <div className="pt-1">
                <span
                  className={`block h-2.5 w-2.5 rounded-full ${activity.dot}`}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900">
                  {activity.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{activity.desc}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function MilestoneDefinitionCard() {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardBody className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50">
            <Workflow size={18} className="text-green-600" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Milestone Completion Logic
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Each project contains multiple milestones like Documentation,
              Filing, Procurement, Legal Review and Approval. A milestone should
              be treated as completed only when its completion percentage is
              exactly 100%.
            </p>

            <Divider className="my-2.5" />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 px-2 py-2.5">
                <p className="text-base font-bold text-slate-950">0-99%</p>
                <p className="mt-0.5 text-[11px] text-slate-500">In Progress</p>
              </div>

              <div className="rounded-xl bg-green-50 px-2 py-2.5">
                <p className="text-base font-bold text-green-600">100%</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Completed</p>
              </div>

              <div className="rounded-xl bg-orange-50 px-2 py-2.5">
                <p className="text-base font-bold text-orange-600">Rework</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Correction</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function OperationsDashboard() {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const rawUserId = routeParams.userId ?? routeParams.id;
  const parsedUserId = Number(rawUserId);
  const loggedInUserId =
    rawUserId !== undefined &&
    rawUserId !== null &&
    rawUserId !== "" &&
    Number.isFinite(parsedUserId) &&
    parsedUserId > 0
      ? parsedUserId
      : null;

  const [userId, setUserId] = useState(loggedInUserId);

  // Reset the selected user whenever the logged-in user (route) changes.
  useEffect(() => {
    setUserId(loggedInUserId);
  }, [loggedInUserId]);

  const {
    dashboardUsers = [],
    projectOverviewData = null,
    projectOverviewCards = [],
    projectOverviewLoading = "idle",
    projectOverviewError = null,
    userProjectDashboard = null,
    userProjectDashboardLoading = "idle",
    userProjectDashboardError = null,
  } = useSelector((state) => state.dashboard || {});

  // Fetch the hierarchy (team) of the logged-in user for the "select user" dropdown.
  useEffect(() => {
    if (!loggedInUserId) return;
    dispatch(getDashboardUsersByHeirarchy(loggedInUserId));
  }, [dispatch, loggedInUserId]);

  const topCards = useMemo(
    () => buildTopCards(userProjectDashboard),
    [userProjectDashboard],
  );

  const fetchProjectOverview = useCallback(() => {
    if (!userId) return;

    dispatch(
      getProjectOverviewCards({
        userId,
        currentMonth: true,
      }),
    );
  }, [dispatch, userId]);

  const fetchUserProjectDashboard = useCallback(() => {
    if (!userId) return;

    dispatch(
      getUserProjectDashboard({
        userId,
        currentMonth: true,
      }),
    );
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) return;

    fetchProjectOverview();
    fetchUserProjectDashboard();
  }, [fetchProjectOverview, fetchUserProjectDashboard, userId]);

  return (
    <div className="max-h-[85vh] overflow-auto overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="w-full p-2 sm:p-2.5 lg:p-3">
        <div className="mb-2 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers3 size={20} className="text-blue-600" />
              <h1 className="text-base font-bold text-slate-950">
                Project Operations Dashboard
              </h1>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Track all projects, milestone-wise completion, stage percentage,
              workload and risk queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="bordered"
              className="h-8 rounded-lg border-slate-200 text-xs"
              startContent={<CalendarDays size={14} />}
            >
              Current Month
            </Button>

            <div className="w-full sm:w-56">
              <NewSelect
                label="Viewing dashboard for"
                labelPlacement="outside"
                placeholder="Select user"
                data={dashboardUsers}
                labelKey="name"
                valueKey="id"
                value={userId}
                onChange={(value) => value && setUserId(Number(value))}
              />
            </div>

            <Button
              size="sm"
              color="primary"
              className="h-8 rounded-lg text-xs"
              startContent={<BarChart3 size={14} />}
            >
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TopProjectCards
            cards={topCards}
            loading={userProjectDashboardLoading}
            error={userProjectDashboardError}
            userId={userId}
            onRetry={fetchUserProjectDashboard}
          />
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-2 2xl:grid-cols-[1fr_1fr_0.9fr]">
          <PortfolioCompletionChart />
          <MilestoneOverview />
          <ProjectStatusOverview
            cards={projectOverviewCards}
            totalProjects={projectOverviewData?.totalProjects || 0}
            loading={projectOverviewLoading}
            error={projectOverviewError}
            userId={userId}
            onRetry={fetchProjectOverview}
          />
          <DepartmentWorkload />
          <DueProjects />
          <div className="space-y-2">
            <MilestoneDefinitionCard />
            <RecentActivities />
          </div>
        </div>

        <div className="mt-2">
          <ProjectsTable />
        </div>
      </div>
    </div>
  );
}
