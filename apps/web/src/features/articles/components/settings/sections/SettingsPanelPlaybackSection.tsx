import { Button } from "@sola/ui"

import { useSidebarPanelView } from "../../../hooks/view/useSidebarPanelView"
import { SettingsPanelRow } from "../SettingsPanelRow"
import { SettingsPanelNumberRow } from "../SettingsPanelNumberRow"

export const SettingsPanelPlaybackSection = () => {
  const {
    t,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    onPlaybackNativeRepeatChange,
    onPlaybackTargetRepeatChange,
    onPlaybackPauseSecondsChange,
    onOpenShadowing,
  } = useSidebarPanelView()

  return (
    <>
      <SettingsPanelRow label={t("settings.shadowingConfig")}>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={onOpenShadowing}
        >
          {t("settings.shadowing")}
        </Button>
      </SettingsPanelRow>

      <SettingsPanelNumberRow
        label={t("settings.playbackNativeRepeat")}
        value={playbackNativeRepeat}
        onChange={onPlaybackNativeRepeatChange}
      />

      <SettingsPanelNumberRow
        label={t("settings.playbackTargetRepeat")}
        value={playbackTargetRepeat}
        onChange={onPlaybackTargetRepeatChange}
      />

      <SettingsPanelNumberRow
        label={t("settings.playbackPauseSeconds")}
        value={playbackPauseSeconds}
        step={1}
        onChange={onPlaybackPauseSecondsChange}
      />
    </>
  )
}
