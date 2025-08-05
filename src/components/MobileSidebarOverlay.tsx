import Sidebar from "./Sidebar"
import { navigation } from "../constants/navigation"

interface MobileSidebarOverlayProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onMenuSelect: (id: string, displayName: string) => void
  selectedNav?: string  
  expandedItems: string[]
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>
}

export default function MobileSidebarOverlay({ sidebarOpen, setSidebarOpen, onMenuSelect, selectedNav, expandedItems, setExpandedItems }: MobileSidebarOverlayProps) {
  return sidebarOpen ? (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
      <Sidebar
        navigation={navigation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={true}
        onMenuSelect={onMenuSelect}
        selectedNav={selectedNav}
        expandedItems={expandedItems}
        setExpandedItems={setExpandedItems}
      />
    </div>
  ) : null
}