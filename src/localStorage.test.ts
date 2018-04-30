import { mockTranslations } from '../test/setupJest'
import {
  getTranslationsFromLocalStorage,
  persistTranslationsToLocalStorage,
} from './localStorage'

// Local storage tests
test('Stores translations to local storage', () => {
  expect(persistTranslationsToLocalStorage(mockTranslations)).toBeTruthy
  expect(localStorage.__STORE__['__translations__']).toEqual(
    JSON.stringify(mockTranslations),
  )
  expect(localStorage.__STORE__['__trans_time__']).toBeDefined
})

test('Correctly returns stored values', () => {
  expect(getTranslationsFromLocalStorage()).toEqual(mockTranslations)
})

test('LocalStorage returns undefined if cache has expired', () => {
  expect(getTranslationsFromLocalStorage(-1)).toEqual(undefined)
})
