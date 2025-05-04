import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  owner: z.string(),
  status: z.string(),
  phases: z.string(),
  bugs: z.string(),
  startDate:  z.string(),
  endDate: z.string(),
  tags: z.string(),
})

export type Task = z.infer<typeof taskSchema>