import { z } from "zod";

const createMessageValidator = z.object({
  role: z.string(),
  content: z.enum(["user", "assistant"]),
});

export { createMessageValidator };
