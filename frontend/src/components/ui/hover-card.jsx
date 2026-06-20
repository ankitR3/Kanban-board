import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "./lib/utils.js";

function HoverCard({ ...props }) {
  return <HoverCardPrimitive.Root openDelay={150} closeDelay={100} {...props} />;
}

function HoverCardTrigger({ ...props }) {
  return <HoverCardPrimitive.Trigger {...props} />;
}

function HoverCardContent({ className, align = "center", sideOffset = 8, ...props }) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 rounded-lg bg-[#262626] border border-[#3a3a3a] p-3 text-sm text-gray-200 shadow-xl outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
