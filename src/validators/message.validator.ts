import { z } from "zod";

const createMessageValidator = z.object({
  prompt: z.string(),
});

export { createMessageValidator };
