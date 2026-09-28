import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { X } from "lucide-react";

// Accepts only http/https URLs, e.g. https://example.com or
// http://portal.example.com/login. Keep this in sync with the same helper
// in ClientPortalCredentialsModal.jsx (consider moving to a shared util).
const isValidPortalUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const EditPortalModal = ({
  isOpen,
  onOpenChange,
  editPortalData,
  onEditPortalChange,
  onSubmit,
}) => {
  return (
    <Modal
      size="3xl"
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <Form onSubmit={onSubmit}>
            <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200 w-full">
              <div>
                <p className="text-base font-semibold">
                  Update portal login details
                </p>
                <p className="text-xs font-normal text-default-500">
                  Update portal name, URL, username, password and remarks.
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

            <ModalBody className="w-full gap-4">
              <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Portal name"
                  name="portalName"
                  isRequired
                  value={editPortalData.portalName}
                  onChange={onEditPortalChange}
                />

                <Input
                  label="Portal URL"
                  name="portalUrl"
                  type="url"
                  isRequired
                  placeholder="https://example.com"
                  value={editPortalData.portalUrl}
                  onChange={onEditPortalChange}
                  validate={(value) => {
                    if (!value?.trim()) {
                      return "Please enter portal URL";
                    }

                    if (!isValidPortalUrl(value)) {
                      return "Please enter a valid URL, e.g. https://example.com";
                    }

                    return true;
                  }}
                />

                <Input
                  label="Username"
                  name="username"
                  isRequired
                  value={editPortalData.username}
                  onChange={onEditPortalChange}
                />

                <Input
                  label="Password"
                  name="password"
                  isRequired
                  value={editPortalData.password}
                  onChange={onEditPortalChange}
                />

                <Textarea
                  label="Remarks"
                  name="remarks"
                  isRequired
                  minRows={3}
                  value={editPortalData.remarks}
                  onChange={onEditPortalChange}
                  className="md:col-span-2"
                />
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-default-200">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>

              <Button color="primary" type="submit">
                Update
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditPortalModal;
