import { Chip } from "@heroui/react";
import { statusColors } from "../../common";

// Left-hand list of a project's milestones — selecting one loads its
// history/timeline in the detail panel.
const MilestoneSidebar = ({
  milestones,
  selectedMilestone,
  onSelectMilestone,
}) => {
  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-0 max-h-[calc(100vh-150px)] overflow-y-auto border-r border-default-200 pr-2.5">
        <div className="mb-2">
          <p className="text-sm font-semibold text-foreground">Milestones</p>
          <p className="text-[11px] text-default-500">
            Select a milestone to view its history
          </p>
        </div>

        <div className="divide-y divide-default-100">
          {milestones?.length > 0 ? (
            milestones.map((mile, index) => {
              const isActive =
                selectedMilestone?.milestoneId === mile?.milestoneId;

              return (
                <button
                  key={`${mile?.milestoneId || index}`}
                  type="button"
                  onClick={() => onSelectMilestone(mile)}
                  className={`w-full px-2 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary"
                      : "hover:bg-default-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold">
                        {mile?.milestoneName || "Milestone"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-default-500">
                        {mile?.assignedUser?.fullName
                          ? `Assigned to ${mile.assignedUser.fullName}`
                          : "Unassigned"}
                      </p>
                    </div>

                    <Chip
                      size="sm"
                      color={statusColors[mile?.status] || "default"}
                      variant="flat"
                      className="h-5 shrink-0 text-[10.5px]"
                    >
                      {mile?.status || "-"}
                    </Chip>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="py-5 text-center text-xs text-default-500">
              No milestones found
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default MilestoneSidebar;
