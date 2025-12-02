import type { NodeKind } from "./dashboard";
import { useState } from "react";
import type { MetaData } from "./dashboard";
import { Button } from "@/components/ui/button";
import type { TimerMetadata  } from "../nodes/triggers/Timer"
import type {PriceTriggerMetadata} from "../nodes/triggers/Trigger"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React from "react";


const SUPPORTED_ACTION = [
  {
    id: "mail",
    title: "mail",
    description: "SENT MAIL",
  },
  {
    id: "chat",
    title: "chat",
    description: "chat with chatgpt",
  },
];

export const actionSheet = ({
  onSelect,
}: {
  onSelect: (kind: NodeKind, metadata: MetaData) => void;
}) => {
  const [metadata, setMetaData] = useState<TimerMetadata | PriceTriggerMetadata>({
    time: 3600
  });
  const [selectedTrigger, setSelectedTrigger] = useState(SUPPORTED_TRIGGER[0].id)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a Trigger</SheetTitle>
          <SheetDescription>
            Enter a Following Details to Create a Init Node 
          </SheetDescription>
        </SheetHeader>
       <div className="px-3 grid gap-5">
         <Select value={selectedTrigger} onValueChange={(value)=> setSelectedTrigger(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a TRIGGER" />
          </SelectTrigger>
          <SelectContent>
            
            <SelectGroup>
              {SUPPORTED_TRIGGER.map(({ id, title }) => (
                <React.Fragment key={id}>
                  <SelectItem 
                    value={id}
                  >
                    {title}
                  </SelectItem>
                </React.Fragment>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {selectedTrigger === "timer" && 
        <div className="grid gap-3">
           <Label className="capitalize">enter a time to trigger a flow every time</Label>
           <Input type="number" onChange={(e)=> setMetaData(metadata => ({...metadata, time: Number(e.target.value)}))}/>
        </div>
        }


        {selectedTrigger === "price-trigger" && 
        <div className="grid gap-3">
          <div className="grid gap-3">
            <Label>Enter Triggr Price</Label>
            <Input type="number" onChange={ (e) => setMetaData(metadata=>({...metadata, price: Number(e.target.value)}))}/>
          </div>
          
          
          </div>}
       </div>
        <SheetFooter>
          <Button type="submit" onClick={()=> onSelect(
            selectedTrigger,
            metadata
          )}>Save changes</Button>
         
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
