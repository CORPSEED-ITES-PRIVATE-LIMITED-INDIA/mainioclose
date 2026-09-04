import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import NewSelect from "../../components/NewSelect";

const UpdateAssigneeModal = ({
  isOpen,
  onOpenChange,
  userListBydepartment,
  assigneeObj,
  setAssigneeObj,
  userId,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update assignee
            </ModalHeader>
            <ModalBody className="max-h-[90vh] overflow-auto">
              <NewSelect
                label={"Select assignee"}
                isRequired={true}
                data={userListBydepartment || []}
                labelKey={"fullName"}
                valueKey={"id"}
                value={assigneeObj?.newUserId}
                onChange={(e) => {
                  setAssigneeObj((prev) => ({
                    ...prev,
                    newUserId: e,
                    changedById: userId,
                  }));
                }}
              />
              <Textarea
                label={"Reason"}
                value={assigneeObj?.reassignmentReason}
                onChange={(e) => {
                  setAssigneeObj((prev) => ({
                    ...prev,
                    reassignmentReason: e.target.value,
                    changedById: userId,
                  }));
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={!assigneeObj?.newUserId}
                onPress={onSubmit}
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateAssigneeModal;
