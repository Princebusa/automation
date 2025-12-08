import { useState, useCallback } from "react";
import {ActionSheet} from "./actionSheet"
import {Mail} from '../nodes/actions/mail'
import type { NodeTypes } from "comman";
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

export default function dashboard() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);


  const [action, setAction] = useState<{
       position:{
        x: number,
        y: number
       }
       parentNode: string
  } | null>(null)
// console.log(nodes)
// console.log(edges)
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
      
      <p>{JSON.stringify(nodes)}</p>


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
