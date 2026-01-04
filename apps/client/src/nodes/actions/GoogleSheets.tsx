import { Handle, Position } from "@xyflow/react";

export type GoogleSheetsMetadata = {
  operation: 'read' | 'write' | 'append' | 'create';
  spreadsheetId?: string;
  range?: string;
  values?: any[][];
  apiKey?: string;
}

export const GoogleSheets = ({ data }: {
  data: {
    metadata: GoogleSheetsMetadata
  }
}) => {
  const operation = data.metadata.operation || 'read';
  const range = data.metadata.range || 'Sheet1!A1:Z1000';

  const getOperationIcon = (op: string) => {
    switch (op) {
      case 'read': return '📖';
      case 'write': return '✏️';
      case 'append': return '➕';
      case 'create': return '📋';
      default: return '📊';
    }
  };

  return (
    <div className="border py-2 px-4 rounded-xs bg-green-50 border-green-200 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span>{getOperationIcon(operation)}</span>
        <span className="text-xs font-semibold text-green-700 capitalize">{operation}</span>
      </div>
      <div className="text-xs text-gray-600 truncate mt-1">{range}</div>
      <div className="text-xs text-gray-500 mt-1">Google Sheets</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
