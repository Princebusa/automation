import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type MailMetadata = {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  to?: string;
  subject?: string;
  body?: string;
}

export const Mail = ({ id, data }: { id: string, data: { metadata: MailMetadata, status?: any } }) => {
  const meta = data.metadata || {};
  return (
    <NodeWrapper status={data?.status} nodeId={id}>
      <div className="bg-blue-300 w-64 min-h-[100px] flex flex-col">
        <div className="bg-black text-white p-3 font-black uppercase tracking-tight flex items-center justify-between">
          <span>📧 Send Email</span>
        </div>
        <div className="p-4 flex-1">
           <div className="flex flex-col gap-2 mb-2">
             <div className="text-[10px] font-bold uppercase">To:</div>
             <span className="bg-white border-2 border-black font-black px-2 py-1 shadow-[2px_2px_0_0_#000] truncate">
                {meta.to || 'No Recipient'}
             </span>
             <div className="text-[10px] font-bold uppercase mt-1">Subject:</div>
             <div className="text-xs italic bg-white border-2 border-black px-2 py-1 truncate shadow-[2px_2px_0_0_#000]">
                {meta.subject || 'No Subject'}
             </div>
           </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-6 h-6 bg-black border-4 border-white rounded-none -right-3" />
        <Handle type="target" position={Position.Left} className="w-6 h-6 bg-black border-4 border-white rounded-none -left-3" />
      </div>
    </NodeWrapper>
  );
}