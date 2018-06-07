"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var localStorage_1 = require("./localStorage");
var translations;
var configuration;
var defaultConf = {
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
exports.initTranslations = function (conf) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var status;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                configuration = tslib_1.__assign({}, defaultConf, conf);
                return [4 /*yield*/, exports.fetchTranslations()
                    // Default locale to first locale in translations if not set
                ];
            case 1:
                status = _a.sent();
                // Default locale to first locale in translations if not set
                if (status && !configuration.locale && translations) {
                    configuration.locale = Object.keys(translations)[0];
                }
                return [2 /*return*/, status];
        }
    });
}); };
/**
 * Fetchest translations either from local storage or from remote.
 * Returns true on success, false on error
 */
exports.fetchTranslations = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var useLocalStorage, translationFileUrl, cache, cacheExpirationTime;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                useLocalStorage = configuration.useLocalStorage, translationFileUrl = configuration.translationFileUrl, cache = configuration.cache, cacheExpirationTime = configuration.cacheExpirationTime;
                if (useLocalStorage) {
                    translations = localStorage_1.getTranslationsFromLocalStorage(translationFileUrl, cache ? cacheExpirationTime : undefined);
                    if (translations) {
                        return [2 /*return*/, true];
                    }
                }
                return [4 /*yield*/, getTranslationsFromRemote()];
            case 1:
                translations = _a.sent();
                if (translations) {
                    return [2 /*return*/, true];
                }
                else {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Fetches translations from remote url, parses the JSON, and persists it to
 * local storage if setting is enabled
 */
var getTranslationsFromRemote = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var translationFileUrl, useLocalStorage, response, json, error_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                translationFileUrl = configuration.translationFileUrl, useLocalStorage = configuration.useLocalStorage;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch(translationFileUrl, {
                        mode: 'cors',
                    })];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                json = _a.sent();
                if (useLocalStorage) {
                    localStorage_1.persistTranslationsToLocalStorage(json, translationFileUrl);
                }
                return [2 /*return*/, json];
            case 4:
                error_1 = _a.sent();
                logError("Unable to fetch translations from url: " + translationFileUrl + ". Error: " + error_1.message);
                return [2 /*return*/, undefined];
            case 5: return [2 /*return*/];
        }
    });
}); };
/**
 * Function for debugging state of translations
 * @param locale Optional locale to only return part of translations
 */
exports.exportTranslations = function (locale) {
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
exports.getLocales = function () {
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
exports.t = function (key, replacements, context, locale) {
    if (!translations) {
        logError("No translations were available to client");
        return replaceParams(key, replacements);
    }
    if (!locale) {
        if (!configuration.locale) {
            logError("No locale specified when looking up key: " + key);
            return replaceParams(key, replacements);
        }
        locale = configuration.locale;
    }
    if (!translations.hasOwnProperty(locale)) {
        logError("Missing locale: \"" + locale + "\" in translations");
        return replaceParams(key, replacements);
    }
    var processedKey = context ? key + "<" + context + ">" : key;
    if (!translations[locale].hasOwnProperty(processedKey)) {
        if (!context) {
            logError("Missing translation for locale: \"" + locale + "\" with key: \"" + key + "\"");
            return replaceParams(key, replacements);
        }
        // If a context was provided, we check if a translation is available for the key without context
        if (!translations[locale].hasOwnProperty(key)) {
            logError("Missing translation for locale: \"" + locale + "\" with key: \"" + key + "\" and context: \"" + context + "\"");
            return replaceParams(key, replacements);
        }
        else {
            // We found a translation by not using the context
            logError("Missing translation for locale: \"" + locale + "\" with context: \"" + context + "\". However, the translation was found for key: \"" + key + "\"");
            processedKey = key;
        }
    }
    var result = translations[locale][processedKey];
    result = replaceParams(result, replacements);
    return result;
};
var replaceParams = function (phrase, replacements) {
    if (!replacements) {
        return phrase;
    }
    var result = phrase;
    for (var key in replacements) {
        if (replacements.hasOwnProperty(key)) {
            result = result.replace("%" + key, "" + replacements[key]);
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
var logError = function (error) {
    if (!configuration) {
        return;
    }
    var errorCallback = configuration.errorCallback, notify = configuration.notify, notificationEndpoint = configuration.notificationEndpoint, notificationHeaders = configuration.notificationHeaders;
    if (errorCallback) {
        errorCallback(error);
    }
    if (notify && notificationEndpoint) {
        var body = {
            url: window.location,
            time: new Date().toUTCString(),
            configuration: configuration,
            error: error,
        };
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        // Add extra headers if available
        if (notificationHeaders) {
            for (var key in notificationHeaders) {
                if (notificationHeaders.hasOwnProperty(key)) {
                    var value = notificationHeaders[key];
                    headers.append(key, value);
                }
            }
        }
        var params = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        };
        fetch(notificationEndpoint, params);
    }
};
