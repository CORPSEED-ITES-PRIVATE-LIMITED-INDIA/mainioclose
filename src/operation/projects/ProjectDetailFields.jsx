import { formatDateTime } from "./projectDetailsUtils";

// Small read-only "label + value" display atoms used throughout the
// ProjectDetails overview/detail cards.

export const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-default-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {value || "-"}
      </p>
    </div>
  );
};

export const DateItem = ({ label, value }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-default-200 bg-content1 p-4">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-default-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {formatDateTime(value)}
        </p>
      </div>
    </div>
  );
};
