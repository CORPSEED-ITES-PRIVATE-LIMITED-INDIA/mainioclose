import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { Link } from "react-router-dom";
import ActivityItem from "./ActivityItem";

// Comments / notes / expenses feed for the project (opened from the
// "Comment" dropdown item and from the "Comment"/"Note"/"Expense" buttons
// inside it, which each open their own modal).
const ActivityFeedDrawer = ({
  isOpen,
  onOpenChange,
  activityType,
  onFilterChange,
  onOpenCommentModal,
  onOpenNoteModal,
  onOpenExpenseModal,
  activities,
  onReply,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      classNames={{
        base: "h-screen max-h-screen",
      }}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="border-b border-default-200">
              <div className="flex w-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      Comments
                    </p>
                    <p className="text-xs text-default-500">
                      Comments, notes and expenses for this project
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Select
                    size="sm"
                    selectedKeys={[activityType]}
                    onSelectionChange={(keys) => {
                      onFilterChange(Array.from(keys)[0]);
                    }}
                    className="sm:max-w-[220px]"
                  >
                    <SelectItem key="ALL">All</SelectItem>
                    <SelectItem key="COMMENT">Comments</SelectItem>
                    <SelectItem key="NOTE">Notes</SelectItem>
                    <SelectItem key="EXPENSE">Expenses</SelectItem>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      radius="md"
                      variant="flat"
                      onPress={onOpenCommentModal}
                    >
                      Comment
                    </Button>
                    <Button
                      size="sm"
                      radius="md"
                      variant="flat"
                      onPress={onOpenNoteModal}
                    >
                      Note
                    </Button>
                    <Button
                      size="sm"
                      radius="md"
                      variant="flat"
                      onPress={onOpenExpenseModal}
                    >
                      Expense
                    </Button>
                  </div>
                </div>
              </div>
            </DrawerHeader>

            <DrawerBody className="min-h-0 flex-1 overflow-y-auto p-4">
              {activities?.length > 0 ? (
                <div className="divide-y divide-default-100">
                  {activities.map(
                    (activity) =>
                      activity && (
                        <ActivityItem
                          key={activity.activityId}
                          activity={activity}
                          onReply={onReply}
                        />
                      ),
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-10 text-center">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      No activity found
                    </p>
                    <p className="mt-1 text-sm text-default-500">
                      Add a comment, note or expense to start the timeline.
                    </p>
                  </div>
                </div>
              )}
            </DrawerBody>

            <DrawerFooter className="border-t border-default-200 bg-content1">
              <Button as={Link} variant="light" to={`activities`}>
                See All
              </Button>
              <Button color="primary" onPress={onClose}>
                Done
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default ActivityFeedDrawer;
