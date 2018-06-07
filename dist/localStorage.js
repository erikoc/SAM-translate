"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var STORAGE_KEY = '__translations__';
var TIME_KEY = '__trans_time__';
var now = function () { return Math.round(new Date().getTime() / 1000); };
exports.persistTranslationsToLocalStorage = function (json, url) {
    try {
        var serializedData = JSON.stringify(json);
        localStorage.setItem(getStorageKey(url), serializedData);
        localStorage.setItem(getTimeKey(url), "" + now());
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.getTranslationsFromLocalStorage = function (url, cacheExpiration) {
    try {
        var persistedTranslations = localStorage.getItem(getStorageKey(url));
        if (persistedTranslations !== null) {
            if (cacheExpiration) {
                try {
                    var persistedTime = localStorage.getItem(getTimeKey(url));
                    var atm = now();
                    if (Number(persistedTime) < atm - cacheExpiration) {
                        return undefined;
                    }
                }
                catch (error) {
                    // If we're unable to detect when data was persisted we return undefined
                    return undefined;
                }
            }
            return JSON.parse(persistedTranslations);
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        return undefined;
    }
};
var getStorageKey = function (url) { return "" + STORAGE_KEY + url; };
var getTimeKey = function (url) { return "" + TIME_KEY + url; };
