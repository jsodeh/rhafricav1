import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-normal text-gray-900 placeholder:text-gray-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:border-blue-500 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
