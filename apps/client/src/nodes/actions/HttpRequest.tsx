import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type HttpRequestMetadata = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

export const HttpRequest = ({ data }: {
  data: {
    metadata: HttpRequestMetadata
  }
}) => {
  const method = data.metadata.method || 'GET';
  const url = data.metadata.url || 'No URL set';
  
  // Truncate URL if too long
  const displayUrl = url.length > 30 ? url.substring(0, 27) + '...' : url;

  return (
    <NodeWrapper status={(data as any)?.status}>
    <div className="border py-2 px-4 rounded-xs bg-blue-50 border-blue-200 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-blue-700">{method}</span>
        <span className="text-xs text-gray-600 truncate">{displayUrl}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">HTTP Request</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
      </NodeWrapper>
  );
}
