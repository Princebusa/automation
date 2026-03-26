import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import workflow from "./routes/workFlow.routes"
import cors from "cors";
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
dotenv.config();
const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", workflow)


// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MongoDB URI is not provided");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async (): Promise<void> => {
  await connectDB();
  
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  
  const rooms = new Map<string, Set<WebSocket>>();
  app.set('wssRooms', rooms);

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe' && data.workflowId) {
          if (!rooms.has(data.workflowId)) {
            rooms.set(data.workflowId, new Set());
          }
          rooms.get(data.workflowId)!.add(ws);
          
          ws.on('close', () => {
             rooms.get(data.workflowId)?.delete(ws);
          });
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();