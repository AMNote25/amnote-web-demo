import React, { useState, useEffect } from "react"
import CustomerForm from "../components/CustomerForm"
import NotificationModal, { type NotificationType } from "../components/NotificationModal"
import ExcelImportModal from "../components/ExcelImportModal"
import { Button } from "../components/ui"
import { IconButton } from "../components/ui"
import type { CustomerItem } from "../types/customer"
import { getAllCustomer, deleteCustomer } from "../api/customerApi"
import { getCustomerCategoryOptions, type CategoryOption } from "../api/categoryApi"
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

export default function CustomerManagement() {
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
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null)
  // const [editFormData, setEditFormData] = useState<Partial<CustomerItem>>({})
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [categoryLoading, setCategoryLoading] = useState(true)
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
    customer: CustomerItem | null;
  }>({ isOpen: false, customer: null });

  // State cho tooltip thiết lập cột
  const [showColumnTooltip, setShowColumnTooltip] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  // Danh sách tên cột customer table
  const columnHeaders = [
    "Mã khách hàng",
    "Mã người dùng",
    "Tên (VI)",
    "Tên (EN)",
    "Tên (KOR)",
    "Email",
    "SDT",
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

  // Hàm lọc khách hàng theo từ khóa tìm kiếm
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.CustomerNM?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (customer.CustomerCD?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (customer.TaxCD || "").includes(searchTerm),
  );

  // Sắp xếp dữ liệu theo sortConfig
  const sortedCustomers = React.useMemo(() => {
    if (!sortConfig) return filteredCustomers;
    const keyMap: Record<string, keyof CustomerItem> = {
      "Mã khách hàng": "CustomerCD",
      "Mã người dùng": "CustomerUserCD",
      "Tên (VI)": "CustomerNM",
      "Tên (EN)": "CustomerNM_EN",
      "Tên (KOR)": "CustomerNM_KOR",
      "Email": "Email",
      "SDT": "Tel",
    };
    const key = keyMap[sortConfig.key];
    if (!key) return filteredCustomers;
    const sorted = [...filteredCustomers].sort((a, b) => {
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
  }, [filteredCustomers, sortConfig]);


  // State cho phân trang
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi đổi filter/search hoặc rowsPerPage
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / rowsPerPage));
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Lấy danh sách khách hàng khi component mount
  useEffect(() => {
    setLoading(true)

    getAllCustomer()
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }, [])

  // Lấy danh mục loại khách hàng khi component mount
  useEffect(() => {
    setCategoryLoading(true)

    getCustomerCategoryOptions()
      .then(setCategoryOptions)
      .catch(() => setCategoryOptions([]))
      .finally(() => setCategoryLoading(false))
  }, [])

  // Hàm xử lý sự kiện khi nhấn nút "Xem"
  const handleView = (customerCode: string) => {
    const customer = customers.find((c) => c.CustomerCD === customerCode) || null
    setSelectedCustomer(customer)
    setModalMode("view")
  }

  // Hàm xử lý sự kiện khi nhấn nút "Sửa"
  const handleEdit = (customerCode: string) => {
    const customer = customers.find((c) => c.CustomerCD === customerCode) || null
    setSelectedCustomer(customer)
    setModalMode("edit")
  }

  // Hàm xử lý sự kiện khi nhấn nút "Xóa"
  const handleDelete = (customerCode: string) => {
    const customer = customers.find((c) => c.CustomerCD === customerCode) || null;
    if (!customer) return;
    setConfirmDelete({ isOpen: true, customer });
  };

  // Hàm xác nhận xóa khách hàng
  const confirmDeleteCustomer = async () => {
    if (!confirmDelete.customer) return;
    try {
      await deleteCustomer(confirmDelete.customer.CustomerCD);
      const updatedCustomers = await getAllCustomer();
      setCustomers(updatedCustomers.data || []);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Thành công!",
        message: "Đã xóa khách hàng thành công!",
      });
    } catch {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Lỗi!",
        message: "Có lỗi xảy ra khi xóa khách hàng!",
      });
    } finally {
      setConfirmDelete({ isOpen: false, customer: null });
    }
  };

  // Đóng modal (form thêm/sửa/xem)
  const closeModal = () => {
    setModalMode(null)
    setSelectedCustomer(null)
    // setEditFormData({})
  }

  // Xử lý khi nhấn nút "Thêm khách hàng"
  const handleAddCustomer = () => {
    setShowAddForm(true)
  }

  // Đóng thông báo notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  // Vô hiệu hóa scroll khi mở modal hoặc form thêm
  useEffect(() => {
    // Khi có modal hoặc form add mở, disable scroll và thao tác nền
    if ((showAddForm && !categoryLoading) || (modalMode && modalMode !== "delete" && selectedCustomer && !categoryLoading)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup khi unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddForm, modalMode, selectedCustomer, categoryLoading]);

  // Hàm làm mới danh sách khách hàng
  const handleRefresh = () => {
    setSortConfig(null); // Reset sort state
    setLoading(true);
    getAllCustomer()
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]))
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
  const allVisibleChecked = paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedRows.includes(c.CustomerCD));

  // Xử lý chọn tất cả dòng đang hiển thị
  const handleSelectAll = () => {
    if (allVisibleChecked) {
      setSelectedRows(selectedRows.filter(id => !paginatedCustomers.some(c => c.CustomerCD === id)));
    } else {
      setSelectedRows([
        ...selectedRows,
        ...paginatedCustomers
          .map(c => c.CustomerCD)
          .filter(id => !selectedRows.includes(id)),
      ]);
    }
  };

  // Xử lý chọn từng dòng
  const handleSelectRow = (customerCD: string) => {
    setSelectedRows(prev =>
      prev.includes(customerCD)
        ? prev.filter(id => id !== customerCD)
        : [...prev, customerCD]
    );
  };

  // Xử lý xóa nhiều dòng
  const handleDeleteSelected = async () => {
    for (const customerCD of selectedRows) {
      try {
        await deleteCustomer(customerCD);
      } catch {
        console.error(`Failed to delete customer ${customerCD}`);
        continue;
      }
    }
    const updatedCustomers = await getAllCustomer();
    setCustomers(updatedCustomers.data || []);
    setSelectedRows([]);
    setNotification({
      isOpen: true,
      type: "success",
      title: "Thành công!",
      message: "Đã xóa khách hàng đã chọn!",
    });
  };

  // Hàm xuất Excel các dòng đã chọn
  const handleExportSelected = async () => {
    if (selectedRows.length === 0) return;
    // Lấy dữ liệu các dòng đã chọn
    const selectedData = customers.filter(c => selectedRows.includes(c.CustomerCD));
    // Chuyển dữ liệu sang định dạng phù hợp cho Excel
    const exportData = selectedData.map(c => ({
      "Mã khách hàng": c.CustomerCD,
      "Mã người dùng": c.CustomerUserCD,
      "Tên (VI)": c.CustomerNM,
      "Tên (EN)": c.CustomerNM_EN,
      "Tên (KOR)": c.CustomerNM_KOR,
      "Email": c.Email,
      "SDT": c.Tel,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KhachHang");
    // Tên file mặc định
    const fileName = "quan-ly-khach-hang.xlsx";
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
          message: `Đã xuất ${selectedRows.length} khách hàng ra file Excel.`,
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
        message: `Đã xuất ${selectedRows.length} khách hàng ra file Excel.`,
      });
    }
  };

  // Đóng form thêm khách hàng và reload lại danh sách
  const handleCloseAddForm = async () => {
    setLoading(true);
    try {
      const res = await getAllCustomer();
      setCustomers(res.data || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Render giao diện
  return (
    <div className=" bg-white">
      <div className="mb-4 max-w-8xl mx-auto">
        {/* Thêm style cho hiệu ứng hover actions */}
        {/* <div dangerouslySetInnerHTML={{ __html: tableRowHoverStyle }} /> */}
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 justify-start w-full">
              <div className="text-left">
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý khách hàng</h1>
                <p className="text-sm text-gray-600">Quản lý thông tin khách hàng trong hệ thống</p>
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
              onClick={handleAddCustomer}
              variant="primary"
              size="md"
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Thêm
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-80">  {/* Chỉnh chiều ngang ô tìm kiếm */}
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, mã khách hàng..."
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
                title="Xóa các khách hàng đã chọn"
              >
                Xóa đã chọn ({selectedRows.length})
              </Button>
            )}
          </div>
        </div>

        {/* Customer Table */}
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
                  {visibleColumns["Mã khách hàng"] && (
                    <TableHeaderCell className="w-36 min-w-36 text-left cursor-pointer select-none" onClick={() => handleSort("Mã khách hàng")}> 
                      Mã khách hàng
                      {sortConfig?.key === "Mã khách hàng" ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 inline ml-1 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )
                      ) : (
                        // ChevronUpDownIcon cho cột chưa sắp xếp
                        <ChevronUpDownIcon className="w-5 h-5 inline ml-1 text-gray-800" />
                      )}
                    </TableHeaderCell>
                  )}
                  {visibleColumns["Mã người dùng"] && (
                    <TableHeaderCell className="w-36 min-w-36 text-left cursor-pointer select-none" onClick={() => handleSort("Mã người dùng")}> 
                      Mã người dùng
                      {sortConfig?.key === "Mã người dùng" ? (
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
                  {visibleColumns["Tên (VI)"] && (
                    <TableHeaderCell className="w-40 min-w-40 text-left cursor-pointer select-none" onClick={() => handleSort("Tên (VI)")}> 
                      Tên (VI)
                      {sortConfig?.key === "Tên (VI)" ? (
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
                  {visibleColumns["Tên (EN)"] && (
                    <TableHeaderCell className="w-40 min-w-40 text-left cursor-pointer select-none" onClick={() => handleSort("Tên (EN)")}> 
                      Tên (EN)
                      {sortConfig?.key === "Tên (EN)" ? (
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
                  {visibleColumns["Tên (KOR)"] && (
                    <TableHeaderCell className="w-40 min-w-40 text-left cursor-pointer select-none" onClick={() => handleSort("Tên (KOR)")}> 
                      Tên (KOR)
                      {sortConfig?.key === "Tên (KOR)" ? (
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
                  {visibleColumns["Email"] && (
                    <TableHeaderCell className="w-48 min-w-48 text-left cursor-pointer select-none" onClick={() => handleSort("Email")}> 
                      Email
                      {sortConfig?.key === "Email" ? (
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
                  {visibleColumns["SDT"] && (
                    <TableHeaderCell className="w-32 min-w-32 text-left cursor-pointer select-none" onClick={() => handleSort("SDT")}> 
                      SDT
                      {sortConfig?.key === "SDT" ? (
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
                    <TableCell colSpan={8} className="text-center py-12 text-gray-600">
                      Đang tải dữ liệu khách hàng...
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer, index) => {
                    const isLastRow = index === paginatedCustomers.length - 1;
                    return (
                      <TableRow
                        key={customer.CustomerCD || index}
                        className={`group hover:bg-gray-100 transition-colors duration-200 h-12 align-middle${isLastRow ? ' last-row border-gray-300' : ''}`}
                      >
                        {/* Checkbox cell */}
                  <TableCell className="w-8 text-center px-0">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(customer.CustomerCD)}
                            onChange={() => handleSelectRow(customer.CustomerCD)}
                            aria-label={`Chọn khách hàng ${customer.CustomerCD}`}
                            className="border border-gray-300 rounded"
                          />
                        </TableCell>
                        {visibleColumns["Mã khách hàng"] && <TableCell className="w-32 min-w-32 text-left">{customer.CustomerCD}</TableCell>}
                        {visibleColumns["Mã người dùng"] && <TableCell className="w-32 min-w-32 text-left">{customer.CustomerUserCD}</TableCell>}
                        {visibleColumns["Tên (VI)"] && <TableCell className="w-40 min-w-40 text-left">{customer.CustomerNM}</TableCell>}
                        {visibleColumns["Tên (EN)"] && <TableCell className="w-40 min-w-40 text-left">{customer.CustomerNM_EN}</TableCell>}
                        {visibleColumns["Tên (KOR)"] && <TableCell className="w-40 min-w-40 text-left">{customer.CustomerNM_KOR}</TableCell>}
                        {visibleColumns["Email"] && <TableCell className="w-48 min-w-48 text-left">{customer.Email}</TableCell>}
                        {visibleColumns["SDT"] && <TableCell className="w-32 min-w-32 text-left">{customer.Tel}</TableCell>}
                        <TableCell className="w-32 min-w-32 text-center actions-cell transition-opacity duration-200 overflow-visible">
                          <div className="flex items-center justify-center">
                            {/* View Button */}
                            <button
                              onClick={() => handleView(customer.CustomerCD)}
                              className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors group/view"
                              title="View Customer"
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
                              onClick={() => handleEdit(customer.CustomerCD)}
                              className="relative text-gray-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors group/edit"
                              title="Edit Customer"
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
                              onClick={() => handleDelete(customer.CustomerCD)}
                              className="relative text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors group/delete"
                              title="Delete Customer"
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
          {filteredCustomers.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-600">
                {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new customer."}
              </p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2 w-auto">
            <span>Số hàng trên mỗi trang</span>
            <Select
              className="" // "border border-gray-300 rounded-lg px-2 py-1 transition-all duration-200 focus:outline-none"
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

      {/* Add Customer Form */}
      {showAddForm && !categoryLoading && (
        <CustomerForm onClose={() => setShowAddForm(false)} onSave={handleCloseAddForm} categoryOptions={categoryOptions} />
      )}

      {/* Edit/View Customer Form */}
      {modalMode && modalMode !== "delete" && selectedCustomer && !categoryLoading && (
        <CustomerForm
          mode={modalMode}
          customer={selectedCustomer}
          onClose={closeModal}
          onSave={handleCloseAddForm} // Chỉ reload data, không đóng form
          categoryOptions={categoryOptions}
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
          title="Xác nhận xóa khách hàng"
          message={`Bạn có chắc chắn muốn xóa khách hàng:\n${confirmDelete.customer?.CustomerNM || confirmDelete.customer?.CustomerCD}`}
          onClose={() => setConfirmDelete({ isOpen: false, customer: null })}
          buttonText="Hủy"
          confirmText="Xóa"
          onConfirm={confirmDeleteCustomer}
        />
      )}
    </div>
  )
}