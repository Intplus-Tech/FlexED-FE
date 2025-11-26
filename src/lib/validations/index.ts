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

export const addStudentSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"], { message: "Please select a gender" }),
  class: z.string().min(1, "Please select a class"),
  relationship: z.enum(["parents", "guardian"], {
    message: "Please select a relationship",
  }),
  fatherName: z
    .string()
    .min(2, "Father/Guardian name must be at least 2 characters"),
  fatherEmail: z.string().email("Invalid email address"),
  fatherPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  fatherAddress: z.string().min(5, "Address must be at least 5 characters"),
  motherName: z
    .string()
    .min(2, "Mother/Guardian name must be at least 2 characters"),
  motherEmail: z.string().email("Invalid email address"),
  motherPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  motherAddress: z.string().optional(),
});

export type AddStudentFormData = z.infer<typeof addStudentSchema>;
