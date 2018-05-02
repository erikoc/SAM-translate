import { mockResponseOnce } from 'jest-fetch-mock'
import { exportTranslations, initTranslations, t, ITranslateConfig } from '.'
import {
  mockTranslations,
  nonExistingPhrase,
  tokenKey,
  translatableKey,
  translatableValue,
} from '../test/setupJest'

const customErrorCallback = jest.fn(() => {
  console.log('customErrorCallback')
})

// Translation tests

test('Inits the translation configuration', async () => {
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
  expect(customErrorCallback).toHaveBeenCalledTimes(1)
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
