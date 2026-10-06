import { z } from "zod";

export const ringRotationOutputSchema = z.object({
  keyframes: z.array(
    z
      .object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      })
      .strict(),
  ),
  summary: z.string(),
}).strict();