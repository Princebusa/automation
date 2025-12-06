import type { NodeTypes } from "./dashboard";
import { use, useState } from "react";
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

export const ActionSheet = ({
  onSelect
}: {
  onSelect: (kind: NodeTypes, metadata: MetaData) => void; 

}) => {
  const [metadata, setMetaData] = useState<TimerMetadata | PriceTriggerMetadata>({
    time: 3600
  });
 const [selectedAction, setSelectedAction] = useState<any>()
  return (
    <Sheet open={true}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a Trigger</SheetTitle>
          <SheetDescription>
            Enter a Following Details to Create a Init Node 
          </SheetDescription>
        </SheetHeader>
       <div className="px-3 grid gap-5">
         <Select value={selectedAction} onValueChange={(value)=> setSelectedAction(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a TRIGGER" />
          </SelectTrigger>
          <SelectContent>
            
            <SelectGroup>
              {SUPPORTED_ACTION.map(({ id, title }) => (
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

        


        
       </div>
        <SheetFooter>
          <Button type="submit" onClick={()=> onSelect(
            selectedAction,
            metadata
          )}>Save changes</Button>
          <SheetClose asChild>
            <Button>
              close
            </Button>
            
          </SheetClose>
         
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
