import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-blue-500 active:bg-blue-800 border-0",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-red-500 active:bg-red-800 border-0",
        outline:
          "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm hover:-translate-y-0.5 focus-visible:ring-blue-500 active:bg-gray-100",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-sm hover:-translate-y-0.5 focus-visible:ring-gray-500 active:bg-gray-300 border-0",
        ghost: "text-gray-800 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5 focus-visible:ring-gray-500 active:bg-gray-200 border-0",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-blue-500 border-0",
        blue: "bg-blue-700 text-white hover:bg-blue-800 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-blue-500 active:bg-blue-900 border-0",
      },
      size: {
        default: "h-10 px-6 py-2 min-w-[44px] rounded-md",
        sm: "h-8 px-4 py-1 text-sm min-w-[36px] rounded-sm",
        lg: "h-12 px-8 py-3 text-lg min-w-[48px] rounded-lg",
        icon: "h-10 w-10 min-w-[44px] rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
