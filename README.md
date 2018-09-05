# SAM-translate

[![Greenkeeper badge](https://badges.greenkeeper.io/OmniCar/SAM-translate.svg)](https://greenkeeper.io/)

Client js library for fetching translations in a given format (see `ILocaleTranslation`), translating strings, and reporting issues when found.

## Installation (for development)

`yarn` or `npm i` (examples below are using `yarn`)

## Installation on clients

`yarn add OmniCar/sam-translate#0.0.1`

Where `#0.0.1` indicates the `Github` release tag.

## Usage

First call the `init` function with the parameters that match your environment (dev/staging/prod etc.) or current needs.

These parameters are available:

* `translationFileUrl` - endpoint from where to fetch the translations
* `errorCallback` - function used for reporting errors. Defaults to `window.alert`
* `notify` - whether the library should report errors to an endpoint (see below)
* `notificationEndpoint` - endpoint for `POST`ing errors
* `cache` - whether the library should use cache expiration (see below)
* `cacheExpirationTime` - cache expiration time for local storage
* `useLocalStorage` - whether the library should save translations to `localStorage`
* `locale` - the locale to use. Defaults to the first one from the received translations

## Tests

To run `jest` tests either run:

`yarn test`

or to run tests in watch mode run:

`yarn test-watch`

### Compile application (`tsc`):

`yarn tsc`