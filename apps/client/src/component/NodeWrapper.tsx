import { Loader2, Check, X } from 'lucide-react';
import React from 'react';

interface NodeWrapperProps {
  status?: 'pending' | 'running' | 'success' | 'failed';
  children: React.ReactNode;
}

export const NodeWrapper = ({ status, children }: NodeWrapperProps) => {
  return (
    <div className="relative group node-neo-wrapper">
      <div className="hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0 transition-all duration-200 cursor-pointer">
        {/* Inject target-agnostic neo brut styles into the inner container of varying node types */}
        <div className="[&>div]:!rounded-none [&>div]:!border-4 [&>div]:!border-black [&>div]:!shadow-[6px_6px_0_0_#000] hover:[&>div]:!shadow-[8px_8px_0_0_#000] [&>div]:transition-shadow">
           {children}
        </div>
      </div>
      
      {status && (
        <div className="absolute -top-5 -right-5 z-20 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] w-10 h-10 flex items-center justify-center">
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
