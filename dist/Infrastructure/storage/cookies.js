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
exports.retrieveLoginCookies = exports.saveLoginCookies = void 0;
const logger = __importStar(require("../logger"));
const zod_1 = require("zod");
const neverthrow_1 = require("neverthrow");
const base_1 = require("./base");
const zSavedCookie = zod_1.z
    .object({
    name: zod_1.z.string(),
    value: zod_1.z.string(),
    path: zod_1.z.string().optional(),
    domain: zod_1.z.string().optional(),
    secure: zod_1.z.boolean().optional(),
    httpOnly: zod_1.z.boolean().optional(),
    expiry: zod_1.z.union([zod_1.z.number(), zod_1.z.date()]).optional(),
})
    .array();
const saveLoginCookies = async (cookies) => {
    const bucket = base_1.storageClient.bucket(base_1.buckets.cookies);
    const file = bucket.file(`login_cookies.json`);
    const stream = file.createWriteStream({
        metadata: {
            contentType: 'application/json',
        },
    });
    stream.write(JSON.stringify(cookies, null, 2));
    stream.end();
    stream.on('finish', () => {
        logger.info({
            message: 'Cookies saved to GCS.',
        });
    });
};
exports.saveLoginCookies = saveLoginCookies;
const retrieveLoginCookies = async () => {
    const bucket = base_1.storageClient.bucket(base_1.buckets.cookies);
    const file = bucket.file(`login_cookies.json`);
    const [exists] = await file.exists();
    if (!exists) {
        logger.info({
            message: 'Cookie file was not found',
        });
        return (0, neverthrow_1.err)(null);
    }
    const [contents] = await file.download();
    const parseResult = zSavedCookie.safeParse(JSON.parse(contents.toString('utf-8')));
    if (!parseResult.success) {
        logger.error({
            message: 'Cookie file was not found',
        }, parseResult.error);
        return (0, neverthrow_1.err)(null);
    }
    return (0, neverthrow_1.ok)(parseResult.data);
};
exports.retrieveLoginCookies = retrieveLoginCookies;
