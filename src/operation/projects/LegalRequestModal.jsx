import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import FileUploader from "../../components/FileUploader";

const EMPTY_LEGAL_REQUEST = {
  legalRequestTitle: "",
  notes: "",
  documents: [],
  tatInDays: "",
  tatReason: "",
};

const LegalRequestModal = ({
  isOpen,
  onOpenChange,
  selectedMilestone,
  legalRequestData,
  setLegalRequestData,
  onSaveLegalDocs,
  onAppendLegalDoc,
  setIsLegalDocUploading,
  onSubmit,
}) => {
  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);

        if (!open) {
          setLegalRequestData(EMPTY_LEGAL_REQUEST);
        }
      }}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[88vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <form
            className="flex max-h-[88vh] w-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
              Legal Request
              {selectedMilestone?.milestoneName && (
                <span className="text-xs font-normal text-default-500">
                  Milestone: {selectedMilestone.milestoneName}
                </span>
              )}
            </ModalHeader>

            <ModalBody className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Request title"
                  name="legalRequestTitle"
                  isRequired
                  placeholder="Enter request title"
                  errorMessage="Please enter request title"
                  value={legalRequestData.legalRequestTitle}
                  onChange={(e) =>
                    setLegalRequestData((prev) => ({
                      ...prev,
                      legalRequestTitle: e.target.value,
                    }))
                  }
                />

                <Textarea
                  label="Status Reason"
                  name="statusReason"
                  minRows={2}
                  maxRows={4}
                  placeholder="Enter status reason"
                  value={legalRequestData.statusReason}
                  onChange={(e) =>
                    setLegalRequestData((prev) => ({
                      ...prev,
                      statusReason: e.target.value,
                    }))
                  }
                />

                <FileUploader
                  label="Document Attachments"
                  placeholder="Upload legal request documents"
                  uploadingType="multiple"
                  value={legalRequestData.documents || []}
                  onChange={(uploadedFiles) => {
                    console.log("LEGAL REQUEST UPLOADER RAW:", uploadedFiles);
                    onSaveLegalDocs(uploadedFiles);
                  }}
                  onUploadSuccess={(fileMeta) => {
                    console.log("LEGAL REQUEST UPLOAD SUCCESS:", fileMeta);
                    onAppendLegalDoc(fileMeta);
                  }}
                  onUploadingChange={setIsLegalDocUploading}
                />

                <Textarea
                  label="Request description"
                  name="notes"
                  isRequired
                  minRows={4}
                  maxRows={6}
                  placeholder="Enter request description"
                  errorMessage="Please enter description"
                  value={legalRequestData.notes}
                  onChange={(e) =>
                    setLegalRequestData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </ModalBody>

            <ModalFooter className="shrink-0 border-t border-default-200 bg-background">
              <Button
                type="button"
                variant="light"
                onPress={() => {
                  setLegalRequestData(EMPTY_LEGAL_REQUEST);
                  onClose();
                }}
              >
                Close
              </Button>

              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LegalRequestModal;
