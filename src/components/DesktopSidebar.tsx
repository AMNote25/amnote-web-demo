import Sidebar from "./Sidebar"
import { navigation } from "../constants/navigation"

interface DesktopSidebarProps {
  desktopSidebarOpen: boolean
  setDesktopSidebarOpen: (open: boolean) => void
  onMenuSelect: (id: string, displayName: string) => void
  selectedNav?: string
  expandedItems: string[]
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>
}

export default function DesktopSidebar({ desktopSidebarOpen, setDesktopSidebarOpen, onMenuSelect, expandedItems, setExpandedItems, selectedNav }: DesktopSidebarProps) {
  return (
    <div
      className={`
        hidden
        lg:fixed lg:inset-y-0 lg:flex
        transition-all duration-300
        ${desktopSidebarOpen ? "lg:w-64" : "lg:w-0"}
        overflow-hidden
        bg-white border-r border-gray-200
      `}
      style={{ zIndex: 30 }}
    >
      {desktopSidebarOpen && (
        <Sidebar
          navigation={navigation}
          sidebarOpen={desktopSidebarOpen}
          setSidebarOpen={setDesktopSidebarOpen}
          onHideSidebar={() => setDesktopSidebarOpen(false)}
          onMenuSelect={onMenuSelect}
          selectedNav={selectedNav}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
        />
      )}
    </div>
  )
}