import { z } from "zod";

const addressSchema = z.object({
  addressLine: z.string().min(5, "Address is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pinCode: z.string().min(6, "Pin code must be 6 digits"),
});

export const leadEstimateSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyUnit: z.string().min(1, "Select company unit"),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
});
