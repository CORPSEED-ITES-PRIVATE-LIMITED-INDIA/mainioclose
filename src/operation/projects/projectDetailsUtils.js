import {
  Activity,
  Flag,
  MessageSquare,
  Receipt,
  StickyNote,
  UserCog,
} from "lucide-react";

// Shared formatting/color helpers used across ProjectDetails and the
// components it composes (activity feed, expense breakdown, vendor cards,
// milestone timeline, etc).

export const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case "VENDOR_FINALIZED":
      return "success";
    case "VENDOR_SHORTLISTED":
      return "warning";
    case "VENDOR_REQUIRED":
      return "danger";
    case "DRAFT":
      return "default";
    default:
      return "primary";
  }
};

// Full literal class strings (not template-interpolated) so Tailwind's
// scanner can find and generate every variant at build time.
export const STATUS_BADGE_CLASSES = {
  primary: "bg-primary-100 text-primary-600",
  secondary: "bg-secondary-100 text-secondary-600",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
  default: "bg-default-200 text-default-600",
};

export const getStatusBadgeClass = (colorKey) =>
  STATUS_BADGE_CLASSES[colorKey] || STATUS_BADGE_CLASSES.default;

export const TIMELINE_EVENT_ICONS = {
  PROJECT_STATUS_CHANGED: Flag,
  MILESTONE_STATUS_CHANGED: Flag,
  MILESTONE_ASSIGNEE_CHANGED: UserCog,
  MILESTONE_ASSIGNMENT_CHANGED: UserCog,
};

export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// ----------------------------------------------------------------------------
// Activity feed helpers (used by ActivityItem / ExpenseActivityDetails)
// ----------------------------------------------------------------------------

export const formatEnumLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const formatMoney = (amount, currencyCode = "INR") => {
  if (amount === null || amount === undefined || amount === "") return "-";

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "-";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode || "INR",
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currencyCode || "INR"} ${numericAmount.toFixed(2)}`;
  }
};

export const getApprovalChipColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    case "PENDING":
    case "PROCESSING":
      return "warning";
    case "ON_HOLD":
      return "secondary";
    default:
      return "default";
  }
};

export const getPaymentChipColor = (status) => {
  switch (status) {
    case "PAID":
      return "success";
    case "PENDING":
    case "PROCESSING":
      return "warning";
    case "PARTIALLY_PAID":
      return "secondary";
    case "FAILED":
    case "CANCELLED":
    case "REVERSED":
      return "danger";
    default:
      return "default";
  }
};

export const ACTIVITY_TYPE_META = {
  COMMENT: { icon: MessageSquare, accent: "text-primary bg-primary-50" },
  NOTE: { icon: StickyNote, accent: "text-warning-600 bg-warning-50" },
  EXPENSE: { icon: Receipt, accent: "text-success-600 bg-success-50" },
};

export const DEFAULT_ACTIVITY_TYPE_META = {
  icon: Activity,
  accent: "text-default-500 bg-default-100",
};

export const getRatingBadgeClass = (rating) => {
  const value = String(rating || "")
    .trim()
    .toLowerCase();

  if (value === "gold") {
    return "border border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (value === "silver") {
    return "border border-slate-200 bg-slate-50 text-slate-600";
  }

  if (value === "bronze") {
    return "border border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border border-slate-200 bg-slate-50 text-slate-500";
};

export const getPriorityBadgeClass = (priority) => {
  const value = String(priority || "")
    .trim()
    .toLowerCase();

  if (value === "normal") {
    return "border border-green-200 bg-green-50 text-green-700";
  }

  if (value === "high priority" || value === "high") {
    return "border border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (value === "critical") {
    return "border border-red-200 bg-red-50 text-red-700";
  }

  return "border border-slate-200 bg-slate-50 text-slate-500";
};

export const formatBadgeText = (value) => {
  if (!value) return "";
  return String(value).trim();
};

export const getFileNameFromUrl = (url = "") => {
  try {
    const cleanUrl = String(url).split("?")[0];
    const name = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
    return decodeURIComponent(name || "document");
  } catch {
    return "document";
  }
};
