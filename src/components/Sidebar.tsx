import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"
import Logo from "./Logo"
import { logoutItem } from "../constants/navigation"
import { Button, Input } from "./ui"

interface NavigationItem {
  id: string
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  current: boolean
  children?: {
    id: string
    name: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    current: boolean
    disabled?: boolean
  }[]
  disabled?: boolean
}

interface SidebarProps {
  navigation: NavigationItem[]
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
  isMobile?: boolean
  onMenuSelect?: (id: string, displayName: string) => void
  onHideSidebar?: () => void
  selectedNav?: string
  expandedItems: string[]
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

const Sidebar: React.FC<SidebarProps> = ({
  navigation,
  sidebarOpen,
  setSidebarOpen,
  isMobile = false,
  onMenuSelect,
  selectedNav,
  expandedItems,
  setExpandedItems,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeParent, setActiveParent] = useState<string | null>(null)

  const handleParentClick = (item: NavigationItem) => {
    setExpandedItems((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
    setActiveParent(item.id);
    localStorage.setItem("sidebar_activeParent", item.id);
    onMenuSelect?.(item.id, item.name);
  }

  // Lưu trạng thái item cha và item con đang chọn vào localStorage
  React.useEffect(() => {
    localStorage.setItem("sidebar_activeParent", activeParent || "");
    localStorage.setItem("sidebar_selectedNav", selectedNav || "");
  }, [activeParent, selectedNav]);

  // Đọc lại trạng thái khi mount
  React.useEffect(() => {
    const savedParent = localStorage.getItem("sidebar_activeParent");
    const savedNav = localStorage.getItem("sidebar_selectedNav");
    if (savedParent) setActiveParent(savedParent);
    if (savedNav) {
      // Tìm tên hiển thị phù hợp
      let displayName = savedNav;
      for (const item of navigation) {
        if (item.id === savedNav) {
          displayName = item.name;
          break;
        }
        if (item.children) {
          const child = item.children.find(child => child.id === savedNav);
          if (child) {
            displayName = `${item.name}`; // ${item.name} / ${child.name}
            break;
          }
        }
      }
      onMenuSelect?.(savedNav, displayName);
      // Nếu là item con thì tự động expand parent
      const parentId = navigation.find(item => {
        if (item.id === savedNav) return false;
        if (item.children) return item.children.some(child => child.id === savedNav);
        return false;
      })?.id;
      if (parentId) {
        setExpandedItems((prev) => prev.includes(parentId) ? prev : [...prev, parentId]);
      } else {
        setActiveParent(savedNav);
      }
    }
  }, [onMenuSelect, setExpandedItems, navigation]);

  // Lọc navigation theo searchTerm
  const filteredNavigation = navigation
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          filteredChildren.length > 0
        ) {
          return { ...item, children: filteredChildren };
        }
        return null;
      } else {
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return item;
        }
        return null;
      }
    })
    .filter((item): item is NavigationItem => Boolean(item));

  type SidebarItemProps = React.PropsWithChildren<{
    className?: string;
  }> & React.ButtonHTMLAttributes<HTMLButtonElement>;

  // Shared SidebarItem component
  const SidebarItem = ({
    children,
    className = "",
    ...props
  }: SidebarItemProps) => {
    return (
      <Button
        variant="sidebar"
        className={
          className +
          " w-full min-w-0 max-w-full text-left justify-start text-sm font-medium flex"
        }
        style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
        {...props}
      >
        {children}
      </Button>
    )
  }

  const sidebarContent = (
    <>
      <div className="flex h-20 items-center justify-between">
        <Logo />
        {/* Button đóng sidebar mobile */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen?.(false)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      {/* Ô tìm kiếm menu */}
      {/* w-full h-10 px-2 py-2 border border-gray-300 rounded-md focus:border-0 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm */}
      <div className="px-4 py-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm menu..."
          size="md"
        />
      </div>
      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {filteredNavigation.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <>
                <SidebarItem
                onClick={() => !item.disabled && handleParentClick(item)}
                  className={classNames(
                    (activeParent === item.id || (selectedNav && item.children.some(child => child.id === selectedNav)))
                      ? "!bg-red-600 text-white hover:!bg-red-600 hover:!text-white"
                      : item.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100 hover:text-gray-900",
                  )}
                  disabled={item.disabled}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDownIcon
                    className={classNames(
                      "h-4 w-4 transition-transform duration-700",
                      (activeParent === item.id || (selectedNav && item.children.some(child => child.id === selectedNav)))
                        ? "text-white"
                        : "text-gray-600",
                      expandedItems.includes(item.id)
                        ? "rotate-180"
                        : "rotate-0"
                    )}
                  />
                </SidebarItem>
                <AnimatePresence initial={false}>
                  {expandedItems.includes(item.id) && (
                    <motion.div
                      className="mt-1 space-y-1"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: 'auto' },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {item.children.map((child, idx) => (
                        <motion.div
                          key={child.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ delay: idx * 0.04, duration: 0.22 }}
                        >
                          <SidebarItem
                          onClick={() => {
                              if (!child.disabled) {
                                setActiveParent(item.id);
                                localStorage.setItem("sidebar_activeParent", item.id);
                                onMenuSelect?.(child.id, `${item.name}`); // ${item.name} / ${child.name}
                              }
                            }}
                            className={classNames(
                              selectedNav === child.id
                                ? "text-red-600 hover:text-red-600 hover:bg-red-50"
                                : "hover:bg-gray-100 hover:text-gray-900",
                              child.disabled ? "opacity-50 cursor-not-allowed" : "",
                              "pl-8 pr-2"
                            )}
                            disabled={child.disabled}
                          >
                            {child.icon && <child.icon className="mr-3 h-4 w-4" />}
                            {child.name}
                          </SidebarItem>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <SidebarItem
                onClick={() => !item.disabled && handleParentClick(item)}
                className={classNames(
                    (activeParent === item.id)
                      ? "!bg-red-600 text-white hover:!bg-red-600 hover:!text-white"
                      : item.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100 hover:text-gray-900",
                  )}
                disabled={item.disabled}
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                {item.name}
              </SidebarItem>
            )}
          </div>
        ))}
      </nav>

      {/* Logout button at bottom */}
      <div className="px-2 py-4">
        <SidebarItem
          onClick={() => onMenuSelect?.(logoutItem.id, logoutItem.name)}
          className={""}
        >
          {logoutItem.icon && <logoutItem.icon className="mr-3 h-5 w-5" />}
          {logoutItem.name}
        </SidebarItem>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-mobile"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed flex flex-col inset-y-0 left-0 w-64 min-w-64 max-w-64 bg-white border-r border-gray-300 overflow-y-auto z-40"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  return (
    <AnimatePresence>
      {(!isMobile || sidebarOpen !== false) && (
        <motion.div
          key="sidebar-desktop"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}
          transition={{ type: "tween", duration: 0.25 }}
          className="flex flex-col flex-grow w-64 min-w-64 max-w-64 bg-white border-r border-gray-300 overflow-y-auto"
        >
          {sidebarContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Sidebar