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
exports.diveReservation = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const neverthrow_1 = require("neverthrow");
const dayjs_1 = __importDefault(require("dayjs"));
require("dayjs/locale/ja");
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const logger = __importStar(require("../../utils/logger"));
const scraiper_1 = require("../../utils/scraiper");
const customParseFormat_1 = __importDefault(require("dayjs/plugin/customParseFormat"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(customParseFormat_1.default);
async function diveReservation(browser, reservationId, range, search) {
    await browser.get('https://salonboard.com/KLP/reserve/reserveList/');
    const searchResult = await search.searchWithCondition(browser, range, reservationId);
    if (searchResult.isErr()) {
        logger.error({
            message: 'search failed',
            error: searchResult.error,
        });
        return (0, neverthrow_1.err)(null);
    }
    const reserveLinks = await browser.findElements(selenium_webdriver_1.By.css('#reserveListArea a[href*=reserveId]'));
    const linkUrl = await reserveLinks[0].getAttribute('href');
    logger.info({
        reserveLink: linkUrl,
    });
    await browser.get(linkUrl);
    await Promise.race([
        browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('extReserveDetail')), 5000),
        browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('netReserveDetail')), 5000),
    ]);
    const rsvDateElement = await browser.findElement(selenium_webdriver_1.By.css('#rsvDate'));
    const rsvDateText = await rsvDateElement.getText();
    const dateStr = rsvDateText.split('（')[0];
    const timePattern = /\d{1,2}:\d{2}/g;
    const times = rsvDateText.match(timePattern) || [];
    const [startTime, endTime] = times.map((t) => dayjs_1.default.utc(`${dateStr}${t}`, 'YYYY年M月D日H:mm').subtract(9, 'hour'));
    const salesExists = (await browser.findElements(selenium_webdriver_1.By.id('salesId'))).length > 0;
    const customerIdElem = await browser.findElement(selenium_webdriver_1.By.id('customerDetailLink'));
    const customerId = await customerIdElem.getAttribute('data-customerid');
    const extractedReservationId = await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="予約番号"]/following-sibling::td');
    if (!extractedReservationId) {
        console.error({
            message: 'could not get reservationId',
        });
        return (0, neverthrow_1.err)(null);
    }
    return (0, neverthrow_1.ok)({
        reservation: {
            id: extractedReservationId,
            status: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="ステータス"]/following-sibling::td'),
            time: {
                start: startTime ? startTime.toDate() : null,
                end: endTime ? endTime.toDate() : null,
            },
            source: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="予約経路"]/following-sibling::td'),
            options: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="割引・サービス・オプション"]/following-sibling::td'),
            staff: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="スタッフ"]/following-sibling::td'),
            facilities: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="設備"]/following-sibling::td'),
            customerNumber: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="お客様番号"]/following-sibling::td'),
            customerId: customerId,
            coupon: {
                name: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="クーポン名"]/following-sibling::td'),
                description: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="クーポン内容"]/following-sibling::td'),
                conditions: {
                    note: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="提示条件"]/following-sibling::td[1]'),
                    expiration: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="有効期限"]/following-sibling::td[1]'),
                    usage: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="利用条件"]/following-sibling::td[1]'),
                },
            },
            favor: {
                gender: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="性別"]/following-sibling::td'),
                request: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="ご要望・ご相談"]/following-sibling::td'),
                first_time: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="このサロンに行くのは初めてですか？"]/following-sibling::td'),
                note: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="ご来店に際しての注意事項"]/following-sibling::td'),
                question: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="サロンからお客様への質問"]/following-sibling::td/div'),
                response: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="お客様のご回答"]/following-sibling::td/div'),
            },
            note: {
                atReservation: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="来店回数"]/following-sibling::td'),
                forNext: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="来店回数"]/following-sibling::td'),
            },
            hbContacts: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="HOT PEPPER Beauty\n予約者連絡先"]/following-sibling::td'),
        },
        customer: {
            id: customerId,
            nameKana: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="氏名 (カナ)"]/following-sibling::td/div[@class="nameKana"]'),
            nameKanji: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="氏名 (漢字)"]/following-sibling::td'),
            phoneNumber: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="電話番号"]/following-sibling::td'),
            repeatCount: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="来店回数"]/following-sibling::td'),
            note: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="お客様メモ"]/following-sibling::td'),
            previousInfo: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="前回の施術情報"]/following-sibling::td'),
        },
        sale: salesExists
            ? {
                id: await (await browser.findElement(selenium_webdriver_1.By.id('salesId'))).getAttribute('value'),
                time: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="会計日時"]/following-sibling::td'),
                pic: await (0, scraiper_1.extractTextByXpathIfExist)(browser, '//th[text()="レジ担当者"]/following-sibling::td'),
                items: await (async () => {
                    const elements = await browser.findElements(selenium_webdriver_1.By.xpath('//tr[@class="reserveSales mod_middle"]'));
                    const processElement = async (item) => {
                        return {
                            category: await (await item.findElement(selenium_webdriver_1.By.xpath('./td[1]'))).getText(),
                            menu: await (await item.findElement(selenium_webdriver_1.By.xpath('./td[2]'))).getText(),
                            staff: await (await item.findElement(selenium_webdriver_1.By.xpath('./td[3]'))).getText(),
                            price: await (await item.findElement(selenium_webdriver_1.By.xpath('./td[4]'))).getText(),
                            units: await (await item.findElement(selenium_webdriver_1.By.xpath('./td[5]'))).getText(),
                            amount: await (await item.findElement(selenium_webdriver_1.By.xpath('./td[6]'))).getText(),
                        };
                    };
                    const results = [];
                    for (const elm of elements) {
                        results.push(await processElement(elm));
                    }
                    return results;
                })(),
            }
            : null,
    });
}
exports.diveReservation = diveReservation;
