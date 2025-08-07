import React, { useState, useEffect } from "react"
import InventoryForm from "../components/InventoryForm"
import NotificationModal, { type NotificationType } from "../components/NotificationModal"
import ExcelImportModal from "../components/ExcelImportModal"
import { Button } from "../components/ui"
import { IconButton } from "../components/ui"
import type { InventoryItem } from "../types/inventory"
import { getAllInventory, deleteInventory } from "../api/inventoryApi"
import { Table, TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../components/ui"
import { XMarkIcon, PlusIcon, ArrowDownTrayIcon, EyeIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, Cog6ToothIcon, ArrowUpTrayIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { Input } from "../components/ui/Input"
import { Select } from "../components/ui/Select"
import * as XLSX from "xlsx";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

// Khai báo mở rộng Window cho showSaveFilePicker
declare global {
  interface Window {
    showSaveFilePicker?: (
      options?: {
        suggestedName?: string;
        types?: Array<{
          description?: string;
          accept?: Record<string, string[]>;
        }>;
      }
    ) => Promise<FileSystemFileHandle>;
  }
}

type ModalMode = "view" | "edit" | "delete" | null

export default function InventoryManagement() {
  // Hàm xử lý khi nhấn vào header để sắp xếp (di chuyển ra ngoài phần render)
  function handleSort(header: string) {
    setSortConfig(prev => {
      if (prev?.key === header) {
        // Đảo chiều sắp xếp
        return { key: header, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Chọn cột mới, mặc định tăng dần
      return { key: header, direction: 'asc' };
    });
  }
  // State cho sắp xếp bảng
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [showExcelImport, setShowExcelImport] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
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
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    item: InventoryItem | null;
  }>({ isOpen: false, item: null });

  // State cho tooltip thiết lập cột
  const [showColumnTooltip, setShowColumnTooltip] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  // Danh sách tên cột inventory table
  const columnHeaders = [
    "Tên tài khoản",
    "Tên nhóm vật tư",
    "Mã đối tượng tập hợp chi phí",
    "Mã hàng",
    "Tên hàng (VN)",
    "Tên hàng (EN)",
    "Tên hàng (KOR)",
    "Đơn vị tính",
  ];
  const filteredHeaders = columnHeaders.filter(h => h.toLowerCase().includes(columnSearch.toLowerCase()));

  // State cho ẩn/hiện cột
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columnHeaders.reduce((acc, header) => {
      acc[header] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Hàm toggle ẩn/hiện cột
  const toggleColumn = (header: string) => {
    setVisibleColumns((prev) => ({ ...prev, [header]: !prev[header] }));
  };

  // Hàm lọc inventory theo từ khóa tìm kiếm
  const filteredItems = items.filter(
    (item) =>
      (item.PRODUCT_NM?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.PRODUCT_CD?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.STORE_CD?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Sắp xếp dữ liệu theo sortConfig
  const sortedItems = React.useMemo(() => {
    if (!sortConfig) return filteredItems;
    const keyMap: Record<string, keyof InventoryItem> = {
      "Tên tài khoản": "STORE_CD",
      "Tên nhóm vật tư": "PRODUCTKIND_CD",
      "Mã đối tượng tập hợp chi phí": "DEPARTMENT_CD",
      "Mã hàng": "PRODUCT_CD",
      "Tên hàng (VN)": "PRODUCT_NM",
      "Tên hàng (EN)": "PRODUCT_NM_ENG",
      "Tên hàng (KOR)": "PRODUCT_NM_KOR",
      "Đơn vị tính": "STOCK_UNIT",
    };
    const key = keyMap[sortConfig.key];
    if (!key) return filteredItems;
    const sorted = [...filteredItems].sort((a, b) => {
      const aValue = a[key] ?? '';
      const bValue = b[key] ?? '';
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue, 'vi', { sensitivity: 'base' })
          : bValue.localeCompare(aValue, 'vi', { sensitivity: 'base' });
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    return sorted;
  }, [filteredItems, sortConfig]);

  // State cho phân trang
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi đổi filter/search hoặc rowsPerPage
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / rowsPerPage));
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Lấy danh sách inventory khi component mount
  useEffect(() => {
    setLoading(true)
    getAllInventory()
      .then((data) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  // Hàm xử lý sự kiện khi nhấn nút "Xem"
  const handleView = (itemCode: string) => {
    const item = items.find((c) => c.PRODUCT_CD === itemCode) || null
    setSelectedItem(item)
    setModalMode("view")
  }

  // Hàm xử lý sự kiện khi nhấn nút "Sửa"
  const handleEdit = (itemCode: string) => {
    const item = items.find((c) => c.PRODUCT_CD === itemCode) || null
    setSelectedItem(item)
    setModalMode("edit")
  }

  // Hàm xử lý sự kiện khi nhấn nút "Xóa"
  const handleDelete = (itemCode: string) => {
    const item = items.find((c) => c.PRODUCT_CD === itemCode) || null;
    if (!item) return;
    setConfirmDelete({ isOpen: true, item });
  };

  // Hàm xác nhận xóa inventory
  const confirmDeleteItem = async () => {
    if (!confirmDelete.item) return;
    try {
      await deleteInventory(confirmDelete.item.PRODUCT_CD);
      const updatedItems = await getAllInventory();
      setItems(updatedItems.data || []);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Thành công!",
        message: "Đã xóa hàng tồn kho thành công!",
      });
    } catch {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Lỗi!",
        message: "Có lỗi xảy ra khi xóa hàng tồn kho!",
      });
    } finally {
      setConfirmDelete({ isOpen: false, item: null });
    }
  };

  // Đóng modal (form thêm/sửa/xem)
  const closeModal = () => {
    setModalMode(null)
    setSelectedItem(null)
  }

  // Xử lý khi nhấn nút "Thêm hàng tồn kho"
  const handleAddItem = () => {
    setShowAddForm(true)
  }

  // Đóng thông báo notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  // Vô hiệu hóa scroll khi mở modal hoặc form thêm
  useEffect(() => {
    if (showAddForm || (modalMode && modalMode !== "delete" && selectedItem)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddForm, modalMode, selectedItem]);

  // Hàm làm mới danh sách inventory
  const handleRefresh = () => {
    setSortConfig(null); // Reset sort state
    setLoading(true);
    getAllInventory()
      .then((data) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  // Đóng tooltip khi click ra ngoài
  useEffect(() => {
    if (!showColumnTooltip) return;
    function handleClickOutside(event: MouseEvent) {
      const tooltip = document.getElementById('column-tooltip');
      const btn = document.getElementById('column-tooltip-btn');
      if (
        tooltip && !tooltip.contains(event.target as Node) &&
        btn && !btn.contains(event.target as Node)
      ) {
        setShowColumnTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnTooltip]);

  // State cho chọn nhiều dòng
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Kiểm tra tất cả dòng hiện tại đã được chọn chưa
  const allVisibleChecked = paginatedItems.length > 0 && paginatedItems.every(c => selectedRows.includes(c.PRODUCT_CD));

  // Xử lý chọn tất cả dòng đang hiển thị
  const handleSelectAll = () => {
    if (allVisibleChecked) {
      setSelectedRows(selectedRows.filter(id => !paginatedItems.some(c => c.PRODUCT_CD === id)));
    } else {
      setSelectedRows([
        ...selectedRows,
        ...paginatedItems
          .map(c => c.PRODUCT_CD)
          .filter(id => !selectedRows.includes(id)),
      ]);
    }
  };

  // Xử lý chọn từng dòng
  const handleSelectRow = (productCode: string) => {
    setSelectedRows(prev =>
      prev.includes(productCode)
        ? prev.filter(id => id !== productCode)
        : [...prev, productCode]
    );
  };

  // Xử lý xóa nhiều dòng
  const handleDeleteSelected = async () => {
    for (const productCode of selectedRows) {
      try {
        await deleteInventory(productCode);
      } catch {
        console.error(`Failed to delete inventory ${productCode}`);
        continue;
      }
    }
    const updatedItems = await getAllInventory();
    setItems(updatedItems.data || []);
    setSelectedRows([]);
    setNotification({
      isOpen: true,
      type: "success",
      title: "Thành công!",
      message: "Đã xóa hàng tồn kho đã chọn!",
    });
  };

  // Hàm xuất Excel các dòng đã chọn
  const handleExportSelected = async () => {
    if (selectedRows.length === 0) return;
    // Lấy dữ liệu các dòng đã chọn
    const selectedData = items.filter(c => selectedRows.includes(c.PRODUCT_CD));
    // Chuyển dữ liệu sang định dạng phù hợp cho Excel
    const exportData = selectedData.map(c => ({
      "Tên tài khoản": c.STORE_CD,
      "Tên nhóm vật tư": c.PRODUCTKIND_CD,
      "Mã đối tượng tập hợp chi phí": c.DEPARTMENT_CD,
      "Mã hàng": c.PRODUCT_CD,
      "Tên hàng (VN)": c.PRODUCT_NM,
      "Tên hàng (EN)": c.PRODUCT_NM_ENG,
      "Tên hàng (KOR)": c.PRODUCT_NM_KOR,
      "Đơn vị tính": c.STOCK_UNIT,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HangTonKho");
    // Tên file mặc định
    const fileName = "quan-ly-hang-ton-kho.xlsx";
    // Tạo file blob
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    // Xử lý lưu file
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: "Excel File",
            accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        setNotification({
          isOpen: true,
          type: "success",
          title: "Xuất Excel thành công!",
          message: `Đã xuất ${selectedRows.length} hàng tồn kho ra file Excel.`,
        });
      } catch {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Lỗi xuất Excel!",
          message: "Có lỗi xảy ra khi lưu file!",
        });
      }
    } else {
      // Fallback: tạo link download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Xuất Excel thành công!",
        message: `Đã xuất ${selectedRows.length} hàng tồn kho ra file Excel.`,
      });
    }
  };

  // Đóng form thêm inventory và reload lại danh sách
  const handleCloseAddForm = async () => {
    setLoading(true);
    try {
      const res = await getAllInventory();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Render giao diện
  return (
    <div className=" bg-white">
      <div className="mb-4 max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 justify-start w-full">
              <div className="text-left">
                <h1 className="text-2xl font-semibold text-gray-800">Quản lý hàng tồn kho</h1>
                <p className="text-sm text-gray-600">Quản lý các mặt hàng tồn kho trong hệ thống</p>
              </div>
            </div>
            <div className="relative group/import">
              <IconButton
                variant="secondary"
                size="md"
                icon={<ArrowDownTrayIcon />}
                onClick={() => setShowExcelImport(true)}
              />
              <span
                className="absolute left-1/2 -top-3 -translate-x-1/2 -translate-y-full z-10 px-4 py-2 bg-white border border-gray-200 rounded shadow-lg text-xs text-gray-600 font-semibold opacity-0 group-hover/import:opacity-100 group-focus/import:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
              >
                Nhập Excel
              </span>
            </div>
            <Button
              onClick={handleAddItem}
              variant="primary"
              size="md"
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Thêm
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-80">
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, mã hàng..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                size="md"
                className="pr-12 w-80"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center px-1 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                  style={{ height: '2rem' }}
                  title="Xóa tìm kiếm"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex items-center bg-gray-100 text-gray-600 rounded-lg px-2 py-1 ml-2">
              {/* ArrowPathIcon with tooltip */}
              <div className="relative group/refresh">
                <IconButton
                  data-tooltip-target="tooltip-light" data-tooltip-style="light" 
                  variant="primary"
                  size="sm"
                  icon={<ArrowPathIcon className="group-hover/refresh:text-cyan-600" />}
                  className="hover:bg-transparent group-hover/refresh:text-cyan-600 transition-colors duration-200"
                  onClick={handleRefresh}
                />
                <span
                  className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-10 px-3 py-1 bg-white border border-gray-300 rounded shadow-lg text-xs text-cyan-600 opacity-0 group-hover/refresh:opacity-100 group-focus/refresh:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                >
                  Làm mới
                </span>
              </div>
              {/* ArrowUpTrayIcon with tooltip */}
              <div className="relative group/export">
                <IconButton
                  variant="primary"
                  size="sm"
                  icon={<ArrowUpTrayIcon className="group-hover/export:text-green-600" />}
                  className="hover:bg-transparent group-hover/export:text-green-600 transition-colors"
                  onClick={handleExportSelected}
                  disabled={selectedRows.length === 0}
                />
                <span
                  className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-10 px-3 py-1 bg-white border border-gray-200 rounded shadow-lg text-xs text-green-600 font-semibold opacity-0 group-hover/export:opacity-100 group-focus/export:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                >
                  Xuất Excel
                </span>
              </div>
              {/* Cog6ToothIcon with tooltip */}
              <div className="relative group/settings">
                <IconButton
                  id="column-tooltip-btn"
                  variant="primary"
                  size="sm"
                  icon={<Cog6ToothIcon className="group-hover/settings:text-cyan-600" />}
                  className="hover:bg-transparent group-hover/settings:text-cyan-600 transition-colors"
                  onClick={() => setShowColumnTooltip(v => !v)}
                />
                {showColumnTooltip && (
                  <div id="column-tooltip" className="absolute right-0 top-10 z-20 w-60 bg-white border border-gray-300 rounded shadow-lg p-3">
                    <input
                      type="text"
                      placeholder="Tìm kiếm tên cột..."
                      value={columnSearch}
                      onChange={e => setColumnSearch(e.target.value)}
                      className="w-full mb-2 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base"
                      autoFocus
                    />
                    <ul className="max-h-[152px] overflow-y-auto">
                      {filteredHeaders.length === 0 ? (
                        <li className="text-gray-600 text-base py-2 text-left">Không có cột phù hợp</li>
                      ) : (
                        filteredHeaders.map((header, idx) => (
                          <li
                            key={idx}
                            className="py-2 px-2 text-gray-600 hover:bg-gray-50 rounded cursor-pointer text-base flex items-center justify-between text-left select-none"
                            onClick={() => toggleColumn(header)}
                          >
                            <span className="text-left">{header}</span>
                            {visibleColumns[header] && <CheckIcon className="w-5 h-5 text-cyan-600 ml-2" />}
                          </li>
                        )))
                      }
                    </ul>
                  </div>
                )}
                <span
                  className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-10 px-3 py-1 bg-white border border-gray-200 rounded shadow-lg text-xs text-cyan-600 font-semibold opacity-0 group-hover/settings:opacity-100 group-focus/settings:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                >
                  Thiết lập
                </span>
              </div>
            </div>
            {/* Nút xóa nhiều dòng */}
            {selectedRows.length > 0 && (
              <Button
                type="button"
                onClick={handleDeleteSelected}
                variant="danger"
                size="md"
                leftIcon={<TrashIcon className="w-5 h-5 mr-1" />}
                className="ml-auto flex items-center min-w-[200px] px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                title="Xóa các hàng tồn kho đã chọn"
              >
                Xóa đã chọn ({selectedRows.length})
              </Button>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="mb-4 bg-white border border-gray-300 rounded-lg overflow-hidden">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="h-12 align-middle">
                  {/* Checkbox header */}
                  <TableHeaderCell className="w-8 min-w-8 text-center">
                    <input
                      type="checkbox"
                      checked={allVisibleChecked}
                      onChange={handleSelectAll}
                      aria-label="Chọn tất cả"
                      className="border border-gray-300 rounded"
                    />
                  </TableHeaderCell>
                  {visibleColumns["Tên tài khoản"] && (
                    <TableHeaderCell className="w-32 min-w-32 text-left cursor-pointer select-none" onClick={() => handleSort("Tên tài khoản")}> 
                      Tên tài khoản
                      {sortConfig?.key === "Tên tài khoản" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Tên nhóm vật tư"] && (
                    <TableHeaderCell className="w-36 min-w-36 text-left cursor-pointer select-none" onClick={() => handleSort("Tên nhóm vật tư")}> 
                      Tên nhóm vật tư
                      {sortConfig?.key === "Tên nhóm vật tư" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Mã đối tượng tập hợp chi phí"] && (
                    <TableHeaderCell className="w-48 min-w-48 text-left cursor-pointer select-none" onClick={() => handleSort("Mã đối tượng tập hợp chi phí")}> 
                      Mã đối tượng tập hợp chi phí
                      {sortConfig?.key === "Mã đối tượng tập hợp chi phí" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Mã hàng"] && (
                    <TableHeaderCell className="w-32 min-w-32 text-left cursor-pointer select-none" onClick={() => handleSort("Mã hàng")}> 
                      Mã hàng
                      {sortConfig?.key === "Mã hàng" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Tên hàng (VN)"] && (
                    <TableHeaderCell className="w-40 min-w-40 text-left cursor-pointer select-none" onClick={() => handleSort("Tên hàng (VN)")}> 
                      Tên hàng (VN)
                      {sortConfig?.key === "Tên hàng (VN)" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Tên hàng (EN)"] && (
                    <TableHeaderCell className="w-40 min-w-40 text-left cursor-pointer select-none" onClick={() => handleSort("Tên hàng (EN)")}> 
                      Tên hàng (EN)
                      {sortConfig?.key === "Tên hàng (EN)" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Tên hàng (KOR)"] && (
                    <TableHeaderCell className="w-40 min-w-40 text-left cursor-pointer select-none" onClick={() => handleSort("Tên hàng (KOR)")}> 
                      Tên hàng (KOR)
                      {sortConfig?.key === "Tên hàng (KOR)" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Đơn vị tính"] && (
                    <TableHeaderCell className="w-32 min-w-32 text-left cursor-pointer select-none" onClick={() => handleSort("Đơn vị tính")}> 
                      Đơn vị tính
                      {sortConfig?.key === "Đơn vị tính" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  <TableHeaderCell className="w-32 min-w-32 text-center">Thao tác</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow className="h-12 align-middle">
                    <TableCell colSpan={9} className="text-center py-12 text-gray-600">
                      Đang tải dữ liệu tồn kho...
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item: InventoryItem, index: number) => {
                    const isLastRow = index === paginatedItems.length - 1;
                    return (
                      <TableRow key={item.PRODUCT_CD || index} className={`group hover:bg-gray-100 transition-colors duration-200 h-12 align-middle${isLastRow ? ' last-row border-gray-300' : ''}`}>
                        {/* Checkbox cell */}
                        <TableCell className="w-8 text-center px-0">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.PRODUCT_CD)}
                            onChange={() => handleSelectRow(item.PRODUCT_CD)}
                            aria-label={`Chọn hàng tồn kho ${item.PRODUCT_CD}`}
                            className="border border-gray-300 rounded"
                          />
                        </TableCell>
                        {visibleColumns["Tên tài khoản"] && <TableCell className="w-32 min-w-32 text-left">{item.STORE_CD}</TableCell>}
                        {visibleColumns["Tên nhóm vật tư"] && <TableCell className="w-36 min-w-36 text-left">{item.PRODUCTKIND_CD}</TableCell>}
                        {visibleColumns["Mã đối tượng tập hợp chi phí"] && <TableCell className="w-48 min-w-48 text-left">{item.DEPARTMENT_CD}</TableCell>}
                        {visibleColumns["Mã hàng"] && <TableCell className="w-32 min-w-32 text-left">{item.PRODUCT_CD}</TableCell>}
                        {visibleColumns["Tên hàng (VN)"] && <TableCell className="w-40 min-w-40 text-left">{item.PRODUCT_NM}</TableCell>}
                        {visibleColumns["Tên hàng (EN)"] && <TableCell className="w-40 min-w-40 text-left">{item.PRODUCT_NM_ENG}</TableCell>}
                        {visibleColumns["Tên hàng (KOR)"] && <TableCell className="w-40 min-w-40 text-left">{item.PRODUCT_NM_KOR}</TableCell>}
                        {visibleColumns["Đơn vị tính"] && <TableCell className="w-32 min-w-32 text-left">{item.STOCK_UNIT}</TableCell>}
                        <TableCell className="w-32 min-w-32 text-center actions-cell transition-opacity duration-200 overflow-visible">
                          <div className="flex items-center justify-center">
                            {/* View Button */}
                            <button
                              onClick={() => handleView(item.PRODUCT_CD)}
                              className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors group/view"
                              title="View Item"
                            >
                              {/* Tooltip card for View */}
                              <span
                                className="absolute left-1/2 -top-1 -translate-x-1/2 -translate-y-full z-10 px-4 py-2 bg-gray-50 border border-gray-200 rounded shadow-lg text-xs text-blue-600 font-semibold opacity-0 group-hover/view:opacity-100 group-focus/view:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                              >
                                Xem
                              </span>
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(item.PRODUCT_CD)}
                              className="relative text-gray-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors group/edit"
                              title="Edit Item"
                            >
                              {/* Tooltip card for Update */}
                              <span
                                className="absolute left-1/2 -top-1 -translate-x-1/2 -translate-y-full z-10 px-4 py-2 bg-gray-50 border border-gray-200 rounded shadow-lg text-xs text-green-600 font-semibold opacity-0 group-hover/edit:opacity-100 group-focus/edit:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                              >
                                Sửa
                              </span>
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(item.PRODUCT_CD)}
                              className="relative text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors group/delete"
                              title="Delete Item"
                            >
                              {/* Tooltip card */}
                              <span
                                className="absolute left-1/2 -top-1 -translate-x-1/2 -translate-y-full z-10 px-4 py-2 bg-gray-50 border border-gray-200 rounded shadow-lg text-xs text-red-600 font-semibold opacity-0 group-hover/delete:opacity-100 group-focus/delete:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                              >
                                Xóa
                              </span>
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Empty State */}
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-800">No inventory items found</h3>
              <p className="mt-1 text-sm text-gray-600">
                {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new item."}
              </p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2 w-auto">
            <span>Số hàng trên mỗi trang</span>
            <Select
              className=""
              variant="rowsPerPage"
              size="sm"
              value={rowsPerPage}
              onChange={e => setRowsPerPage(Number(e.target.value))}
            >
              {[5, 10, 20, 30, 40, 50].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              variant="secondary"
              size="sm"
              icon={<ChevronLeftIcon />}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            <span>
              Trang {currentPage}/{totalPages}
            </span>
            <IconButton
              variant="secondary"
              size="sm"
              icon={<ChevronRightIcon />}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <InventoryForm onClose={() => setShowAddForm(false)} onSave={handleCloseAddForm} />
      )}

      {/* Edit/View Item Form */}
      {modalMode && modalMode !== "delete" && selectedItem && (
        <InventoryForm
          mode={modalMode}
          item={selectedItem}
          onClose={closeModal}
          onSave={handleCloseAddForm}
        />
      )}
      
      {/* Excel Import Modal */}
      {showExcelImport && (
        <ExcelImportModal onClose={() => setShowExcelImport(false)} />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />

      {/* Delete Confirmation Modal */}
      {confirmDelete.isOpen && (
        <NotificationModal
          isOpen={confirmDelete.isOpen}
          type="warning"
          title="Xác nhận xóa hàng tồn kho"
          message={`Bạn có chắc chắn muốn xóa hàng tồn kho "${confirmDelete.item?.PRODUCT_NM || confirmDelete.item?.PRODUCT_CD}" ?`}
          onClose={() => setConfirmDelete({ isOpen: false, item: null })}
          buttonText="Hủy"
          confirmText="Xóa"
          onConfirm={confirmDeleteItem}
        />
      )}
    </div>
  )
}
