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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReservations = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const dayjs_1 = __importDefault(require("dayjs"));
const logger = __importStar(require("../../utils/logger"));
async function listReservations(browser, range, screenshot, search) {
    await browser.get('https://salonboard.com/KLP/reserve/reserveList/');
    const searchResult = await search.searchWithCondition(browser, range);
    if (searchResult.isErr()) {
        logger.error({
            message: 'search failed',
            error: searchResult.error,
        });
        return {};
    }
    await screenshot.takeAndUpload(browser, 'before_page');
    const pageText = await browser
        .findElement(selenium_webdriver_1.By.css('#sortList > div.mod_column02.mt15.cf > div.columnBlock02 > div > p.page.mod_font01'))
        .getText();
    logger.info({
        pageText,
    });
    if (!pageText) {
        return {};
    }
    const [numerator, totalPage] = pageText
        .split('/')
        .map((str) => parseInt(str.replace('ページ', ''), 10));
    let currentPage = numerator;
    const results = {};
    while (currentPage <= totalPage) {
        logger.info({
            page: `${currentPage}/${totalPage}`,
        });
        const table = await browser.findElement(selenium_webdriver_1.By.id('resultList'));
        const rows = await table.findElements(selenium_webdriver_1.By.xpath('.//tr'));
        for (const row of rows) {
            const cols = await row.findElements(selenium_webdriver_1.By.xpath('.//td'));
            if (cols.length === 0) {
                continue;
            }
            const reserveNum = (await (await cols[2].findElement(selenium_webdriver_1.By.xpath('.//a'))).getText()).replace(/[^a-zA-Z0-9]/g, '');
            const customerName = await (await cols[2].findElement(selenium_webdriver_1.By.xpath('.//p[1]'))).getText();
            const status = await cols[1].getText();
            const staff = await cols[3].getText();
            const visitTimeStr = await (await cols[0].findElement(selenium_webdriver_1.By.xpath('.//a'))).getText();
            const visitTime = (0, dayjs_1.default)(`${(0, dayjs_1.default)().year()}/${visitTimeStr}`).subtract(9, 'hour');
            logger.info({
                reserveNum,
                status,
                visitTime,
                staff,
            });
            results[reserveNum] = {
                status: status,
                staff: staff,
                time: {
                    start: visitTime.toDate(),
                },
                name: customerName,
            };
        }
        currentPage += 1;
        await browser.get(`https://salonboard.com/KLP/reserve/reserveList/changePage?pn=${currentPage + 1}`);
        await new Promise((res) => setTimeout(res, 3000));
        logger.info({
            total: rows.length,
        });
    }
    return results;
}
exports.listReservations = listReservations;
