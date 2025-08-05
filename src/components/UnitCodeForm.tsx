import { useEffect, useState, useRef, useCallback } from "react"
import type { UnitCodeItem } from "../types/unitCode"
import type { UnitCodePayload } from "../types/unitCodePayload"
import NotificationModal, { type NotificationType } from "./NotificationModal"
import { Button, Input } from "./ui"
import LoadingButton from "./ui/LoadingButton"
import { insertUnitCode, updateUnitCode } from "../api/unitCodeApi"

interface FormData {
  unitCD: string
  unitNM: string
  isDel: string
  userID: string
}

interface UnitCodeFormProps {
  onClose: () => void
  mode?: "view" | "edit" | "add" | "delete"
  unitCode?: UnitCodeItem
  onSave?: (data: FormData) => void
}

export default function UnitCodeForm({ onClose, mode = "add", unitCode, onSave }: UnitCodeFormProps) {
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: NotificationType
    title: string
    message: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })
  const [formData, setFormData] = useState<FormData>({
    unitCD: "",
    unitNM: "",
    isDel: "0",
    userID: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (unitCode) {
      setFormData({
        unitCD: unitCode.UNIT_CD || "",
        unitNM: unitCode.UNIT_NM || "",
        isDel: unitCode.ISDEL || "0",
        userID: unitCode.USERID || "",
      })
    }
  }, [unitCode])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClose = useCallback(() => {
    setFormData({
      unitCD: "",
      unitNM: "",
      isDel: "0",
      userID: "",
    })
    if (onClose) onClose()
  }, [onClose])

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  const handleFormSave = async () => {
    setIsSaving(true)
    // Chuẩn hóa dữ liệu gửi đi, KHÔNG truyền Lag nữa
    const payload: UnitCodePayload = {
      productUnitName: formData.unitNM,
    }
    try {
      let result
      if (mode === "edit") {
        result = await updateUnitCode(formData.unitCD, payload.productUnitName)
      } else if (mode === "add") {
        result = await insertUnitCode(payload.productUnitName)
      }
      if (result?.status === "success") {
        const actionText = mode === "add" ? "thêm" : "cập nhật"
        setNotification({
          isOpen: true,
          type: "success",
          title: "Thành công!",
          message: `Đã ${actionText} đơn vị tính thành công!`,
        })
        if (onSave) onSave(formData)
        setIsSaving(false)
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Lỗi!",
          message: result?.messages?.[0] || "Có lỗi xảy ra khi lưu đơn vị tính.",
        })
        setIsSaving(false)
      }
    } catch {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Lỗi kết nối!",
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      })
      setIsSaving(false)
    }
  }

  const isReadOnly = mode === "view"

  const getTitle = () => {
    switch (mode) {
      case "add": return "Thêm đơn vị tính"
      case "edit": return "Chỉnh sửa đơn vị tính"
      case "view": return "Xem đơn vị tính"
      case "delete": return "Xóa đơn vị tính"
      default: return "Đơn vị tính"
    }
  }

  // Trap focus in modal
  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const focusableSelectors = [
      'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])',
      'textarea:not([disabled])', 'button:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ]
    const modal = modalRef.current
    if (!modal) return
    const focusableEls = modal.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
    if (focusableEls.length) focusableEls[0].focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      } else if (e.key === 'Escape') {
        handleClose()
      }
    }
    modal.addEventListener('keydown', handleKeyDown)
    return () => {
      modal.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose])

  // Validate required fields
  const isValid = () => {
    return formData.unitNM
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{zIndex: 9999}}>
      <div className="fixed inset-0" style={{zIndex: 9998}} aria-hidden="true"></div>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="mx-auto max-w-2xl w-full focus:outline-none"
        style={{ zIndex: 10000 }}
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200" style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column', minWidth: 400 }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 flex-shrink-0 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{getTitle()}</h1>
              <button onClick={handleClose} className="text-gray-600 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-0 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-gray-600 rounded-full"></span>
              Thông tin đơn vị tính
            </h3>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto bg-white" style={{ flex: 1, minHeight: 0 }}>
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {/* unitCD: Ẩn ở mode add, readonly ở view/edit */}
                {mode !== "add" && (
                  <Input
                    id="unitCD"
                    label="Mã đơn vị tính"
                    value={formData.unitCD}
                    disabled
                    showRequired
                    required
                  />
                )}
                <Input
                  id="unitNM"
                  label="Tên đơn vị tính"
                  value={formData.unitNM}
                  onChange={e => handleInputChange("unitNM", e.target.value)}
                  placeholder={!isReadOnly ? "Nhập tên đơn vị tính" : undefined}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="userID"
                  label="Người tạo"
                  value={formData.userID}
                  onChange={e => handleInputChange("userID", e.target.value)}
                  placeholder={!isReadOnly ? "Nhập người tạo (không bắt buộc)" : undefined}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="min-w-[100px]"
                >
                  Đóng
                </Button>
                {mode !== "view" && (
                  <LoadingButton
                    onClick={handleFormSave}
                    isLoading={isSaving}
                    leftIcon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12h18M12 3v18"
                        />
                      </svg>
                    }
                    className="min-w-[100px] bg-green-600 hover:bg-green-900 text-white font-semibold"
                    disabled={!isValid()}
                  >
                    Lưu
                  </LoadingButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  )
}
