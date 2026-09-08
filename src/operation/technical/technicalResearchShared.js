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

/**
 * The technical-research service serialises status/priority as UPPER_SNAKE
 * (`ASSIGNED`, `MEDIUM`) on every response, and the list endpoint's `status`
 * filter only accepts that form — the display labels its OpenAPI schema
 * advertises ("In Progress") make it return 500. The status-update endpoint
 * accepts either, so UPPER_SNAKE is used throughout.
 */
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

/**
 * Status picker for the update-status modal: the filter list without "ALL".
 *
 * Every status is offered because the service owns the transition rules and
 * does not expose them (there is no "allowed transitions" endpoint), so an
 * illegal move comes back as a readable 400 - "Status cannot be changed from
 * In Progress to Assigned" - which the modal surfaces as-is.
 */
export const STATUS_UPDATE_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.key !== "--",
).map((option) => ({ id: option.key, name: option.label }));

/** Free-text `reason` is capped at 2000 characters by the service. */
export const STATUS_REASON_MAX_LENGTH = 2000;

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

/**
 * Departments allowed to change a research case's status or assignee.
 *
 * The nav map in Layoutpage treats "technical" and "operations" as one team
 * (both get the same Operations nav, which is where this page lives) and this
 * backend only has an "Operations" department, so both names are accepted.
 * Narrow this to ["technical"] if the two are ever split apart.
 */
export const RESEARCH_MANAGING_DEPARTMENTS = ["technical", "operations"];

export const canManageResearchCases = (department, isAdmin = false) => {
  if (isAdmin) return true;

  const name = department?.trim()?.toLowerCase();
  return RESEARCH_MANAGING_DEPARTMENTS.includes(name);
};
