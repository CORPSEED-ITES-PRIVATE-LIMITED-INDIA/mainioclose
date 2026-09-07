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
import { Controller } from "react-hook-form";

const VerifyDocumentModal = ({
  isOpen,
  onOpenChange,
  control,
  errors,
  handleSubmit,
  onValidSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Verify Document</ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit(onValidSubmit)}
                className="flex flex-col gap-4"
              >
                <Controller
                  name="newStatus"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Select Status"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        field.onChange(value);
                      }}
                      isInvalid={!!errors.newStatus}
                      errorMessage={errors.newStatus?.message}
                    >
                      <SelectItem key="VERIFIED">VERIFIED</SelectItem>
                      <SelectItem key="REJECTED">REJECTED</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Remarks"
                      minRows={3}
                      isInvalid={!!errors.remarks}
                      errorMessage={errors.remarks?.message}
                    />
                  )}
                />

                <ModalFooter className="px-0">
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" type="submit">
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VerifyDocumentModal;
