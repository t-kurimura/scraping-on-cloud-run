"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const zod_1 = require("zod");
exports.schema = {
    salons: {
        name: 'salons',
        schema: zod_1.z.object({}),
    },
    salonBoards: {
        name: 'salonBoards',
        schema: zod_1.z.object({
            id: zod_1.z.string(),
            password: zod_1.z.string(),
            scraping: zod_1.z.object({
                status: zod_1.z.union([
                    zod_1.z.literal('green'),
                    zod_1.z.literal('red'),
                    zod_1.z.literal('yellow'),
                ]),
                yellowDetectedTime: zod_1.z.date().nullable(),
                redDetectedTime: zod_1.z.date().nullable(),
            }),
        }),
    },
    reservations: {
        name: 'reservations',
        schema: zod_1.z.object({
            metadata: zod_1.z.object({
                createdAt: zod_1.z.date(),
            }),
        }),
    },
    listedReservation: {
        name: 'listed',
        schema: zod_1.z.object({
            status: zod_1.z.string(),
            staff: zod_1.z.string(),
            time: zod_1.z.object({
                start: zod_1.z.date(),
            }),
            name: zod_1.z.string(),
        }),
    },
    reservationDetail: {
        name: 'detail',
        schema: zod_1.z.object({
            id: zod_1.z.string(),
            status: zod_1.z.string().nullable(),
            time: zod_1.z.object({
                start: zod_1.z.date().nullable(),
                end: zod_1.z.date().nullable(),
            }),
            source: zod_1.z.string().nullable(),
            options: zod_1.z.string().nullable(),
            staff: zod_1.z.string().nullable(),
            facilities: zod_1.z.string().nullable(),
            customerNumber: zod_1.z.string().nullable(),
            customerId: zod_1.z.string(),
            coupon: zod_1.z.object({
                name: zod_1.z.string().nullable(),
                description: zod_1.z.string().nullable(),
                conditions: zod_1.z.object({
                    note: zod_1.z.string().nullable(),
                    expiration: zod_1.z.string().nullable(),
                    usage: zod_1.z.string().nullable(),
                }),
            }),
            favor: zod_1.z.object({
                gender: zod_1.z.string().nullable(),
                request: zod_1.z.string().nullable(),
                first_time: zod_1.z.string().nullable(),
                note: zod_1.z.string().nullable(),
                question: zod_1.z.string().nullable(),
                response: zod_1.z.string().nullable(),
            }),
            note: zod_1.z.object({
                atReservation: zod_1.z.string().nullable(),
                forNext: zod_1.z.string().nullable(),
            }),
            hbContacts: zod_1.z.string().nullable(),
        }),
    },
    customers: {
        name: 'customers',
        schema: zod_1.z.object({
            id: zod_1.z.string(),
            nameKana: zod_1.z.string().nullable(),
            nameKanji: zod_1.z.string().nullable(),
            phoneNumber: zod_1.z.string().nullable(),
            repeatCount: zod_1.z.string().nullable(),
            note: zod_1.z.string().nullable(),
            previousInfo: zod_1.z.string().nullable(),
            gender: zod_1.z.string().nullable(),
            birthday: zod_1.z.string().nullable(),
        }),
    },
    coupons: {
        name: 'coupons',
        schema: zod_1.z.object({
            order: zod_1.z.string().nullable(),
            presentFlg: zod_1.z.string().nullable(),
            imageUrl: zod_1.z.string(),
            type: zod_1.z.string(),
            name: zod_1.z.string(),
            expirationDate: zod_1.z.string(),
            status: zod_1.z.string(),
            couponId: zod_1.z.string(),
        }),
    },
    stylists: {
        name: 'stylists',
        schema: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
        }),
    },
};
