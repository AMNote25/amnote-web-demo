import React, { forwardRef } from "react"
import { cn } from "../../utils/cn"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Kiểu hiển thị của select */
  variant?: "default" | "rowsPerPage" | "flushed"
  /** Kích thước của select */
  size?: "sm" | "md" | "lg"
  /** Icon hiển thị bên trái */
  leftIcon?: React.ReactNode
  /** Trạng thái lỗi và thông báo lỗi */
  error?: string | boolean
  /** Văn bản trợ giúp hiển thị bên dưới select */
  helperText?: string
  /** Nhãn cho select */
  label?: string
  /** Nhãn có hiển thị hay chỉ dành cho trình đọc màn hình */
  labelVisible?: boolean
  /** Có hiển thị dấu sao bắt buộc không */
  showRequired?: boolean
  /** Trạng thái đang tải */
  loading?: boolean
  /** Danh sách tuỳ chọn cho select */
  options?: SelectOption[]
  /** Văn bản placeholder */
  placeholder?: string
}

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      leftIcon,
      error,
      helperText,
      label,
      labelVisible = true,
      showRequired = false,
      loading = false,
      id,
      required,
      disabled,
      options = [],
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const hasError = Boolean(error)
    const errorMessage = typeof error === "string" ? error : undefined

    // Style cơ bản cho tất cả các kiểu
    const baseStyles = "transition-all duration-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-opacity-50"
    
    // Style cho từng kiểu hiển thị
    const variantStyles = {
      default: cn(
        "border border-gray-300 bg-white",
        hasError && "border-red-500 focus:ring-red-500",
        disabled && "bg-red-500 text-gray-600 cursor-not-allowed"
      ),
      rowsPerPage: cn(
        "text-gray-600",
        "border border-gray-300 bg-transparent",
        "focus:border-cyan-600"
      ),
      flushed: cn(
        "border-0 border-b-2 border-gray-200 bg-transparent rounded-none",
        disabled && "cursor-not-allowed"
      )
    }

    // Style cho từng kích thước
    const sizeStyles = {
      sm: cn(
        leftIcon ? "pl-8 pr-8 py-1" : "pl-3 pr-8 py-1"
      ),
      md: cn(
        leftIcon ? "pl-8 pr-8 py-2" : "pl-3 pr-8 py-2"
      ),
      lg: cn(
        leftIcon ? "" : "",
      )
    }

    // Vị trí icon
    const iconSizes = {
      sm: "h-4 w-4",
      md: "",
      lg: "",
    }

    const leftIconPosition = {
      sm: "left-2",
      md: "left-3", // left-3
      lg: "", // left-4
    }

    const rightIconPosition = {
      sm: "right-2",
      md: "right-3", // right-3
      lg: "", // right-4
    }

    return (
      <div>
        {label && (
          <label
            htmlFor={selectId}
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
            <div
              className={cn(
                "absolute inset-y-0 flex items-center pointer-events-none z-10",
                leftIconPosition[size],
                "text-gray-600"
              )}
            >
              <div className={iconSizes[size]}>
                {leftIcon}
              </div>
            </div>
          )}
          
          <select
            ref={ref}
            id={selectId}
            className={cn(
              baseStyles,
              variantStyles[variant],
              sizeStyles[size],
              "w-full text-gray-900",
              variant !== "flushed" && "rounded-lg",
              className
            )}
            disabled={disabled || loading}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              cn(
                errorMessage && `${selectId}-error`,
                helperText && `${selectId}-helper`
              ) || undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-gray-600">
                {placeholder}
              </option>
            )}
            
            {options.length > 0 ? (
              options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="text-gray-900 bg-white"
                >
                  {option.label}
                </option>
              ))
            ) : (
              children
            )}
          </select>
          
          {/* Mũi tên dropdown tuỳ chỉnh */}
          <div
            className={cn(
              "absolute inset-y-0 flex items-center pointer-events-none z-10",
              rightIconPosition[size],
              "text-gray-600"
            )}
          >
            {loading ? (
              <div className={cn("animate-spin rounded-full border-2 border-gray-200 border-t-blue-600", iconSizes[size])} />
            ) : (
              <ChevronDownIcon />
            )}
          </div>
        </div>

        {(errorMessage || helperText) && (
          <div className="mt-1 text-sm">
            {errorMessage && (
              <p id={`${selectId}-error`} className="text-red-600">
                {errorMessage}
              </p>
            )}
            {helperText && !errorMessage && (
              <p id={`${selectId}-helper`} className="text-gray-600">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
