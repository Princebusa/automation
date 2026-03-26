import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type WebhookMetadata = {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  responseCode?: number;
}

export const Webhook = ({ data }: {
  data: {
    metadata: WebhookMetadata
  }
}) => {
  const method = data.metadata.method || 'POST';
  const endpoint = data.metadata.endpoint || '/webhook';

  return (
    <NodeWrapper status={(data as any)?.status}>
    <div className="border py-2 px-4 rounded-xs bg-orange-50 border-orange-200 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-orange-700">{method}</span>
        <span className="text-xs text-gray-600 truncate">{endpoint}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">Webhook</div>
      <Handle type="source" position={Position.Right} />
    </div>
      </NodeWrapper>
  );
}
