import React from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

export type ButtonVariant = "primary" | "secondary" | "sidebar" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"

    const variantClasses = {
      primary: "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-300 shadow-lg hover:shadow-xl",
      secondary: "border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300 shadow-lg hover:shadow-xl",
      sidebar: "gap-1 bg-transparent text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-0",
      danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-300 shadow-lg hover:shadow-xl"
    }

    const sizeClasses = {
      sm: "",
      md: "w-32 px-4 py-2 text-base gap-2",
      lg: ""
    }

    const iconSizes = {
      sm: "",
      md: "w-5 h-5", 
      lg: ""
    }

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

    const iconClasses = iconSizes[size]

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className={`animate-spin rounded-full border-b-2 border-current ${iconClasses}`}></div>
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className={iconClasses}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={iconClasses}>{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
