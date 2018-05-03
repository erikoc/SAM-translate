import {
  getTranslationsFromLocalStorage,
  persistTranslationsToLocalStorage,
} from './localStorage'

export interface ITranslateConfig {
  translationFileUrl: string
  errorCallback?: (error: string) => void
  notify?: boolean
  notificationEndpoint?: string
  notificationHeaders?: { [key: string]: string }
  cache?: boolean
  cacheExpirationTime?: number
  useLocalStorage?: boolean
  locale?: string
}

export interface ILocaleTranslation {
  [key: string]: ITranslation
}

export interface ITranslation {
  [key: string]: string
}

export interface IReplacement {
  [Key: string]: string | number
}

let translations: ILocaleTranslation | undefined
let configuration: ITranslateConfig

const defaultConf = {
  errorCallback: alert.bind(window),
  notify: false,
  useLocalStorage: true,
  cache: true,
  cacheExpirationTime: 60 * 60, // 1 hour
}

/**
 * Inits the configuration parameters and fetches the translations
 * @param conf ITranslateConfig configuration for the library
 */
export const initTranslations = async (
  conf: ITranslateConfig,
): Promise<boolean> => {
  configuration = {
    ...defaultConf,
    ...conf,
  }
  const status = await fetchTranslations()
  // Default locale to first locale in translations if not set
  if (status && !configuration.locale && translations) {
    configuration.locale = Object.keys(translations)[0]
  }
  return status
}

/**
 * Fetchest translations either from local storage or from remote.
 * Returns true on success, false on error
 */
export const fetchTranslations = async (): Promise<boolean> => {
  if (configuration.useLocalStorage) {
    translations = getTranslationsFromLocalStorage(
      configuration.cache ? configuration.cacheExpirationTime : undefined,
    )
    if (translations) {
      return true
    }
  }
  translations = await getTranslationsFromRemote()
  if (translations) {
    return true
  } else {
    return false
  }
}

/**
 * Fetches translations from remote url, parses the JSON, and persists it to
 * local storage if setting is enabled
 */
const getTranslationsFromRemote = async (): Promise<
  ILocaleTranslation | undefined
> => {
  try {
    const response = await fetch(configuration.translationFileUrl, {
      mode: 'cors',
    })
    const json: ILocaleTranslation = await response.json()
    if (configuration.useLocalStorage) {
      persistTranslationsToLocalStorage(json)
    }
    return json
  } catch (error) {
    logError(
      `Unable to fetch translations from url: ${
        configuration.translationFileUrl
      }. Error: ${error.message}`,
    )
    return undefined
  }
}

/**
 * Function for debugging state of translations
 * @param locale Optional locale to only return part of translations
 */
export const exportTranslations = (
  locale?: string,
): ILocaleTranslation | ITranslation | undefined => {
  if (!translations) {
    return undefined
  }
  if (locale && translations.hasOwnProperty(locale)) {
    return translations[locale]
  } else {
    return translations
  }
}

export const getLocales = () => {
  if (translations) {
    return Object.keys(translations)
  }
  return undefined
}

/**
 * Translates a given phrase using replacements and a locale
 * @param key phrase to translate
 * @param replacements optional replacements as key/value object
 * @param locale optional locale to use for translations
 */
export const t = (
  key: string,
  replacements?: IReplacement,
  context?: string,
  locale?: string,
) => {
  if (!translations) {
    logError(`No translations were available to client`)
    return replaceParams(key, replacements)
  }
  if (!locale) {
    if (!configuration.locale) {
      logError(`No locale specified when looking up key: ${key}`)
      return replaceParams(key, replacements)
    }
    locale = configuration.locale
  }
  if (!translations.hasOwnProperty(locale)) {
    logError(`Missing locale: "${locale}" in translations`)
    return replaceParams(key, replacements)
  }
  let processedKey = context ? `${key}<${context}>` : key
  if (!translations[locale].hasOwnProperty(processedKey)) {
    if (!context) {
      logError(`Missing translation for locale: "${locale}" with key: "${key}"`)
      return replaceParams(key, replacements)
    }
    // If a context was provided, we check if a translation is available for the key without context
    if (!translations[locale].hasOwnProperty(key)) {
      logError(
        `Missing translation for locale: "${locale}" with key: "${key}" and context: "${context}"`,
      )
      return replaceParams(key, replacements)
    } else {
      // We found a translation by not using the context
      logError(
        `Missing translation for locale: "${locale}" with context: "${context}". However, the translation was found for key: "${key}"`,
      )
      processedKey = key
    }
  }
  let result = translations[locale][processedKey]
  result = replaceParams(result, replacements)
  return result
}

const replaceParams = (phrase: string, replacements?: IReplacement) {
  if (!replacements) {
    return phrase
  }
  let result = phrase
  for (const key in replacements) {
    if (replacements.hasOwnProperty(key)) {
      result = result.replace(`%${key}`, `${replacements[key]}`)
    }
  }
  return result
}

/**
 * Logs an error depending on the different settings
 * If an errorCallback is available it will be called
 * If the configuration has been set to notify and it has an endpoint
 * it will POST the error message to that endpoint
 * @param error error message
 */
const logError = (error: string) => {
  const {
    errorCallback,
    notify,
    notificationEndpoint,
    notificationHeaders,
  } = configuration
  if (errorCallback) {
    errorCallback(error)
  }
  if (notify && notificationEndpoint) {
    const body = {
      url: window.location,
      time: new Date().toUTCString(),
      configuration,
      error,
    }
    const headers = new Headers()
    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')
    // Add extra headers if available
    if (notificationHeaders) {
      for (const key in notificationHeaders) {
        if (notificationHeaders.hasOwnProperty(key)) {
          const value = notificationHeaders[key]
          headers.append(key, value)
        }
      }
    }
    const params: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
    fetch(notificationEndpoint, params)
  }
}
