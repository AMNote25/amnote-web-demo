import { useEffect } from "react"
import { Button } from "./ui"

export type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationModalProps {
  isOpen: boolean
  type: NotificationType
  title: string
  message: string
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
  buttonText?: string
  confirmText?: string
  onConfirm?: () => void
}

export default function NotificationModal({
  isOpen,
  type,
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
  buttonText = "OK",
  confirmText,
  onConfirm,
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  // Keyboard event handler for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case "error":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case "warning":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        )
      case "info":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          titleColor: "text-green-600",
          messageColor: "text-gray-600",
          buttonBg: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-300",
        }
      case "error":
        return {
          titleColor: "text-red-800",
          messageColor: "text-gray-600",
          buttonBg: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-300",
        }
      case "warning":
        return {
          titleColor: "text-yellow-600",
          messageColor: "text-gray-600",
          buttonBg: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-300",
        }
      case "info":
        return {
          titleColor: "text-gray-600",
          messageColor: "text-gray-600",
          buttonBg: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-300",
        }
    }
  }

  const colors = getColors()

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      style={{ zIndex: 999000 }}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-slideIn">
        {/* Modal Content */}
        <div className="p-8 text-center">
          {/* Icon Container */}
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full mb-6">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold mb-3 ${colors.titleColor}`}>
            {title}
          </h3>

          {/* Message */}
          <p className={`${colors.messageColor} mb-8 leading-relaxed text-base`} style={{ whiteSpace: 'pre-line' }}>{message}</p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="min-w-[120px]"
              autoFocus={!onConfirm}
            >
              {buttonText}
            </Button>
            {onConfirm && (
              <Button
                variant="danger"
                onClick={onConfirm}
                className="min-w-[120px]"
                autoFocus={!!onConfirm}
              >
                {confirmText || "Xác nhận"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
