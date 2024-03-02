"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStylists = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
async function listStylists(browser, screenshot) {
    await browser.get('https://salonboard.com/KLP/reserve/reserveList/');
    await browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('mod_box_05_reserve')), 5000);
    await screenshot.takeAndUpload(browser, 'stylists');
    const stylistElements = await browser.findElements(selenium_webdriver_1.By.xpath('//select[@id="stylistId"]/option'));
    const stylists = {};
    for (const elm of stylistElements) {
        const stylistId = await elm.getAttribute('value');
        if (!stylistId) {
            continue;
        }
        stylists[stylistId] = {
            name: await elm.getText(),
            id: stylistId,
        };
    }
    return stylists;
}
exports.listStylists = listStylists;
