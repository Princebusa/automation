import { WorkFlow, Node } from "db/client";
import { Response, Request } from "express";
import { CreateWorkflowSchema } from "comman/types";
import axios from 'axios';


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
    return res.json(newFlow);
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to create workflow", error: error.message });
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

export const updateWorkflow = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { workflowId } = req.params;
  
  try {
    const workflow = await WorkFlow.findOne({ _id: workflowId, userId });
    
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    // Convert frontend data to match database schema
    if (req.body.nodes) {
      const convertedNodes = req.body.nodes.map((node: any) => ({
        ...node,
        data: {
          ...node.data,
          kind: node.data.kind.toUpperCase() === 'TRIGGER' ? 'TRIGGER' : 'ACTION'
        }
      }));
      //@ts-ignore
      workflow.nodes = convertedNodes;
    }
    if (req.body.edges) {
      //@ts-ignore
      workflow.edges = req.body.edges;
    }
    if (req.body.name) {
      //@ts-ignore
      workflow.name = req.body.name;
    }

    await workflow.save();
    return res.json(workflow);
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to update workflow", error: error.message });
  }
};

export const nodes = async (req: Request, res: Response)=>{
  const node = await Node.find()
  return res.json(node)
}

// Execute a workflow
export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const userId = req.userId;

    const workflow = await WorkFlow.findOne({ _id: workflowId, userId });
    
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    // Convert database nodes to the expected format
    const nodes = workflow.nodes.map((node: any) => ({
      id: node.id,
      type: node.nodeId?.toString() || node.type,
      nodeId: node.nodeId?.toString(),
      data: node.data,
      position: node.position,
      credentials: node.credentials
    }));

    // Call executor service
    const executorResponse = await axios.post('http://localhost:4001/execute-workflow', {
      nodes,
      edges: workflow.edges
    });

    return res.json(executorResponse.data);
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Workflow execution failed", 
      error: error.message 
    });
  }
}

// Execute a single node (for testing)
export const executeNode = async (req: Request, res: Response) => {
  try {
    const { nodeType, metadata } = req.body;
    
    if (!nodeType || !metadata) {
      return res.status(400).json({ message: "Node type and metadata are required" });
    }

    // Call executor service
    const executorResponse = await axios.post('http://localhost:4001/execute-node', {
      nodeType,
      metadata
    });
    
    return res.json(executorResponse.data);
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Node execution failed", 
      error: error.message 
    });
  }
}

// Webhook endpoint
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.params;
    const method = req.method;
    const body = req.body;
    const headers = req.headers;

    // Log webhook data
    console.log(`Webhook received: ${method} ${endpoint}`, {
      headers,
      body
    });

    // In a real implementation, you would:
    // 1. Find workflows that have this webhook trigger
    // 2. Execute those workflows with the webhook data
    // 3. Return appropriate response

    return res.json({
      success: true,
      message: 'Webhook received successfully',
      data: {
        endpoint,
        method,
        headers,
        body
      }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Webhook handling failed", 
      error: error.message 
    });
  }
}