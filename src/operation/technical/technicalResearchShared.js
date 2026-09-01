export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const formatStatusLabel = (value) =>
  value
    ? value
        .split("_")
        .map((word) => capitalize(word))
        .join(" ")
    : "-";

export const STATUS_OPTIONS = [
  { key: "--", label: "ALL" },
  { key: "PENDING_ASSIGNMENT", label: "Pending Assignment" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "AWAITING_INFORMATION", label: "Awaiting Information" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "REVISION_REQUIRED", label: "Revision Required" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CANCELLED", label: "Cancelled" },
];

export const PRIORITY_OPTIONS = [
  { key: "--", label: "ALL" },
  { key: "LOW", label: "Low" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HIGH", label: "High" },
  { key: "CRITICAL", label: "Critical" },
];

export const STATUS_COLOR_CODE = {
  PENDING_ASSIGNMENT: "warning",
  ASSIGNED: "primary",
  IN_PROGRESS: "secondary",
  AWAITING_INFORMATION: "warning",
  UNDER_REVIEW: "primary",
  REVISION_REQUIRED: "warning",
  COMPLETED: "success",
  REJECTED: "danger",
  CANCELLED: "default",
};

export const PRIORITY_COLOR_CODE = {
  LOW: "default",
  MEDIUM: "primary",
  HIGH: "warning",
  CRITICAL: "danger",
};
