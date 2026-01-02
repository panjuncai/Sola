import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enUS from "./locales/en-US.json"
import frFR from "./locales/fr-FR.json"
import zhCN from "./locales/zh-CN.json"

const fallbackLanguage = "zh-CN"
const storedLanguage =
  typeof window !== "undefined" ? localStorage.getItem("sola_ui_lang") : null

i18n.use(initReactI18next).init({
  resources: {
    "zh-CN": { translation: zhCN },
    "en-US": { translation: enUS },
    "fr-FR": { translation: frFR },
  },
  lng: storedLanguage ?? fallbackLanguage,
  fallbackLng: fallbackLanguage,
  supportedLngs: ["zh-CN", "en-US", "fr-FR"],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
