import express from 'express';
import cors from 'cors';
import { WorkflowExecutor } from './services/workflowExecutor.service';
import { NodeExecutor } from './services/nodeExecutor.service';

const app = express();
const PORT = process.env.EXECUTOR_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Executor service is running', port: PORT });
});

// Execute a single node
app.post('/execute-node', async (req, res) => {
  try {
    const { nodeType, metadata } = req.body;
    
    if (!nodeType || !metadata) {
      return res.status(400).json({ message: "Node type and metadata are required" });
    }

    const node = {
      id: 'test-node',
      type: nodeType,
      nodeId: nodeType,
      data: {
        kind: (nodeType.includes('trigger') ? 'TRIGGER' : 'ACTION') as 'ACTION' | 'TRIGGER',
        metadata
      },
      position: { x: 0, y: 0 }
    };

    const result = await WorkflowExecutor.executeSingleNode(node);
    
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Node execution failed", 
      error: error.message 
    });
  }
});

// Execute a complete workflow
app.post('/execute-workflow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    
    if (!nodes || !edges) {
      return res.status(400).json({ message: "Nodes and edges are required" });
    }

    const result = await WorkflowExecutor.executeWorkflow(nodes, edges);
    
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Workflow execution failed", 
      error: error.message 
    });
  }
});

// Webhook endpoint for trigger nodes
app.all('/webhooks/*', async (req, res) => {
  try {
    const { originalUrl, method, body, headers } = req;
    const endpoint = originalUrl.replace('/webhooks', '');

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
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Executor service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Node execution: http://localhost:${PORT}/execute-node`);
  console.log(`🔄 Workflow execution: http://localhost:${PORT}/execute-workflow`);
});

export default app;
