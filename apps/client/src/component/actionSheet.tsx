import type { NodeTypes } from "comman";
import { useState } from "react";
import type { MetaData } from "./workflow";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const SUPPORTED_ACTION = [
  {
    id: "http-request",
    title: "HTTP Request",
    description: "Make HTTP requests to any API",
  },
  {
    id: "mail",
    title: "Send Email (SMTP)",
    description: "Send emails directly via SMTP",
  }
];

export const ActionSheet = ({
  onSelect
}: {
  onSelect: (kind: NodeTypes, metadata: MetaData) => void; 
}) => {
  const [metadata, setMetaData] = useState<MetaData>({});
  const [selectedAction, setSelectedAction] = useState<any>()

  return (
    <Sheet open={true}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create an Action</SheetTitle>
          <SheetDescription>
            Select an action node and configure its parameters
          </SheetDescription>
        </SheetHeader>
       <div className="px-3 grid gap-5 mt-4">
         <Select value={selectedAction} onValueChange={(value)=> setSelectedAction(value)}>
          <SelectTrigger className="w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_#000]">
            <SelectValue placeholder="Select an Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SUPPORTED_ACTION.map(({ id, title }) => (
                <React.Fragment key={id}>
                  <SelectItem value={id}>{title}</SelectItem>
                </React.Fragment>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* HTTP Request Configuration */}
        {selectedAction === "http-request" && (
          <div className="grid gap-3 p-4 border-4 border-black bg-yellow-300 shadow-[4px_4px_0_0_#000] mt-4">
            <h3 className="font-black uppercase">🌐 HTTP Configuration</h3>
            <div className="grid gap-2">
              <Label className="font-bold uppercase text-xs">Method</Label>
              <Select value={metadata.method} onValueChange={(value) => setMetaData(prev => ({ ...prev, method: value }))}>
                <SelectTrigger className="bg-white border-2 border-black rounded-none">
                  <SelectValue placeholder="GET" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="font-bold uppercase text-xs">Target URL</Label>
              <Input 
                placeholder="https://api.example.com/endpoint" 
                onChange={(e) => setMetaData(prev => ({ ...prev, url: e.target.value }))}
                className="border-2 border-black rounded-none shadow-[2px_2px_0_0_#000] bg-white font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold uppercase text-xs">Headers (JSON)</Label>
              <Input 
                placeholder='{"Authorization": "Bearer token"}' 
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    setMetaData(prev => ({ ...prev, headers }));
                  } catch {}
                }}
                className="border-2 border-black rounded-none shadow-[2px_2px_0_0_#000] bg-white font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold uppercase text-xs">Body (JSON)</Label>
              <Input 
                placeholder='{"key": "value"}' 
                onChange={(e) => {
                  try {
                    const body = JSON.parse(e.target.value);
                    setMetaData(prev => ({ ...prev, body: JSON.stringify(body) }));
                  } catch {}
                }}
                className="border-2 border-black rounded-none shadow-[2px_2px_0_0_#000] bg-white font-bold"
              />
            </div>
          </div>
        )}

        {/* Mail Configuration */}
        {selectedAction === "mail" && (
          <div className="grid gap-3 p-4 border-4 border-black bg-blue-300 shadow-[4px_4px_0_0_#000] mt-4 max-h-[50vh] overflow-y-auto">
            <h3 className="font-black uppercase">📧 SMTP Configuration</h3>
            
            <div className="grid grid-cols-2 gap-2">
               <div className="grid gap-1">
                 <Label className="font-bold uppercase text-[10px]">SMTP Host</Label>
                 <Input 
                   placeholder="smtp.gmail.com" 
                   onChange={(e) => setMetaData(prev => ({ ...prev, host: e.target.value }))}
                   className="border-2 border-black rounded-none bg-white text-xs h-8"
                 />
               </div>
               <div className="grid gap-1">
                 <Label className="font-bold uppercase text-[10px]">Port</Label>
                 <Input 
                   type="number"
                   placeholder="587" 
                   onChange={(e) => setMetaData(prev => ({ ...prev, port: e.target.value }))}
                   className="border-2 border-black rounded-none bg-white text-xs h-8"
                 />
               </div>
            </div>

            <div className="grid gap-1">
              <Label className="font-bold uppercase text-[10px]">Username</Label>
              <Input 
                placeholder="your-email@gmail.com" 
                onChange={(e) => setMetaData(prev => ({ ...prev, user: e.target.value }))}
                className="border-2 border-black rounded-none bg-white text-xs h-8"
              />
            </div>
            <div className="grid gap-1">
              <Label className="font-bold uppercase text-[10px]">App Password</Label>
              <Input 
                type="password"
                placeholder="****" 
                onChange={(e) => setMetaData(prev => ({ ...prev, password: e.target.value }))}
                className="border-2 border-black rounded-none bg-white text-xs h-8"
              />
            </div>

            <hr className="border-black border-2 my-2" />
            
            <div className="grid gap-1">
              <Label className="font-bold uppercase text-[10px]">To Address</Label>
              <Input 
                placeholder="recipient@example.com" 
                onChange={(e) => setMetaData(prev => ({ ...prev, to: e.target.value }))}
                className="border-2 border-black rounded-none bg-white text-xs h-8"
              />
            </div>
            <div className="grid gap-1">
              <Label className="font-bold uppercase text-[10px]">Subject</Label>
              <Input 
                placeholder="Automated Alert" 
                onChange={(e) => setMetaData(prev => ({ ...prev, subject: e.target.value }))}
                className="border-2 border-black rounded-none bg-white text-xs h-8"
              />
            </div>
            <div className="grid gap-1">
              <Label className="font-bold uppercase text-[10px]">Body Text</Label>
              <textarea 
                placeholder="Workflow execution completed." 
                onChange={(e) => setMetaData(prev => ({ ...prev, body: e.target.value }))}
                className="border-2 border-black rounded-none bg-white text-xs p-2 min-h-[60px]"
              />
            </div>

          </div>
        )}
       </div>

        <SheetFooter className="mt-8 flex flex-col sm:flex-col gap-4">
          <Button 
            type="submit" 
            className="neo-btn rounded-none bg-yellow-400 text-black w-full py-6 text-xl font-black uppercase hover:bg-yellow-300"
            onClick={()=> {
               // Verify required fields if HTTP
               if (selectedAction === 'http-request' && !metadata.url) return alert('URL is required');
               // Verify required fields if Mail
               if (selectedAction === 'mail' && (!metadata.host || !metadata.user || !metadata.password || !metadata.to)) return alert('SMTP credentials & To address are required');
               
               onSelect(selectedAction, metadata);
            }}
          >
            Save changes
          </Button>
          <SheetClose asChild>
            <Button className="neo-btn rounded-none bg-white text-black w-full py-4 text-lg font-bold uppercase hover:bg-gray-100">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
