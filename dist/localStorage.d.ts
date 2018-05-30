import { ILocaleTranslation } from './';
export declare const persistTranslationsToLocalStorage: (json: ILocaleTranslation, url: string) => boolean;
export declare const getTranslationsFromLocalStorage: (url: string, cacheExpiration?: number | undefined) => ILocaleTranslation | undefined;
