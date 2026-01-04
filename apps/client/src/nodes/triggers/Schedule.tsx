import { Handle, Position } from "@xyflow/react";

export type ScheduleMetadata = {
  type: 'interval' | 'cron' | 'once';
  interval?: number; // in seconds
  cronExpression?: string;
  datetime?: string;
  timezone?: string;
}

export const Schedule = ({ data }: {
  data: {
    metadata: ScheduleMetadata
  }
}) => {
  const type = data.metadata.type || 'interval';
  
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

  return (
    <div className="border py-2 px-4 rounded-xs bg-indigo-50 border-indigo-200 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span className="text-lg">⏰</span>
        <span className="text-xs font-semibold text-indigo-700 capitalize">{type}</span>
      </div>
      <div className="text-xs text-gray-600 truncate mt-1">{getDisplayText()}</div>
      <div className="text-xs text-gray-500 mt-1">Schedule</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
