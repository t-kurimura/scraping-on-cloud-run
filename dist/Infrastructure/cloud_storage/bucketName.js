"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = void 0;
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
exports.bucketName = {
    screenshot: `${projectId}-screenshots`,
    cookies: `${projectId}-cookies`,
};
