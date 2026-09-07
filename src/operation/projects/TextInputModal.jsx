import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";

// Shared single-textarea "Add Comment" / "Add Note" style modal.
const TextInputModal = ({
  isOpen,
  onOpenChange,
  title,
  label,
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (!value?.trim()) return;
              onSubmit();
            }}
          >
            <ModalHeader>{title}</ModalHeader>
            <ModalBody className="w-full">
              <Textarea
                label={label}
                name={label}
                isRequired
                errorMessage={`Please enter ${label.toLowerCase()}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2 w-full">
              <Button onPress={onClose}>Close</Button>
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

export default TextInputModal;
