"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chromeDriver = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = __importDefault(require("selenium-webdriver/chrome"));
const chromeDriver = () => {
    const options = new chrome_1.default.Options();
    options.headless();
    options.addArguments('window-size=1400x1200');
    options.addArguments('--no-sandbox');
    options.addArguments('--enable-file-cookies');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.excludeSwitches('--enable-logging');
    options.addArguments('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');
    return new selenium_webdriver_1.Builder()
        .forBrowser('chrome')
        .setLoggingPrefs((() => {
        const logger = new selenium_webdriver_1.logging.Preferences();
        logger.setLevel(selenium_webdriver_1.logging.Type.DRIVER, selenium_webdriver_1.logging.Level.ALL);
        logger.setLevel(selenium_webdriver_1.logging.Type.BROWSER, selenium_webdriver_1.logging.Level.ALL);
        return logger;
    })())
        .setChromeOptions(options)
        .build();
};
exports.chromeDriver = chromeDriver;
