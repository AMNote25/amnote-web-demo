import React, { useEffect, useRef } from "react"
import { cn } from "../../utils/cn"

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to call when the modal should be closed */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full"
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Whether to close on backdrop click */
  closeOnBackdrop?: boolean
  /** Whether to close on escape key */
  closeOnEscape?: boolean
  /** Whether to focus the modal when opened */
  autoFocus?: boolean
  /** Custom header content */
  header?: React.ReactNode
  /** Modal content */
  children?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
  /** Custom className for the modal content */
  className?: string
  /** Custom className for the backdrop */
  backdropClassName?: string
}

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  autoFocus = true,
  header,
  children,
  footer,
  className,
  backdropClassName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Size styles
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-none w-full h-full"
  }

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      if (autoFocus && modalRef.current) {
        modalRef.current.focus()
      }
    } else {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, autoFocus])

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Backdrop click handler
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black bg-opacity-50",
        "transition-opacity duration-200",
        backdropClassName
      )}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-white rounded-lg shadow-xl",
          "transform transition-all duration-200 ease-out",
          size !== "full" && "max-h-[90vh] overflow-y-auto",
          sizeStyles[size],
          className
        )}
        aria-modal="true"
        role="dialog"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(header || title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {header || (
                title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )
              )}
            </div>
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2text-gray-600 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                <XIcon />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {children && (
          <div className={cn(
            "p-6",
            size === "full" && "h-full overflow-y-auto"
          )}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Compound components for better structure
const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("flex items-center space-x-4", className)}>
    {children}
  </div>
)

const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h2>
)

const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {children}
  </div>
)

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("flex items-center justify-end space-x-3", className)}>
    {children}
  </div>
)

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter }
