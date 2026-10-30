import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreditCard, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu";

const meta = {
  title: "Components/Dropdown menu",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuContent align="start" className="w-56">
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
  ),
};
