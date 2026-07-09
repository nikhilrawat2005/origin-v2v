import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  education: z.string().min(1, "Education is required"),
  skills: z.string().min(1, "Enter at least one skill"),
  interests: z.string().min(1, "Enter at least one interest"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Preferred category is required"),
  income: z.string().min(1, "Annual family income is required"),
});
