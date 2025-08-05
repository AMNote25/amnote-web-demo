import React from "react"

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Bạn có thể log lỗi ở đây nếu muốn
    console.error("ErrorBoundary caught an error", error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-600 p-4">Đã xảy ra lỗi khi hiển thị trang.</div>
    }
    return this.props.children
  }
}

export default ErrorBoundary