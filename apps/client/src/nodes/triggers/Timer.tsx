import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type TimerMetadata ={
    time: number
}


export const Timer =({data, isConnectable}: {
    data: {
        metadata: TimerMetadata
    },
    isConnectable: boolean
})=> {

   
  
    return (
    <NodeWrapper status={(data as any)?.status}>
<div className="border py-1 px-4 rounded-xs">
     {data.metadata.time}
    <Handle type="source" position={Position.Right}></Handle>
</div>
        </NodeWrapper>
  )
}