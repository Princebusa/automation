import { Loader2, Check, X, Trash2 } from 'lucide-react';
import React from 'react';
import { useReactFlow } from '@xyflow/react';

interface NodeWrapperProps {
  nodeId?: string;
  status?: 'pending' | 'running' | 'success' | 'failed';
  children: React.ReactNode;
}

export const NodeWrapper = ({ nodeId, status, children }: NodeWrapperProps) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nodeId) return;
    setNodes((nodes) => nodes.filter(n => n.id !== nodeId));
    setEdges((edges) => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
  };

  return (
    <div className="relative group node-neo-wrapper">
      {/* Delete Button (visible on hover) */}
      {nodeId && (
        <button 
          onClick={handleDelete}
          className="absolute -top-4 -right-4 z-30 bg-red-500 border-4 border-black shadow-[4px_4px_0_0_#000] w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-400 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer"
        >
          <Trash2 className="w-5 h-5 text-black stroke-[3]" />
        </button>
      )}

      <div className="hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0 transition-all duration-200 cursor-pointer">
        <div className="[&>div]:!rounded-none [&>div]:!border-4 [&>div]:!border-black [&>div]:!shadow-[8px_8px_0_0_#000] hover:[&>div]:!shadow-[12px_12px_0_0_#000] [&>div]:transition-shadow">
           {children}
        </div>
      </div>
      
      {/* Status Overlay */}
      {status && (
        <div className="absolute -top-5 -left-5 z-20 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] w-10 h-10 flex items-center justify-center animate-in zoom-in">
          {status === 'running' && (
             <Loader2 className="w-6 h-6 text-black stroke-[3] animate-spin" />
          )}
          {status === 'success' && (
             <div className="w-full h-full bg-green-400 flex items-center justify-center">
               <Check className="w-6 h-6 text-black stroke-[4]" />
             </div>
          )}
          {status === 'failed' && (
             <div className="w-full h-full bg-red-400 flex items-center justify-center">
               <X className="w-6 h-6 text-black stroke-[4]" />
             </div>
          )}
        </div>
      )}
    </div>
  );
};
