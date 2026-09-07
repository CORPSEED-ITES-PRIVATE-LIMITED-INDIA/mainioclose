import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";

const ReopenProjectModal = ({
  isOpen,
  onOpenChange,
  projectDetails,
  selectedMilestone,
  reopenData,
  setReopenData,
  responsibleMilestoneLoading,
  responsibleMilestoneOptions,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Reopen Project Request
              <span className="text-xs font-normal text-default-500">
                Raise reopen request from current milestone and select
                responsible milestone.
              </span>
            </ModalHeader>

            <ModalBody className="space-y-4">
              <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-default-400">
                      Project
                    </p>
                    <p className="font-semibold text-foreground">
                      {projectDetails?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-default-400">
                      Project No.
                    </p>
                    <p className="font-semibold text-foreground">
                      {projectDetails?.projectNo || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-default-400">
                      Detected At Milestone
                    </p>
                    <p className="font-semibold text-foreground">
                      {selectedMilestone?.milestoneName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-default-400">
                      Detected Assignment ID
                    </p>
                    <p className="font-semibold text-foreground">
                      {reopenData.detectedAtAssignmentId ||
                        selectedMilestone?.id ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              <Select
                label="Responsible Milestone"
                placeholder={
                  responsibleMilestoneLoading
                    ? "Loading milestones..."
                    : "Select responsible milestone"
                }
                isRequired
                isDisabled={responsibleMilestoneLoading}
                selectedKeys={
                  reopenData.responsibleAssignmentId
                    ? new Set([String(reopenData.responsibleAssignmentId)])
                    : new Set([])
                }
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)?.[0];

                  setReopenData((prev) => ({
                    ...prev,
                    responsibleAssignmentId: selected ? String(selected) : "",
                  }));
                }}
              >
                {(responsibleMilestoneOptions || []).map((mile) => (
                  <SelectItem
                    key={String(mile.assignmentId)}
                    textValue={`${mile.milestoneName} ${mile.assignmentId}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {mile.milestoneName || "-"}
                      </span>
                      <span className="text-xs text-default-500">
                        Assignment ID: {mile.assignmentId || "-"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Reason"
                isRequired
                minRows={4}
                placeholder="Enter reason for reopening this project..."
                value={reopenData.reason}
                onChange={(e) =>
                  setReopenData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>

              <Button color="warning" onPress={onSubmit}>
                Submit Reopen Request
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReopenProjectModal;
