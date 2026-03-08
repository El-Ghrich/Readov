import { z } from "zod";

// --- Authentication Schemas ---

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine(
        (val) => new Date(val) <= new Date(),
        "Date of birth cannot be in the future",
      )
      .refine((val) => {
        const birthDate = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 13;
      }, "You must be at least 13 years old"),
    nativeLanguage: z.string().min(1, "Native language is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// --- Story Creation Schemas ---

export const storyCreateSchema = z.object({
  targetLanguage: z.string().min(1, "Please select a target language"),
  genre: z.string().min(1, "Please select a genre"),
  languageLevel: z.string().min(1, "Please select a language level"),
  goal: z.string().max(100, "Goal must not exceed 100 characters").optional(),
  lesson: z
    .string()
    .max(100, "Lesson must not exceed 100 characters")
    .optional(),
  customPremise: z
    .string()
    .max(500, "Premise must not exceed 500 characters")
    .optional(),
});

// --- Editor Save Schema ---

export const storySaveSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  genre: z.string().min(1, "Genre is required"),
  language: z.string().min(1, "Language is required"),
  goal: z.string().max(100, "Goal is too long").optional(),
  lesson: z.string().max(100, "Lesson is too long").optional(),
  isPublic: z.boolean().default(false),
});

// --- Component Schemas ---

export const storyTitleSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters"),
});

export const customChoiceSchema = z.object({
  direction: z
    .string()
    .min(2, "Direction must be at least 2 characters")
    .max(200, "Direction must not exceed 200 characters"),
});

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => new Date(val) <= new Date(),
      "Date of birth cannot be in the future",
    )
    .refine((val) => {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 13;
    }, "You must be at least 13 years old"),
  nativeLanguage: z.string().min(1, "Native language is required"),
});

export const settingsSchema = z.object({
  favoriteLanguage: z.string().min(1, "Favorite language is required"),
  languageLevel: z.string().min(1, "Language level is required"),
  autoScroll: z.boolean(),
});
