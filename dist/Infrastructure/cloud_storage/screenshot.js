"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadScreenshot = void 0;
const base_1 = require("./base");
const uploadScreenshot = async (base64png, fileName) => {
    const bucket = base_1.storageClient.bucket(base_1.buckets.screenshot);
    const file = bucket.file(`${fileName}.png`);
    await file.save(new Buffer(base64png, 'base64'));
};
exports.uploadScreenshot = uploadScreenshot;
