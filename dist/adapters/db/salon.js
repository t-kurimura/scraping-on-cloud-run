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
exports.updateScrapingStatus = exports.updateListedReservationIfChanged = exports.updateCustomerPartially = exports.updateDetailReservation = exports.updateStylist = exports.updateCoupon = exports.getSalonBoards = void 0;
const neverthrow_1 = require("neverthrow");
const dayjs_1 = __importDefault(require("dayjs"));
const firestore = __importStar(require("../../infrastructure/firestore"));
const firestore_1 = require("../../infrastructure/firestore");
const object_1 = require("../../utils/object");
const logger = __importStar(require("../../utils/logger"));
const getSalonBoards = async (salonId) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    return await firestore.getTypedDataList(firestore.schema.salonBoards, salonRef.value);
};
exports.getSalonBoards = getSalonBoards;
const updateCoupon = async (salonId, updateData) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const salonBoardsRef = await salonRef.value
        .collection(firestore.schema.salonBoards.name)
        .get();
    await firestore.set(updateData.couponId, updateData, firestore.schema.coupons, salonBoardsRef.docs[0].ref);
    return (0, neverthrow_1.ok)(null);
};
exports.updateCoupon = updateCoupon;
const updateStylist = async (salonId, updateData) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const salonBoardsRef = await salonRef.value
        .collection(firestore.schema.salonBoards.name)
        .get();
    await firestore.set(updateData.id, updateData, firestore.schema.stylists, salonBoardsRef.docs[0].ref);
    return (0, neverthrow_1.ok)(null);
};
exports.updateStylist = updateStylist;
const updateDetailReservation = async (salonId, updateData) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const salonBoardsRef = await salonRef.value
        .collection(firestore.schema.salonBoards.name)
        .get();
    const firstSalonBoardRef = salonBoardsRef.docs[0].ref;
    let reservationRef = await firestore.getReference(updateData.id, firestore.schema.reservations, firstSalonBoardRef);
    if (reservationRef.isErr()) {
        if (reservationRef.error.type === 'notFound') {
            await firestore.set(updateData.id, {
                metadata: {
                    createdAt: (0, dayjs_1.default)().toDate(),
                },
            }, firestore.schema.reservations, firstSalonBoardRef);
            reservationRef = await firestore.getReference(updateData.id, firestore.schema.reservations, firstSalonBoardRef);
        }
    }
    if (reservationRef.isErr()) {
        logger.error({
            message: 'failed to get reservationRef',
            err: reservationRef.error,
            reservationId: updateData.id,
        });
        return (0, neverthrow_1.err)(null);
    }
    await firestore.set(updateData.id, updateData, firestore.schema.reservationDetail, reservationRef.value);
    return (0, neverthrow_1.ok)(null);
};
exports.updateDetailReservation = updateDetailReservation;
const updateCustomerPartially = async (salonId, updateData) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const salonBoardsRef = await salonRef.value
        .collection(firestore.schema.salonBoards.name)
        .get();
    const firstSalonBoardRef = salonBoardsRef.docs[0].ref;
    const customerRef = await (0, firestore_1.getReference)(updateData.id, firestore.schema.customers, firstSalonBoardRef);
    if (customerRef.isErr()) {
        if (customerRef.error.type === 'unknown') {
            logger.error({
                message: 'failed to get customerRef',
                err: customerRef.error,
                customerId: updateData.id,
            });
            return (0, neverthrow_1.err)(null);
        }
        await firestore.set(updateData.id, updateData, firestore.schema.customers, firstSalonBoardRef);
        return (0, neverthrow_1.ok)(null);
    }
    await (0, firestore_1.updatePartially)(updateData.id, updateData, firestore.schema.customers, firstSalonBoardRef);
    return (0, neverthrow_1.ok)(null);
};
exports.updateCustomerPartially = updateCustomerPartially;
const updateListedReservationIfChanged = async (salonId, reservationId, updateData) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const salonBoardsRef = await salonRef.value
        .collection(firestore.schema.salonBoards.name)
        .get();
    const firstSalonBoardRef = salonBoardsRef.docs[0].ref;
    let reservationRef = await firestore.getReference(reservationId, firestore.schema.reservations, firstSalonBoardRef);
    if (reservationRef.isErr()) {
        if (reservationRef.error.type === 'notFound') {
            await firestore.set(reservationId, {
                metadata: {
                    createdAt: (0, dayjs_1.default)().toDate(),
                },
            }, firestore.schema.reservations, firstSalonBoardRef);
            reservationRef = await firestore.getReference(reservationId, firestore.schema.reservations, firstSalonBoardRef);
        }
    }
    if (reservationRef.isErr()) {
        logger.error({
            message: 'failed to get reservationRef',
            err: reservationRef.error,
            reservationId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const listedReservationResult = await firestore.getTypedData(reservationId, firestore.schema.listedReservation, reservationRef.value);
    if (listedReservationResult.isErr()) {
        if (listedReservationResult.error.type !== 'notFound') {
            logger.error({
                message: 'failed to get listedReservation',
                err: listedReservationResult.error,
                reservationId,
            });
            return (0, neverthrow_1.err)(null);
        }
        await firestore.set(reservationId, updateData, firestore.schema.listedReservation, reservationRef.value);
        return (0, neverthrow_1.ok)({
            hasChanged: true,
        });
    }
    if ((0, object_1.deepEqual)(listedReservationResult.value, updateData)) {
        return (0, neverthrow_1.ok)({
            hasChanged: false,
        });
    }
    await firestore.set(reservationId, updateData, firestore.schema.listedReservation, reservationRef.value);
    return (0, neverthrow_1.ok)({
        hasChanged: true,
    });
};
exports.updateListedReservationIfChanged = updateListedReservationIfChanged;
const updateScrapingStatus = async (salonId, updateData) => {
    const salonRef = await firestore.getReference(salonId, firestore.schema.salons);
    if (salonRef.isErr()) {
        logger.error({
            message: 'failed to get salonRef',
            err: salonRef.error,
            salonId,
        });
        return (0, neverthrow_1.err)(null);
    }
    const salonBoardsRef = await salonRef.value
        .collection(firestore.schema.salonBoards.name)
        .get();
    const firstSalonBoardRef = salonBoardsRef.docs[0].ref;
    await (0, firestore_1.updatePartially)(firstSalonBoardRef.id, updateData, firestore.schema.salonBoards, salonRef.value);
    return (0, neverthrow_1.ok)(null);
};
exports.updateScrapingStatus = updateScrapingStatus;
