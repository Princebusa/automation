import { Router } from "express";
import {authMiddleware} from '../middleware/auth.middleware'
import { createWorkflow, getWorkflow, updateWorkflow, nodes, addNode, getAllWorkflow, executeWorkflow, stopWorkflowExecution, getLatestExecution, executeNode, handleWebhook, updateNodeStatus, updateWorkflowStatus } from "../controllers/workFlow.controller";


const router = Router()

router.post("/workflow", authMiddleware, createWorkflow)
router.get("/workflow", authMiddleware, getAllWorkflow)
router.get("/workflow/:workflowId", authMiddleware, getWorkflow)
router.put("/workflow/:workflowId", authMiddleware, updateWorkflow)
router.post("/workflow/:workflowId/execute", authMiddleware, executeWorkflow)
router.post("/workflow/:workflowId/stop", authMiddleware, stopWorkflowExecution)
router.get("/workflow/:workflowId/execution", authMiddleware, getLatestExecution)
router.post("/execute-node", authMiddleware, executeNode)
router.post("/node-status", updateNodeStatus)
router.post("/workflow-status", updateWorkflowStatus)
router.get("/nodes", authMiddleware, nodes)
router.post("/nodes", authMiddleware, addNode)
router.all(/^\/webhooks\/.*$/, handleWebhook)

export default router