import {
  Button,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/react";
import { Download, FileText, User2 } from "lucide-react";
import dayjs from "dayjs";

/**
 * Shows the acknowledgement uploaded while completing every milestone of a
 * project (GET /operationService/api/milestone-assignments/{projectId}/completion-acknowledgements).
 */
const MilestoneAcknowledgementsDrawer = ({
  isOpen,
  onOpenChange,
  loading,
  acknowledgements = [],
}) => {
  const sortedAcknowledgements = [...(acknowledgements || [])].sort(
    (a, b) => (a.milestoneOrder || 0) - (b.milestoneOrder || 0),
  );

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      hideCloseButton
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 px-6 py-5">
              <div className="flex w-full items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Milestone Acknowledgements
                  </h2>
                  <p className="mt-1 text-sm text-default-500">
                    Acknowledgements uploaded while completing each milestone
                    of this project.
                  </p>
                </div>

                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </div>
            </DrawerHeader>

            <DrawerBody className="bg-default-50 px-6 py-6">
              {loading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <p className="text-sm text-default-500">
                    Loading acknowledgements...
                  </p>
                </div>
              ) : sortedAcknowledgements.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-default-300 bg-white">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-default-300" />
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      No acknowledgements yet
                    </p>
                    <p className="mt-1 text-xs text-default-500">
                      They will appear here once milestones are completed with
                      an acknowledgement attachment.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {sortedAcknowledgements.map((item) => (
                    <div
                      key={item.historyId}
                      className="rounded-xl border border-default-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Chip size="sm" variant="flat" color="primary">
                            {item.milestoneOrder
                              ? `#${item.milestoneOrder}`
                              : "-"}
                          </Chip>
                          <span className="text-sm font-semibold text-foreground">
                            {item.milestoneName || "-"}
                          </span>
                        </div>
                        <span className="text-xs text-default-400">
                          {item.completedAt
                            ? dayjs(item.completedAt).format(
                                "DD MMM YYYY, hh:mm A",
                              )
                            : "-"}
                        </span>
                      </div>

                      {item.completionReason && (
                        <p className="mt-2 text-xs text-default-600">
                          <span className="font-medium text-default-500">
                            Reason:{" "}
                          </span>
                          {item.completionReason}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-default-500">
                        <User2 className="h-3.5 w-3.5" />
                        Completed by {item.completedByName || "-"}
                      </div>

                      {item.acknowledgementAttachmentUrl && (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-default-200 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-default-400" />
                            <span
                              className="truncate text-xs font-medium text-foreground"
                              title={item.acknowledgementAttachmentName}
                            >
                              {item.acknowledgementAttachmentName ||
                                "Attachment"}
                            </span>
                          </div>

                          <a
                            href={item.acknowledgementAttachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default MilestoneAcknowledgementsDrawer;
