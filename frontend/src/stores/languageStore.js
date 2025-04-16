import { defineStore } from 'pinia'
import {Constants} from "../../../shared/Constants.js";

const LANGUAGE_COOKIE_KEY = 'preferredLanguage'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: getInitialLanguage(),
    initialLanguage: getInitialLanguage()
  }),

  actions: {
    setLanguage(lang) {
      this.currentLanguage = lang
      document.cookie = `${LANGUAGE_COOKIE_KEY}=${lang}; path=/; max-age=31536000`
      localStorage.setItem(LANGUAGE_COOKIE_KEY, lang)
    },
  },
})

function getInitialLanguage() {
  // Check cookie
  const match = document.cookie.match(/(?:^|; )preferredLanguage=([^;]+)/)
  if (match) return match[1]

  // Check localStorage
  const fromStorage = localStorage.getItem(LANGUAGE_COOKIE_KEY)
  if (fromStorage) return fromStorage

  // Check browser default
  const browserLang = navigator.language?.toLowerCase() || Constants.LANGUAGE.ESTONIAN.value
  if (browserLang.startsWith(Constants.LANGUAGE.ESTONIAN.value)) {
    return Constants.LANGUAGE.ESTONIAN.value
  } else if (browserLang.startsWith(Constants.LANGUAGE.ENGLISH.value)) {
    return Constants.LANGUAGE.ENGLISH.value
  }

  // Default
  return Constants.LANGUAGE.ESTONIAN.value
}