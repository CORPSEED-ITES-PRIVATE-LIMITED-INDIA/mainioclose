import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { X } from "lucide-react";

const PortalStatusModal = ({
  isOpen,
  onOpenChange,
  selectedPortalDetail,
  portalStatusData,
  setPortalStatusData,
  onPortalStatusRemarksChange,
  onSubmit,
}) => {
  return (
    <Modal size="lg" isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <Form onSubmit={onSubmit}>
            <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200 w-full">
              <div>
                <p className="text-base font-semibold">Update portal status</p>
                <p className="text-xs font-normal text-default-500">
                  Approve or reject client portal login details with remarks.
                </p>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="full"
                onPress={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </ModalHeader>

            <ModalBody className="w-full gap-4">
              <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                  Portal
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedPortalDetail?.portalName || "-"}
                </p>

                <p className="mt-1 break-all text-xs text-default-500">
                  {selectedPortalDetail?.portalUrl || "-"}
                </p>
              </div>

              <Select
                label="Status"
                name="status"
                isRequired
                selectedKeys={
                  portalStatusData.status ? [portalStatusData.status] : []
                }
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];

                  setPortalStatusData((prev) => ({
                    ...prev,
                    status: value,
                  }));
                }}
              >
                <SelectItem key="APPROVED">APPROVED</SelectItem>
                <SelectItem key="REJECTED">REJECTED</SelectItem>
              </Select>

              <Textarea
                label="Approval remarks"
                name="approvalRemarks"
                isRequired
                minRows={4}
                placeholder="Enter approval/rejection remarks..."
                value={portalStatusData.approvalRemarks}
                onChange={onPortalStatusRemarksChange}
              />
            </ModalBody>

            <ModalFooter className="border-t border-default-200">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>

              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PortalStatusModal;
