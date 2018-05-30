import { mockTranslations } from '../test/setupJest'
import {
  getTranslationsFromLocalStorage,
  persistTranslationsToLocalStorage,
} from './localStorage'

// Local storage tests
test('Stores translations to local storage', () => {
  const testUrl = 'https://test.com'
  expect(persistTranslationsToLocalStorage(mockTranslations, testUrl))
    .toBeTruthy
  expect(localStorage.__STORE__['__translations__https://test.com']).toEqual(
    JSON.stringify(mockTranslations),
  )
  expect(localStorage.__STORE__['__trans_time__https://test.com']).toBeDefined
})

test('Correctly returns stored values', () => {
  expect(getTranslationsFromLocalStorage('https://test.com')).toEqual(
    mockTranslations,
  )
})

test('LocalStorage returns undefined if cache has expired', () => {
  expect(getTranslationsFromLocalStorage('https://test.com', -1)).toEqual(
    undefined,
  )
})
