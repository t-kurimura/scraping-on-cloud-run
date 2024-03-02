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
const neverthrow_1 = require("neverthrow");
const adapter = __importStar(require("../../adapters"));
const adapters_1 = require("../../adapters");
const retrieveAndApplyCookies = async (browser, salonBoardId) => {
    const cookies = await adapter.retrieveLoginCookies(salonBoardId);
    if (cookies.isOk()) {
        const manager = await browser.manage();
        for (const cookie of cookies.value) {
            await manager.addCookie(cookie);
        }
    }
};
const extractAndSaveCookiesIfLoginSucceeded = async (browser, salonBoardId, r) => {
    if (r.isOk()) {
        const cookies = await browser.manage().getCookies();
        await adapter.saveLoginCookies(salonBoardId, cookies);
    }
};
const takeScreenshotOnBrowserAndUploadGCS = async (browser, fileName) => {
    const screenshot = await browser.takeScreenshot();
    await adapter.uploadScreenshot(screenshot, fileName);
};
const login = async (browser, salonId, forceLogin = false) => {
    const salonBoards = await adapter.getSalonBoards(salonId);
    if (salonBoards.isErr()) {
        await (0, adapters_1.updateScrapingStatus)(salonId, {
            scraping: {
                status: 'red',
                yellowDetectedTime: null,
                redDetectedTime: new Date(),
            },
        });
        return (0, neverthrow_1.err)({ type: 'firestore' });
    }
    await (0, adapters_1.updateScrapingStatus)(salonId, {
        scraping: {
            status: 'green',
            yellowDetectedTime: null,
            redDetectedTime: null,
        },
    });
    const loginResult = await adapter.login(browser, salonBoards.value[0], {
        load: retrieveAndApplyCookies,
        save: extractAndSaveCookiesIfLoginSucceeded,
    }, {
        takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
    }, forceLogin);
    if (loginResult.isOk()) {
        if (loginResult.value.alertMessage) {
            await (0, adapters_1.updateScrapingStatus)(salonId, {
                scraping: {
                    status: 'yellow',
                    yellowDetectedTime: new Date(),
                    redDetectedTime: null,
                },
            });
        }
        else {
            await (0, adapters_1.updateScrapingStatus)(salonId, {
                scraping: {
                    status: 'green',
                    yellowDetectedTime: null,
                    redDetectedTime: null,
                },
            });
        }
    }
    else {
        await (0, adapters_1.updateScrapingStatus)(salonId, {
            scraping: {
                status: 'red',
                yellowDetectedTime: null,
                redDetectedTime: new Date(),
            },
        });
    }
    return loginResult;
};
exports.login = login;
