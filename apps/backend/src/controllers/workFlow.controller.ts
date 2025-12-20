import { WorkFlow, Node } from "db/client";
import { Response, Request } from "express";
import { CreateWorkflowSchema } from "comman/types";


export const createWorkflow = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { success, data } = CreateWorkflowSchema.safeParse(req.body);

  if (!success) {
    return res.status(403).json({ message: "incorrect input" });
  }
  try {
    const newFlow = await WorkFlow.create({
      userId,
      nodes: data.nodes,
      edges: data.edges,
    });
    return res
      .status(200)
      .json({ status: "success", message: "worflow created", id: newFlow._id });
  } catch (e) {

    return res
      .status(411)
      .json({ status: "failed", message: "failed to create workflow" });
  }
};

export const getWorkflow = async (req: Request, res: Response) => {
  const { workflowId } = req.params as { workflowId: string };
  const workflow = await WorkFlow.findOne({ _id: workflowId, userId: req.userId });

  if (!workflow) {
    return res.status(400).json({ message: "workflow not found" });
  }

  return res.json(workflow);
};

export const getAllWorkflow = async (req: Request, res: Response) => {
  const allflow = await WorkFlow.find({userId: req.userId})
  return res.json(allflow)
}
export const nodes = async (req: Request, res: Response)=>{
  const node = await Node.find()
  return res.json(node)
}