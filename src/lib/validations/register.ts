import * as z from "zod";

export const registerFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyAction: z.enum(["create", "join"]),
  // Fields for creating a new company
  newCompanyName: z.string().optional(),
  newCompanyAddress: z.string().optional(),
  newOrganizationNumber: z.string().optional(),
  // Field for joining an existing company
  existingCompanyId: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).superRefine((data, ctx) => {
  // Conditional validation based on companyAction
  if (data.companyAction === "create") {
    if (!data.newCompanyName || data.newCompanyName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name must be at least 2 characters",
        path: ["newCompanyName"]
      });
    }
    if (!data.newCompanyAddress || data.newCompanyAddress.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company address must be at least 5 characters",
        path: ["newCompanyAddress"]
      });
    }
    if (!data.newOrganizationNumber || data.newOrganizationNumber.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization number must be at least 5 characters",
        path: ["newOrganizationNumber"]
      });
    }
  } else if (data.companyAction === "join") {
    if (!data.existingCompanyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a company to join",
        path: ["existingCompanyId"]
      });
    }
  }
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;