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
  getProjectOverviewCards,
  getUserProjectDashboard,
  getOperationRiskQueue,
  getMilestoneTracker,
  getMilestoneOverview,
  getTeamWorkload,
  getStatusWiseSummary,
  getRecentProjectActivities,
  getDashboardUsersByHeirarchy,
} from "../../toolkit/slices/dashboardSlice.js";
// import NewSelect from "../../components/NewSelect";
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
  Users,
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

const statusBarColor = {
  OPEN: "bg-blue-600",
  IN_PROGRESS: "bg-indigo-600",
  COMPLETED: "bg-green-600",
  CANCELLED: "bg-red-500",
  REFUNDED: "bg-amber-500",
  REOPENED: "bg-purple-500",
  FORCE_CLOSED: "bg-slate-500",
};

const defaultStatusBarColor = "bg-slate-400";

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatPercentage(value) {
  const percentage = toFiniteNumber(value);
  return `${percentage.toFixed(2).replace(/\.00$/, "")}%`;
}

function formatCurrency(value) {
  const amount = toFiniteNumber(value);
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

function formatTrackerDate(isoDate) {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toTitleCase(value) {
  if (!value) return "-";
  return value.charAt(0) + value.slice(1).toLowerCase();
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
const milestoneStyleConfig = {
  Documentation: {
    icon: FileText,
    color: "primary",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  Filling: {
    icon: FileCheck2,
    color: "secondary",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  Filing: {
    icon: FileCheck2,
    color: "secondary",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  Procurement: {
    icon: PackageCheck,
    color: "warning",
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  "Legal Review": {
    icon: ShieldCheck,
    color: "danger",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  Certification: {
    icon: CheckCircle2,
    color: "success",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  "Final Approval": {
    icon: CheckCircle2,
    color: "success",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
};

const defaultMilestoneStyle = {
  icon: Workflow,
  color: "default",
  bg: "bg-slate-100",
  iconColor: "text-slate-600",
};

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

const activityDotColor = {
  GREEN: "bg-green-500",
  BLUE: "bg-blue-500",
  ORANGE: "bg-amber-500",
  YELLOW: "bg-amber-500",
  RED: "bg-red-500",
};

const defaultActivityDotColor = "bg-slate-400";

function formatActivityTimestamp(isoDate) {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
}

function RecentActivities({ items = [], loading = false }) {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Recent Project Activities"
          subtitle="Latest milestone & project status updates"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="h-[360px] space-y-2.5 overflow-y-auto pr-1">
          {loading ? (
            [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex animate-pulse gap-2.5">
                <div className="pt-1">
                  <span className="block h-2.5 w-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-32 rounded bg-slate-200" />
                  <div className="mt-1.5 h-2.5 w-48 rounded bg-slate-100" />
                  <div className="mt-1.5 h-2.5 w-24 rounded bg-slate-100" />
                </div>
              </div>
            ))
          ) : !items.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
              <p className="text-xs font-semibold text-slate-700">
                No recent activity found
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Activity will show up here as projects and milestones update.
              </p>
            </div>
          ) : (
            items.map((activity, index) => (
              <div
                key={`${activity.activityType}-${activity.timestamp}-${index}`}
                className="flex gap-2.5"
              >
                <div className="pt-1">
                  <span
                    className={`block h-2.5 w-2.5 rounded-full ${
                      activityDotColor[activity.colorCode] ||
                      defaultActivityDotColor
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {activity.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatActivityTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
}

const statusConfig = {
  OPEN: {
    label: "Open",
    color: "default",
  },
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
  HIGH: "danger",
  MEDIUM: "warning",
  STANDARD: "default",
  LOW: "success",
};

function SectionTitle({ title, subtitle }) {
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

function MilestoneOverview({ items = [], loading = false }) {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Milestone Overview"
          subtitle="Completion status across all projects"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="mt-2 h-2.5 w-32 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-8 rounded bg-slate-200" />
                </div>
                <div className="mt-2 ml-[42px] h-1.5 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : !items.length ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
            <p className="text-xs font-semibold text-slate-700">
              No milestone data found
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              There is no milestone activity to summarize yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const style =
                milestoneStyleConfig[item.milestoneName] ||
                defaultMilestoneStyle;
              const Icon = style.icon;
              const completion = toFiniteNumber(item.completionPercentage);

              return (
                <div
                  key={item.milestoneId}
                  className="rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg}`}
                    >
                      <Icon size={16} className={style.iconColor} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {item.milestoneName}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.completedProjects} completed out of{" "}
                        {item.totalProjects}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-bold text-slate-950">
                      {completion}%
                    </p>
                  </div>

                  <div className="mt-2 pl-[42px]">
                    <Progress
                      aria-label={item.milestoneName}
                      value={completion}
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

function StatusWiseSummaryChart({ items = [], loading = false }) {
  const maxCount = Math.max(
    1,
    ...items.map((i) => toFiniteNumber(i.projectCount)),
  );

  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <div className="flex w-full items-center justify-between">
          <SectionTitle
            title="Project Status Distribution"
            subtitle="Projects grouped by current status"
          />
        </div>
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[90px_minmax(0,1fr)_70px] items-center gap-2.5 animate-pulse"
              >
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-7 rounded-lg bg-slate-100" />
                <div className="h-3 w-14 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : !items.length ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
            <p className="text-xs font-semibold text-slate-700">
              No status data found
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              There are no projects to summarize yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const count = toFiniteNumber(item.projectCount);
              const percentage = toFiniteNumber(item.percentage);
              const widthPct = Math.max(
                count > 0 ? 6 : 0,
                (count / maxCount) * 100,
              );
              const barColor =
                statusBarColor[item.statusName] || defaultStatusBarColor;
              const label =
                statusConfig[item.statusName]?.label ||
                toTitleCase(item.statusName);

              return (
                <div
                  key={item.statusId}
                  className="grid grid-cols-[90px_minmax(0,1fr)_70px] items-center gap-2.5"
                >
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {label}
                  </p>

                  <div className="h-7 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className={`flex h-full items-center justify-end rounded-lg ${barColor} pr-2 transition-all`}
                      style={{ width: `${widthPct}%` }}
                    >
                      {count > 0 && (
                        <span className="text-[10px] font-semibold text-white">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-right text-xs font-semibold text-slate-950">
                    {formatPercentage(percentage)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function DepartmentWorkload({ items = [], loading = false }) {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Team Workload"
          subtitle="Assigned vs completed milestone work"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="h-[360px] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="mb-1.5 flex items-center justify-between gap-2.5">
                    <div className="flex-1">
                      <div className="h-3 w-32 rounded bg-slate-200" />
                      <div className="mt-2 h-2.5 w-40 rounded bg-slate-100" />
                    </div>
                    <div className="h-3 w-8 rounded bg-slate-200" />
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : !items.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
              <p className="text-xs font-semibold text-slate-700">
                No team workload data found
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                There is no assigned work to summarize yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => {
                const completion = toFiniteNumber(item.completionPercentage);

                return (
                  <div key={item.departmentId}>
                    <div className="mb-1.5 flex items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {item.departmentName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.completedCount} completed / {item.assignedCount}{" "}
                          assigned
                        </p>
                      </div>

                      <p className="shrink-0 text-xs font-bold text-slate-950">
                        {formatPercentage(completion)}
                      </p>
                    </div>

                    <Progress
                      aria-label={item.departmentName}
                      value={completion}
                      color={completion >= 60 ? "success" : "warning"}
                      size="sm"
                      radius="full"
                      classNames={{
                        track: "bg-slate-100",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function MilestoneMiniProgress({ milestones = [] }) {
  return (
    <div className="flex min-w-[260px] flex-col gap-1.5">
      {milestones.map((milestone, index) => {
        const isCompleted = milestone.completion === 100;

        return (
          <div
            key={`${milestone.name}-${index}`}
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

function ProjectsTable({
  projects = [],
  loading = false,
  pageInfo = null,
  onPrevPage,
  onNextPage,
}) {
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            title="All Projects Milestone Tracker"
            subtitle="A milestone is completed only when completion reaches 100%"
          />
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

          <TableBody
            emptyContent={loading ? "Loading projects..." : "No projects found"}
          >
            {projects.map((project) => {
              const stage = statusConfig[project.stage] || {
                label: project.stage || "Unknown",
                color: "default",
              };

              const milestones = (project.milestones || []).map((m) => ({
                name: m.milestoneName,
                completion: toFiniteNumber(m.percentage),
              }));

              return (
                <TableRow key={project.projectId}>
                  <TableCell>
                    <div>
                      <p className="whitespace-nowrap font-semibold text-slate-950">
                        {project.projectNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Value: {formatCurrency(project.projectValue)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[220px]">
                      <p className="truncate font-semibold text-slate-950">
                        {project.companyName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {project.serviceName}
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
                          {toFiniteNumber(project.overallPercentage)}%
                        </span>
                      </div>

                      <Progress
                        aria-label="Overall completion"
                        value={toFiniteNumber(project.overallPercentage)}
                        color={
                          project.overallPercentage === 100
                            ? "success"
                            : project.overallPercentage >= 70
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
                        {project.currentMilestoneName || "-"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Pending docs:{" "}
                        {toFiniteNumber(project.pendingDocumentCount)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <MilestoneMiniProgress milestones={milestones} />
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="whitespace-nowrap font-semibold text-slate-950">
                        {formatTrackerDate(project.dueDate)}
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={priorityConfig[project.priority] || "default"}
                        className="mt-0.5 text-[10px]"
                      >
                        {toTitleCase(project.priority)}
                      </Chip>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="whitespace-nowrap font-semibold text-slate-950">
                      {project.ownerName || "Unassigned"}
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {pageInfo && (
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <p className="text-[11px] text-slate-500">
              Page {pageInfo.number + 1} of {pageInfo.totalPages || 1} •{" "}
              {pageInfo.totalElements} total projects
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                className="h-7 rounded-lg border-slate-200 text-xs"
                isDisabled={pageInfo.first}
                onPress={onPrevPage}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className="h-7 rounded-lg border-slate-200 text-xs"
                isDisabled={pageInfo.last}
                onPress={onNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function DueProjects({ items = [], loading = false }) {
  function formatDisplayDate(isoDate) {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return (
    <Card className="rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="px-3 pt-2.5 pb-0">
        <SectionTitle
          title="Due / Risk Queue"
          subtitle="Projects requiring immediate attention"
        />
      </CardHeader>

      <CardBody className="px-3 pb-2.5">
        <div className="h-[360px] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="h-3 w-32 rounded bg-slate-200" />
                  <div className="mt-2 h-2.5 w-44 rounded bg-slate-100" />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-lg bg-slate-100" />
                    <div className="h-8 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : !items.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
              <p className="text-xs font-semibold text-slate-700">
                No projects at risk
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Nothing is due or overdue in the selected window.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.projectId}-${item.milestoneId}`}
                  className="rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-950">
                        {item.companyName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {item.projectNumber} • {item.milestoneName}
                      </p>
                    </div>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        item.priority === "HIGH"
                          ? "danger"
                          : item.priority === "MEDIUM"
                            ? "warning"
                            : "default"
                      }
                      className="text-[10px]"
                    >
                      {item.priority
                        ? item.priority.charAt(0) +
                          item.priority.slice(1).toLowerCase()
                        : "Normal"}
                    </Chip>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <p className="text-slate-500">Due Date</p>
                      <p className="mt-0.5 font-semibold text-slate-950">
                        {formatDisplayDate(item.dueDate)}
                      </p>
                      {item.overdue && (
                        <p className="mt-0.5 text-[10px] font-medium text-red-600">
                          Overdue by {item.overdueDays}{" "}
                          {item.overdueDays === 1 ? "day" : "days"}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <p className="text-slate-500">Owner</p>
                      <p className="mt-0.5 font-semibold text-slate-950">
                        {item.ownerName || "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

  const userId = loggedInUserId;

  // NEW: which team member's data is currently being viewed.
  // null means "show my own (logged-in user's) data".
  const [selectedUser, setSelectedUser] = useState(null);

  // NEW: every fetch below now uses this instead of `userId` directly,
  // so switching the dropdown swaps the entire dashboard.
  const activeUserId = selectedUser?.id ?? userId;

  const toInputDate = (d) => d.toISOString().slice(0, 10);

  const getDefaultRange = () => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: toInputDate(firstOfMonth),
      to: toInputDate(today),
    };
  };

  const [{ from: defaultFrom, to: defaultTo }] = useState(getDefaultRange);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [dateRangeError, setDateRangeError] = useState(null);

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setDateRangeError(
      toDate && value && value > toDate
        ? "From date cannot be after To date"
        : null,
    );
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setDateRangeError(
      fromDate && value && fromDate > value
        ? "To date cannot be before From date"
        : null,
    );
  };

  const {
    projectOverviewData = null,
    projectOverviewCards = [],
    projectOverviewLoading = "idle",
    projectOverviewError = null,
    userProjectDashboard = null,
    userProjectDashboardLoading = "idle",
    userProjectDashboardError = null,
    riskQueue = [],
    milestoneTracker = null,
    milestoneOverview: milestoneOverviewData = [],
    teamWorkload = [],
    statusWiseSummary = [],
    recentProjectActivities = [],
    dashboardUsers = [], // NEW: hierarchy list for the dropdown

    loading: sharedLoading = false,
  } = useSelector((state) => state.dashboard || {});

  const [trackerPage, setTrackerPage] = useState(0);
  const trackerSize = 10;

  const trackerContent = milestoneTracker?.content || [];
  const trackerPageInfo = milestoneTracker
    ? {
        number: milestoneTracker.number ?? 0,
        totalPages: milestoneTracker.totalPages ?? 1,
        totalElements: milestoneTracker.totalElements ?? 0,
        first: milestoneTracker.first ?? true,
        last: milestoneTracker.last ?? true,
      }
    : null;

  // NEW: fetch the hierarchy list once we know who's logged in.
  useEffect(() => {
    if (!userId) return;
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId || !dashboardUsers.length) return;

    const matchedUser = dashboardUsers.find(
      (person) => String(person.id) === String(userId),
    );

    if (matchedUser) {
      setSelectedUser(matchedUser);
    }
  }, [userId, dashboardUsers]);

  const fetchMilestoneTracker = useCallback(() => {
    if (!activeUserId) return;

    dispatch(
      getMilestoneTracker({
        userId: activeUserId,
        page: trackerPage,
        size: trackerSize,
      }),
    );
  }, [dispatch, activeUserId, trackerPage]);

  useEffect(() => {
    if (!activeUserId) return;
    fetchMilestoneTracker();
  }, [fetchMilestoneTracker, activeUserId]);

  const topCards = useMemo(
    () => buildTopCards(userProjectDashboard),
    [userProjectDashboard],
  );

  const fetchProjectOverview = useCallback(() => {
    if (!activeUserId || !fromDate || !toDate || dateRangeError) return;

    dispatch(
      getProjectOverviewCards({
        userId: activeUserId,
        fromDate,
        toDate,
      }),
    );
  }, [dispatch, activeUserId, fromDate, toDate, dateRangeError]);

  const fetchUserProjectDashboard = useCallback(() => {
    if (!activeUserId || !fromDate || !toDate || dateRangeError) return;

    dispatch(
      getUserProjectDashboard({
        userId: activeUserId,
        fromDate,
        toDate,
      }),
    );
  }, [dispatch, activeUserId, fromDate, toDate, dateRangeError]);

  const fetchOperationRiskQueue = useCallback(() => {
    if (!activeUserId) return;

    const upcomingDays =
      fromDate && toDate
        ? Math.max(
            1,
            Math.ceil(
              (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24),
            ),
          )
        : 30;

    dispatch(
      getOperationRiskQueue({
        userId: activeUserId,
        upcomingDays,
        limit: 5,
      }),
    );
  }, [dispatch, activeUserId, fromDate, toDate]);

  const fetchStatusWiseSummary = useCallback(() => {
    if (!activeUserId || !fromDate || !toDate || dateRangeError) return;

    dispatch(getStatusWiseSummary({ userId: activeUserId, fromDate, toDate }));
  }, [dispatch, activeUserId, fromDate, toDate, dateRangeError]);

  const fetchTeamWorkload = useCallback(() => {
    if (!activeUserId || !fromDate || !toDate || dateRangeError) return;

    dispatch(getTeamWorkload({ userId: activeUserId, fromDate, toDate }));
  }, [dispatch, activeUserId, fromDate, toDate, dateRangeError]);

  const fetchMilestoneOverview = useCallback(() => {
    if (!activeUserId || !fromDate || !toDate || dateRangeError) return;

    dispatch(getMilestoneOverview({ userId: activeUserId, fromDate, toDate }));
  }, [dispatch, activeUserId, fromDate, toDate, dateRangeError]);

  const fetchRecentActivities = useCallback(() => {
    if (!activeUserId) return;
    dispatch(getRecentProjectActivities({ userId: activeUserId, limit: 5 }));
  }, [dispatch, activeUserId]);

  useEffect(() => {
    if (!activeUserId) return;

    fetchProjectOverview();
    fetchUserProjectDashboard();
    fetchOperationRiskQueue();
    fetchStatusWiseSummary();
    fetchTeamWorkload();
    fetchMilestoneOverview();
    fetchRecentActivities();
  }, [
    fetchProjectOverview,
    fetchUserProjectDashboard,
    fetchOperationRiskQueue,
    fetchStatusWiseSummary,
    fetchTeamWorkload,
    fetchMilestoneOverview,
    fetchRecentActivities,
    activeUserId,
  ]);

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
            {/* NEW: team member selector */}
            {dashboardUsers.length > 0 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    variant="bordered"
                    className="h-8 rounded-lg border-slate-200 text-xs"
                    startContent={<Users size={14} />}
                    endContent={<ChevronDown size={14} />}
                  >
                    {selectedUser ? selectedUser.name : "Select User"}
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  aria-label="Select team member"
                  onAction={(key) => {
                    if (key === "self") {
                      setSelectedUser(null);
                      return;
                    }

                    const person = dashboardUsers.find(
                      (user) => String(user.id) === key,
                    );

                    if (person) {
                      setSelectedUser(person);
                    }
                  }}
                >
                  <DropdownItem key="self">Select User</DropdownItem>
                  {dashboardUsers.map((person) => (
                    <DropdownItem key={String(person.id)}>
                      {person.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label
                    htmlFor="dashboard-from-date"
                    className="mb-0.5 text-[10px] font-medium text-slate-600"
                  >
                    From
                  </label>
                  <div className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2">
                    <CalendarDays
                      size={14}
                      className="shrink-0 text-slate-500"
                    />
                    <input
                      id="dashboard-from-date"
                      type="date"
                      value={fromDate}
                      max={toDate || undefined}
                      onChange={(e) => handleFromDateChange(e.target.value)}
                      className="w-[118px] border-none bg-transparent text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="dashboard-to-date"
                    className="mb-0.5 text-[10px] font-medium text-slate-600"
                  >
                    To
                  </label>
                  <div className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2">
                    <CalendarDays
                      size={14}
                      className="shrink-0 text-slate-500"
                    />
                    <input
                      id="dashboard-to-date"
                      type="date"
                      value={toDate}
                      min={fromDate || undefined}
                      onChange={(e) => handleToDateChange(e.target.value)}
                      className="w-[118px] border-none bg-transparent text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {dateRangeError && (
                <p className="text-[10px] font-medium text-red-600">
                  {dateRangeError}
                </p>
              )}
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
            userId={activeUserId}
            onRetry={fetchUserProjectDashboard}
          />
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-2 2xl:grid-cols-[1fr_1fr_0.9fr]">
          <StatusWiseSummaryChart
            items={statusWiseSummary}
            loading={sharedLoading}
          />
          <MilestoneOverview
            items={milestoneOverviewData}
            loading={sharedLoading}
          />
          <ProjectStatusOverview
            cards={projectOverviewCards}
            totalProjects={projectOverviewData?.totalProjects || 0}
            loading={projectOverviewLoading}
            error={projectOverviewError}
            userId={activeUserId}
            onRetry={fetchProjectOverview}
          />
          <DepartmentWorkload items={teamWorkload} loading={sharedLoading} />
          <DueProjects items={riskQueue} loading={sharedLoading} />
          <div className="space-y-2">
            {/* <MilestoneDefinitionCard /> */}
            <RecentActivities
              items={recentProjectActivities}
              loading={sharedLoading}
            />
          </div>
        </div>

        <div className="mt-2">
          <ProjectsTable
            projects={trackerContent}
            loading={sharedLoading}
            pageInfo={trackerPageInfo}
            onPrevPage={() => setTrackerPage((p) => Math.max(0, p - 1))}
            onNextPage={() => setTrackerPage((p) => p + 1)}
          />
        </div>
      </div>
    </div>
  );
}
