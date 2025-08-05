import { Bars3Icon } from "@heroicons/react/24/outline"
// import { BellIcon } from "@heroicons/react/24/outline"

interface TopHeaderProps {
  setSidebarOpen: (open: boolean) => void
  desktopSidebarOpen: boolean
  setDesktopSidebarOpen: (open: boolean) => void
  selectedNavName: string
}

export default function TopHeader({
  setSidebarOpen,
  desktopSidebarOpen,
  setDesktopSidebarOpen,
  selectedNavName,
}: TopHeaderProps) {
  return (
    <div className="sticky top-0 flex-shrink-0 flex h-16 border-b border-gray-300  bg-white px-4">
      {/* Button và tên navigation */}
      <div className="flex items-center">
        <button
          className="text-gray-600 inline-flex items-center justify-center rounded-md  hover:bg-gray-50"
          onClick={() => {
            if (window.innerWidth >= 1024) {
              setDesktopSidebarOpen(!desktopSidebarOpen)
            } else {
              setSidebarOpen(true)
            }
          }}
        >
          <Bars3Icon className="h-8 w-8" />
        </button>
        <span className="ml-4 text-lg font-base text-gray-800">{selectedNavName}</span>
      </div>

      {/* Thành phần bên phải */}
      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src="/placeholder.svg?height=32&width=32"
              alt="User avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<span class="text-sm font-medium text-gray-600">TC</span>'
                }
              }}
            />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-600">Tom Cook</div>
          </div>
        </div>
      </div>
    </div>
  )
}