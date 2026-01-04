import { Handle, Position } from "@xyflow/react";

export type FileSystemMetadata = {
  operation: 'read' | 'write' | 'delete' | 'exists';
  filePath: string;
  content?: string;
  encoding?: 'utf8' | 'base64';
}

export const FileSystem = ({ data }: {
  data: {
    metadata: FileSystemMetadata
  }
}) => {
  const operation = data.metadata.operation || 'read';
  const filePath = data.metadata.filePath || 'No file path';
  
  // Truncate file path if too long
  const displayPath = filePath.length > 25 ? filePath.substring(0, 22) + '...' : filePath;

  const getOperationIcon = (op: string) => {
    switch (op) {
      case 'read': return '📖';
      case 'write': return '✏️';
      case 'delete': return '🗑️';
      case 'exists': return '🔍';
      default: return '📁';
    }
  };

  return (
    <div className="border py-2 px-4 rounded-xs bg-green-50 border-green-200 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span>{getOperationIcon(operation)}</span>
        <span className="text-xs font-semibold text-green-700 capitalize">{operation}</span>
      </div>
      <div className="text-xs text-gray-600 truncate mt-1">{displayPath}</div>
      <div className="text-xs text-gray-500 mt-1">File System</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
