"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadScreenshot = void 0;
const infrastructure_1 = require("../../infrastructure");
const uploadScreenshot = async (base64png, fileName) => {
    const bucket = infrastructure_1.storageClient.bucket(infrastructure_1.bucketName.screenshot);
    const file = bucket.file(`${fileName}.png`);
    await file.save(new Buffer(base64png, 'base64'));
};
exports.uploadScreenshot = uploadScreenshot;
