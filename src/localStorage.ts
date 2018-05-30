import { ILocaleTranslation } from './'

const STORAGE_KEY = '__translations__'
const TIME_KEY = '__trans_time__'

const now = () => Math.round(new Date().getTime() / 1000)

export const persistTranslationsToLocalStorage = (
  json: ILocaleTranslation,
  url: string,
) => {
  try {
    const serializedData = JSON.stringify(json)
    localStorage.setItem(getStorageKey(url), serializedData)
    localStorage.setItem(getTimeKey(url), `${now()}`)
    return true
  } catch (e) {
    return false
  }
}

export const getTranslationsFromLocalStorage = (
  url: string,
  cacheExpiration?: number,
) => {
  try {
    const persistedTranslations = localStorage.getItem(getStorageKey(url))
    if (persistedTranslations !== null) {
      if (cacheExpiration) {
        try {
          const persistedTime = localStorage.getItem(getTimeKey(url))
          const atm = now()
          if (Number(persistedTime) < atm - cacheExpiration) {
            return undefined
          }
        } catch (error) {
          // If we're unable to detect when data was persisted we return undefined
          return undefined
        }
      }
      return JSON.parse(persistedTranslations) as ILocaleTranslation
    } else {
      return undefined
    }
  } catch (error) {
    return undefined
  }
}

const getStorageKey = (url: string) => `${STORAGE_KEY}${url}`

const getTimeKey = (url: string) => `${TIME_KEY}${url}`
