import React from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

export type IconButtonVariant = "primary" | "secondary" | "iconCloseForm" | "danger" | "success" | "warning"
export type IconButtonSize = "sm" | "md" | "lg"

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  icon: ReactNode
  tooltip?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      tooltip,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"

    const variantClasses = {
      primary: "text-gray-600 hover:text-gray-600 hover:bg-gray-100",
      secondary: "border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100",
      iconCloseForm: "bg-transparent rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100", // text-gray-600 hover:text-gray-600 hover:bg-gray-50 focus:ring-gray-300
      danger: "", // text-red-600 hover:text-red-800 hover:bg-red-50 focus:ring-red-300
      success: "", // text-green-600 hover:text-green-600 hover:bg-green-50 focus:ring-green-300
      warning: "" //text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 focus:ring-yellow-300
    }

    const sizeClasses = {
      sm: "px-2 py-1",
      md: "px-4 py-2",
      lg: ""
    }

    const iconSizes = {
      sm: "w-5 h-5",
      md: "w-6 h-6",
      lg: ""
    }

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

    return (
      <button
        ref={ref}
        className={combinedClasses}
        title={tooltip}
        {...props}
      >
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </button>
    )
  }
)

IconButton.displayName = "IconButton"

export default IconButton
