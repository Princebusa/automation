import { NodeExecutor, NodeExecutionResult } from './nodeExecutor.service';

export interface WorkflowNode {
  id: string;
  type?: string;
  nodeId?: string;
  data: {
    kind: 'ACTION' | 'TRIGGER';
    metadata: any;
  };
  position?: { x: number; y: number };
  credentials?: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowExecutionResult {
  success: boolean;
  results: Array<{
    nodeId: string;
    nodeType: string;
    result: NodeExecutionResult;
  }>;
  error?: string;
}

export class WorkflowExecutor {
  
  static async executeWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): Promise<WorkflowExecutionResult> {
    const results: Array<{
      nodeId: string;
      nodeType: string;
      result: NodeExecutionResult;
    }> = [];

    try {
      // Find trigger nodes (nodes with no incoming edges)
      const triggerNodes = this.findTriggerNodes(nodes, edges);
      
      if (triggerNodes.length === 0) {
        return {
          success: false,
          results: [],
          error: 'No trigger nodes found in workflow'
        };
      }

      // Execute each trigger and its connected nodes
      for (const triggerNode of triggerNodes) {
        const executionPath = this.buildExecutionPath(triggerNode, nodes, edges);
        await this.executeNodePath(executionPath, results);
      }

      return {
        success: true,
        results
      };
    } catch (error: any) {
      return {
        success: false,
        results,
        error: error.message || 'Workflow execution failed'
      };
    }
  }

  private static findTriggerNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
    const nodeIdsWithIncomingEdges = new Set(edges.map(edge => edge.target));
    
    return nodes.filter(node => 
      node.data.kind === 'TRIGGER' && !nodeIdsWithIncomingEdges.has(node.id)
    );
  }

  private static buildExecutionPath(
    startNode: WorkflowNode, 
    allNodes: WorkflowNode[], 
    allEdges: WorkflowEdge[]
  ): WorkflowNode[] {
    const path: WorkflowNode[] = [startNode];
    const visited = new Set<string>();
    let currentNode = startNode;

    while (currentNode) {
      visited.add(currentNode.id);
      
      // Find next node (first outgoing edge)
      const nextEdge = allEdges.find(edge => edge.source === currentNode.id);
      
      if (!nextEdge || visited.has(nextEdge.target)) {
        break;
      }

      const nextNode = allNodes.find(node => node.id === nextEdge.target);
      
      if (!nextNode) {
        break;
      }

      path.push(nextNode);
      currentNode = nextNode;
    }

    return path;
  }

  private static async executeNodePath(
    nodes: WorkflowNode[], 
    results: Array<{
      nodeId: string;
      nodeType: string;
      result: NodeExecutionResult;
    }>
  ): Promise<void> {
    let previousData: any = null;

    for (const node of nodes) {
      const result = await this.executeNode(node, previousData);
      
      results.push({
        nodeId: node.id,
        nodeType: node.type,
        result
      });

      // If node execution failed, stop the path
      if (!result.success) {
        break;
      }

      // Pass result data to next node
      previousData = result.data;
    }
  }

  private static async executeNode(node: WorkflowNode, inputData: any): Promise<NodeExecutionResult> {
    // Get the node type from either type or nodeId field
    const nodeType = node.type || node.nodeId || '';
    const { data } = node;

    switch (nodeType) {
      case 'timer':
        return NodeExecutor.executeTimer(data.metadata);
        
      case 'price-trigger':
        return NodeExecutor.executePriceTrigger(data.metadata);
        
      case 'webhook':
        return NodeExecutor.executeWebhook(data.metadata);
        
      case 'schedule':
        return NodeExecutor.executeSchedule(data.metadata);
        
      case 'mail':
        return NodeExecutor.executeMail(data.metadata);
        
      case 'http-request':
        return NodeExecutor.executeHttpRequest(data.metadata);
        
      case 'file-system':
        return NodeExecutor.executeFileSystem(data.metadata);
        
      case 'data-transform':
        return NodeExecutor.executeDataTransform(data.metadata, inputData);
        
      case 'google-sheets':
        return NodeExecutor.executeGoogleSheets(data.metadata);
        
      default:
        return {
          success: false,
          error: `Unknown node type: ${nodeType}`
        };
    }
  }

  // Execute a single node (for testing purposes)
  static async executeSingleNode(node: WorkflowNode, inputData?: any): Promise<NodeExecutionResult> {
    return this.executeNode(node, inputData);
  }
}
