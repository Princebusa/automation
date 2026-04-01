import { WorkFlow, Node, Execution } from "db/client";
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
  const workflow = await WorkFlow.findOne({ _id: workflowId, userId: req.userId }).populate('nodes.nodeId');

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
      const convertedNodes = await Promise.all(req.body.nodes.map(async (node: any) => {
        const nodeModel = await Node.findOne({ title: node.type });
    
        return {
          ...node,
          data: {
        ...node.data,
        kind: node.data.kind.toUpperCase() === 'TRIGGER' ? 'TRIGGER' : 'ACTION',
          },
          nodeId: nodeModel?._id
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

export const addNode = async (req: Request, res: Response) => {
  try {
    const { title, description, type, credentialsType } = req.body;
    
    // Check if node already exists
    const existingNode = await Node.findOne({ title });
    if (existingNode) {
      return res.status(400).json({ message: "Node with this title already exists" });
    }
    
    const newNode = await Node.create({
      title,
      description,
      type, // 'ACTION' or 'TRIGGER'
    });
    
    return res.json(newNode);
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to add node", error: error.message });
  }
};

// Execute a workflow
export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const userId = req.userId;

    if (!userId) {
       return res.status(401).json({ message: "User not authenticated" });
    }

    const workflow = await WorkFlow.findOne({ _id: workflowId, userId }).populate('nodes.nodeId');

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    // Send nodes with type = node title so executor can run each node by kind
    const nodes = workflow.nodes.map((node: any) => ({
      id: node.id,
      type: node.nodeId?.title ?? node.nodeId?.toString?.() ?? 'timer',
      nodeId: node.nodeId ? { title: node.nodeId.title } : { title: 'timer' },
      data: node.data,
      position: node.position,
      credentials: node.credentials
    }));

    // Create a new execution in the DB with status PENDING for the Worker to pick up
    //@ts-ignore
    const execution = await Execution.create({
      workflowId: workflow._id,
      status: "PENDING",
      startTime: new Date()
    });

    // Mark the workflow as running
    workflow.isRunning = true;
    //@ts-ignore
    await workflow.save();

    return res.json({ 
       success: true, 
       executionId: execution?._id, 
       message: "Execution queued successfully" 
    });
  } catch (error: any) {
    console.error("Workflow execution crash:", error);
    return res.status(500).json({
      message: "Workflow execution failed",
      error: error?.message || String(error) || "Unknown error"
    });
  }
}

// Stop a running workflow execution
export const stopWorkflowExecution = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const userId = req.userId;

    // Find the latest execution that is either PENDING or RUNNING
    const execution = await Execution.findOneAndUpdate(
      { 
        workflowId: workflowId, 
        status: { $in: ["PENDING", "RUNNING"] } 
      },
      { 
        status: "CANCELLED",
        endTime: new Date()
      },
      { sort: { starTime: -1 }, new: true }
    );

    if (!execution) {
      return res.status(404).json({ message: "No active execution found to stop" });
    }

    // Mark the workflow as stopped
    await WorkFlow.findByIdAndUpdate(workflowId, { isRunning: false });

    // Broadcast cancellation to all connected clients for this workflow
    const rooms = req.app.get('wssRooms');
    if (rooms && rooms.has(workflowId)) {
      const clients = rooms.get(workflowId);
      clients.forEach((client: any) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            type: 'workflow-stopped',
            workflowId,
            executionId: execution._id
          }));
        }
      });
    }

    return res.json({ success: true, message: "Workflow execution stopped successfully" });
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Failed to stop workflow execution", 
      error: error.message 
    });
  }
}

// Get the latest execution status for a workflow
export const getLatestExecution = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const execution = await Execution.findOne({ workflowId }).sort({ starTime: -1 });
    return res.json(execution);
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to fetch execution status", error: error.message });
  }
}

// Execute a single node (for testing)
export const executeNode = async (req: Request, res: Response) => {
  try {
    const { nodeType, metadata } = req.body;
    
    if (!nodeType || !metadata) {
      return res.status(400).json({ message: "Node type and metadata are required" });
    }

    const executorUrl = process.env.EXECUTOR_URL || 'http://localhost:4001';
    const executorResponse = await axios.post(`${executorUrl}/execute-node`, {
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

// Receive status updates from the executor and broadcast via WebSocket
export const updateNodeStatus = async (req: Request, res: Response) => {
  try {
    const { workflowId, nodeId, status } = req.body;
    
    // Broadcast immediately
    const rooms = req.app.get('wssRooms');
    if (rooms && rooms.has(workflowId)) {
      const clients = rooms.get(workflowId);
      clients.forEach((client: any) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            type: 'node-status-change',
            workflowId,
            nodeId,
            status
          }));
        }
      });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Webhook endpoint
export const updateWorkflowStatus = async (req: Request, res: Response) => {
  const { workflowId, status } = req.body;
  if (!workflowId || !status) return res.status(400).json({ message: "Missing workflowId or status" });

  const rooms = req.app.get('wssRooms');
  if (rooms && rooms.has(workflowId)) {
    const clients = rooms.get(workflowId);
    const eventType = status === 'success' ? 'workflow-finished' : 'workflow-failed';
    clients.forEach((client: any) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: eventType, workflowId }));
      }
    });
  }

  return res.json({ success: true });
}

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