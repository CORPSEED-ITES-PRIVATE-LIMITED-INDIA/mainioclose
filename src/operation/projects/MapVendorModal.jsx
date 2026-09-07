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
import { inrCurrency } from "../../common";

const MapVendorModal = ({
  isOpen,
  onOpenChange,
  normalizedVendorList = [],
  vendorMapData,
  setVendorMapData,
  onSubmit,
}) => {
  return (
    <Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <Form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              let data = Object.fromEntries(new FormData(e.currentTarget));
              onSubmit(data);
            }}
          >
            <ModalHeader>Map Vendor</ModalHeader>
            <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
              <Select
                isRequired
                label="Select vendor"
                name="vendorId"
                placeholder={
                  normalizedVendorList.length > 0
                    ? "Select approved vendor"
                    : "No approved vendors found"
                }
                selectedKeys={
                  vendorMapData?.vendorId
                    ? new Set([String(vendorMapData.vendorId)])
                    : new Set([])
                }
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)?.[0] || "";

                  setVendorMapData((prev) => ({
                    ...prev,
                    vendorId: selected,
                  }));
                }}
                isDisabled={normalizedVendorList.length === 0}
              >
                {normalizedVendorList.map((vendor) => {
                  const optionValue = String(vendor.vendorId || vendor.id);
                  const optionLabel =
                    vendor.vendorName || vendor.name || "Vendor";

                  return (
                    <SelectItem key={optionValue} textValue={optionLabel}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {optionLabel}
                        </span>
                        <span className="text-xs text-default-500">
                          {vendor.email || "-"}
                          {vendor.priceLevel ? ` • ${vendor.priceLevel}` : ""}
                          {vendor.totalFinalizedAmount
                            ? ` • ${inrCurrency(vendor.totalFinalizedAmount)}`
                            : ""}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>

              <Textarea
                label="Remark"
                name="remarks"
                isRequired
                errorMessage="please enter description"
                value={vendorMapData?.remarks}
                onChange={(e) =>
                  setVendorMapData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
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

export default MapVendorModal;
