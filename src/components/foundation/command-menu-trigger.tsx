"use client";

import { Command } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCommandMenu } from "./command-menu";

export function CommandMenuTriggerButton() {
  const { open } = useCommandMenu();

  return (
    <Button type="button" variant="outline" size="sm" onClick={open}>
      <Command aria-hidden="true" />
      Open palette
    </Button>
  );
}
