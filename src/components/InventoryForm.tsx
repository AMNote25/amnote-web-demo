import { useEffect, useState, useRef, useCallback } from "react"
import type { InventoryItem } from "../types/inventory"
import type { InventoryPayload } from "../types/inventoryPayload"
import NotificationModal, { type NotificationType } from "./NotificationModal"
import { Button, Input } from "./ui"
import { Textarea } from "./ui/Textarea"
import { insertInventory, updateInventory } from "../api/inventoryApi"
import { IconButton } from "./ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";

interface FormData {
  // Required Information
  PRODUCT_CD: string
  DivisionCD: string
  DepartmentCD: string
  PRODUCTKIND_CD: string
  PRODUCT_NM: string
  PRODUCT_NM_ENG: string
  PRODUCT_NM_KOR: string
  StockUnitCD: string
  StoreCD: string
  // Additional Information
  InboundUnitCD: string
  OutboundUnitCD: string
  materialInputUnitCD: string
  InboundQuantity: number
  OutboundQuantity: number
  MaterialInputQuantity: number
  StandardCD: string
  FitnessStock: string
  UnitPrice: string
  FcUnitPirce: string
  ExRate: string
  lblCCType: string
  lblFCType: string
  rgUseNotUse: string
  txtSummary: string
  HaveChildBOM: string
  Origin: string
}

interface InventoryFormProps {
  onClose: () => void
  mode?: "view" | "edit" | "add" | "delete"
  item?: InventoryItem
  onSave?: (data: FormData) => void
}

