import { Router } from "express";
import {authMiddleware} from '../middleware/auth.middleware'
import { createWorkflow, getWorkflow, nodes, getAllWorkflow } from "../controllers/workFlow.controller";


const router = Router()

router.post("/workflow", authMiddleware, createWorkflow)
router.get("/workflow", authMiddleware, getAllWorkflow)
router.get("/workflow/:workflowId", authMiddleware, getWorkflow)
router.get("/nodes", authMiddleware, nodes)
export default router