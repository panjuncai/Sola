import { useMobileMenuApi } from "../../hooks/state/useMobileMenuState"

export const MobileHeaderMenuButton = () => {
  const { setMobileMenuOpen } = useMobileMenuApi()
  const openMobileMenu = () => setMobileMenuOpen(true)

  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center text-muted-foreground"
      onClick={openMobileMenu}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    </button>
  )
}
