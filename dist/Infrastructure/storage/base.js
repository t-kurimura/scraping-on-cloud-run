"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buckets = exports.storageClient = void 0;
const storage_1 = require("@google-cloud/storage");
exports.storageClient = new storage_1.Storage();
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
exports.buckets = {
    screenshot: `${projectId}-screenshots`,
    cookies: `${projectId}-cookies`,
};
