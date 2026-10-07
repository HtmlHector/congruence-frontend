"use client";

import React from "react";
import { CenterCanvas } from "./CenterCanvas";
import { ActorSidebar } from "./ActorSidebar";
import { StatusBar } from "./StatusBar";

export function ExecutionDeck() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      {/* 2-Column Split Execution Body (Center Canvas + Right Actor Sidebar) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Canvas (Tabs + Preview + Terminal + Changes) */}
        <CenterCanvas />

        {/* Right Actor & Lease Sidebar */}
        <div className="hidden lg:flex">
          <ActorSidebar />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}
