"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const STORAGE_KEY = '__translations__';
const CACHE_KEY = '__trans_time__';
const now = () => Math.round(new Date().getTime() / 1000);
exports.persistTranslationsToLocalStorage = (json) => {
    try {
        const serializedData = JSON.stringify(json);
        localStorage.setItem(STORAGE_KEY, serializedData);
        localStorage.setItem(CACHE_KEY, `${now()}`);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.getTranslationsFromLocalStorage = (cacheExpiration) => {
    try {
        const persistedTranslations = localStorage.getItem(STORAGE_KEY);
        if (persistedTranslations !== null) {
            if (cacheExpiration) {
                try {
                    const persistedTime = localStorage.getItem(CACHE_KEY);
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
