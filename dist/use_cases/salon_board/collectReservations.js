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
exports.collectReservations = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const adapter = __importStar(require("../../adapters"));
const logger = __importStar(require("../../utils/logger"));
const takeScreenshotOnBrowserAndUploadGCS = async (browser, fileName) => {
    const screenshot = await browser.takeScreenshot();
    await adapter.uploadScreenshot(screenshot, fileName);
};
const collectReservations = async (browser, range, salonId) => {
    const reservations = await adapter.listReservations(browser, range, {
        takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
    }, {
        searchWithCondition: adapter.searchWithCondition,
    });
    logger.info({
        message: 'retrieved reservations',
        reservations,
    });
    for (const reservationId in reservations) {
        if (!reservations.hasOwnProperty(reservationId)) {
            continue;
        }
        const updateResult = await adapter.updateListedReservationIfChanged(salonId, reservationId, reservations[reservationId]);
        if (updateResult.isErr()) {
            logger.error({
                message: 'update failed',
                reservationId,
                reservation: reservations[reservationId],
            });
            return;
        }
        if (!updateResult.value.hasChanged) {
            continue;
        }
        const reservationPageResult = await adapter.diveReservation(browser, reservationId, range, {
            searchWithCondition: adapter.searchWithCondition,
        });
        if (reservationPageResult.isErr()) {
            logger.error({
                message: 'failed to check reservation page',
                salonId,
                reservationId,
            });
            continue;
        }
        await adapter.updateDetailReservation(salonId, reservationPageResult.value.reservation);
        await adapter.updateCustomerPartially(salonId, reservationPageResult.value.customer);
        const customerId = reservationPageResult.value.customer.id;
        const customerPageResult = await adapter.diveCustomer(browser, customerId, {
            takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
        });
        if (customerPageResult.isErr()) {
            logger.error({
                message: 'failed customer',
                error: customerPageResult.error,
            });
            continue;
        }
        await adapter.updateCustomerPartially(salonId, {
            id: customerId,
            birthday: customerPageResult.value.birthday,
            gender: customerPageResult.value.gender,
        });
        for (const pastReservation of customerPageResult.value.pastReservation) {
            const pastReservationPageResult = await adapter.diveReservation(browser, pastReservation.reservationId, {
                from: (0, dayjs_1.default)(pastReservation.date).format('YYYYMMDD'),
                to: (0, dayjs_1.default)(pastReservation.date).format('YYYYMMDD'),
            }, {
                searchWithCondition: adapter.searchWithCondition,
            });
            if (pastReservationPageResult.isErr()) {
                logger.error({
                    message: 'failed to check past reservation page',
                    salonId,
                    reservationId,
                });
                continue;
            }
            await adapter.updateDetailReservation(salonId, pastReservationPageResult.value.reservation);
        }
        logger.info({
            message: 'fetch reservationDetail',
            reservationDetail: reservationPageResult,
        });
    }
};
exports.collectReservations = collectReservations;
