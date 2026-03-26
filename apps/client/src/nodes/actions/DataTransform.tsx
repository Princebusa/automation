import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type DataTransformMetadata = {
  operation: 'map' | 'filter' | 'reduce' | 'sort' | 'custom';
  expression?: string;
  script?: string;
  field?: string;
  value?: any;
}

export const DataTransform = ({ data }: {
  data: {
    metadata: DataTransformMetadata
  }
}) => {
  const operation = data.metadata.operation || 'map';

  const getOperationIcon = (op: string) => {
    switch (op) {
      case 'map': return '🔄';
      case 'filter': return '🔍';
      case 'reduce': return '➕';
      case 'sort': return '📊';
      case 'custom': return '⚙️';
      default: return '🔧';
    }
  };

  return (
    <NodeWrapper status={(data as any)?.status}>
    <div className="border py-2 px-4 rounded-xs bg-purple-50 border-purple-200 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span>{getOperationIcon(operation)}</span>
        <span className="text-xs font-semibold text-purple-700 capitalize">{operation}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">Data Transform</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
      </NodeWrapper>
  );
}
