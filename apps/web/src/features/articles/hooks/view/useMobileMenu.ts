import { useCallback } from "react"
import { useMobileMenuActions, useMobileMenuState } from "../../atoms/mobileMenu"

export const useMobileMenu = () => {
  const { mobileMenuOpen } = useMobileMenuState()
  const { setMobileMenuOpen } = useMobileMenuActions()

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true)
  }, [setMobileMenuOpen])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [setMobileMenuOpen])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [setMobileMenuOpen])

  return {
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  }
}
