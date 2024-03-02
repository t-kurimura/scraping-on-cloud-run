"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCoupons = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const safeAccessorToValueAttr = async (baseElm, cssPath) => {
    try {
        return await baseElm.findElement(selenium_webdriver_1.By.css(cssPath));
    }
    catch (e) {
        if (e instanceof selenium_webdriver_1.error.NoSuchElementError) {
            return null;
        }
        throw e;
    }
};
async function listCoupons(browser, screenshot) {
    await browser.get('https://salonboard.com/CNK/draft/couponList/');
    await screenshot.takeAndUpload(browser, 'couponList');
    await browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('table.table_list_store.mt10')), 5000);
    const couponRows = await browser.findElements(selenium_webdriver_1.By.css('table.table_list_store.mt10 tbody tr'));
    const coupons = {};
    for (const row of couponRows) {
        const couponIdInput = await safeAccessorToValueAttr(row, 'input[name*=".couponId"]');
        if (couponIdInput) {
            const couponId = await couponIdInput.getAttribute('value');
            const seq = await safeAccessorToValueAttr(row, 'input[name*=".seq"]');
            const order = seq !== null ? await seq.getAttribute('value') : null;
            const present = await safeAccessorToValueAttr(row, 'input[name*=".presentFlg"]');
            const presentFlg = present !== null ? await present.getAttribute('value') : null;
            const imageUrl = await (await row.findElement(selenium_webdriver_1.By.css('img[name="couponPhoto"]'))).getAttribute('src');
            const type = await (await row.findElement(selenium_webdriver_1.By.xpath('./td[3]'))).getText();
            const name = await (await row.findElement(selenium_webdriver_1.By.xpath('./td[4]'))).getText();
            const expirationDate = await (await row.findElement(selenium_webdriver_1.By.xpath('./td[5]'))).getText();
            const status = await (await row.findElement(selenium_webdriver_1.By.xpath('./td[6]'))).getText();
            coupons[couponId] = {
                order,
                presentFlg,
                imageUrl,
                type,
                name,
                expirationDate,
                status,
                couponId,
            };
        }
    }
    return coupons;
}
exports.listCoupons = listCoupons;
