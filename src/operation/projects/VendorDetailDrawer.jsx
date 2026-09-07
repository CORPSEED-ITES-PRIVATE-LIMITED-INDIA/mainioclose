import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/react";
import { DateItem, DetailItem } from "./ProjectDetailFields";
import { getInitials, getStatusColor } from "./projectDetailsUtils";

const VendorDetailDrawer = ({
  isOpen,
  onOpenChange,
  vendorDetail,
  selectedVendor,
  onMapVendor,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      hideCloseButton
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 px-6 py-5">
              <div className="flex w-full items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Vendor Details
                    </h2>

                    {vendorDetail?.status && (
                      <Chip
                        color={getStatusColor(vendorDetail.status)}
                        variant="flat"
                        size="sm"
                      >
                        {vendorDetail.status}
                      </Chip>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-default-500">
                    View procurement vendor details for this project
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button color="primary" variant="flat" onPress={onMapVendor}>
                    Map Vendor
                  </Button>

                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </DrawerHeader>

            <DrawerBody className="bg-default-50 px-6 py-6">
              {!vendorDetail ? (
                <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-dashed border-default-300 bg-white">
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">
                      No vendor detail found
                    </p>
                    <p className="mt-1 text-sm text-default-500">
                      Vendor data is not available for this procurement
                      milestone.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-170px)] overflow-y-auto pr-2">
                  <div className="space-y-5">
                    <Card className="overflow-hidden border border-default-200 bg-white shadow-sm">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-primary-100 via-blue-50 to-white p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                Procurement Assignment
                              </p>

                              <h3 className="mt-1 text-xl font-bold text-foreground">
                                {vendorDetail.projectName || "-"}
                              </h3>

                              <p className="mt-1 text-sm text-default-600">
                                {vendorDetail.message ||
                                  "Procurement vendor information"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Chip color="primary" variant="flat">
                                Assignment ID:{" "}
                                {vendorDetail.procurementAssignmentId || "-"}
                              </Chip>

                              <Chip color="secondary" variant="flat">
                                Project No: {vendorDetail.projectNo || "-"}
                              </Chip>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
                          <DetailItem
                            label="Project ID"
                            value={vendorDetail.projectId}
                          />
                          <DetailItem
                            label="Product"
                            value={vendorDetail.productName}
                          />
                          <DetailItem
                            label="Product ID"
                            value={vendorDetail.productId}
                          />
                          <DetailItem
                            label="Milestone"
                            value={vendorDetail.milestoneName}
                          />
                          <DetailItem
                            label="Milestone ID"
                            value={vendorDetail.milestoneId}
                          />
                          <DetailItem
                            label="Assigned To"
                            value={vendorDetail.assignedToUserName}
                          />
                          <DetailItem
                            label="Assigned User ID"
                            value={vendorDetail.assignedToUserId}
                          />
                          <DetailItem
                            label="Selected Vendor ID"
                            value={vendorDetail.selectedVendorId}
                          />
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="border border-default-200 bg-white shadow-sm">
                      <CardBody className="p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-foreground">
                              Selected Vendor
                            </p>
                            <p className="text-sm text-default-500">
                              Vendor currently mapped with this procurement
                              assignment
                            </p>
                          </div>

                          <Chip
                            color={selectedVendor ? "success" : "warning"}
                            variant="flat"
                          >
                            {selectedVendor ? "Mapped" : "Not Mapped"}
                          </Chip>
                        </div>

                        <Divider />

                        <div className="mt-5">
                          {selectedVendor ? (
                            <div className="rounded-3xl border border-success-200 bg-gradient-to-br from-success-50 to-white p-5">
                              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex items-center gap-4">
                                  <Avatar
                                    name={getInitials(
                                      selectedVendor?.vendorName ||
                                        selectedVendor?.name,
                                    )}
                                    className="h-14 w-14 bg-success-100 text-success"
                                  />

                                  <div>
                                    <h3 className="text-lg font-bold text-foreground">
                                      {selectedVendor?.vendorName ||
                                        selectedVendor?.name ||
                                        "-"}
                                    </h3>

                                    <p className="text-sm text-default-500">
                                      Vendor ID:{" "}
                                      {selectedVendor?.vendorId ||
                                        selectedVendor?.id ||
                                        "-"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Chip
                                    size="sm"
                                    color={
                                      selectedVendor?.status === "ACTIVE"
                                        ? "success"
                                        : "default"
                                    }
                                    variant="flat"
                                  >
                                    {selectedVendor?.status || "-"}
                                  </Chip>

                                  <Chip
                                    size="sm"
                                    color={
                                      selectedVendor?.verified
                                        ? "success"
                                        : "warning"
                                    }
                                    variant="flat"
                                  >
                                    {selectedVendor?.verified
                                      ? "Verified"
                                      : "Not Verified"}
                                  </Chip>
                                </div>
                              </div>

                              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                <DetailItem
                                  label="Email"
                                  value={selectedVendor?.email}
                                />
                                <DetailItem
                                  label="Mobile"
                                  value={selectedVendor?.mobile}
                                />
                                <DetailItem
                                  label="GST Number"
                                  value={selectedVendor?.gstNumber}
                                />
                                <DetailItem
                                  label="PAN Number"
                                  value={selectedVendor?.panNumber}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-3xl border border-dashed border-default-300 bg-default-50 p-8 text-center">
                              <p className="text-base font-semibold text-foreground">
                                No selected vendor found
                              </p>
                              <p className="mt-1 text-sm text-default-500">
                                No vendor is currently mapped with this
                                procurement.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="border border-default-200 bg-white shadow-sm">
                      <CardBody className="p-5">
                        <div className="mb-4">
                          <p className="text-base font-semibold text-foreground">
                            Procurement Timeline
                          </p>
                          <p className="text-sm text-default-500">
                            Important dates related to this procurement
                            milestone
                          </p>
                        </div>

                        <Divider />

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <DateItem
                            label="Vendor Shortlisted"
                            value={vendorDetail.vendorShortlistedDate}
                          />

                          <DateItem
                            label="PO Created"
                            value={vendorDetail.poCreatedDate}
                          />

                          <DateItem
                            label="PO Released"
                            value={vendorDetail.poReleasedDate}
                          />

                          <DateItem
                            label="Last Updated"
                            value={vendorDetail.updatedDate}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default VendorDetailDrawer;
