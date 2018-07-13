import { IsoLocale } from '@omnicar/sam-types';
export interface ITranslateConfig {
    translationFileUrl: string;
    translations?: ILocaleTranslation;
    errorCallback?: (error: string) => void;
    notify?: boolean;
    notificationEndpoint?: string;
    notificationHeaders?: {
        [key: string]: string;
    };
    cache?: boolean;
    cacheExpirationTime?: number;
    useLocalStorage?: boolean;
    locale?: IsoLocale;
}
export interface ILocaleTranslation {
    [key: string]: ITranslation;
}
export interface ITranslation {
    [key: string]: string;
}
export interface IReplacement {
    [Key: string]: string | number;
}
/**
 * Inits the configuration parameters and fetches the translations
 * @param conf ITranslateConfig configuration for the library
 */
export declare const initTranslations: (conf: ITranslateConfig) => Promise<boolean>;
/**
 * Fetchest translations either from local storage or from remote.
 * Returns true on success, false on error
 */
export declare const fetchTranslations: () => Promise<boolean>;
/**
 * Function for debugging state of translations
 * @param locale Optional locale to only return part of translations
 */
export declare const exportTranslations: (locale?: string | undefined) => ILocaleTranslation | ITranslation | undefined;
export declare const getLocales: () => string[] | undefined;
export declare const setLocale: (locale: string) => boolean;
export declare const getConfiguration: () => ITranslateConfig;
export declare const getLocale: () => "da-DK" | "sv-SE" | "en-GB" | undefined;
/**
 * Translates a given phrase using replacements and a locale
 * @param key phrase to translate
 * @param replacements optional replacements as key/value object
 * @param locale optional locale to use for translations
 */
export declare const t: (key: string, replacements?: IReplacement | undefined, context?: string | undefined, locale?: string | undefined) => string;
