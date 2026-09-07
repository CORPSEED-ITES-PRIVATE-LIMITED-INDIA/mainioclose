import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { statusColorCode } from "../../common";

const ClientPortalCredentialsModal = ({
  isOpen,
  onOpenChange,
  isCredentials,
  setIsCredentials,
  credentials,
  onChange,
  onSubmit,
  clientLoginPortalCredentials,
  onOpenPortalStatusModal,
  onOpenEditPortalModal,
  onOpenDeletePortalModal,
}) => {
  return (
    <Modal
      size="4xl"
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      classNames={{
        base: "max-h-[92vh]",
        body: "py-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-start justify-between gap-3 border-b border-default-200">
              <div>
                <p className="text-base font-semibold">
                  {isCredentials
                    ? "Add client portal login credentials"
                    : "Client portal login credentials"}
                </p>
                <p className="text-xs font-normal text-default-500">
                  {isCredentials
                    ? "Add portal URL, username and password for client login."
                    : "View and approve/reject client portal login details."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isCredentials ? (
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setIsCredentials(false)}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setIsCredentials(true)}
                  >
                    Add Credentials
                  </Button>
                )}

                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </ModalHeader>

            <ModalBody>
              {isCredentials ? (
                <Form className="w-full" onSubmit={onSubmit}>
                  <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                    <Input
                      label="Portal name"
                      name="portalName"
                      isRequired
                      errorMessage="Please enter portal name"
                      value={credentials?.portalName}
                      onChange={onChange}
                    />

                    <Input
                      label="Portal URL"
                      name="portalUrl"
                      isRequired
                      errorMessage="Please enter portal URL"
                      value={credentials?.portalUrl}
                      onChange={onChange}
                    />

                    <Input
                      label="Username"
                      name="username"
                      isRequired
                      errorMessage="Please enter username"
                      value={credentials?.username}
                      onChange={onChange}
                    />

                    <Input
                      label="Password"
                      name="password"
                      isRequired
                      errorMessage="Please enter password"
                      value={credentials?.password}
                      onChange={onChange}
                    />

                    <Textarea
                      label="Remarks"
                      name="remarks"
                      isRequired
                      minRows={3}
                      errorMessage="Please enter remark"
                      value={credentials?.remarks}
                      onChange={onChange}
                      className="md:col-span-2"
                    />
                  </div>

                  <ModalFooter className="w-full px-0">
                    <Button
                      variant="flat"
                      onPress={() => setIsCredentials(false)}
                    >
                      Cancel
                    </Button>

                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {clientLoginPortalCredentials?.companyName || "-"}
                    </p>

                    <p className="mt-1 text-xs text-default-500">
                      Project No:{" "}
                      {clientLoginPortalCredentials?.projectNo || "-"}
                    </p>
                  </div>

                  {clientLoginPortalCredentials?.portals?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {clientLoginPortalCredentials?.portals?.map(
                        (item, idx) => (
                          <Card
                            key={item?.id || item?.detailId || idx}
                            className="border border-default-200 shadow-none"
                          >
                            <CardHeader className="border-b border-default-100 px-4 py-3">
                              <div className="flex w-full items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <h3 className="max-w-full truncate text-sm font-semibold text-foreground">
                                      {item?.portalName || "-"}
                                    </h3>

                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color={
                                        statusColorCode[item?.status] ||
                                        "default"
                                      }
                                      className="shrink-0"
                                    >
                                      {item?.status || "-"}
                                    </Chip>
                                  </div>

                                  <p className="mt-1 break-all text-xs text-default-500">
                                    {item?.portalUrl || "-"}
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                  <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    className="shrink-0"
                                    onPress={() =>
                                      onOpenPortalStatusModal(item)
                                    }
                                  >
                                    Update Status
                                  </Button>

                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="flat"
                                    className="shrink-0"
                                    onPress={() => onOpenEditPortalModal(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    size="sm"
                                    isIconOnly
                                    color="danger"
                                    variant="flat"
                                    className="shrink-0"
                                    onPress={() =>
                                      onOpenDeletePortalModal(item)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            <CardBody className="gap-3 px-4 py-3">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="min-w-0 rounded-lg bg-default-50 px-3 py-2">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                                    Username
                                  </p>
                                  <p className="mt-1 break-all text-xs font-semibold text-foreground">
                                    {item?.username || "-"}
                                  </p>
                                </div>

                                <div className="min-w-0 rounded-lg bg-default-50 px-3 py-2">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                                    Password
                                  </p>
                                  <p className="mt-1 break-all text-xs font-semibold text-foreground">
                                    {item?.password || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="min-w-0 rounded-lg bg-default-50 px-3 py-2">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                                  Remarks
                                </p>
                                <p className="mt-1 whitespace-pre-wrap break-words text-xs text-foreground">
                                  {item?.remarks || "-"}
                                </p>
                              </div>

                              {item?.approvalRemarks && (
                                <div className="min-w-0 rounded-lg bg-primary-50 px-3 py-2">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                                    Approval Remarks
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap break-words text-xs text-foreground">
                                    {item?.approvalRemarks}
                                  </p>
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-default-300 py-10 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        No portal credentials found
                      </p>
                      <p className="mt-1 text-xs text-default-500">
                        Click Add Credentials to create client portal login
                        details.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ClientPortalCredentialsModal;
