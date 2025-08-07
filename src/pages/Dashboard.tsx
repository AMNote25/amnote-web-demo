import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DesktopSidebar from "../components/DesktopSidebar"
import MobileSidebarOverlay from "../components/MobileSidebarOverlay"
import TopHeader from "../components/TopHeader"
import { navigation } from "../constants/navigation"
import CompanyManagement from "./CompanyManagement"
import CustomerManagement from "./CustomerManagement"
import InventoryManagement from "./InventoryManagement"
import UnitCodeManagement from "./UnitCodeManagement"
import UserManagement from "./UserManagement"
import ErrorBoundary from "../components/ErrorBoundary"
import { logout } from "../api/authApi"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  // Ensure selectedNav uses the unique id of the first menu item
  const [selectedNav, setSelectedNav] = useState(navigation[0].id)
  const [selectedNavName, setSelectedNavName] = useState(navigation[0].name)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const navigate = useNavigate()

  // Kiểm tra access_token, nếu không có thì chuyển về trang login
  useEffect(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
    if (!token) {
      navigate("/")
    }
  }, [navigate])

  // Hàm chọn menu
  const handleMenuSelect = async (id: string, displayName: string) => {
    if (id === "logout") {
      try {
        const result = await logout()
        if (result.ok) {
          // Xóa token hoặc thông tin đăng nhập nếu có
          localStorage.removeItem("access_token")
          sessionStorage.removeItem("access_token")
          // Quay lại trang đăng nhập
          navigate("/")
        } else {
          console.error("Logout failed:", result.data)
          // Vẫn quay lại trang đăng nhập ngay cả khi API lỗi
          localStorage.removeItem("access_token")
          sessionStorage.removeItem("access_token")
          navigate("/")
        }
      } catch (error) {
        console.error("Logout error:", error)
        // Vẫn quay lại trang đăng nhập ngay cả khi có lỗi
        localStorage.removeItem("access_token")
        sessionStorage.removeItem("access_token")
        navigate("/")
      }
    } else {
      setSelectedNav(id)
      setSelectedNavName(displayName)
    }
  }

  // Render nội dung theo menu được chọn bằng id
  let pageContent = null
  switch (selectedNav) {
    case "company":
      pageContent = <CompanyManagement />
      break
    case "customer":
      pageContent = <CustomerManagement />
      break
    case "user":
      pageContent = <UserManagement />
      break
    case "inventory":
      pageContent = <InventoryManagement />
      break
    case "unit":
      pageContent = <UnitCodeManagement />
      break
    default:
      pageContent = (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Chức năng đang được phát triển.</p>
        </div>
      )
  }

  return (
    <div className="w-screen h-screen bg-gray-50 flex">
      <MobileSidebarOverlay
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onMenuSelect={handleMenuSelect}
        selectedNav={selectedNav}
        expandedItems={expandedItems}
        setExpandedItems={setExpandedItems}
      />
      <DesktopSidebar
        desktopSidebarOpen={desktopSidebarOpen}
        setDesktopSidebarOpen={setDesktopSidebarOpen}
        onMenuSelect={handleMenuSelect}
        selectedNav={selectedNav}
        expandedItems={expandedItems}
        setExpandedItems={setExpandedItems}
      />
      <div
        className={`
          min-w-0 flex flex-col flex-1
          transition-all duration-300
          ${desktopSidebarOpen ? "lg:pl-64" : "lg:pl-0"}
        `}
      >
        <TopHeader
          setSidebarOpen={setSidebarOpen}
          desktopSidebarOpen={desktopSidebarOpen}
          setDesktopSidebarOpen={setDesktopSidebarOpen}
          selectedNavName={selectedNavName}
        />
        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="overflow-x-auto m-6 p-6 bg-white rounded-lg border border-gray-300 min-h-[calc(100vh-6rem)]"> {/* min-h-[calc(100vh-6rem)] : chiều cao tối thiểu bằng chiều cao toàn màn hình (100vh) trừ đi 6rem */ }
            <ErrorBoundary>  
              {/* Nội dung trang sẽ được hiển thị ở đây */}
              {pageContent} 
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
