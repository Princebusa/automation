import { useEffect, useState, useCallback } from "react";
import {ActionSheet} from "./actionSheet"
import {Mail} from '../nodes/actions/mail'
import type { NodeTypes } from "comman";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import { Timer } from "@/nodes/triggers/Timer";
import {Trigger} from "@/nodes/triggers/Trigger"
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiGetWorkflow } from "@/lib/api";



interface NodeType {
  type: NodeTypes;
  data: {
    kind: "action" | "trigger";
    metadata: MetaData;
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
  "mail": Mail
};

export default function workflow() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!workflowId) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const wfRaw = await apiGetWorkflow(workflowId);
        const wf = Array.isArray(wfRaw)
          ? wfRaw.find((x: any) => String(x?._id) === String(workflowId)) ?? wfRaw[0]
          : wfRaw;

        // Backend stores nodes as { nodeId, data: { kind: "ACTION"|"TRIGGER" }, ... }
        const mappedNodes: NodeType[] = (wf?.nodes || []).map((n: any) => ({
          id: String(n.id),
          // backend `nodeId` is often a DB ObjectId, which won't match ReactFlow nodeTypes keys.
          // Use a safe fallback based on kind so something renders.
          type: ((n.type as NodeTypes) ||
            (typeof n.nodeId === "string" && ["mail", "timer", "price-trigger", "tr", "chat"].includes(n.nodeId)
              ? (n.nodeId as NodeTypes)
              : (String(n?.data?.kind || "").toUpperCase().includes("TRIGGER")
                ? ("timer" as NodeTypes)
                : ("mail" as NodeTypes)))) as NodeTypes,
          position: n.position,
          data: {
            kind:
              String(n?.data?.kind || "")
                .toLowerCase()
                .includes("trigger")
                ? "trigger"
                : "action",
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


  const [action, setAction] = useState<{
       position:{
        x: number,
        y: number
       }
       parentNode: string
  } | null>(null)
console.log(nodes)
console.log(edges)
  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
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
  console.log(sh)
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      {isLoading && (
        <div className="absolute top-4 left-4 z-10 text-white bg-gray-900/80 px-3 py-2 rounded">
          Loading workflow...
        </div>
      )}
      {loadError && (
        <div className="absolute top-4 left-4 z-10 text-red-300 bg-red-950/70 px-3 py-2 rounded border border-red-800">
          {loadError}
        </div>
      )}


      {action && <ActionSheet  onSelect={(type, metadata)=> {
        const nodeid = Math.random().toString()
        setNodes([...nodes, {
          id: nodeid,
          type,
          data:{
             kind: "action",
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
                  kind: "trigger",

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
      />
    </div>
  );
}
