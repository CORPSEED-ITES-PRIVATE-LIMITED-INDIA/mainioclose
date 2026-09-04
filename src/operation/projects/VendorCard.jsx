import { Avatar, Card, CardBody, Chip, Divider } from "@heroui/react";
import { getInitials } from "./projectDetailsUtils";

// NOTE: not currently rendered anywhere — kept as-is from ProjectDetails.jsx
// during the component split (it was already unused there).
const VendorCard = ({ vendor, isSelected }) => {
  return (
    <Card
      className={`border shadow-none transition-all ${
        isSelected
          ? "border-success-300 bg-success-50"
          : "border-default-200 bg-content1"
      }`}
    >
      <CardBody className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={getInitials(vendor?.vendorName || vendor?.name)}
              className="bg-primary-100 text-primary"
            />

            <div>
              <p className="text-sm font-semibold text-foreground">
                {vendor?.vendorName || vendor?.name || "-"}
              </p>
              <p className="text-xs text-default-500">
                Vendor ID: {vendor?.vendorId || vendor?.id || "-"}
              </p>
            </div>
          </div>

          {isSelected && (
            <Chip color="success" variant="flat" size="sm">
              Selected
            </Chip>
          )}
        </div>

        <Divider />

        <div className="grid grid-cols-1 gap-2 text-sm text-default-600">
          <div className="flex justify-between gap-3">
            <span className="text-default-400">Email</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.email || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-default-400">Mobile</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.mobile || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-default-400">GST No.</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.gstNumber || "-"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-default-400">PAN No.</span>
            <span className="text-right font-medium text-foreground">
              {vendor?.panNumber || "-"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip
            size="sm"
            color={vendor?.status === "ACTIVE" ? "success" : "default"}
            variant="flat"
          >
            {vendor?.status || "-"}
          </Chip>

          <Chip
            size="sm"
            color={vendor?.verified ? "success" : "warning"}
            variant="flat"
          >
            {vendor?.verified ? "Verified" : "Not Verified"}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};

export default VendorCard;
