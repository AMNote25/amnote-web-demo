import { useEffect, useState, useRef, useCallback } from "react"
import type { CustomerItem } from "../types/customer"
import type { CustomerPayload } from "../types/customerPayload"
import type { CategoryOption } from "../api/categoryApi"
import NotificationModal, { type NotificationType } from "./NotificationModal"
import { Button, Input, Select } from "./ui"
import { Textarea } from "./ui/Textarea"
import { insertCustomer, updateCustomer } from "../api/customerApi"
import { IconButton } from "./ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";

interface FormData {
  customerCD: string
  categoryCD: string
  customerType: string
  customerNM: string
  customerNM_EN: string
  customerNM_KOR: string
  taxCD: string
  address: string
  email: string
  buyerNM: string
  customerUserCD: string
  bankCD: string
  ownerNM: string
  businessType: string
  kindBusiness: string
  tel: string
  fax: string
  zipCD: string
}

interface CustomerFormProps {
  onClose: () => void
  mode?: "view" | "edit" | "add" | "delete"
  customer?: CustomerItem
  onSave?: (data: FormData) => void
  categoryOptions: CategoryOption[]
}

// Component để hiển thị form thêm/sửa/xem khách hàng
export default function CustomerForm({ onClose, mode = "add", customer, onSave, categoryOptions }: CustomerFormProps) {
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
    customerCD: "",
    categoryCD: "1",
    customerType: "1",
    customerNM: "",
    customerNM_EN: "",
    customerNM_KOR: "",
    taxCD: "",
    address: "",
    email: "",
    buyerNM: "",
    customerUserCD: "",
    bankCD: "",
    ownerNM: "",
    businessType: "",
    kindBusiness: "",
    tel: "",
    fax: "",
    zipCD: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Nếu ở chế độ add, không cần load dữ liệu
  useEffect(() => {
    if (customer) {
      setFormData({
        customerCD: customer.CustomerCD || "",
        categoryCD: customer.CategoryCD || "",
        customerType: customer.CustomerType && customer.CustomerType !== "" ? customer.CustomerType : "1",
        customerNM: customer.CustomerNM || "",
        customerNM_EN: customer.CustomerNM_EN || "",
        customerNM_KOR: customer.CustomerNM_KOR || "",
        taxCD: customer.TaxCD || "",
        address: customer.Address || "",
        email: customer.Email || "",
        buyerNM: customer.BuyerNM || "",
        customerUserCD: customer.CustomerUserCD || "",
        bankCD: customer.BankCD || "",
        ownerNM: customer.OwnerNM || "",
        businessType: customer.BusinessType || "",
        kindBusiness: customer.KindBusiness || "",
        tel: customer.Tel || "",
        fax: customer.Fax || "",
        zipCD: customer.ZipCD || "",
      })
    }
  }, [customer])

  // Hàm xử lý thay đổi input
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Hàm đóng modal
  const handleClose = useCallback(() => {
    setFormData({
      customerCD: "",
      categoryCD: "",
      customerType: "",
      customerNM: "",
      customerNM_EN: "",
      customerNM_KOR: "",
      taxCD: "",
      address: "",
      email: "",
      buyerNM: "",
      customerUserCD: "",
      bankCD: "",
      ownerNM: "",
      businessType: "",
      kindBusiness: "",
      tel: "",
      fax: "",
      zipCD: "",
    })
    if (onClose) onClose()
  }, [onClose])

  // Hàm đóng thông báo
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
    // Chỉ gọi onClose khi là thông báo thành công và mode là add hoặc edit
    if (notification.type === "success" && (mode === "add" || mode === "edit")) {
      if (onClose) onClose();
    }
  }

  // Hàm lưu dữ liệu
  const handleFormSave = async () => {
    setIsSaving(true)
    // Chuẩn hóa dữ liệu gửi đi, KHÔNG truyền Lag nữa
    const payload: CustomerPayload = {
      CustomerCD: mode === "add" ? "" : formData.customerCD,
      CategoryCD: formData.categoryCD,
      CustomerType: formData.customerType,
      CustomerNM: formData.customerNM,
      CustomerNM_EN: formData.customerNM_EN,
      CustomerNM_KOR: formData.customerNM_KOR,
      BuyerNM: formData.buyerNM,
      CustomerUserCD: formData.customerUserCD,
      TaxCD: formData.taxCD,
      BankCD: formData.bankCD,
      BRN: "",
      SSN: "",
      OwnerNM: formData.ownerNM,
      BusinessType: formData.businessType,
      KindBusiness: formData.kindBusiness,
      Tel: formData.tel,
      Fax: formData.fax,
      ZipCD: formData.zipCD,
      AddressDO: "",
      Address: formData.address,
      Email: formData.email,
    }

    try {
      let result
      if (mode === "edit") {
        result = await updateCustomer(payload)
      } else if (mode === "add") {
        result = await insertCustomer(payload)
      }
      if (result?.status === "success") {
        const actionText = mode === "add" ? "thêm" : "cập nhật"
        setNotification({
          isOpen: true,
          type: "success",
          title: "Thành công!",
          message: `Đã ${actionText} khách hàng thành công!`,
        })
        if (onSave) onSave(formData); // Gọi callback reload ngay sau khi lưu thành công
        setIsSaving(false)
        // KHÔNG gọi onClose ở đây
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Lỗi!",
          message: result?.messages?.[0] || "Có lỗi xảy ra khi lưu khách hàng.",
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

  // Disable input nếu mode là "view"
  const isReadOnly = mode === "view"

  // Function to get title based on mode
  const getTitle = () => {
    switch (mode) {
      case "add":
        return "Thêm Khách Hàng"
      case "edit":
        return "Chỉnh sửa Khách Hàng"
      case "view":
        return "Xem Khách Hàng"
      default:
        return "Khách Hàng"
    }
  }

  // Trap focus in modal và xử lý phím Esc để đóng modal
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
        if (!isSaving) handleClose(); // Đóng modal khi nhấn Esc nếu không đang lưu
      }
    }
    modal.addEventListener('keydown', handleKeyDown)
    return () => {
      modal.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isSaving])

  // Render modal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" style={{zIndex: 9999}}>
      {/* Overlay to block click */}
      <div className="fixed inset-0" style={{zIndex: 9998}} aria-hidden="true"></div>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="mx-auto max-w-4xl w-full focus:outline-none animate-slideIn"
        style={{ zIndex: 10000 }}
      >
        <div className="bg-white rounded-xl border border-white overflow-hidden max-h-[90vh] min-w-[600px] flex flex-col">
          {/* Header */}
          <div className="text-gray-800 p-4 flex-shrink-0">
            <div className="relative flex items-center mb-2">
              <h1 className="w-full text-2xl font-bold uppercase text-center">{getTitle()}</h1>
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <IconButton
                  variant="iconCloseForm"
                  onClick={handleClose}
                  size="md"
                  className="transition-colors focus:outline-none"
                  icon={<XMarkIcon />}
                  aria-label="Đóng"
                />
              </div>
            </div>
          </div>

          {/* Form Content - All fields in one step */}
          <div className="p-6 overflow-y-auto bg-white" style={{ flex: 1, minHeight: 0 }}>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã khách hàng: Ẩn ở chế độ thêm, chỉ đọc ở xem/sửa */}
                {mode !== "add" && (
                  <Input
                  id="customerCD"
                  label="Mã khách hàng"
                  value={formData.customerCD}
                  disabled
                  showRequired
                  required
                  />
                )}
                <Input
                  id="customerUserCD"
                  label="Mã người dùng khách hàng"
                  value={formData.customerUserCD}
                  onChange={(e) => handleInputChange("customerUserCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Select
                  id="categoryCD"
                  label="Nhóm khách hàng"
                  value={formData.categoryCD}
                  onChange={(e) => handleInputChange("categoryCD", e.target.value)}
                  disabled={isReadOnly}
                  options={categoryOptions.map(opt => ({
                    value: opt.FIELD_VALUE,
                    label: opt.DESCFIELD
                  }))}
                  showRequired
                  required
                />
                <Select
                  id="customerType"
                  variant="default"
                  label="Loại khách hàng"
                  value={formData.customerType}
                  onChange={(e) => handleInputChange("customerType", e.target.value)}
                  disabled={isReadOnly}
                  options={[
                    { value: "1", label: "Nội địa" },
                    { value: "2", label: "Nước ngoài" }
                  ]}
                  showRequired
                  required
                />
                <Input
                  id="customerNM"
                  label="Tên khách hàng"
                  value={formData.customerNM}
                  onChange={(e) => handleInputChange("customerNM", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="customerNM_EN"
                  label="Tên khách hàng (Tiếng Anh)"
                  value={formData.customerNM_EN}
                  onChange={(e) => handleInputChange("customerNM_EN", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="taxCD"
                  label="Mã số thuế"
                  value={formData.taxCD}
                  onChange={(e) => handleInputChange("taxCD", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="customerNM_KOR"
                  label="Tên khách hàng (Tiếng Hàn)"
                  value={formData.customerNM_KOR}
                  onChange={(e) => handleInputChange("customerNM_KOR", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="buyerNM"
                  label="Tên người mua"
                  value={formData.buyerNM}
                  onChange={(e) => handleInputChange("buyerNM", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="bankCD"
                  label="Mã ngân hàng"
                  value={formData.bankCD}
                  onChange={(e) => handleInputChange("bankCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="ownerNM"
                  label="Tên chủ sở hữu"
                  value={formData.ownerNM}
                  onChange={(e) => handleInputChange("ownerNM", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="businessType"
                  label="Loại hình kinh doanh"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange("businessType", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="kindBusiness"
                  label="Ngành nghề"
                  value={formData.kindBusiness}
                  onChange={(e) => handleInputChange("kindBusiness", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="tel"
                  label="Số điện thoại"
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => handleInputChange("tel", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="fax"
                  label="Số fax"
                  value={formData.fax}
                  onChange={(e) => handleInputChange("fax", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="zipCD"
                  label="Mã bưu điện"
                  value={formData.zipCD}
                  onChange={(e) => handleInputChange("zipCD", e.target.value)}
                  disabled={isReadOnly}
                />
                </div>
                <div className="space-y-2 mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-800">
                  Địa chỉ <span className="text-red-600">*</span>
                </label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                  required
                />
                </div>
              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  leftIcon={<XMarkIcon className="w-5 h-5" />}
                  className="min-w-[100px]"
                  disabled={isSaving}
                >
                  Đóng
                </Button>
                {mode !== "view" && (
                  <Button
                    onClick={handleFormSave}
                    variant="primary"
                    size="md"
                    isLoading={isSaving}
                    leftIcon={<DocumentCheckIcon className="w-5 h-5" />}
                    className="min-w-[100px] bg-blue-600 hover:bg-blue-800 text-white font-semibold"
                  >
                    Lưu
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
      
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
