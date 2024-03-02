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
const dayjs_1 = __importDefault(require("dayjs"));
const zod_1 = require("zod");
const logger = __importStar(require("./utils/logger"));
const useCases = __importStar(require("./use_cases"));
const adapter = __importStar(require("./adapters"));
const app = (0, express_1.default)();
app.get('/salon_board/:salonId/reservations', async (req, res) => {
    const startAt = (0, dayjs_1.default)().format('YYYY-MM-DDTHH:mm:ss SSS [Z] A');
    const salonId = req.params.salonId;
    logger.info({
        message: 'requested',
        startAt,
        salonId,
    });
    const rangeParam = zod_1.z
        .object({
        from: zod_1.z
            .string()
            .regex(/^\d{4}\d{2}\d{2}$/, 'Invalid date format. Expected YYYYMMDD.'),
        to: zod_1.z
            .string()
            .regex(/^\d{4}\d{2}\d{2}$/, 'Invalid date format. Expected YYYYMMDD.'),
    })
        .safeParse(req.query);
    if (!rangeParam.success) {
        res.status(401).json({
            message: 'Parameter invalid',
            startAt,
            query: req.query,
            err: rangeParam.error,
        });
        return;
    }
    const browser = adapter.createBrowser();
    const loginResult = await useCases.login(browser, salonId);
    logger.info({
        message: 'login flow completed',
        loginResult,
    });
    if (loginResult.isErr()) {
        await browser.quit();
        res.status(500).json({
            message: 'Login failed',
            ...loginResult,
            startAt,
        });
        return;
    }
    await useCases.collectReservations(browser, rangeParam.data, salonId);
    await browser.quit();
    res.json({
        message: 'Login completed',
        startAt,
        loginResult,
    });
});
app.get('/salon_board/:salonId/stylists', async (req, res) => {
    const startAt = (0, dayjs_1.default)().format('YYYY-MM-DDTHH:mm:ss SSS [Z] A');
    const salonId = req.params.salonId;
    logger.info({
        message: 'requested',
        startAt,
        salonId,
    });
    const browser = adapter.createBrowser();
    const loginResult = await useCases.login(browser, salonId);
    logger.info({
        message: 'login flow completed',
        loginResult,
    });
    if (loginResult.isErr()) {
        await browser.quit();
        res.status(500).json({
            message: 'Login failed',
            ...loginResult,
            startAt,
        });
        return;
    }
    await useCases.collectStylists(browser, salonId);
    res.json({
        message: 'Stylists completed',
        startAt,
    });
});
app.get('/salon_board/:salonId/coupons', async (req, res) => {
    const startAt = (0, dayjs_1.default)().format('YYYY-MM-DDTHH:mm:ss SSS [Z] A');
    const salonId = req.params.salonId;
    logger.info({
        message: 'requested coupons',
        startAt,
        salonId,
    });
    const browser = adapter.createBrowser();
    const loginResult = await useCases.login(browser, salonId, true);
    logger.info({
        message: 'login flow complete',
        loginResult,
    });
    if (loginResult.isErr()) {
        await browser.quit();
        res.status(500).json({
            message: 'Login failed',
            ...loginResult,
            startAt,
        });
        return;
    }
    await useCases.collectCoupons(browser, salonId);
    res.json({
        message: 'Coupons completed',
        startAt,
    });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
