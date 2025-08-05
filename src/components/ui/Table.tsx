import React from "react"
import { cn } from "../../utils/cn"

export const TableContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("overflow-x-auto w-full", className)} {...props} />
  )
)
TableContainer.displayName = "TableContainer"

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn("w-full table-fixed border-collapse", className)} {...props} />
  )
)
Table.displayName = "Table"

export const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("border-b border-gray-200", className)} {...props} />
  )
)
TableHead.displayName = "TableHead"

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("bg-white divide-y divide-gray-200", className)} {...props} />
  )
)
TableBody.displayName = "TableBody"

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn(className)} {...props} />
  )
)
TableRow.displayName = "TableRow"

export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-2 py-2 text-gray-600 uppercase",
        className ? className : "text-left"
      )}
      {...props}
    />
  )
)
TableHeaderCell.displayName = "TableHeaderCell"

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("px-2 py-2 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis", className)} {...props} />
  )
)
TableCell.displayName = "TableCell"
