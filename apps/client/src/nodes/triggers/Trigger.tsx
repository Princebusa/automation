import { Handle, Position } from "@xyflow/react";

export type PriceTriggerMetadata ={
    price: number,
    assets: string
}


export const Trigger =({data, isConnectable}: {
    data: {
        metadata: PriceTriggerMetadata
    },
    isConnectable: boolean
})=> {

    console.log(data.metadata)
  
    return(
<div className="border py-1 px-4 rounded-xs">
     {data.metadata.assets}<br/>
     {data.metadata.price}
    <Handle type="source" position={Position.Right}></Handle>
</div>
    )
}