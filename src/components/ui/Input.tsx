import React, { forwardRef, useId } from "react"
import { cn } from "../../utils/cn"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant of the input */
  variant?: "default" | "filled" | "flushed"
  /** Size of the input */
  size?: "sm" | "md" | "lg"
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode
  /** Error state and message */
  error?: string | boolean
  /** Helper text to display below the input */
  helperText?: string
  /** Label for the input */
  label?: string
  /** Whether the label should be visible or screen-reader only */
  labelVisible?: boolean
  /** Whether to show the required asterisk */
  showRequired?: boolean
  /** Loading state */
  loading?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      leftIcon,
      rightIcon,
      error,
      helperText,
      label,
      labelVisible = true,
      showRequired = false,
      loading = false,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const inputId = id || `input-${reactId}`
    const hasError = Boolean(error)
    const errorMessage = typeof error === "string" ? error : undefined

    // Base styles for all variants
    const baseStyles = "transition-all duration-200 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600 focus:ring-opacity-50"

    // Variant styles
    const variantStyles = {
      default: cn(
        "border border-gray-300 bg-white",
        hasError && "border-red-500 focus:ring-red-500",
        disabled && "bg-gray-50 text-gray-600 cursor-not-allowed"
      ),
      filled: cn(
        "border-0 bg-gray-100",
        "hover:bg-gray-200",
        hasError && "bg-red-50 focus:ring-red-500",
        disabled && "bg-gray-50 text-gray-600 cursor-not-allowed"
      ),
      flushed: cn(
        "border-0 border-b-2 border-gray-200 bg-transparent rounded-none",
        "hover:border-gray-400",
        hasError && "border-red-500 focus:ring-0 focus:border-red-500",
        disabled && "text-gray-600 cursor-not-allowed"
      )
    }

    // Size styles (gộp luôn padding icon trái/phải)
    const sizeStyles = {
      sm: cn(
        "text-sm",
        leftIcon ? "pl-8" : "pl-3",
        rightIcon ? "pr-8" : "pr-3",
        variant === "flushed" ? "py-1" : "py-2"
      ),
      md: cn(
        "text-sm",
        leftIcon ? "pl-10" : "pl-3",
        rightIcon ? "pr-10" : "pr-3",
        variant === "flushed" ? "py-2" : "py-3"
      ),
      lg: cn(
        "text-base",
        leftIcon ? "pl-12" : "pl-4",
        rightIcon ? "pr-12" : "pr-4",
        variant === "flushed" ? "py-3" : "py-4"
      )
    }

    // Icon positioning
    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    }

    const leftIconPosition = {
      sm: "left-2",
      md: "left-3",
      lg: "left-4"
    }

    const rightIconPosition = {
      sm: "right-2.5",
      md: "right-3",
      lg: "right-4"
    }

    // aria-describedby logic
    const describedBy = [
      errorMessage ? `${inputId}-error` : null,
      helperText && !errorMessage ? `${inputId}-helper` : null
    ].filter(Boolean).join(" ") || undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-800 mb-1",
              !labelVisible && "sr-only"
            )}
          >
            {label}
            {showRequired && required && (
              <span className="text-red-600 ml-1">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <span
              className={cn(
                "absolute inset-y-0 flex items-center pointer-events-none z-10",
                leftIconPosition[size],
                "text-gray-800"
              )}
            >
              {React.isValidElement(leftIcon) && typeof leftIcon.type !== 'string'
                ? React.cloneElement(leftIcon as React.ReactElement<{ className?: string }>, {
                    className: cn(
                      iconSizes[size],
                      (leftIcon.props as { className?: string })?.className
                    )
                  })
                : <span className={iconSizes[size]}>{leftIcon}</span>
              }
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles,
              variantStyles[variant],
              sizeStyles[size],
              "w-full text-gray-800 placeholder-gray-400 rounded-lg",
              className
            )}
            disabled={disabled || loading}
            required={required}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            {...props}
          />
          
          {(rightIcon || loading) && (
            <span
              className={cn(
                "absolute inset-y-0 flex items-center pointer-events-auto z-10",
                rightIconPosition[size],
                "text-gray-600"
              )}
            >
              {loading ? (
                <span className={cn(iconSizes[size], "animate-spin rounded-full border-2 border-gray-200 border-t-blue-600")} />
              ) : rightIcon && React.isValidElement(rightIcon) && typeof rightIcon.type !== 'string'
                ? React.cloneElement(rightIcon as React.ReactElement<{ className?: string }>, {
                    className: cn(
                      iconSizes[size],
                      (rightIcon.props as { className?: string })?.className
                    )
                  })
                : rightIcon && <span className={iconSizes[size]}>{rightIcon}</span>
              }
            </span>
          )}
        </div>

        {(errorMessage || helperText) && (
          <div className="mt-1 text-sm">
            {errorMessage ? (
              <p id={`${inputId}-error`} className="text-red-600">
                {errorMessage}
              </p>
            ) : helperText && (
              <p id={`${inputId}-helper`} className="text-gray-600">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
