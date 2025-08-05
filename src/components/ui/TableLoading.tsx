import React from "react"
import { cn } from "../../utils/cn"

export interface TableLoadingProps {
  /** Hiển thị loading ở giữa bảng, có thể truyền colSpan cho cell */
  colSpan?: number
  /** Kích thước spinner: sm, md, lg */
  size?: "sm" | "md" | "lg"
  /** Thông báo loading */
  text?: string
  /** Thêm className tuỳ chỉnh */
  className?: string
}

const spinnerSize = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-4"
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  colSpan = 8,
  size = "md",
  text = "Đang tải dữ liệu...",
  className = ""
}) => (
  <tr>
    <td colSpan={colSpan} className={cn("py-12 text-center", className)}>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={cn(
          "animate-spin rounded-full border-b-2 border-blue-400 border-solid",
          spinnerSize[size]
        )} />
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    </td>
  </tr>
)

TableLoading.displayName = "TableLoading"
