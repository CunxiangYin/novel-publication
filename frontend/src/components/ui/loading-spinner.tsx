import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-8 w-8 border-4",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary-foreground",
        muted: "text-muted-foreground",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, fullScreen = false, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant, className }))}
        role="status"
        aria-label="Loading..."
        {...props}
      />
    )

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            {spinner}
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        </div>
      )
    }

    if (text) {
      return (
        <div className="flex items-center space-x-2">
          {spinner}
          <span className="text-sm text-muted-foreground">{text}</span>
        </div>
      )
    }

    return spinner
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Inline spinner for use within components
export const InlineSpinner = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingSpinnerProps, 'fullScreen'>
>(({ className, size = "sm", ...props }, ref) => (
  <LoadingSpinner
    ref={ref}
    className={cn("inline-block", className)}
    size={size}
    {...props}
  />
))
InlineSpinner.displayName = "InlineSpinner"

export { LoadingSpinner, spinnerVariants }