import { z } from "zod";

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyUnit: z.string().min(1, "Select a company unit"),
  billingAddress: z.string().min(5, "Billing address is required"),
  shippingAddress: z.string().min(5, "Shipping address is required"),
});
