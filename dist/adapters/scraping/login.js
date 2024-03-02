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
exports.login = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const neverthrow_1 = require("neverthrow");
const error_1 = require("selenium-webdriver/lib/error");
const logger = __importStar(require("../../utils/logger"));
const waitForLoginResult = async (browser, timeoutMs) => {
    const captchaPage = browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('captchaForm')), timeoutMs);
    const failurePage = browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('#common_body > div.contents > div > div.div_err_message')), timeoutMs);
    const onRejected = async (e) => {
        if (e instanceof selenium_webdriver_1.error.TimeoutError) {
            return (0, neverthrow_1.err)({ type: 'timeout' });
        }
        if (e instanceof error_1.UnexpectedAlertOpenError) {
            await new Promise((r) => setTimeout(r, 5000));
        }
        logger.warning({
            message: 'failed to wait for a exceptional flow, but the normal login process might have already proceeded.',
            error: e,
        });
        return (0, neverthrow_1.err)({ type: 'unknown' });
    };
    return Promise.race([
        (async () => {
            {
                try {
                    await browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('body > div.contents03 > div > div > div.columnBlock.w636 > p.mod_txt_37.mt20')), timeoutMs);
                }
                catch (e) {
                    return (0, neverthrow_1.err)({ type: 'timeout' });
                }
                try {
                    await browser.wait(selenium_webdriver_1.until.alertIsPresent(), 3000);
                }
                catch (e) {
                    return (0, neverthrow_1.ok)({ alertMessage: null });
                }
                const alert = await browser.switchTo().alert();
                const alertMessage = await alert.getText();
                return (0, neverthrow_1.ok)({ alertMessage });
            }
        })(),
        captchaPage.then(() => (0, neverthrow_1.err)({ type: 'recapture' }), onRejected),
        failurePage.then(() => (0, neverthrow_1.err)({ type: 'failure' }), onRejected),
    ]);
};
const login = async (browser, cred, cookie, screenshot, forceLogin) => {
    if (!forceLogin) {
        await browser.get('https://salonboard.com/KLP/top/');
        await cookie.load(browser, cred.id);
        await browser.get('https://salonboard.com/KLP/top/');
        const resultWithExistingSession = await waitForLoginResult(browser, 5000);
        if (resultWithExistingSession.isOk()) {
            return (0, neverthrow_1.ok)(resultWithExistingSession.value);
        }
    }
    await browser.get('https://salonboard.com/login/');
    await browser.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id('idPasswordInputForm')), 3000);
    const userIdInput = await browser.findElement(selenium_webdriver_1.By.name('userId'));
    await userIdInput.sendKeys(cred.id);
    const passwordInput = await browser.findElement(selenium_webdriver_1.By.name('password'));
    await passwordInput.sendKeys(cred.password);
    await screenshot.takeAndUpload(browser, 'input_login_keys');
    await passwordInput.sendKeys(selenium_webdriver_1.Key.RETURN);
    const result = await waitForLoginResult(browser, 5000);
    logger.info({
        message: 'login result',
        result,
        title: browser.getTitle(),
    });
    await cookie.save(browser, cred.id, result);
    await screenshot.takeAndUpload(browser, 'after_login');
    return result;
};
exports.login = login;
