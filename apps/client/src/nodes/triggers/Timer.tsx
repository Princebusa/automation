import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position, useReactFlow } from "@xyflow/react";

export type TimerMetadata = {
  time?: number;
  endTime?: string;
}

export const Timer = ({ id, data }: { id: string, data: { metadata: TimerMetadata, status?: any } }) => {
  const { setNodes } = useReactFlow();
  const time = data.metadata?.time || 0;
  const endTime = data.metadata?.endTime || "";

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, metadata: { ...(n.data?.metadata as any || {}), time: val } } } : n));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, metadata: { ...(n.data?.metadata as any || {}), endTime: val } } } : n));
  };

  return (
    <NodeWrapper status={data?.status} nodeId={id}>
      <div className="bg-pink-300 w-72 min-h-[140px] flex flex-col border-4 border-black">
        <div className="bg-black text-white p-3 font-black uppercase tracking-tight flex items-center gap-2 border-b-4 border-black">
          ⏳ Timer Trigger
        </div>
        <div className="p-4 flex-1 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase">Run Every (sec)</label>
              <input 
                type="number" 
                value={time} 
                onChange={handleTimeChange}
                className="w-full border-4 border-black p-2 font-bold focus:outline-none focus:bg-pink-100 transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-red-600">Stop After (End Time)</label>
              <input 
                type="datetime-local" 
                value={endTime} 
                onChange={handleEndTimeChange}
                className="w-full border-4 border-black p-2 font-bold text-xs focus:outline-none focus:bg-pink-100 transition-colors"
              />
            </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-6 h-6 bg-black border-4 border-white rounded-none -right-3" />
      </div>
    </NodeWrapper>
  );
}