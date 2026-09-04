import {
  Accordion,
  AccordionItem,
  Button,
  Chip,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Input,
} from "@heroui/react";
import { Download, FileText, FolderOpen, FolderPlus } from "lucide-react";
import FileUploader from "../../components/FileUploader";

// Rendered from the "Procurement Acknowledgement" dropdown item on the
// procurement milestone — lets Procurement upload/organize directories &
// certificates for the project.
const ProcurementDirectoriesDrawer = ({
  isOpen,
  onOpenChange,
  newDirectoryName,
  setNewDirectoryName,
  createDirectoryLoading,
  onCreateDirectory,
  projectDirectoriesLoading,
  projectDirectories,
  directoryUploadingId,
  onDirectoryDocumentUploadSuccess,
}) => {
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
                    Project Directories
                  </h2>
                  <p className="mt-1 text-sm text-default-500">
                    Upload and manage procurement documents & certificates for
                    this project.
                  </p>
                </div>

                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </div>
            </DrawerHeader>

            <DrawerBody className="bg-default-50 px-6 py-6">
              <div className="flex items-end gap-2 rounded-xl border border-default-200 bg-white p-3">
                <Input
                  size="sm"
                  label="New directory name"
                  placeholder="e.g. Lab Testing"
                  value={newDirectoryName}
                  onChange={(e) => setNewDirectoryName(e.target.value)}
                />
                <Button
                  size="sm"
                  color="primary"
                  className="shrink-0"
                  isLoading={createDirectoryLoading}
                  startContent={
                    !createDirectoryLoading && (
                      <FolderPlus className="h-3.5 w-3.5" />
                    )
                  }
                  onPress={onCreateDirectory}
                >
                  Add Directory
                </Button>
              </div>

              {projectDirectoriesLoading ? (
                <div className="mt-6 flex min-h-[200px] items-center justify-center">
                  <p className="text-sm text-default-500">
                    Loading directories...
                  </p>
                </div>
              ) : (projectDirectories || []).length === 0 ? (
                <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-default-300 bg-white">
                  <div className="text-center">
                    <FolderOpen className="mx-auto h-8 w-8 text-default-300" />
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      No directories yet
                    </p>
                    <p className="mt-1 text-xs text-default-500">
                      Create a directory above to start uploading documents.
                    </p>
                  </div>
                </div>
              ) : (
                <Accordion
                  className="mt-4 px-0"
                  variant="splitted"
                  selectionMode="multiple"
                >
                  {projectDirectories.map((directory) => (
                    <AccordionItem
                      key={directory.directoryId}
                      aria-label={directory.directoryName}
                      title={
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {directory.directoryName}
                          </span>
                          <Chip size="sm" variant="flat">
                            {directory.documents?.length || 0} file
                            {directory.documents?.length === 1 ? "" : "s"}
                          </Chip>
                        </div>
                      }
                      className="bg-white shadow-sm"
                    >
                      <div className="flex flex-col gap-2">
                        {(directory.documents || []).length === 0 ? (
                          <p className="text-xs text-default-400">
                            No documents uploaded yet.
                          </p>
                        ) : (
                          directory.documents.map((doc) => (
                            <div
                              key={doc.id || doc.uuid}
                              className="flex items-center justify-between gap-3 rounded-lg border border-default-200 px-3 py-2"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0 text-default-400" />
                                <span
                                  className="truncate text-xs font-medium text-foreground"
                                  title={doc.fileName}
                                >
                                  {doc.fileName || "-"}
                                </span>
                              </div>

                              {doc.url && (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  View
                                </a>
                              )}
                            </div>
                          ))
                        )}

                        <Divider className="my-1" />

                        <FileUploader
                          label="Upload documents"
                          placeholder="Drag & drop files here, paste, or choose files"
                          uploadingType="multiple"
                          onUploadSuccess={(fileMeta) =>
                            onDirectoryDocumentUploadSuccess(
                              directory.directoryId,
                              fileMeta,
                            )
                          }
                        />

                        {directoryUploadingId === directory.directoryId && (
                          <p className="text-xs text-primary">
                            Saving document to directory...
                          </p>
                        )}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default ProcurementDirectoriesDrawer;
