import { z } from "zod";

const numberLike = (fieldName) =>
  z
    .union([
      z.number({ invalid_type_error: `${fieldName} is required` }),
      z.string().min(1, `${fieldName} is required`),
    ])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => !Number.isNaN(val), `${fieldName} must be a valid number`);

const lineItemSchema = z.object({
  categoryCode: z.string().optional(),
  feeType: z.string().optional(),
  itemName: z.string().min(1, "Item name is required"),
  unitPriceExGst: numberLike("Amount").refine(
    (val) => val >= 0,
    "Amount must be 0 or greater",
  ),
  hsnSacCode: z.string().min(1, "HSN/SAC code is required"),
  gstRate: numberLike("GST rate")
    .refine((val) => val >= 0, "GST cannot be negative")
    .refine((val) => val <= 100, "GST cannot exceed 100%"),
  quantity: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return typeof val === "string" ? Number(val) : val;
    })
    .refine(
      (val) => val === undefined || (!Number.isNaN(val) && val >= 0),
      "Quantity must be 0 or greater",
    ),
});

export const estimateFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  unitId: z.string().min(1, "Unit is required"),
  // solutionName: z.string().min(1, "Solution is required"),
  // email: z.string().email("Invalid email").optional(),
  contactId: z.string().min(1, "contact is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one item is required"),
  // orderNumber: z.string().optional(),
  estimateDate: z.string().min(1, "Date is required"),
  validUntil: z.string().min(1, "Date is required"),
  customerNotes: z.string().optional(),
  internalRemarks: z.string().optional(),
});
