import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  Banknote,
  Building,
  Building2,
  Calendar,
  ClipboardCheck,
  EllipsisVertical,
  FileText,
  FolderOpen,
  GitFork,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  UserCog,
  User2,
} from "lucide-react";
import dayjs from "dayjs";
import { inrCurrency, statusColors } from "../../common";
import {
  formatBadgeText,
  getInitials,
  getPriorityBadgeClass,
  getRatingBadgeClass,
} from "./projectDetailsUtils";

// Project title/summary card + the "more actions" dropdown menu (vendor,
// purchase orders, procurement/milestone acknowledgements, documents,
// client login credentials, comment).
const ProjectSummaryHeader = ({
  projectDetails,
  milestonesCount,
  selectedMilestone,
  department,
  adminRole,
  isProcurementMilestone,
  onOpenVendor,
  onOpenPurchaseOrders,
  onOpenProcurementAcknowledgement,
  onOpenMilestoneAcknowledgements,
  onOpenDocuments,
  onOpenClientCredentials,
  onOpenComment,
}) => {
  return (
    <section className="border-b border-default-200 bg-background pb-2.5">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Chip
              size="sm"
              color="primary"
              variant="flat"
              className="h-5 text-[10.5px]"
            >
              Project Detail
            </Chip>

            {selectedMilestone?.status && (
              <Chip
                size="sm"
                color={statusColors[selectedMilestone?.status] || "default"}
                variant="flat"
                className="h-5 text-[10.5px]"
              >
                {selectedMilestone?.status}
              </Chip>
            )}
          </div>

          <div className="flex flex-col gap-0.5 2xl:flex-row 2xl:items-baseline 2xl:gap-3">
            <h1 className="font-sans text-base font-semibold shrink-0">
              {projectDetails?.name || "Project"}
            </h1>

            <p className="text-[11px] font-medium text-default-500">
              {projectDetails?.projectNo || "-"}
              {(projectDetails?.createdDate || projectDetails?.date) &&
                ` • Created: ${dayjs(
                  projectDetails?.createdDate || projectDetails?.date,
                ).format("DD-MM-YYYY")}`}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-default-600">
              <Building className="h-3.5 w-3.5 text-default-400" />
              <span className="text-default-400">Company:</span>

              <span className="font-medium text-foreground">
                {projectDetails?.companyName || "-"}
              </span>

              {projectDetails?.rating && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 ${getRatingBadgeClass(
                    projectDetails?.rating,
                  )}`}
                >
                  {formatBadgeText(projectDetails?.rating)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-default-600">
              <Building className="h-3.5 w-3.5 text-default-400" />
              <span className="text-default-400">Company unit:</span>

              <span className="font-medium text-foreground">
                {projectDetails?.companyUnitName || "-"}
              </span>

              {projectDetails?.priority && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 ${getPriorityBadgeClass(
                    projectDetails?.priority,
                  )}`}
                >
                  {formatBadgeText(projectDetails?.priority)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-default-600">
              <Calendar className="h-3.5 w-3.5 text-default-400" />
              <span className="text-default-400">Updated:</span>
              <span className="font-medium text-foreground">
                {projectDetails?.updatedDate
                  ? dayjs(projectDetails?.updatedDate).format("DD-MM-YYYY")
                  : "-"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-default-600">
              <GitFork className="h-3.5 w-3.5 text-default-400" />
              <span className="text-default-400">Milestones:</span>
              <span className="font-medium text-foreground">
                {milestonesCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-default-600">
              <User2 className="h-3.5 w-3.5 text-default-400" />
              <span className="text-default-400">Assignee:</span>
              <span className="font-medium text-foreground">
                {selectedMilestone?.assignedUser?.fullName || "Unassigned"}
              </span>
            </div>

            {(department === "Procurement" || adminRole) && (
              <div className="flex items-center gap-1.5 text-default-600">
                <Banknote className="h-3.5 w-3.5 text-default-400" />
                <span className="text-default-400">Paid amount:</span>
                <span className="font-medium text-foreground">
                  {inrCurrency(projectDetails?.paidAmount) || "NA"}
                </span>
              </div>
            )}
            {(department === "Procurement" || adminRole) && (
              <div className="flex items-center gap-1.5 text-default-600">
                <Banknote className="h-3.5 w-3.5 text-default-400" />
                <span className="text-default-400">Total amount:</span>
                <span className="font-medium text-foreground">
                  {inrCurrency(projectDetails?.totalAmount) || "NA"}
                </span>
              </div>
            )}
          </div>

          {projectDetails?.address && (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-default-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-default-400" />
              <span className="break-words">
                {[
                  projectDetails?.address,
                  projectDetails?.city,
                  projectDetails?.state,
                  projectDetails?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>
          )}

          {(department === "CRT" || adminRole) &&
            projectDetails?.contacts?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-default-100 pt-2 text-xs">
                {projectDetails?.contacts?.map((contact, index) => (
                  <div
                    key={`${contact?.contactNo || contact?.emails || index}`}
                    className="flex min-w-[240px] flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="sm"
                        name={getInitials(contact?.name)}
                        className="bg-primary-100 text-primary"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold capitalize text-foreground">
                          {`${contact?.title || ""} ${contact?.name || ""}`.trim() ||
                            "N/A"}
                        </p>
                        <p className="truncate text-[11px] text-default-500">
                          {contact?.designation || "Client Contact"}
                        </p>
                      </div>
                    </div>

                    <div className="ml-8 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-default-600">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {contact?.contactNo || "N/A"}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {contact?.emails || "N/A"}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="flex w-full items-center justify-end gap-2 xl:w-auto">
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                radius="md"
                variant="flat"
                aria-label="More actions"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Project actions">
              {isProcurementMilestone &&
                (department === "Procurement" || adminRole) && (
                  <DropdownItem
                    key="vendor"
                    startContent={<Building2 className="h-3.5 w-3.5" />}
                    onPress={onOpenVendor}
                  >
                    Vendor
                  </DropdownItem>
                )}

              {isProcurementMilestone &&
                (department === "Procurement" || adminRole) && (
                  <DropdownItem
                    key="purchaseOrders"
                    startContent={<Receipt className="h-3.5 w-3.5" />}
                    onPress={onOpenPurchaseOrders}
                  >
                    Purchase Orders
                  </DropdownItem>
                )}

              {isProcurementMilestone &&
                (department === "Procurement" || adminRole) && (
                  <DropdownItem
                    key="acknowledgement"
                    startContent={<FolderOpen className="h-3.5 w-3.5" />}
                    onPress={onOpenProcurementAcknowledgement}
                  >
                    Procurement Acknowledgement
                  </DropdownItem>
                )}

              <DropdownItem
                key="milestoneAcknowledgements"
                startContent={<ClipboardCheck className="h-3.5 w-3.5" />}
                onPress={onOpenMilestoneAcknowledgements}
              >
                Milestone Acknowledgements
              </DropdownItem>

              <DropdownItem
                key="documents"
                startContent={<FileText className="h-3.5 w-3.5" />}
                onPress={onOpenDocuments}
              >
                Documents
              </DropdownItem>

              <DropdownItem
                key="clientLoginCredentials"
                startContent={<UserCog className="h-3.5 w-3.5" />}
                onPress={onOpenClientCredentials}
              >
                Client login credentials
              </DropdownItem>

              <DropdownItem
                key="comment"
                startContent={<MessageSquare className="h-3.5 w-3.5" />}
                onPress={onOpenComment}
              >
                Comment
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </section>
  );
};

export default ProjectSummaryHeader;
