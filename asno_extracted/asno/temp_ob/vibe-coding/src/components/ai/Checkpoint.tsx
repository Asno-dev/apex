"use client"

import { BookmarkIcon, type LucideProps } from "lucide-react"
import type { ComponentProps, HTMLAttributes } from "react"
import { Button } from "../ui/Button"
import { Separator } from "../ui/Separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/Tooltip"
import { cn } from "../../lib/utils"

export type CheckpointProps = HTMLAttributes<HTMLDivElement>

export const Checkpoint = ({ className, children, ...props }: CheckpointProps) => (
  <div
    className={cn("flex items-center gap-0.5 text-muted-foreground overflow-hidden", className)}
    {...props}
  >
    {children}
    <Separator className="flex-1 ml-2" />
  </div>
)

export type CheckpointIconProps = LucideProps

export const CheckpointIcon = ({ className, children, ...props }: CheckpointIconProps) =>
  children ?? <BookmarkIcon className={cn("size-4 shrink-0", className)} {...props} />

export type CheckpointTriggerProps = ComponentProps<typeof Button> & {
  tooltip?: string
}

export const CheckpointTrigger = ({
  children,
  className,
  variant = "ghost",
  size = "sm",
  tooltip,
  ...props
}: CheckpointTriggerProps) => {
  const button = (
    <Button size={size} type="button" variant={variant} className={cn("text-xs", className)} {...props}>
      {children}
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent align="start" side="bottom">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
