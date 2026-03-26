import { useEffect, useState, useCallback } from "react";
import {ActionSheet} from "./actionSheet"
import {Mail} from '../nodes/actions/mail'
import {HttpRequest} from '../nodes/actions/HttpRequest'
import {FileSystem} from '../nodes/actions/FileSystem'
import {DataTransform} from '../nodes/actions/DataTransform'
import {GoogleSheets} from '../nodes/actions/GoogleSheets'
import type { NodeTypes } from "comman";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import { Timer } from "@/nodes/triggers/Timer";
import {Trigger} from "@/nodes/triggers/Trigger"
import {Webhook} from "@/nodes/triggers/Webhook"
import {Schedule} from "@/nodes/triggers/Schedule"
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiGetWorkflow, apiUpdateWorkflow, apiExecuteWorkflow } from "@/lib/api";



interface NodeType {
  type: NodeTypes;
  data: {
    kind: "ACTION" | "TRIGGER";
    metadata: MetaData;
    status?: 'pending' | 'running' | 'success' | 'failed';
  };
  id: string;
  position: { x: number; y: number };
}
export type MetaData = any;
interface Edge {
  id: string;
  source: string;
  target: string
}

const nodeTypes = {
  "timer": Timer,
  "price-trigger": Trigger,
  "webhook": Webhook,
  "schedule": Schedule,
  "mail": Mail,
  "http-request": HttpRequest,
  "file-system": FileSystem,
  "data-transform": DataTransform,
  "google-sheets": GoogleSheets
};

export default function workflow() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ success: boolean; error?: string; nodeOutputs?: Record<string, unknown> } | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateWorkflow = async () => {
    if (!workflowId) return;

    setIsSaving(true);
    try {
      await apiUpdateWorkflow(workflowId, { nodes, edges });
      setHasChanges(false);
      alert("Workflow updated successfully!");
    } catch (error) {
      console.error("Failed to update workflow:", error);
      alert("Failed to update workflow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (!workflowId) return;
    setIsRunning(true);
    setRunResult(null);
    try {
      const result = await apiExecuteWorkflow(workflowId);
      setRunResult({
        success: result.success ?? false,
        error: result.error,
        nodeOutputs: result.nodeOutputs,
      });
      if (result.success) {
        alert("Workflow ran successfully!");
      } else {
        alert(`Workflow run failed: ${result.error ?? "Unknown error"}`);
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to run workflow";
      setRunResult({ success: false, error: message });
      alert(message);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!workflowId) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const wfRaw = await apiGetWorkflow(workflowId);
        console.log("Fetched workflow data:", wfRaw);
        const wf = Array.isArray(wfRaw)
          ? wfRaw.find((x: any) => String(x?._id) === String(workflowId)) ?? wfRaw[0]
          : wfRaw;

        // Backend stores nodes as { nodeId, data: { kind: "ACTION"|"TRIGGER" }, ... }
        const mappedNodes: NodeType[] = (wf?.nodes || []).map((n: any) => ({
          id: String(n.id),
          type: n.nodeId.title,
          position: n.position,
          data: {
            kind:
              String(n?.data?.kind || "")
                .toLowerCase()
                .includes("trigger")
                ? "TRIGGER"
                : "ACTION",
            metadata: n?.data?.metadata,
          },
        }));

        const mappedEdges: Edge[] = (wf?.edges || []).map((e: any) => ({
          id: String(e.id),
          source: String(e.source),
          target: String(e.target),
        }));

        if (!cancelled) {
          setNodes(mappedNodes);
          setEdges(mappedEdges);
        }
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Failed to load workflow");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workflowId]);

  useEffect(() => {
    if (!workflowId) return;

    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => {
      console.log("Connected to WS");
      ws.send(JSON.stringify({ type: "subscribe", workflowId }));
    };

    ws.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        if (eventData.type === "node-status-change" && eventData.nodeId) {
          setNodes((nds) => 
            nds.map((n) => {
               if (n.id === eventData.nodeId) {
                 return { ...n, data: { ...n.data, status: eventData.status } };
               }
               return n;
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      ws.close();
    };
  }, [workflowId]);


  const [action, setAction] = useState<{
       position:{
        x: number,
        y: number
       }
       parentNode: string
  } | null>(null)

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
      setHasChanges(true);
    },
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
      setHasChanges(true);
    },
    []
  );
  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const onConnectEnd = useCallback(
    (_params: any, sh: any)=>
    {

if(!sh.isValid){
 
  setAction({
    position: {
      x: sh.from.x + 100,
      y: sh.from.y + -18
    },
    parentNode: sh.fromNode.id
  })
}
    }
    ,[]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#fefce8" }}>
      {/* Floating Neo-Brutalist Header */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center bg-white border-4 border-black p-4 shadow-[8px_8px_0_0_#000]">
        <div className="font-black text-2xl tracking-tighter uppercase">
          n8n<span className="text-pink-500">.clone</span> / <span className="text-gray-500">Editor</span>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleRunWorkflow}
            disabled={isLoading || isRunning || nodes.length === 0}
            className={`font-black uppercase text-lg border-4 border-black rounded-none px-6 py-6 ${isRunning ? 'bg-gray-300' : 'bg-yellow-400 hover:bg-yellow-300 neo-btn text-black'}`}
          >
            {isRunning ? "Running…" : "Run"}
          </Button>
          <Button
            onClick={handleUpdateWorkflow}
            disabled={!hasChanges || isSaving || isLoading}
            className={`font-black uppercase text-lg border-4 border-black rounded-none px-6 py-6 ${!hasChanges || isSaving ? 'bg-gray-300' : 'bg-green-400 hover:bg-green-300 neo-btn text-black'}`}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
          <Button
            onClick={handleLogout}
            className="font-black uppercase text-lg border-4 border-black bg-white hover:bg-gray-100 text-black neo-btn rounded-none px-6 py-6"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Quit
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 bg-yellow-300 border-4 border-black p-4 shadow-[4px_4px_0_0_#000] font-bold text-xl uppercase">
          Loading workflow...
        </div>
      )}
      {loadError && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 bg-red-400 border-4 border-black p-4 shadow-[4px_4px_0_0_#000] font-bold text-xl uppercase">
          {loadError}
        </div>
      )}
      {runResult && (
        <div
          className={`absolute top-32 left-1/2 -translate-x-1/2 z-10 px-8 py-4 border-4 border-black font-black uppercase shadow-[8px_8px_0_0_#000] text-xl ${
            runResult.success ? "bg-green-400 text-black" : "bg-red-400 text-black"
          }`}
        >
          {runResult.success ? "Success: Run complete" : `Failed: ${runResult.error ?? "Unknown error"}`}
        </div>
      )}


      {action && <ActionSheet  onSelect={(type, metadata)=> {
        const nodeid = Math.random().toString()
        setNodes([...nodes, {
          id: nodeid,
          type,
          data:{
             kind: "ACTION",
            metadata,
           
          },
          position: action.position

        }])

        setEdges([...edges, {
          id: `${nodeid}-weerwer`,
          source: action.parentNode,
          target: nodeid
        }])
        setAction(null)
      }}/>}



      {!nodes.length && (
        <TriggerSheet
          onSelect={(type, metadata) => {
            setNodes([
              ...nodes,
              {
                id: Math.random().toString(),
                type,
                data: {
                  kind: "TRIGGER",

                  metadata,
                },
                position: { x: 0, y: 0 },
              },
            ]);
          }}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
      >
        <Background color="#000" gap={24} size={2} />
      </ReactFlow>
    </div>
  );
}
