import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import * as XLSX from "xlsx"
import { Select } from "./ui/Select"
import { Button } from "./ui"

interface ExcelImportModalProps {
  onClose: () => void
}

interface Step {
  number: number
  title: string
  active: boolean
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ onClose }) => {
  const [currentStep] = useState<number>(1) // [currentStep, setCurrentStep]
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<any[][] | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  // const [headerRow, setHeaderRow] = useState<string>("1")
  const [importMethod, setImportMethod] = useState<string>("add")
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      readExcelFile(file)
    }
  }

  const readExcelFile = (file: File): void => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get sheet names
        const sheetNames = workbook.SheetNames
        setAvailableSheets(sheetNames)
        setSelectedSheet(sheetNames[0] || "")

        // Read data from first sheet
        if (sheetNames.length > 0) {
          const worksheet = workbook.Sheets[sheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          setExcelData(jsonData as any[][])
        }
      } catch (error) {
        console.error("Error reading Excel file:", error)
        alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSheetChange = (sheetName: string): void => {
    setSelectedSheet(sheetName)
    // Re-read data from selected sheet
    if (selectedFile && sheetName) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        setExcelData(jsonData as any[][])
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }

  const steps: Step[] = [
    { number: 1, title: "Chọn tệp", active: currentStep === 1 },
    { number: 2, title: "Ghép dữ liệu", active: currentStep === 2 },
    { number: 3, title: "Kiểm tra", active: currentStep === 3 },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Nhập dữ liệu từ Excel</h1>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step: Step, index: number) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.active
                        ? "bg-cyan-600 text-white"
                        : step.number < currentStep
                          ? "bg-cyan-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${step.active ? "text-gray-900" : "text-gray-600"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && <div className="flex-1 mx-4 h-0.5 bg-gray-300"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - File Selection */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Chọn tệp Excel <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-2"
                    >
                      Chọn tệp Excel
                    </button>
                    <p className="text-sm text-gray-600">Hỗ trợ định dạng .xlsx, .xls</p>
                    {selectedFile && <p className="text-sm text-green-600 mt-2">Đã chọn: {selectedFile.name}</p>}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex items-center text-sm text-cyan-600 hover:text-blue-700 cursor-pointer">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Tải tệp mẫu Excel (có hướng dẫn)
              </div>
            </div>

            {/* Right Column - Configuration */}
            <div className="space-y-6">
              {/* Sheet Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sheet chứa dữ liệu <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedSheet}
                  onChange={e => handleSheetChange(e.target.value)}
                  disabled={!availableSheets.length}
                  className="w-full"
                >
                  <option value="">Chọn sheet</option>
                  {availableSheets.map((sheet: string) => (
                    <option key={sheet} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Header Row */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Dòng tiêu đề</label>
                <p className="text-sm text-gray-600 mb-2">Nhập số dòng chứa tiêu đề cột (ví dụ: 1)</p>
                <input
                  type="number"
                  value={headerRow}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setHeaderRow(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-600"
                  min="1"
                />
              </div> */}

              {/* Import Method */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">Phương pháp nhập dữ liệu</label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="importMethod"
                      value="add"
                      checked={importMethod === "add"}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setImportMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-800 text-left">Thêm mới (không ghi đè dữ liệu cũ)</div>
                      <div className="text-sm text-gray-600 text-left">Chỉ thêm các mã chưa tồn tại trong hệ thống</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="importMethod"
                      value="update"
                      checked={importMethod === "update"}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setImportMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-800">Cập nhật (chỉ sửa bản ghi đã tồn tại)</div>
                      <div className="text-sm text-gray-600">Chỉ cập nhật các mã đã tồn tại, không thêm mã mới</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="importMethod"
                      value="overwrite"
                      checked={importMethod === "overwrite"}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setImportMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-800">Ghi đè (xóa tất cả và thêm mới)</div>
                      <div className="text-sm text-gray-600">
                        Xóa toàn bộ dữ liệu cũ và thay thế bằng dữ liệu từ Excel
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Dữ liệu hiện có trong hệ thống</div>
                    <div className="text-sm text-yellow-700">Tổng số bản ghi: 500</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          {excelData && excelData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Xem trước dữ liệu</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {excelData[0]?.map((header: any, index: number) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {excelData.slice(1, 6).map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {excelData.length > 6 && (
                  <div className="px-4 py-2 text-sm text-gray-600 bg-gray-100">
                    ... và {excelData.length - 6} dòng khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4">
          <Button onClick={onClose} variant="secondary" className="min-w-[100px]">
            Hủy
          </Button>
          <button
            disabled={!selectedFile || !selectedSheet}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>Tiếp tục</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.9) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default ExcelImportModal
