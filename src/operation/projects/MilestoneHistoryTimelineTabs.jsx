import { Chip, Tab, Tabs } from "@heroui/react";
import { Activity, ArrowRight, Flag, UserCog } from "lucide-react";
import dayjs from "dayjs";
import { statusColors } from "../../common";
import {
  formatEnumLabel,
  getStatusBadgeClass,
  TIMELINE_EVENT_ICONS,
} from "./projectDetailsUtils";

// The "History" (milestone assignment/status changes) and "Timeline"
// (whole-project event log) tabs shown under the selected milestone's
// detail panel.
const MilestoneHistoryTimelineTabs = ({
  detailPanelTab,
  setDetailPanelTab,
  milestoneTimeline,
  projectTimelineEvents,
  projectTimelineLoading,
}) => {
  return (
    <div className="pt-3">
      <Tabs
        aria-label="Milestone history and project timeline"
        selectedKey={detailPanelTab}
        onSelectionChange={setDetailPanelTab}
        variant="underlined"
        size="sm"
        classNames={{
          base: "w-full",
          tabList: "gap-4 px-0",
          panel: "px-0 pb-0",
        }}
      >
        <Tab key="history" title="History">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                History
              </p>
              <p className="text-[11px] text-default-500">
                Assignment changes and status updates for this milestone
              </p>
            </div>

            <span className="text-[11px] font-medium text-default-500">
              {milestoneTimeline.length} update
              {milestoneTimeline.length === 1 ? "" : "s"}
            </span>
          </div>

          {milestoneTimeline.length > 0 ? (
            <div className="relative space-y-0 before:absolute before:left-3 before:top-1 before:h-[calc(100%-8px)] before:w-px before:bg-default-200">
              {milestoneTimeline.map((event, index) => {
                if (event.kind === "status") {
                  const color = statusColors[event.newStatus] || "default";

                  return (
                    <div
                      key={`status-${event.date}-${index}`}
                      className="relative flex gap-2.5 py-2"
                    >
                      <div
                        className={`z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${getStatusBadgeClass(color)}`}
                      >
                        <Flag className="h-3 w-3" />
                      </div>

                      <div className="min-w-0 flex-1 pb-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11.5px] font-medium text-default-500">
                              {formatEnumLabel(event.previousStatus)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-default-400" />
                            <Chip
                              size="sm"
                              variant="flat"
                              color={color}
                              className="h-5 px-1.5 text-[10.5px]"
                            >
                              {formatEnumLabel(event.newStatus)}
                            </Chip>
                          </div>

                          <span className="text-[10.5px] font-medium text-default-400">
                            {event.date
                              ? dayjs(event.date).format(
                                  "DD MMM YYYY, hh:mm A",
                                )
                              : "-"}
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] text-default-600">
                          by{" "}
                          <span className="font-medium text-foreground">
                            {event.changedByName || "-"}
                          </span>
                          {event.reason?.trim() && (
                            <span className="text-default-500">
                              {" "}
                              · "{event.reason.trim()}"
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`assignment-${event.date}-${index}`}
                    className="relative flex gap-2.5 py-2"
                  >
                    <div className="z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
                      <UserCog className="h-3 w-3" />
                    </div>

                    <div className="min-w-0 flex-1 pb-0.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="break-words text-[11.5px] font-semibold text-foreground">
                          {event.reason?.trim() || "Reassigned"}
                        </p>

                        <span className="text-[10.5px] font-medium text-default-400">
                          {event.date
                            ? dayjs(event.date).format("DD MMM YYYY, hh:mm A")
                            : "-"}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-default-600">
                        Assigned to{" "}
                        <span className="font-medium text-foreground">
                          {event.assignedToName || "Unassigned"}
                        </span>{" "}
                        by{" "}
                        <span className="font-medium text-foreground">
                          {event.assignedByName || "-"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-foreground">
                No history found
              </p>
              <p className="mt-1 text-[11px] text-default-500">
                History will appear here once this milestone is updated.
              </p>
            </div>
          )}
        </Tab>

        <Tab key="timeline" title="Timeline">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Timeline
              </p>
              <p className="text-[11px] text-default-500">
                Complete history of events for this project
              </p>
            </div>

            <span className="text-[11px] font-medium text-default-500">
              {projectTimelineEvents.length} event
              {projectTimelineEvents.length === 1 ? "" : "s"}
            </span>
          </div>

          {projectTimelineLoading ? (
            <div className="py-8 text-center">
              <p className="text-[11px] text-default-500">
                Loading timeline...
              </p>
            </div>
          ) : projectTimelineEvents.length > 0 ? (
            <div className="relative space-y-0 before:absolute before:left-3 before:top-1 before:h-[calc(100%-8px)] before:w-px before:bg-default-200">
              {projectTimelineEvents.map((event, index) => {
                const color = statusColors[event?.newValue] || "default";
                const EventIcon =
                  TIMELINE_EVENT_ICONS[event?.eventType] || Activity;

                return (
                  <div
                    key={event?.id ?? `timeline-${index}`}
                    className="relative flex gap-2.5 py-2"
                  >
                    <div
                      className={`z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${getStatusBadgeClass(color)}`}
                    >
                      <EventIcon className="h-3 w-3" />
                    </div>

                    <div className="min-w-0 flex-1 pb-0.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="break-words text-[11.5px] font-semibold text-foreground">
                          {event?.eventTitle ||
                            formatEnumLabel(event?.eventType)}
                        </p>

                        <span className="text-[10.5px] font-medium text-default-400">
                          {event?.occurredAt
                            ? dayjs(event.occurredAt).format(
                                "DD MMM YYYY, hh:mm A",
                              )
                            : "-"}
                        </span>
                      </div>

                      {event?.newValue && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {event?.previousValue && (
                            <>
                              <span className="text-[11.5px] font-medium text-default-500">
                                {formatEnumLabel(event.previousValue)}
                              </span>
                              <ArrowRight className="h-3 w-3 text-default-400" />
                            </>
                          )}

                          <Chip
                            size="sm"
                            variant="flat"
                            color={color}
                            className="h-5 px-1.5 text-[10.5px]"
                          >
                            {formatEnumLabel(event.newValue)}
                          </Chip>
                        </div>
                      )}

                      {event?.description && (
                        <p className="mt-1 text-[11px] text-default-600">
                          {event.description}
                        </p>
                      )}

                      {(event?.newAssigneeName ||
                        event?.previousAssigneeName) && (
                        <p className="mt-1 text-[11px] text-default-600">
                          Assigned to{" "}
                          <span className="font-medium text-foreground">
                            {event?.newAssigneeName || "Unassigned"}
                          </span>
                          {event?.previousAssigneeName && (
                            <span className="text-default-500">
                              {" "}
                              (was {event.previousAssigneeName})
                            </span>
                          )}
                        </p>
                      )}

                      <p className="mt-1 text-[11px] text-default-600">
                        {event?.milestoneName && (
                          <span className="text-default-500">
                            {event.milestoneName} ·{" "}
                          </span>
                        )}
                        by{" "}
                        <span className="font-medium text-foreground">
                          {event?.performedByName ||
                            event?.triggeredByName ||
                            "System"}
                        </span>
                        {event?.reason?.trim() && (
                          <span className="text-default-500">
                            {" "}
                            · "{event.reason.trim()}"
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-foreground">
                No timeline events found
              </p>
              <p className="mt-1 text-[11px] text-default-500">
                Events will appear here as this project progresses.
              </p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default MilestoneHistoryTimelineTabs;
