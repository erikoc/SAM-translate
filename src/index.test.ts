import { mockResponseOnce } from 'jest-fetch-mock'
import {
  exportTranslations,
  initTranslations,
  t,
  ITranslateConfig,
  getLocales,
  setLocale,
  getLocale,
} from '.'
import {
  mockTranslations,
  nonExistingPhrase,
  tokenKey,
  translatableKey,
  translatableValue,
  context,
  contextValue,
  noContextKey,
  noContextValue,
  nonExistingTokenPhrase,
  locale,
} from '../test/setupJest'

const customErrorCallback = jest.fn(e => {
  console.log(`error: ${e}`)
})

let errorCalls = 0

// Translation tests

test('Inits the translation configuration directly', async () => {
  const configuration: ITranslateConfig = {
    translationFileUrl: 'mock',
    errorCallback: customErrorCallback,
    translations: mockTranslations,
  }
  await initTranslations(configuration)
  expect(exportTranslations()).toEqual(mockTranslations)
})

test('Inits the translation configuration from mock url', async () => {
  mockResponseOnce(JSON.stringify(mockTranslations))
  const configuration: ITranslateConfig = {
    translationFileUrl: 'mock',
    errorCallback: customErrorCallback,
  }
  await initTranslations(configuration)
  expect(exportTranslations()).toEqual(mockTranslations)
})

test('Verify that a valid translation is translated', () => {
  expect(t(translatableKey)).toEqual(translatableValue)
})

test('An invalid translation should return original phrase', () => {
  expect(t(nonExistingPhrase)).toEqual(nonExistingPhrase)
  errorCalls++
  expect(customErrorCallback).toHaveBeenCalledTimes(errorCalls)
})

test('Correctly replaces words in a phrase', () => {
  const replacements = {
    num1: 4,
    num2: '3',
  }
  expect(t(tokenKey, replacements)).toEqual(
    'Du har 4 ulæste beskeder og 3 notifikationer',
  )
})

test('Prefers translation including context', () => {
  expect(t(noContextKey, undefined, context)).toEqual(contextValue)
  expect(t(noContextKey)).toEqual(noContextValue)
})

test('Fails gracefully if context is missing but key without context is available', () => {
  expect(t(noContextKey, undefined, 'non existing context')).toEqual(
    noContextValue,
  )
  errorCalls++
  expect(customErrorCallback).toHaveBeenCalledTimes(errorCalls)
})

test('An invalid translation should return original phrase also when adding a context', () => {
  expect(t(nonExistingPhrase, undefined, 'non existing context')).toEqual(
    nonExistingPhrase,
  )
  errorCalls++
  expect(customErrorCallback).toHaveBeenCalledTimes(errorCalls)
})

test('Correctly replaces words in a non existing phrase', () => {
  const replacements = {
    num1: 4,
    num2: '3',
  }
  expect(t(nonExistingTokenPhrase, replacements)).toEqual(
    `You have ${replacements.num1} new contracts with ${
      replacements.num2
    } missing options`,
  )
})

test('Returns the correct list of locales', () => {
  expect(getLocales()).toEqual([locale])
})

test('Changes the locale correctly', () => {
  expect(setLocale('da-DK')).toBe(true)
  expect(getLocale()).toEqual('da-DK')
})

test('Fails to set the locale to an unkown locale', () => {
  expect(setLocale('nk-NO')).toBe(false)
  expect(getLocale()).not.toEqual('nk-NO')
})
