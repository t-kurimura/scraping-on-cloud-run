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
exports.searchWithCondition = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const zod_1 = require("zod");
const neverthrow_1 = require("neverthrow");
const logger = __importStar(require("../../utils/logger"));
const adapter = __importStar(require("../index"));
const searchWithCondition = async (browser, range, reservationId) => {
    await browser.executeScript("document.getElementById('rsvDateFrom').value = arguments[0]", range.from);
    await browser.executeScript("document.getElementById('rsvDateTo').value = arguments[0]", range.to);
    if (reservationId) {
        await browser.executeScript("document.getElementById('reserveId').value = arguments[0]", reservationId);
    }
    logger.info({
        message: 'set search conditions',
    });
    await browser.findElement(selenium_webdriver_1.By.id('search')).click();
    while (true) {
        const loadings = await browser.findElements(selenium_webdriver_1.By.id('shuhari_loader'));
        if (loadings.length === 0) {
            break;
        }
        logger.info({
            message: 'loading............',
        });
    }
    const resultByElm = selenium_webdriver_1.By.xpath('/html/body/div[3]/div/div[2]/div/p');
    await browser.wait(selenium_webdriver_1.until.elementLocated(resultByElm), 5000);
    const screenshot = await browser.takeScreenshot();
    await adapter.uploadScreenshot(screenshot, 'condition_executed');
    const resultCountText = await browser.findElement(resultByElm).getText();
    if (resultCountText === '該当する予約がありません') {
        logger.info({
            message: '該当する予約がありません',
            range,
            reservationId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const resultCount = await browser
        .findElement(selenium_webdriver_1.By.xpath('/html/body/div[3]/div/div[2]/div/p/b'))
        .getText();
    return (0, neverthrow_1.ok)({
        hitsCount: zod_1.z
            .string()
            .refine((value) => !isNaN(Number(value)), {
            message: 'Not a valid number string',
        })
            .transform((v) => Number(v))
            .parse(resultCount),
    });
};
exports.searchWithCondition = searchWithCondition;
