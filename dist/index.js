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
const express_1 = __importDefault(require("express"));
const browser_1 = require("./Infrastructure/browser");
const logger = __importStar(require("./Infrastructure/logger"));
const loginFlow_1 = require("./controller/scraping/loginFlow");
const dayjs_1 = __importDefault(require("dayjs"));
const storage = __importStar(require("./Infrastructure/storage/cookies"));
const app = (0, express_1.default)();
app.get('/salon_board/reservation_list', async (req, res) => {
    const startAt = (0, dayjs_1.default)().format('{YYYY} MM-DDTHH:mm:ss SSS [Z] A');
    logger.info({
        message: 'requested',
        startAt: startAt,
    });
    const loadCookies = async (driver) => {
        const cookies = await storage.retrieveLoginCookies();
        if (cookies.isOk()) {
            const manager = await driver.manage();
            for (const cookie of cookies.value) {
                await manager.addCookie(cookie);
            }
        }
    };
    const saveCookies = async (driver, r) => {
        if (r.isOk()) {
            const cookies = await driver.manage().getCookies();
            await storage.saveLoginCookies(cookies);
        }
    };
    const browser = (0, browser_1.chromeDriver)();
    const result = await (0, loginFlow_1.loginFlow)(browser, {
        id: 'CD54656',
        password: '8iDVd%7#6KC2xZP',
    }, {
        load: loadCookies,
        save: saveCookies,
    });
    logger.info({
        message: 'login flow completed',
        result,
    });
    await browser.quit();
    res.json({
        message: 'Scraping for completed',
        startAt,
    });
});
app.get('/salon_board/reservation', async (req, res) => {
    logger.info({
        message: 'requested',
    });
    const browser = (0, browser_1.chromeDriver)();
    await browser.get('https://www.t-c.co.jp/');
    await browser.quit();
    res.json({ message: 'Scraping for site2 completed' });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
