import { Router } from "express";
import {authMiddleware} from '../middleware/auth.middleware'
import { createWorkflow, getWorkflow, updateWorkflow, nodes, addNode, getAllWorkflow, executeWorkflow, executeNode, handleWebhook, updateNodeStatus } from "../controllers/workFlow.controller";


const router = Router()

router.post("/workflow", authMiddleware, createWorkflow)
router.get("/workflow", authMiddleware, getAllWorkflow)
router.get("/workflow/:workflowId", authMiddleware, getWorkflow)
router.put("/workflow/:workflowId", authMiddleware, updateWorkflow)
router.post("/workflow/:workflowId/execute", authMiddleware, executeWorkflow)
router.post("/execute-node", authMiddleware, executeNode)
router.post("/node-status", updateNodeStatus)
router.get("/nodes", authMiddleware, nodes)
router.post("/nodes", authMiddleware, addNode)
router.all(/^\/webhooks\/.*$/, handleWebhook)

export default router