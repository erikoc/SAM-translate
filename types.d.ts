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
