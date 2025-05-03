import z from "zod";

export const formatZodError = (error: z.ZodError): string => {
  return error.issues
    .map((issue) => {
      // Create a readable path (e.g., "user.address.street")
      const path = issue.path.join(".");

      // Format the error message
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(". ");
};
