import {email, z} from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const SignupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const CreateWorkflowSchema = z.object({
  nodes: z.array(z.object({
    nodeId: z.string(),
    data: z.object({
      kind: z.enum(["ACTION", "TRIGGER"]),
      metadata: z.any()
    }),
    credentials: z.any(),
    id: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number()
    })
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string()
  }))
})