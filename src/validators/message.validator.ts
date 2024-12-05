import { z } from "zod";

const messageValidator = z.object({
  prompt: z.string(),
});

export { messageValidator };
