"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const STORAGE_KEY = '__translations__';
const TIME_KEY = '__trans_time__';
const now = () => Math.round(new Date().getTime() / 1000);
exports.persistTranslationsToLocalStorage = (json, url) => {
    try {
        const serializedData = JSON.stringify(json);
        localStorage.setItem(getStorageKey(url), serializedData);
        localStorage.setItem(getTimeKey(url), `${now()}`);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.getTranslationsFromLocalStorage = (url, cacheExpiration) => {
    try {
        const persistedTranslations = localStorage.getItem(getStorageKey(url));
        if (persistedTranslations !== null) {
            if (cacheExpiration) {
                try {
                    const persistedTime = localStorage.getItem(getTimeKey(url));
                    const atm = now();
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
const getStorageKey = (url) => `${STORAGE_KEY}${url}`;
const getTimeKey = (url) => `${TIME_KEY}${url}`;
