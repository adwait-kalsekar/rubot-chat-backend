import { z } from "zod";

const registerValidator = z
  .object({
    fullName: z.string(),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error path
  });

const loginValidator = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
});

export { registerValidator, loginValidator };
