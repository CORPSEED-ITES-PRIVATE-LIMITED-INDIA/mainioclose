import { z } from "zod";

const serviceLineItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  unitPriceExGst: z
    .number({ invalid_type_error: "Amount is required" })
    .min(0, "Amount must be 0 or greater"),
  hsnSacCode: z.string().min(1, "HSN/SAC code is required"),
  gstRate: z
    .number({ invalid_type_error: "GST rate is required" })
    .min(0, "GST cannot be negative")
    .max(100, "GST cannot exceed 100%"),
});

export const estimateFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  unitId: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  contactNumber: z.string().optional(),
  lineItems: z
    .array(serviceLineItemSchema)
    .min(1, "At least one service is required"),
  orderNumber: z.string().optional(),
  estimateDate: z.string(),
  validUntil: z.string(),
  customerNotes: z.string().optional(),
  internalRemarks: z.string().optional(),
});
