import { Handle, Position } from "@xyflow/react";


export type MailMetadata ={
    port: string,
    host: string,
    user: string,
    password: string
}


export const Mail =({data}: {
    data: {
        metadata: MailMetadata
    }
})=> {

   
  
    return(
<div className="border py-1 px-4 rounded-xs">
    
     mail
    <Handle type="source" position={Position.Right}></Handle>
     <Handle type="target" position={Position.Left}></Handle>
</div>
    )
}