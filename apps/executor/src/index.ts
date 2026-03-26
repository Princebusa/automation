import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import { WorkFlow, Execution } from "db/client";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/n8n-clone";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function connectDB() {
  try {
    const mongoUri = MONGO_URI;
    if (!mongoUri) {
      console.error("MongoDB URI is not provided");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Executor connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function reportNodeStatus(workflowId: string, nodeId: string, status: 'running' | 'success' | 'failed') {
  try {
    await axios.post(`${BACKEND_URL}/api/node-status`, {
      workflowId,
      nodeId,
      status
    });
  } catch (err: any) {
    console.error(`Failed to report status ${status} for node ${nodeId}:`, err.message);
  }
}

function topologicalSort(nodes: any[], edges: any[]) {
  const sorted: any[] = [];
  const visited = new Set();
  const temp = new Set();
  
  const adjList = new Map();
  nodes.forEach(n => adjList.set(n.id, []));
  edges.forEach(e => {
    if (adjList.has(e.source)) {
      adjList.get(e.source).push(e.target);
    }
  });

  function visit(nodeId: string) {
    if (temp.has(nodeId)) throw new Error("Cycle detected");
    if (!visited.has(nodeId)) {
      temp.add(nodeId);
      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        visit(neighbor);
      }
      temp.delete(nodeId);
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) sorted.unshift(node);
    }
  }

  const incomingCount = new Map();
  nodes.forEach(n => incomingCount.set(n.id, 0));
  edges.forEach(e => {
    if (incomingCount.has(e.target)) {
      incomingCount.set(e.target, incomingCount.get(e.target) + 1);
    }
  });

  const roots = nodes.filter(n => incomingCount.get(n.id) === 0);
  roots.forEach(root => visit(root.id));
  
  nodes.forEach(node => {
     if (!visited.has(node.id)) visit(node.id);
  });

  return sorted;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function executeNodeLogic(node: any, inputData: any) {
  const type = node.nodeId?.title?.toLowerCase() || 'unknown';
  const meta = node.data?.metadata || {};
  
  // Real execution logic!
  if (type === 'http-request') {
     const method = meta.method || "GET";
     console.log(`[HTTP-REQUEST] Executing ${method} to ${meta.url}`);
     // Simulate slight delay so UI animation can be seen
     await sleep(1000); 
     const res = await axios({
        method,
        url: meta.url || 'https://jsonplaceholder.typicode.com/todos/1',
        data: meta.body ? JSON.parse(meta.body) : undefined,
        headers: meta.headers ? JSON.parse(meta.headers) : undefined
     });
     return res.data;
  }
  
  if (type === 'mail') {
     console.log(`[MAIL] Sending email to Dummy`);
     // Real nodemailer code could go here, but omitted to prevent spam
     // We will sleep to simulate SMPT sending latency
     await sleep(2000);
     return { success: true, emailSent: true };
  }

  // Generic triggers/delays
  console.log(`[${type.toUpperCase()}] Executing generic logic...`);
  await sleep(1500); 
  return { success: true, data: inputData };
}

async function processExecution(execution: any) {
  try {
     const workflow = await WorkFlow.findById(execution.workflowId).populate('nodes.nodeId');
     if (!workflow) throw new Error("Workflow not found");
     
     const nodes = workflow.nodes.map((n: any) => ({
        id: n.id,
        nodeId: n.nodeId,
        data: n.data
     }));
     const edges = workflow.edges || [];
     
     const sortedNodes = topologicalSort(nodes, edges);
     console.log(`Executing workflow ${workflow._id} - nodes run count: ${sortedNodes.length}`);

     let currentData: any = null;

     for (const node of sortedNodes) {
        await reportNodeStatus(workflow._id.toString(), node.id, 'running');
        try {
           currentData = await executeNodeLogic(node, currentData);
           await reportNodeStatus(workflow._id.toString(), node.id, 'success');
        } catch (err) {
           await reportNodeStatus(workflow._id.toString(), node.id, 'failed');
           throw err; // Stop execution on failure
        }
     }
     
     execution.status = "SUCCESS";
     execution.endTime = new Date();
     await execution.save();
     console.log(`Execution ${execution._id} completed SUCCESS.`);
  } catch (error) {
     execution.status = "FAILED";
     execution.endTime = new Date();
     await execution.save();
     console.error(`Execution ${execution._id} FAILED.`, error);
  }
}

async function startWorker() {
  await connectDB();
  console.log("Worker started, polling for PENDING executions...");

  while (true) {
    try {
      const execution = await Execution.findOneAndUpdate(
        { status: "PENDING" },
        { status: "RUNNING" },
        { new: true }
      );

      if (execution) {
        console.log(`Picked up execution: ${execution._id}`);
        await processExecution(execution);
      } else {
        await sleep(2000); // 2 second polling interval
      }
    } catch (err) {
      console.error("Error in polling loop:", err);
      await sleep(5000);
    }
  }
}

// Ensure proper error handling to keep worker alive
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

startWorker();
