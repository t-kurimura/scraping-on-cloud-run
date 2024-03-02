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
const storage_1 = require("../../Infrastructure/storage");
var UnexpectedAlertOpenError = selenium_webdriver_1.error.UnexpectedAlertOpenError;
const logger = __importStar(require("../../Infrastructure/logger"));
const login = async (browser) => {
    await browser.get("https://salonboard.com/login/");
    await new Promise((r) => setTimeout(r, 3000));
    await (0, storage_1.uploadScreenshot)(await browser.takeScreenshot(), 'open_login_screen');
    const userNameInput = await browser.findElement(selenium_webdriver_1.By.name("userId"));
    await userNameInput.sendKeys("CD54656");
    const passwordInput = await browser.findElement(selenium_webdriver_1.By.name("password"));
    await passwordInput.sendKeys("8iDVd%7#6KC2xZP");
    await (0, storage_1.uploadScreenshot)(await browser.takeScreenshot(), 'input_login_keys');
    try {
        await passwordInput.sendKeys(selenium_webdriver_1.Key.RETURN);
        await new Promise((r) => setTimeout(r, 5000));
    }
    catch (err) {
        if (err instanceof UnexpectedAlertOpenError) {
            logger.error({ message: "UnexpectedAlertOpenError" }, err);
            const alert = await browser.switchTo().alert();
            await alert.accept();
        }
        {
            throw err;
        }
    }
    await (0, storage_1.uploadScreenshot)(await browser.takeScreenshot(), 'after_login');
    return browser;
};
exports.login = login;
