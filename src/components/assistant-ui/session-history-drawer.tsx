"use client";

import React, { useState } from "react";
import { History, MessageSquare, Plus, Clock } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ThreadList } from "@/components/assistant-ui/thread-list";

export function SessionHistoryDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
          title="Past conversation threads"
        >
          <History className="size-3.5" />
          <span className="hidden sm:inline">Sessions</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3 shadow-xl max-h-96 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MessageSquare className="size-3.5 text-primary" />
            <span>Conversation Threads</span>
          </div>
        </div>
        <div className="py-1">
          <ThreadList />
        </div>
      </PopoverContent>
    </Popover>
  );
}
