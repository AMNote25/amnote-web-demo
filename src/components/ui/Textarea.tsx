import React, { forwardRef } from "react"
import { cn } from "../../utils/cn"

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  labelVisible?: boolean
  showRequired?: boolean
  error?: string | boolean
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      labelVisible = true,
      showRequired = false,
      error,
      helperText,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = Boolean(error)
    const errorMessage = typeof error === "string" ? error : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "block text-sm font-medium text-gray-900 mb-1",
              !labelVisible && "sr-only"
            )}
          >
            {label}
            {showRequired && required && (
              <span className="text-red-600 ml-1">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-gray-900 placeholder-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400",
            disabled && "bg-gray-50 text-gray-600 cursor-not-allowed",
            className
          )}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            cn(
              errorMessage && `${textareaId}-error`,
              helperText && `${textareaId}-helper`
            ) || undefined
          }
          {...props}
        />
        {(errorMessage || helperText) && (
          <div className="mt-1 text-sm">
            {errorMessage && (
              <p id={`${textareaId}-error`} className="text-red-600">
                {errorMessage}
              </p>
            )}
            {helperText && !errorMessage && (
              <p id={`${textareaId}-helper`} className="text-gray-600">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
