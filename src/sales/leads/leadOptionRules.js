// Which lead statuses and comments each department is allowed to pick.
//
// Both lists come from the server unfiltered (`/status/getAllStatus` and
// `/lead/getAllComments`), so the sales/quality split is applied here on the
// client. Names are matched on a normalised key rather than the raw string
// because the API spells a few of them differently from the way the business
// refers to them ("Hot Leads" vs "Hot Lead", "Awaiting Documents" vs
// "Awaiting Document"), and a plain equality check silently stopped filtering
// whenever one of those drifted.

const normalize = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/s$/, "");

const keysOf = (names) => new Set(names.map(normalize));

// Retired everywhere — neither sales nor quality may set these any more.
const RETIRED_STATUSES = keysOf(["Final Bad Fit", "Final Deal Lost", "Job Seeker"]);

const SALES_ONLY_STATUSES = keysOf([
  "Proposal Sent",
  "Hot Lead",
  "Awaiting Document",
  "Awaiting Payment",
  "Deal Won",
  "Meeting",
]);

const QUALITY_ONLY_STATUSES = keysOf(["Future Service", "Bad Fit"]);

// Quality works off the call outcome recorded by the IVR, so the three
// "couldn't reach them" comments are not theirs to log by hand.
const QUALITY_HIDDEN_COMMENTS = keysOf(["Busy", "Connect Later", "Switched Off"]);

export const OTHER_COMMENT = "Other";

export const SALES_DEPARTMENT = "Sales";
export const QUALITY_DEPARTMENT = "Quality Team";

const departmentKey = (department) =>
  String(department || "").trim().toLowerCase();

export const isSalesDepartment = (department) =>
  departmentKey(department) === departmentKey(SALES_DEPARTMENT);

export const isQualityDepartment = (department) =>
  departmentKey(department) === departmentKey(QUALITY_DEPARTMENT);

/**
 * Statuses the given department may move a lead to. Admins keep everything
 * except the retired statuses, the same way they bypass the department split
 * elsewhere on the lead screens.
 */
export const filterStatusesByDepartment = (statusList, department, isAdmin) =>
  (statusList || []).filter((status) => {
    const key = normalize(status?.name);

    if (RETIRED_STATUSES.has(key)) return false;
    if (isAdmin) return true;
    if (isSalesDepartment(department)) return !QUALITY_ONLY_STATUSES.has(key);
    if (isQualityDepartment(department)) return !SALES_ONLY_STATUSES.has(key);

    return true;
  });

const findOtherComment = (list) =>
  list.find((comment) => normalize(comment?.name) === normalize(OTHER_COMMENT));

/**
 * Comments the given department may log. Sales only ever writes a free-text
 * remark, so their list collapses to "Other" — which is also the entry that
 * reveals the remark box, so it is added back whenever the API leaves it out.
 */
export const filterCommentsByDepartment = (comments, department, isAdmin) => {
  const list = comments || [];

  if (!isAdmin && isSalesDepartment(department)) {
    return [findOtherComment(list) || { name: OTHER_COMMENT }];
  }

  const allowed =
    !isAdmin && isQualityDepartment(department)
      ? list.filter(
          (comment) => !QUALITY_HIDDEN_COMMENTS.has(normalize(comment?.name)),
        )
      : [...list];

  return findOtherComment(allowed)
    ? allowed
    : [...allowed, { name: OTHER_COMMENT }];
};

// Offered as a category before the free-text reason when a sales person
// rejects a lead assigned to them.
export const LEAD_REJECTION_REASONS = [
  "Investment Issue",
  "Not Interested",
  "Price Issue",
  "Service Not Required",
  "Already Applied",
  "Land Not Finalised",
  "Service Not applicable",
].map((name) => ({ name }));
