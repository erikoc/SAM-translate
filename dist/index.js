"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const localStorage_1 = require("./localStorage");
let translations;
let configuration;
const defaultConf = {
    errorCallback: alert.bind(window),
    notify: false,
    useLocalStorage: true,
    cache: true,
    cacheExpirationTime: 60 * 60,
};
/**
 * Inits the configuration parameters and fetches the translations
 * @param conf ITranslateConfig configuration for the library
 */
exports.initTranslations = (conf) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    configuration = Object.assign({}, defaultConf, conf);
    const status = yield exports.fetchTranslations();
    // Default locale to first locale in translations if not set
    if (status && !configuration.locale && translations) {
        configuration.locale = Object.keys(translations)[0];
    }
    return status;
});
/**
 * Fetchest translations either from local storage or from remote.
 * Returns true on success, false on error
 */
exports.fetchTranslations = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (configuration.useLocalStorage) {
        translations = localStorage_1.getTranslationsFromLocalStorage(configuration.cache ? configuration.cacheExpirationTime : undefined);
        if (translations) {
            return true;
        }
    }
    translations = yield getTranslationsFromRemote();
    if (translations) {
        return true;
    }
    else {
        return false;
    }
});
/**
 * Fetches translations from remote url, parses the JSON, and persists it to
 * local storage if setting is enabled
 */
const getTranslationsFromRemote = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    try {
        const response = yield fetch(configuration.translationFileUrl, {
            mode: 'cors',
        });
        const json = yield response.json();
        if (configuration.useLocalStorage) {
            localStorage_1.persistTranslationsToLocalStorage(json);
        }
        return json;
    }
    catch (error) {
        logError(`Unable to fetch translations from url: ${configuration.translationFileUrl}. Error: ${error.message}`);
        return undefined;
    }
});
/**
 * Function for debugging state of translations
 * @param locale Optional locale to only return part of translations
 */
exports.exportTranslations = (locale) => {
    if (!translations) {
        return undefined;
    }
    if (locale && translations.hasOwnProperty(locale)) {
        return translations[locale];
    }
    else {
        return translations;
    }
};
exports.getLocales = () => {
    if (translations) {
        return Object.keys(translations);
    }
    return undefined;
};
/**
 * Translates a given phrase using replacements and a locale
 * @param key phrase to translate
 * @param replacements optional replacements as key/value object
 * @param locale optional locale to use for translations
 */
exports.t = (key, replacements, context, locale) => {
    if (!translations) {
        logError(`No translations were available to client`);
        return replaceParams(key, replacements);
    }
    if (!locale) {
        if (!configuration.locale) {
            logError(`No locale specified when looking up key: ${key}`);
            return replaceParams(key, replacements);
        }
        locale = configuration.locale;
    }
    if (!translations.hasOwnProperty(locale)) {
        logError(`Missing locale: "${locale}" in translations`);
        return replaceParams(key, replacements);
    }
    let processedKey = context ? `${key}<${context}>` : key;
    if (!translations[locale].hasOwnProperty(processedKey)) {
        if (!context) {
            logError(`Missing translation for locale: "${locale}" with key: "${key}"`);
            return replaceParams(key, replacements);
        }
        // If a context was provided, we check if a translation is available for the key without context
        if (!translations[locale].hasOwnProperty(key)) {
            logError(`Missing translation for locale: "${locale}" with key: "${key}" and context: "${context}"`);
            return replaceParams(key, replacements);
        }
        else {
            // We found a translation by not using the context
            logError(`Missing translation for locale: "${locale}" with context: "${context}". However, the translation was found for key: "${key}"`);
            processedKey = key;
        }
    }
    let result = translations[locale][processedKey];
    result = replaceParams(result, replacements);
    return result;
};
const replaceParams = (phrase, replacements) => {
    if (!replacements) {
        return phrase;
    }
    let result = phrase;
    for (const key in replacements) {
        if (replacements.hasOwnProperty(key)) {
            result = result.replace(`%${key}`, `${replacements[key]}`);
        }
    }
    return result;
};
/**
 * Logs an error depending on the different settings
 * If an errorCallback is available it will be called
 * If the configuration has been set to notify and it has an endpoint
 * it will POST the error message to that endpoint
 * @param error error message
 */
const logError = (error) => {
    const { errorCallback, notify, notificationEndpoint, notificationHeaders, } = configuration;
    if (errorCallback) {
        errorCallback(error);
    }
    if (notify && notificationEndpoint) {
        const body = {
            url: window.location,
            time: new Date().toUTCString(),
            configuration,
            error,
        };
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        // Add extra headers if available
        if (notificationHeaders) {
            for (const key in notificationHeaders) {
                if (notificationHeaders.hasOwnProperty(key)) {
                    const value = notificationHeaders[key];
                    headers.append(key, value);
                }
            }
        }
        const params = {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        };
        fetch(notificationEndpoint, params);
    }
};
