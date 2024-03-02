"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextByXpathIfExist = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const extractTextByXpathIfExist = async (browser, elementLocator) => {
    const elements = await browser.findElements(selenium_webdriver_1.By.xpath(elementLocator));
    if (elements.length === 0) {
        return null;
    }
    return await elements[0].getText();
};
exports.extractTextByXpathIfExist = extractTextByXpathIfExist;
