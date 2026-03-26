import type { NodeTypes } from "comman";
import { useState } from "react";
import type { MetaData } from "./workflow";
import { Button } from "@/components/ui/button";
import type { TimerMetadata } from "../nodes/triggers/Timer"
import type { PriceTriggerMetadata } from "../nodes/triggers/Trigger"
import type { WebhookMetadata } from "../nodes/triggers/Webhook";
import type { ScheduleMetadata } from "../nodes/triggers/Schedule";
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


const SUPPORTED_TRIGGER = [
  {
    id: "timer",
    title: "Timer",
    description: "Run this node every X seconds",
  },
  {
    id: "price-trigger",
    title: "Price Trigger",
    description: "Runs when price goes above a certain number",
  },
  {
    id: "webhook",
    title: "Webhook",
    description: "Triggered by HTTP requests",
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Run on specific schedule",
  },
];

export const TriggerSheet = ({
  onSelect,
}: {
  onSelect: (kind: NodeTypes, metadata: MetaData) => void;
}) => {
  const [metadata, setMetaData] = useState<MetaData>({});
  const [selectedTrigger, setSelectedTrigger] = useState<NodeTypes>("timer");
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
          <Select value={selectedTrigger} onValueChange={(value) => setSelectedTrigger(value as NodeTypes)}>
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

              <Input type="number" onChange={(e) => setMetaData(metadata => ({ ...metadata, time: Number(e.target.value) }))} />
            </div>
          }


          {selectedTrigger === "price-trigger" &&
            <div className="grid gap-3">
              <div className="grid gap-3">
                <Label>Enter Trigger Price</Label>
                <Input type="number" onChange={(e) => setMetaData((metadata: any) => ({ ...metadata, price: Number(e.target.value) }))} />
              </div>
            </div>}

          {selectedTrigger === "webhook" &&
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Endpoint Path</Label>
                <Input
                  placeholder="/webhook/my-endpoint"
                  onChange={(e) => setMetaData((metadata: any) => ({ ...metadata, endpoint: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>HTTP Method</Label>
                <Select value={metadata.method} onValueChange={(value) => setMetaData((metadata: any) => ({ ...metadata, method: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>}

          {selectedTrigger === "schedule" &&
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Schedule Type</Label>
                <Select value={metadata.type} onValueChange={(value) => setMetaData((metadata: any) => ({ ...metadata, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interval">Interval</SelectItem>
                    <SelectItem value="cron">Cron Expression</SelectItem>
                    <SelectItem value="once">Once</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {metadata.type === "interval" && (
                <div className="grid gap-2">
                  <Label>Interval (seconds)</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    onChange={(e) => setMetaData((metadata: any) => ({ ...metadata, interval: Number(e.target.value) }))}
                  />
                </div>
              )}
              {metadata.type === "cron" && (
                <div className="grid gap-2">
                  <Label>Cron Expression</Label>
                  <Input
                    placeholder="0 * * * *"
                    onChange={(e) => setMetaData((metadata: any) => ({ ...metadata, cronExpression: e.target.value }))}
                  />
                </div>
              )}
              {metadata.type === "once" && (
                <div className="grid gap-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    onChange={(e) => setMetaData((metadata: any) => ({ ...metadata, datetime: e.target.value }))}
                  />
                </div>
              )}
            </div>}
        </div>
        <SheetFooter className="mt-8">
          <Button
            type="submit"
            className="neo-btn rounded-none bg-yellow-400 text-black w-full py-6 text-xl font-black uppercase hover:bg-yellow-300"
            onClick={() => onSelect(selectedTrigger, metadata)}
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
