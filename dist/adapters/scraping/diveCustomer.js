"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diveCustomer = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const neverthrow_1 = require("neverthrow");
const logger = __importStar(require("../../utils/logger"));
const scraiper_1 = require("../../utils/scraiper");
async function diveCustomer(browser, customerId, screenshot) {
    const baseUrl = `https://salonboard.com/KLP/customer/customerDetail/?customerId=${customerId}`;
    await browser.get(baseUrl);
    await browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('customerDetail')), 5000);
    await screenshot.takeAndUpload(browser, 'customer');
    const baseInfo = {
        birthday: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="誕生日"]/following-sibling::td'),
        gender: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="性別"]/following-sibling::td'),
    };
    const pageText = await browser
        .findElement(selenium_webdriver_1.By.css('#customerDetail > div.mod_column02.mt15.cf.reserveListPaging > div > div > p.page.mod_font01'))
        .getText();
    logger.info({
        pageText,
    });
    if (!pageText) {
        return (0, neverthrow_1.err)(null);
    }
    const [numerator, totalPage] = pageText
        .split('/')
        .map((str) => parseInt(str.replace('ページ', ''), 10));
    const reservations = [];
    let currentPage = numerator;
    while (currentPage <= totalPage) {
        const tables = await browser.findElements(selenium_webdriver_1.By.xpath('//form//table[last()]'));
        const rows = await tables[tables.length - 1].findElements(selenium_webdriver_1.By.xpath('.//tr'));
        if (rows.length <= 1) {
            break;
        }
        for (const row of rows.slice(1)) {
            const reservationId = (await (await row.findElement(selenium_webdriver_1.By.css('td a.reserveActionLinkTypePost'))).getText())
                .replace('(', '')
                .replace(')', '');
            const reserveDate = (await (await row.findElement(selenium_webdriver_1.By.css('td:first-child'))).getText()).split('\n')[0];
            reservations.push({
                reservationId,
                date: new Date(reserveDate),
            });
        }
        currentPage++;
        await browser.get(`${baseUrl}&pn=${currentPage + 1}`);
        await new Promise((r) => setTimeout(r, 2000));
    }
    logger.info({
        message: `Total past reservations`,
        reservations,
    });
    return (0, neverthrow_1.ok)({
        ...baseInfo,
        pastReservation: reservations,
    });
}
exports.diveCustomer = diveCustomer;
