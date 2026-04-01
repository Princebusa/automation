import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import { WorkFlow, Execution } from "db/client";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/n8n-clone";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:2000";

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
  if (type === 'http request' || type === 'http-request') {
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
     console.log(res.data);
     return res.data;
  }
  
  if (type === 'mail' || type === 'send email (smtp)') {
     console.log(`[MAIL] Sending email to ${meta.to}`);
     if (!meta.host || !meta.port || !meta.user || !meta.password || !meta.to) {
         throw new Error("Missing complete SMTP credentials or Recipient address.");
     }
     
     const transporter = nodemailer.createTransport({
         host: meta.host,
         port: parseInt(meta.port),
         secure: parseInt(meta.port) === 465,
         auth: { user: meta.user, pass: meta.password }
     });
     
     const info = await transporter.sendMail({
         from: meta.user,
         to: meta.to,
         subject: meta.subject || "Automated Alert from n8n-clone",
         text: meta.body || "This is an automated workflow execution message."
     });
     
     console.log(`[MAIL] Success: ${info.messageId}`);
     return { success: true, messageId: info.messageId };
  }

  // Timer Trigger Logic
  if (type === 'timer') {
     const seconds = parseInt(meta.time) || 1;
     console.log(`[TIMER] Waiting for ${seconds} seconds...`);
     await sleep(seconds * 1000); 
     return { success: true, data: inputData };
  }

  // Schedule/Interval Trigger Logic
  if (type === 'schedule' || type === 'interval') {
     const seconds = parseInt(meta.interval) || 1;
     console.log(`[SCHEDULE] Simulated interval wait for ${seconds} seconds...`);
     await sleep(seconds * 1000); 
     return { success: true, data: inputData };
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
     
     const executionPath = topologicalSort(nodes, edges);
      
      // Find the trigger node to check for 'endTime' (expiry)
      const triggerNode = nodes.find(n => n.data?.kind === 'TRIGGER');
      const endTimeStr = triggerNode?.data?.metadata?.endTime;
      const endTime = endTimeStr ? new Date(endTimeStr) : null;

      let previousData = null;
      for (const node of executionPath) {
         // Check if already cancelled by user
         const currentExecution = await Execution.findById(execution._id);
         if ((currentExecution?.status as any) === 'CANCELLED') {
            console.log(`Execution ${execution._id} was cancelled by user.`);
            return;
         }

         // Check if End Time reached
         if (endTime && new Date() > endTime) {
            console.log(`Execution ${execution._id} reached End Time. Stopping.`);
            (execution.status as any) = "CANCELLED";
            execution.endTime = new Date();
            await execution.save();
            
            await WorkFlow.findByIdAndUpdate(workflow?._id, { isRunning: false });
            await axios.post(`${BACKEND_URL}/api/workflow-status`, {
               workflowId: workflow?._id.toString(),
               status: 'stopped' // This will trigger 'workflow-stopped' in UI
            });
            return;
         }

         await reportNodeStatus(workflow._id.toString(), node.id, 'running');
         try {
            previousData = await executeNodeLogic(node, previousData);
            await reportNodeStatus(workflow._id.toString(), node.id, 'success');
         } catch (err) {
            await reportNodeStatus(workflow._id.toString(), node.id, 'failed');
            throw err; // Stop execution on failure
         }
     }
     
     execution.status = "SUCCESS";
     execution.endTime = new Date();
     await execution.save();
     
     // Mark workflow as NOT running
     await WorkFlow.findByIdAndUpdate(workflow?._id, { isRunning: false });
     
     // Report final status to backend for WebSocket broadcast
     await axios.post(`${BACKEND_URL}/api/workflow-status`, {
        workflowId: workflow?._id.toString(),
        status: 'success'
     });
     console.log(`Execution ${execution._id} completed SUCCESS.`);
  } catch (error) {
     execution.status = "FAILED";
     execution.endTime = new Date();
     await execution.save();
     
     // Mark workflow as NOT running even on failure
     try {
       await WorkFlow.findByIdAndUpdate(execution.workflowId, { isRunning: false });
       await axios.post(`${BACKEND_URL}/api/workflow-status`, {
          workflowId: execution.workflowId.toString(),
          status: 'failed'
       });
     } catch (e) {}
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
