import type { NodeTypes } from "comman";
import { useState } from "react";
import type { MetaData } from "./workflow";
import { Button } from "@/components/ui/button";
import type { HttpRequestMetadata } from "../nodes/actions/HttpRequest";
import type { FileSystemMetadata } from "../nodes/actions/FileSystem";
import type { DataTransformMetadata } from "../nodes/actions/DataTransform";
import type { GoogleSheetsMetadata } from "../nodes/actions/GoogleSheets";
import type { MailMetadata } from "../nodes/actions/mail";
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
    title: "Send Email",
    description: "Send emails via SMTP",
  },
  {
    id: "http-request",
    title: "HTTP Request",
    description: "Make HTTP requests to any API",
  },
  {
    id: "file-system",
    title: "File System",
    description: "Read, write, delete files",
  },
  {
    id: "data-transform",
    title: "Data Transform",
    description: "Transform and manipulate data",
  },
  {
    id: "google-sheets",
    title: "Google Sheets",
    description: "Read/write to Google Sheets",
  },
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
      <SheetContent className="sm:max-w-md border-l-4 border-l-black bg-blue-300 shadow-none font-sans overflow-y-auto w-full max-h-screen">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-3xl font-black uppercase tracking-tight text-black">Create an Action</SheetTitle>
          <SheetDescription className="text-black/80 font-bold uppercase">
            Select an action node and configure its parameters
          </SheetDescription>
        </SheetHeader>
       <div className="px-3 grid gap-5">
         <Select value={selectedAction} onValueChange={(value)=> setSelectedAction(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an Action" />
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

        {/* HTTP Request Configuration */}
        {selectedAction === "http-request" && (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>URL</Label>
              <Input 
                placeholder="https://api.example.com/endpoint" 
                onChange={(e) => setMetaData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Method</Label>
              <Select value={metadata.method} onValueChange={(value) => setMetaData(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
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
              <Label>Headers (JSON)</Label>
              <Input 
                placeholder='{"Content-Type": "application/json"}' 
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    setMetaData(prev => ({ ...prev, headers }));
                  } catch {}
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>Body (JSON)</Label>
              <Input 
                placeholder='{"key": "value"}' 
                onChange={(e) => {
                  try {
                    const body = JSON.parse(e.target.value);
                    setMetaData(prev => ({ ...prev, body: JSON.stringify(body) }));
                  } catch {}
                }}
              />
            </div>
          </div>
        )}

        {/* File System Configuration */}
        {selectedAction === "file-system" && (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Operation</Label>
              <Select value={metadata.operation} onValueChange={(value) => setMetaData(prev => ({ ...prev, operation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>File Path</Label>
              <Input 
                placeholder="/path/to/file.txt" 
                onChange={(e) => setMetaData(prev => ({ ...prev, filePath: e.target.value }))}
              />
            </div>
            {(metadata.operation === "write") && (
              <div className="grid gap-2">
                <Label>Content</Label>
                <Input 
                  placeholder="File content" 
                  onChange={(e) => setMetaData(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
            )}
          </div>
        )}

        {/* Data Transform Configuration */}
        {selectedAction === "data-transform" && (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Operation</Label>
              <Select value={metadata.operation} onValueChange={(value) => setMetaData(prev => ({ ...prev, operation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Map</SelectItem>
                  <SelectItem value="filter">Filter</SelectItem>
                  <SelectItem value="reduce">Reduce</SelectItem>
                  <SelectItem value="sort">Sort</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Expression/Script</Label>
              <Input 
                placeholder="item => item.name" 
                onChange={(e) => setMetaData(prev => ({ ...prev, expression: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Mail Configuration */}
        {selectedAction === "mail" && (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>SMTP Host</Label>
              <Input 
                placeholder="smtp.gmail.com" 
                onChange={(e) => setMetaData(prev => ({ ...prev, host: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Port</Label>
              <Input 
                type="number"
                placeholder="587" 
                onChange={(e) => setMetaData(prev => ({ ...prev, port: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input 
                placeholder="your-email@gmail.com" 
                onChange={(e) => setMetaData(prev => ({ ...prev, user: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input 
                type="password"
                placeholder="your-app-password" 
                onChange={(e) => setMetaData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Google Sheets Configuration */}
        {selectedAction === "google-sheets" && (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Operation</Label>
              <Select value={metadata.operation} onValueChange={(value) => setMetaData(prev => ({ ...prev, operation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="append">Append</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Spreadsheet ID</Label>
              <Input 
                placeholder="your-spreadsheet-id" 
                onChange={(e) => setMetaData(prev => ({ ...prev, spreadsheetId: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Range</Label>
              <Input 
                placeholder="Sheet1!A1:Z1000" 
                onChange={(e) => setMetaData(prev => ({ ...prev, range: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input 
                type="password"
                placeholder="your-api-key" 
                onChange={(e) => setMetaData(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
          </div>
        )}

        


        
       </div>
        <SheetFooter className="mt-8 flex flex-col sm:flex-col gap-4">
          <Button 
            type="submit" 
            className="neo-btn rounded-none bg-yellow-400 text-black w-full py-6 text-xl font-black uppercase hover:bg-yellow-300"
            onClick={()=> onSelect(selectedAction, metadata)}
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
