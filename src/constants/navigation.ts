import {
  HomeIcon,
  // BuildingOffice2Icon,
  // UsersIcon,
  ClipboardDocumentListIcon,
  // UserGroupIcon,
  // BanknotesIcon,
  // CogIcon,
  // UserIcon,
  CreditCardIcon,
  PowerIcon,
  // ArchiveBoxIcon,
} from "@heroicons/react/24/outline"

import { ChevronRightIcon, } from "@heroicons/react/20/solid"

export interface NavigationItem {
  id: string
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  current: boolean
  children?: NavigationItem[]
  disabled?: boolean
}

export const navigation: NavigationItem[] = [
  { id: "dashboard", name: "Tổng quan", href: "#", icon: HomeIcon, current: true },
  {
    id: "data_management",
    name: "Quản lý dữ liệu cơ bản",
    href: "#",
    icon: ClipboardDocumentListIcon,
    current: false,
    children: [
      { id: "company", name: "Quản lý công ty", href: "#", icon: ChevronRightIcon, current: false, disabled: true },
      { id: "user", name: "Quản lý người dùng", href: "#", icon: ChevronRightIcon, current: false },
      { id: "cost_object", name: "Đối tượng tập hợp chi phí", href: "#", icon: ChevronRightIcon, current: false, disabled: true },
      { id: "customer", name: "Quản lý khách hàng", href: "#", icon: ChevronRightIcon, current: false },
      { id: "bank", name: "Quản lý ngân hàng", href: "#", icon: ChevronRightIcon, current: false },
      { id: "inventory", name: "Quản lý hàng tồn kho", href: "#", icon: ChevronRightIcon, current: false },
      { id: "unit", name: "Quản lý đơn vị tính", href: "#", icon: ChevronRightIcon, current: false },
    ],
  },
  {
    id: "invoice",
    name: "Hóa đơn",
    href: "#",
    icon: CreditCardIcon,
    current: false,
    children: [
      { id: "electronic_invoice", name: "Hóa đơn điện tử", href: "#", icon: ChevronRightIcon, current: false, disabled: true },
    ],
  },
]

export const logoutItem: NavigationItem = { id: "logout", name: "Đăng xuất", href: "#", icon: PowerIcon, current: false }