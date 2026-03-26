import { NodeWrapper } from "@/component/NodeWrapper";
import { Handle, Position } from "@xyflow/react";

export type GitHubMetadata = {
  token: string;
  ownerRepo: string;
  title: string;
  body: string;
}

export const GitHub = ({ id, data }: { id: string, data: { metadata: GitHubMetadata, status?: any } }) => {
  const meta = data.metadata || {};
  return (
    <NodeWrapper status={data?.status} nodeId={id}>
      <div className="bg-gray-300 w-64 min-h-[100px] flex flex-col">
        <div className="bg-black text-white p-3 font-black uppercase tracking-tight flex items-center gap-2">
          🐙 GitHub Create Issue
        </div>
        <div className="p-4 flex-1">
           <div className="text-sm font-bold mb-1 truncate">{meta.ownerRepo || 'owner/repo'}</div>
           <div className="text-xs bg-white border-2 border-black p-2 mt-2 truncate w-full shadow-[2px_2px_0_0_#000] font-bold">
             {meta.title || 'Issue Title'}
           </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-6 h-6 bg-black border-4 border-white rounded-none -right-3" />
        <Handle type="target" position={Position.Left} className="w-6 h-6 bg-black border-4 border-white rounded-none -left-3" />
      </div>
    </NodeWrapper>
  );
}
