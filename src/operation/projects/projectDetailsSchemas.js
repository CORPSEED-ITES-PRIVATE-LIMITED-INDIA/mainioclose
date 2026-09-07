import { z } from "zod";

export const documentSchema = z
  .object({
    fileUrl: z.string().min(1, "File is required"),
    fileName: z.string().min(1, "File name is required"),
    isFromCompanyDoc: z.boolean().default(false),
    isPermanent: z.boolean({
      required_error: "Please select document type",
    }),
    expiryDate: z.string().nullable().optional(),
    fileSizeKb: z.coerce.number().min(1, "File size required"),
    fileFormat: z.string().min(1, "File format is required"),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isPermanent === false && !data.expiryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiry date is required when document is not permanent",
        path: ["expiryDate"],
      });
    }
  });

export const verifySchema = z.object({
  newStatus: z.string().min(1, "Please select status"),
  remarks: z.string().min(1, "Remarks is required"),
});

export const expenseSchema = z.object({
  expenseCategory: z.string().min(1, "Please select expense category"),

  amount: z.coerce
    .number({
      invalid_type_error: "Please enter amount",
    })
    .positive("Amount must be greater than 0"),

  remark: z.string().trim().min(1, "Please enter remark"),

  expenseDate: z.string().min(1, "Please select expense date"),

  attachmentUrl: z.string().min(1, "Please upload payment proof"),

  externalReference: z.string().trim().optional(),

  currencyCode: z.string().min(1, "Please select currency"),
});
