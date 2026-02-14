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
import { apiGetWorkflow, apiUpdateWorkflow } from "@/lib/api";



interface NodeType {
  type: NodeTypes;
  data: {
    kind: "ACTION" | "TRIGGER";
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
      alert('Workflow updated successfully!');
    } catch (error) {
      console.error('Failed to update workflow:', error);
      alert('Failed to update workflow. Please try again.');
    } finally {
      setIsSaving(false);
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
    <div style={{ width: "100vw", height: "100vh" }}>
      {JSON.stringify(nodes)}
      
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={handleUpdateWorkflow}
          disabled={!hasChanges || isSaving || isLoading}
          variant="outline"
          className="bg-green-600 text-white border-green-700 hover:bg-green-700 disabled:bg-gray-500"
        >
          {isSaving ? 'Saving...' : 'Update'}
        </Button>
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
      />
    </div>
  );
}
