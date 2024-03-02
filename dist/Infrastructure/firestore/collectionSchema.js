"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionSchema = void 0;
const zod_1 = require("zod");
exports.collectionSchema = {
    salons: {
        name: 'salons',
        schema: zod_1.z.object({}),
    },
    salonBoards: {
        name: 'salonBoards',
        schema: zod_1.z.object({
            id: zod_1.z.string(),
            password: zod_1.z.string(),
        }),
    },
    reservations: {
        name: 'reservations',
        schema: zod_1.z.object({}),
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
};
