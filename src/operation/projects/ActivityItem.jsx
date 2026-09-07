import { useState } from "react";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import CommentThread from "./CommentThread";
import ExpenseActivityDetails from "./ExpenseActivityDetails";
import {
  ACTIVITY_TYPE_META,
  DEFAULT_ACTIVITY_TYPE_META,
  formatEnumLabel,
} from "./projectDetailsUtils";

// Renders a single entry in the project activity feed (comment, note, or
// expense). Also imported directly by ProjectActivities.jsx.
export const ActivityItem = ({ activity, onReply }) => {
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const details = activity?.details;

  const typeMeta =
    ACTIVITY_TYPE_META[activity?.activityType] || DEFAULT_ACTIVITY_TYPE_META;
  const TypeIcon = typeMeta.icon;

  const renderContent = () => {
    switch (activity.activityType) {
      case "COMMENT":
        return (
          <div className="group">
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-default-700">
              {details?.commentText || activity.summary || "-"}
            </p>

            <button
              type="button"
              onClick={() => onReply(details?.id)}
              className="mt-1 text-xs font-medium text-primary opacity-80 hover:opacity-100"
            >
              Reply
            </button>

            {details?.children?.length > 0 && (
              <div className="mt-3 border-l border-default-200 pl-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-default-400">
                  Replies
                </p>

                {details.children.map((child) => (
                  <CommentThread
                    key={child.id}
                    comment={child}
                    onReply={onReply}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "NOTE":
        return (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-default-700">
            {details?.noteText || activity.summary || "-"}
          </p>
        );

      case "EXPENSE":
        return (
          <div className="mt-1">
            <p className="text-sm text-default-700">
              {activity.summary || "-"}
            </p>

            {details && (
              <>
                <button
                  type="button"
                  onClick={() => setShowExpenseDetails((previous) => !previous)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-80 hover:opacity-100"
                >
                  {showExpenseDetails ? "Hide details" : "View details"}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      showExpenseDetails ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showExpenseDetails && (
                  <ExpenseActivityDetails details={details} />
                )}
              </>
            )}
          </div>
        );

      default:
        return activity.summary ? (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-default-700">
            {activity.summary}
          </p>
        ) : null;
    }
  };

  return (
    <div className="relative flex gap-3 border-b border-default-100 py-3 text-xs last:border-b-0">
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${typeMeta.accent}`}
      >
        <TypeIcon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-foreground">
            {activity.title || formatEnumLabel(activity.activityType)}
          </span>
          <span className="rounded-full bg-default-100 px-2 py-0.5 text-[10px] font-medium text-default-600">
            {formatEnumLabel(activity.activityType)}
          </span>
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-default-500">
          <span className="font-medium text-default-600">
            {activity.createdByUserName || "-"}
          </span>
          <span>•</span>
          <span>
            {activity.activityDate
              ? dayjs(activity.activityDate).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </span>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ActivityItem;
