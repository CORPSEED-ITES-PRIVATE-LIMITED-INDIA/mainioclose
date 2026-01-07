import { z } from "zod";

export const companyFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  unitName: z.string().min(2, "Unit name is required"),
  email: z.string().email("Invalid email"),
  contactNumber: z.string().min(10, "Contact number is required"),

  billingAddress: z.object({
    primaryAddress: z.string().min(5),
    primaryCountry: z.string().min(2),
    primaryState: z.string().min(2),
    primaryCity: z.string().min(2),
    primaryPinCode: z.string().min(4),
  }),

  shippingAddress: z.object({
    secondaryAddress: z.string().min(5),
    secondaryCountry: z.string().min(2),
    secondaryState: z.string().min(2),
    secondaryCity: z.string().min(2),
    secondaryPinCode: z.string().min(4),
  }),

  orderNumber: z.string().min(1),
  remark: z.string().optional(),
  date: z.date(),
});
