import { z } from "zod";

export const schoolInfoSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  phoneNumber: z.string().min(10, "Phone number must be valid"),
  schoolType: z.string().min(1, "Please select a school type"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactEmail: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logo: z.any().optional(),
});

export type SchoolInfoFormData = z.infer<typeof schoolInfoSchema>;

export const paymentSettingsSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z
    .string()
    .min(10, "Account number must be at least 10 digits"),
  accountName: z.string().min(2, "Account name is required"),
});

export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;

export const securitySettingsSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    oldPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

export const teamMemberSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isActive: z.boolean().default(true),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export const classFormSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.string().min(1, "Level is required"),
  classType: z.string().min(1, "Class type is required"),
  description: z.string().optional().default(""),
  subClass: z.string().optional().default(""),
});

export type ClassFormData = z.infer<typeof classFormSchema>;

export const ParentSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  address: z.string().optional(),
  occupation: z.string().optional(),
  relationship: z.enum(["PARENT", "GUARDIAN"]),
  gender: z.enum(["MALE", "FEMALE"]),
  title: z.string().optional(),
});

export const addStudentSchema = z.object({
  firstName: z.string().min(1, "Name must be more that 1 character"),
  lastName: z.string().min(1, "Name must be more that 1 character"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  admissionNumber: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  class: z.string().min(1),
  parentDetails: z.array(ParentSchema).min(1, "At least one parent required"),
  studentPicture: z.string().optional(),
});

export type AddStudentFormData = z.infer<typeof addStudentSchema>;
