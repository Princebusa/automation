import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type TimerMetadata = {
  time?: number;
}

export const Timer = ({ id, data }: { id: string, data: { metadata: TimerMetadata, status?: any } }) => {
  const time = data.metadata?.time || 0;

  return (
    <NodeWrapper status={data?.status} nodeId={id}>
      <div className="bg-pink-300 w-64 min-h-[100px] flex flex-col">
        <div className="bg-black text-white p-3 font-black uppercase tracking-tight flex items-center gap-2">
          ⏳ Timer Trigger
        </div>
        <div className="p-4 flex-1 flex items-center justify-center">
           <div className="text-sm font-bold bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0_0_#000]">
             Every <span className="text-xl font-black">{time}</span> seconds
           </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-6 h-6 bg-black border-4 border-white rounded-none -right-3" />
      </div>
    </NodeWrapper>
  );
}