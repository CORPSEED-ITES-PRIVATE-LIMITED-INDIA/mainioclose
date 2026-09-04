import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { X } from "lucide-react";

const DeletePortalModal = ({
  isOpen,
  onOpenChange,
  selectedPortalDetail,
  onConfirmDelete,
}) => {
  return (
    <Modal size="md" isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200">
              <div>
                <p className="text-base font-semibold text-danger">
                  Delete portal details
                </p>
                <p className="text-xs font-normal text-default-500">
                  This will soft delete the selected portal login details.
                </p>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="full"
                onPress={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </ModalHeader>

            <ModalBody>
              <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {selectedPortalDetail?.portalName || "-"}
                </p>

                <p className="mt-1 break-all text-xs text-default-600">
                  {selectedPortalDetail?.portalUrl || "-"}
                </p>
              </div>

              <p className="text-sm text-default-600">
                Are you sure you want to delete this portal login detail?
              </p>
            </ModalBody>

            <ModalFooter className="border-t border-default-200">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>

              <Button color="danger" onPress={onConfirmDelete}>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeletePortalModal;
