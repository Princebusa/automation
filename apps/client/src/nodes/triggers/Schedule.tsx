import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position, useReactFlow } from "@xyflow/react";

export type ScheduleMetadata = {
  type: 'interval' | 'cron' | 'once';
  interval?: number; // in seconds
  cronExpression?: string;
  datetime?: string;
  timezone?: string;
  endTime?: string;
}

export const Schedule = ({ id, data }: {
  id: string;
  data: {
    metadata: ScheduleMetadata;
    status?: any;
  }
}) => {
  const { setNodes } = useReactFlow();
  const type = data.metadata.type || 'interval';
  const endTime = data.metadata.endTime || "";
  
  const getDisplayText = () => {
    switch (type) {
      case 'interval':
        return `Every ${data.metadata.interval || 60}s`;
      case 'cron':
        return data.metadata.cronExpression || '0 * * * *';
      case 'once':
        return data.metadata.datetime ? new Date(data.metadata.datetime).toLocaleTimeString() : 'Once';
      default:
        return 'Schedule';
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, metadata: { ...(n.data?.metadata || {}), endTime: val } } } : n));
  };

  return (
    <NodeWrapper status={(data as any)?.status} nodeId={id}>
    <div className="border-4 border-black py-2 px-4 bg-indigo-50 min-w-[180px] shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center gap-2 border-b-2 border-black pb-1 mb-2">
        <span className="text-lg">⏰</span>
        <span className="text-xs font-black uppercase tracking-tighter text-indigo-700 capitalize">{type}</span>
      </div>
      <div className="text-xs font-bold text-gray-800 truncate mt-1 bg-white border-2 border-black p-1">{getDisplayText()}</div>
      
      <div className="mt-3 flex flex-col gap-1">
        <label className="text-[9px] font-black uppercase text-red-600">End Time</label>
        <input 
          type="datetime-local" 
          value={endTime} 
          onChange={handleEndTimeChange}
          className="w-full border-2 border-black p-1 font-bold text-[10px] focus:outline-none focus:bg-indigo-100 transition-colors"
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-black border-2 border-white rounded-none -right-2" />
    </div>
      </NodeWrapper>
  );
}
