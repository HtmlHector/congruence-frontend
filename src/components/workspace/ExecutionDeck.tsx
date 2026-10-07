"use client";

import React from "react";
import { LanesSidebar } from "./LanesSidebar";
import { CenterCanvas } from "./CenterCanvas";
import { ActorSidebar } from "./ActorSidebar";
import { StatusBar } from "./StatusBar";

export function ExecutionDeck() {

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      {/* 3-Column Split Execution Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sub-Sidebar (Lanes) */}
        <div className="hidden md:flex">
          <LanesSidebar />
        </div>

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
