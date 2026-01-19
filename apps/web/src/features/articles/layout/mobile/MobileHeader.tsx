import { MobileHeaderMenuButton } from "./MobileHeaderMenuButton"
import { MobileHeaderTitle } from "./MobileHeaderTitle"
import { MobileHeaderSettingsButton } from "./MobileHeaderSettingsButton"
import { MobileHeaderSettingsPanel } from "./settings/MobileHeaderSettingsPanel"

export const MobileHeader = () => {
  return (
    <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
      <MobileHeaderMenuButton />
      <MobileHeaderTitle />
      <div className="relative">
        <MobileHeaderSettingsButton />
        <MobileHeaderSettingsPanel />
      </div>
    </div>
  )
}
