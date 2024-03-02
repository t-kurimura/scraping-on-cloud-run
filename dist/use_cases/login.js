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
const storage = __importStar(require("../infrastructure/cloud_storage/cookies"));
const loginFlow_1 = require("../adapters/scraping/loginFlow");
const retrieveAndApplyCookies = async (driver) => {
    const cookies = await storage.retrieveLoginCookies();
    if (cookies.isOk()) {
        const manager = await driver.manage();
        for (const cookie of cookies.value) {
            await manager.addCookie(cookie);
        }
    }
};
const extractAndSaveCookiesIfLoginSucceeded = async (driver, r) => {
    if (r.isOk()) {
        const cookies = await driver.manage().getCookies();
        await storage.saveLoginCookies(cookies);
    }
};
const login = async (browser) => {
    return await (0, loginFlow_1.loginFlow)(browser, {
        id: '',
        password: '',
    }, {
        load: retrieveAndApplyCookies,
        save: extractAndSaveCookiesIfLoginSucceeded,
    });
};
exports.login = login;
