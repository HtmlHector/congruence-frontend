"use client";

import { CreditCard, MoreHorizontal, Settings } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DialogSpecimen() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Open dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove member</DialogTitle>
          <DialogDescription>
            Access ends immediately. Work already created in the workspace stays where it is.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button
              type="button"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            className={buttonVariants({ variant: "destructive", size: "sm" })}
          >
            Remove member
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MenuSpecimen() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Workspace options"
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
        >
          <MoreHorizontal aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <Settings aria-hidden="true" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard aria-hidden="true" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Leave workspace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
