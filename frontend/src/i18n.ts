import i18n, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import strings from './strings.json'

// `strings` are translations from english to polish, so to make it easier to work with we derive english

const resources = {
  en: {
    translation: Object.keys(strings).reduce(
      (acc, key) => ({ ...acc, [key]: key }),
      {}
    )
  },
  pl: { translation: strings }
}

let initOptions: InitOptions = {
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false // react already saves from xss
  },
  saveMissing: true
}

if (import.meta.env.DEV) {
  const debugInitOptions: InitOptions = {
    missingKeyHandler: (...args) => {
      console.log(`Missing translation for ${args[3]}`)
      // @ts-ignore
      if (window._missingTranslationAlertShown) return
      // @ts-ignore
      window._missingTranslationAlertShown = true
      alert(`Missing translation for ${args[3]}`)
    },
    parseMissingKeyHandler: () => 'MISSING TRANSLATION'
  }

  initOptions = { ...initOptions, ...debugInitOptions }
}

i18n.use(initReactI18next).use(LanguageDetector).init(initOptions)

export default i18n