export default function InventoryForm({ onClose, mode = "add", item, onSave }: InventoryFormProps) {
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
    PRODUCT_CD: "",
    DivisionCD: "",
    DepartmentCD: "",
    PRODUCTKIND_CD: "",
    PRODUCT_NM: "",
    PRODUCT_NM_ENG: "",
    PRODUCT_NM_KOR: "",
    StockUnitCD: "",
    StoreCD: "",
    InboundUnitCD: "",
    OutboundUnitCD: "",
    materialInputUnitCD: "",
    InboundQuantity: 0,
    OutboundQuantity: 0,
    MaterialInputQuantity: 0,
    StandardCD: "",
    FitnessStock: "",
    UnitPrice: "",
    FcUnitPirce: "",
    ExRate: "",
    lblCCType: "",
    lblFCType: "",
    rgUseNotUse: "",
    txtSummary: "",
    HaveChildBOM: "",
    Origin: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        PRODUCT_CD: item.PRODUCT_CD || "",
        DivisionCD: item.DIVISION_CD || "",
        DepartmentCD: item.DEPARTMENT_CD || "",
        PRODUCTKIND_CD: item.PRODUCTKIND_CD || "",
        PRODUCT_NM: item.PRODUCT_NM || "",
        PRODUCT_NM_ENG: item.PRODUCT_NM_ENG || "",
        PRODUCT_NM_KOR: item.PRODUCT_NM_KOR || "",
        StockUnitCD: item.STOCK_UNIT || "",
        StoreCD: item.STORE_CD || "",
        InboundUnitCD: item.INBOUND_UNIT || "",
        OutboundUnitCD: item.OUTBOUND_UNIT || "",
        materialInputUnitCD: item.MATERIALINPUT_UNIT || "",
        InboundQuantity: item.INBOUND_QUANTITY || 0,
        OutboundQuantity: item.OUTBOUND_QUANTITY || 0,
        MaterialInputQuantity: item.MATERIALINPUT_QUANTITY || 0,
        StandardCD: item.STANDARD_CD || "",
        FitnessStock: String(item.FITNESS_STOCK ?? ""),
        UnitPrice: String(item.UNIT_PRICE_CC ?? ""),
        FcUnitPirce: String(item.UNIT_PRICE_FC ?? ""),
        ExRate: String(item.EX_RATE ?? ""),
        lblCCType: item.CC_TYPE || "",
        lblFCType: item.FC_TYPE || "",
        rgUseNotUse: item.ISUSE || "",
        txtSummary: item.SUMMARY || "",
        HaveChildBOM: "", // Không có trường tương ứng trong response
        Origin: item.ORIGIN || "",
      })
    }
  }, [item])

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClose = useCallback(() => {
    setFormData({
      PRODUCT_CD: "",
      DivisionCD: "",
      DepartmentCD: "",
      PRODUCTKIND_CD: "",
      PRODUCT_NM: "",
      PRODUCT_NM_ENG: "",
      PRODUCT_NM_KOR: "",
      StockUnitCD: "",
      StoreCD: "",
      InboundUnitCD: "",
      OutboundUnitCD: "",
      materialInputUnitCD: "",
      InboundQuantity: 0,
      OutboundQuantity: 0,
      MaterialInputQuantity: 0,
      StandardCD: "",
      FitnessStock: "",
      UnitPrice: "",
      FcUnitPirce: "",
      ExRate: "",
      lblCCType: "",
      lblFCType: "",
      rgUseNotUse: "",
      txtSummary: "",
      HaveChildBOM: "",
      Origin: "",
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
    const payload: InventoryPayload = {
      PRODUCT_CD: formData.PRODUCT_CD,
      DivisionCD: formData.DivisionCD,
      PRODUCTKIND_CD: formData.PRODUCTKIND_CD,
      DepartmentCD: formData.DepartmentCD,
      PRODUCT_NM: formData.PRODUCT_NM,
      PRODUCT_NM_ENG: formData.PRODUCT_NM_ENG,
      PRODUCT_NM_KOR: formData.PRODUCT_NM_KOR,
      InboundUnitCD: formData.InboundUnitCD,
      OutboundUnitCD: formData.OutboundUnitCD,
      materialInputUnitCD: formData.materialInputUnitCD,
      StockUnitCD: formData.StockUnitCD,
      InboundQuantity: formData.InboundQuantity,
      OutboundQuantity: formData.OutboundQuantity,
      MaterialInputQuantity: formData.MaterialInputQuantity,
      StoreCD: formData.StoreCD,
      StandardCD: formData.StandardCD,
      FitnessStock: formData.FitnessStock,
      UnitPrice: formData.UnitPrice,
      FcUnitPirce: formData.FcUnitPirce,
      ExRate: formData.ExRate,
      lblCCType: formData.lblCCType,
      lblFCType: formData.lblFCType,
      txtSummary: formData.txtSummary,
      rgUseNotUse: formData.rgUseNotUse,
      HaveChildBOM: formData.HaveChildBOM,
      Origin: formData.Origin,
    }

    try {
      let result
      if (mode === "edit") {
        result = await updateInventory(payload)
      } else if (mode === "add") {
        result = await insertInventory(payload)
      }
      if (result?.status === "success") {
        const actionText = mode === "add" ? "thêm" : "cập nhật"
        setNotification({
          isOpen: true,
          type: "success",
          title: "Thành công!",
          message: `Đã ${actionText} hàng tồn kho thành công!`,
        })
        if (onSave) onSave(formData); // Gọi callback reload ngay sau khi lưu thành công
        setIsSaving(false)
        // KHÔNG gọi onClose ở đây
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Lỗi!",
          message: result?.messages?.[0] || "Có lỗi xảy ra khi lưu hàng tồn kho.",
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

  // Function to get title based on mode
  const getTitle = () => {
    switch (mode) {
      case "add":
        return "Thêm Hàng Tồn Kho"
      case "edit":
        return "Chỉnh sửa Hàng Tồn Kho"
      case "view":
        return "Xem Hàng Tồn Kho"
      default:
        return "Hàng Tồn Kho"
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
                {/* Mã hàng hóa: Ẩn ở chế độ thêm, chỉ đọc ở xem/sửa */}
                <Input
                  id="PRODUCT_CD"
                  label="Mã hàng hóa"
                  value={formData.PRODUCT_CD}
                  onChange={(e) => handleInputChange("PRODUCT_CD", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="StoreCD"
                  label="Mã kho"
                  value={formData.StoreCD}
                  onChange={(e) => handleInputChange("StoreCD", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="PRODUCTKIND_CD"
                  label="Mã loại hàng"
                  value={formData.PRODUCTKIND_CD}
                  onChange={(e) => handleInputChange("PRODUCTKIND_CD", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="DepartmentCD"
                  label="Mã phòng ban"
                  value={formData.DepartmentCD}
                  onChange={(e) => handleInputChange("DepartmentCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="PRODUCT_NM"
                  label="Tên hàng hóa (VN)"
                  value={formData.PRODUCT_NM}
                  onChange={(e) => handleInputChange("PRODUCT_NM", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="PRODUCT_NM_ENG"
                  label="Tên hàng hóa (EN)"
                  value={formData.PRODUCT_NM_ENG}
                  onChange={(e) => handleInputChange("PRODUCT_NM_ENG", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="PRODUCT_NM_KOR"
                  label="Tên hàng hóa (KOR)"
                  value={formData.PRODUCT_NM_KOR}
                  onChange={(e) => handleInputChange("PRODUCT_NM_KOR", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="StockUnitCD"
                  label="Đơn vị tính"
                  value={formData.StockUnitCD}
                  onChange={(e) => handleInputChange("StockUnitCD", e.target.value)}
                  disabled={isReadOnly}
                  showRequired
                  required
                />
                <Input
                  id="DivisionCD"
                  label="Mã phân khu"
                  value={formData.DivisionCD}
                  onChange={(e) => handleInputChange("DivisionCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="InboundUnitCD"
                  label="Mã đơn vị tính nhập"
                  value={formData.InboundUnitCD}
                  onChange={(e) => handleInputChange("InboundUnitCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="OutboundUnitCD"
                  label="Mã đơn vị tính xuất"
                  value={formData.OutboundUnitCD}
                  onChange={(e) => handleInputChange("OutboundUnitCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="materialInputUnitCD"
                  label="Mã đơn vị tính vật tư"
                  value={formData.materialInputUnitCD}
                  onChange={(e) => handleInputChange("materialInputUnitCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="InboundQuantity"
                  label="Số lượng nhập"
                  type="number"
                  value={formData.InboundQuantity}
                  onChange={(e) => handleInputChange("InboundQuantity", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                <Input
                  id="OutboundQuantity"
                  label="Số lượng xuất"
                  type="number"
                  value={formData.OutboundQuantity}
                  onChange={(e) => handleInputChange("OutboundQuantity", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                <Input
                  id="MaterialInputQuantity"
                  label="Số lượng vật tư"
                  type="number"
                  value={formData.MaterialInputQuantity}
                  onChange={(e) => handleInputChange("MaterialInputQuantity", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                <Input
                  id="StandardCD"
                  label="Mã tiêu chuẩn"
                  value={formData.StandardCD}
                  onChange={(e) => handleInputChange("StandardCD", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="FitnessStock"
                  label="Fitness Stock"
                  value={formData.FitnessStock}
                  onChange={(e) => handleInputChange("FitnessStock", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="UnitPrice"
                  label="Đơn giá"
                  value={formData.UnitPrice}
                  onChange={(e) => handleInputChange("UnitPrice", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="FcUnitPirce"
                  label="Đơn giá FC"
                  value={formData.FcUnitPirce}
                  onChange={(e) => handleInputChange("FcUnitPirce", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="ExRate"
                  label="Tỷ giá"
                  value={formData.ExRate}
                  onChange={(e) => handleInputChange("ExRate", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="lblCCType"
                  label="CC Type"
                  value={formData.lblCCType}
                  onChange={(e) => handleInputChange("lblCCType", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="lblFCType"
                  label="FC Type"
                  value={formData.lblFCType}
                  onChange={(e) => handleInputChange("lblFCType", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="rgUseNotUse"
                  label="Sử dụng/Không sử dụng"
                  value={formData.rgUseNotUse}
                  onChange={(e) => handleInputChange("rgUseNotUse", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="HaveChildBOM"
                  label="BOM con"
                  value={formData.HaveChildBOM}
                  onChange={(e) => handleInputChange("HaveChildBOM", e.target.value)}
                  disabled={isReadOnly}
                />
                <Input
                  id="Origin"
                  label="Nguồn gốc"
                  value={formData.Origin}
                  onChange={(e) => handleInputChange("Origin", e.target.value)}
                  disabled={isReadOnly}
                />
                </div>
                <div className="space-y-2 mt-4">
                <label htmlFor="txtSummary" className="block text-sm font-medium text-gray-800">
                  Tóm tắt
                </label>
                <Textarea
                  id="txtSummary"
                  value={formData.txtSummary}
                  onChange={(e) => handleInputChange("txtSummary", e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
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
                    className="min-w-[100px] bg-blue-600 hover:bg-blue-900 text-white font-semibold"
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
