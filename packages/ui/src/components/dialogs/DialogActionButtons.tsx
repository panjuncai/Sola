import * as React from "react"

import { Button, type ButtonProps } from "../ui/button"

type ActionButtonProps = {
  label: React.ReactNode
  onClick?: ButtonProps["onClick"]
  disabled?: ButtonProps["disabled"]
  className?: string
  variant?: ButtonProps["variant"]
}

export const DialogCancelButton = ({
  label,
  onClick,
  disabled,
  className,
  variant,
}: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant ?? "outline"}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export const DialogCloseButton = ({
  label,
  onClick,
  disabled,
  className,
  variant,
}: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export const DialogSaveButton = ({
  label,
  onClick,
  disabled,
  className,
  variant,
}: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export const DialogDeleteButton = ({
  label,
  onClick,
  disabled,
  className,
  variant,
}: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant ?? "destructive"}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export const DialogAddButton = ({
  label,
  onClick,
  disabled,
  className,
  variant,
}: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant ?? "outline"}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export const DialogConfirmButton = ({
  label,
  onClick,
  disabled,
  className,
  variant,
}: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
