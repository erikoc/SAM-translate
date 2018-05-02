import { ILocaleTranslation } from './';
export declare const persistTranslationsToLocalStorage: (json: ILocaleTranslation) => boolean;
export declare const getTranslationsFromLocalStorage: (cacheExpiration?: number | undefined) => ILocaleTranslation | undefined;
