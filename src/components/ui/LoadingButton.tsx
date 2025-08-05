import React from "react"
import Button from "./Button"
import type { ButtonProps } from "./Button"

interface LoadingButtonProps extends Omit<ButtonProps, "isLoading"> {
  isLoading: boolean
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      isLoading,
      loadingText,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        isLoading={isLoading}
        {...props}
      >
        {isLoading && loadingText ? loadingText : children}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export default LoadingButton
