"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClass } from "./ui";

export function DeleteButton({
  label,
  message,
  className,
}: {
  label: string;
  message: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={cn(buttonClass("danger", "sm"), className)}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
