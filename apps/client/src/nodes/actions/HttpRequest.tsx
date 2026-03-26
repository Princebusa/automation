import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type HttpRequestMetadata = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

export const HttpRequest = ({ id, data }: { id: string, data: { metadata: HttpRequestMetadata, status?: any } }) => {
  const method = data.metadata?.method || 'GET';
  const url = data.metadata?.url || 'No URL set';
  
  const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;

  return (
    <NodeWrapper status={data?.status} nodeId={id}>
      <div className="bg-yellow-300 w-80 min-h-[100px] flex flex-col">
        <div className="bg-black text-white p-3 font-black uppercase tracking-tight flex items-center justify-between">
          <span>🌐 HTTP Request</span>
        </div>
        <div className="p-4 flex-1">
           <div className="flex items-center gap-2 mb-2">
             <span className="bg-white border-2 border-black font-black px-2 py-1 shadow-[2px_2px_0_0_#000]">{method}</span>
           </div>
           <div className="text-xs font-bold bg-white border-2 border-black p-2 truncate shadow-[2px_2px_0_0_#000]">
             {displayUrl}
           </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-6 h-6 bg-black border-4 border-white rounded-none -right-3" />
        <Handle type="target" position={Position.Left} className="w-6 h-6 bg-black border-4 border-white rounded-none -left-3" />
      </div>
    </NodeWrapper>
  );
}
