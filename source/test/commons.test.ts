/// <reference path="../globals.d.ts" />
import {describe, expect, test} from '@jest/globals';
import webdriver, { By, until } from 'selenium-webdriver'
import { v4 as uuidv4 } from 'uuid';

import { createNote, countNotes } from './notes.operations'
import { createNotepad, countNotepads } from './notepads.operations'
import { createPage, countPages, clickPage } from './pages.operations'

const search = async (
  driver: webdriver.ThenableWebDriver,
  content: string,
) => {
  const searchInput = await driver.wait(until.elementLocated(By.id('id:searchbar-input:aPNkesepop')))
  await driver.wait(until.elementIsVisible(searchInput))
  await driver.wait(until.elementIsEnabled(searchInput))
  await searchInput.sendKeys(content)
  const sendSearchButton = await driver.wait(until.elementLocated(By.id('id:searchbar-send-button:OGUB40c5DM')))
  await driver.wait(until.elementIsVisible(sendSearchButton))
  await driver.wait(until.elementIsEnabled(sendSearchButton))
  await sendSearchButton.click()
  until.elementIsEnabled
}

const clearSearch = async (
  driver: webdriver.ThenableWebDriver,
) => {
  const clearSearchButton = await driver.wait(until.elementLocated(By.id('id:searchbar-clear-button:KlsiLQF3zr')))
  await driver.wait(until.elementIsVisible(clearSearchButton))
  await driver.wait(until.elementIsEnabled(clearSearchButton))
  await clearSearchButton.click()
}

describe('General operations', () => {
  test('Search should filter items by its keywords #6LGdgVNDb0', async () => {
    const driver = global.webdriver
    const notepads = Array(5).fill(undefined).map(() => `text:${uuidv4()}`)
    const pages = Array(5).fill(undefined).map(() => `text:${uuidv4()}`)
    const notes = Array(5).fill(undefined).map(() => `text:${uuidv4()}`)
    for(let i = 0; i < notes.length; i++) {
      await createNotepad(driver, notepads[i])
      await createPage(driver, notepads[i], pages[i])
      await clickPage(driver, pages[i])
      await createNote(driver, notes[i])
      await clickPage(driver, pages[i])
    }
    await search(driver, 'text')
 
    await driver.wait(until.elementLocated(By.xpath(
        `//*[contains(text(),'${notes[notes.length - 1]}')]`     
    )), WAIT_UNTIL_TIMEOUT)
    expect(await countNotepads(driver)).toEqual(5)
    expect(await countPages(driver)).toEqual(5)
    expect(await countNotes(driver)).toEqual(5)
    await clearSearch(driver)
    await search(driver, notes[0])
    await driver.wait(async () => {
      return (await driver.findElements(By.xpath(
        `//*[contains(text(),'${notes[notes.length - 1]}')]`     
      ))).length === 0
    }, WAIT_UNTIL_TIMEOUT)
    expect(await countNotepads(driver)).toEqual(1)
    expect(await countPages(driver)).toEqual(1)
    expect(await countNotes(driver)).toEqual(1)
  })
})