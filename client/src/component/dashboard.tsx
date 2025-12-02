import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import { Timer } from "@/nodes/triggers/Timer";
import {Trigger} from "@/nodes/triggers/Trigger"

export type NodeKind = "timer" | "tr" | "chat";

interface NodeType {
  type: NodeKind;
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
  target: string;
}

const nodeTypes = {
  "timer": Timer,
  "price-trigger": Trigger
};

export default function dashboard() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
    (params: any, sh: any)=>
    {
console.log(sh)
    }
    ,[]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <p>{JSON.stringify(nodes)}</p>
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
