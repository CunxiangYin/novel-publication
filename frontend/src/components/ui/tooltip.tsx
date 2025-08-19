import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Convenience wrapper component
export interface SimpleTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  disabled?: boolean
  className?: string
}

const SimpleTooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 700,
  disabled = false,
  className,
}: SimpleTooltipProps) => {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Hook for managing tooltip state
export function useTooltip() {
  const [open, setOpen] = React.useState(false)
  
  const show = React.useCallback(() => setOpen(true), [])
  const hide = React.useCallback(() => setOpen(false), [])
  const toggle = React.useCallback(() => setOpen(prev => !prev), [])

  return {
    open,
    show,
    hide,
    toggle,
    setOpen,
  }
}

// Enhanced tooltip with custom content
export interface EnhancedTooltipProps extends SimpleTooltipProps {
  title?: string
  description?: string
  maxWidth?: number
}

const EnhancedTooltip = ({
  title,
  description,
  content,
  maxWidth = 300,
  className,
  ...props
}: EnhancedTooltipProps) => {
  const tooltipContent = content || (
    <div className="space-y-1" style={{ maxWidth }}>
      {title && <div className="font-medium">{title}</div>}
      {description && <div className="text-xs text-muted-foreground">{description}</div>}
    </div>
  )

  return (
    <SimpleTooltip
      content={tooltipContent}
      className={cn("max-w-xs", className)}
      {...props}
    />
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
  EnhancedTooltip,
}