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
exports.updatePartially = exports.set = void 0;
const firestore_1 = require("@google-cloud/firestore");
const neverthrow_1 = require("neverthrow");
const logger = __importStar(require("../../utils/logger"));
const conveter_1 = require("./conveter");
const object_1 = require("../../utils/object");
const firestore = new firestore_1.Firestore();
async function set(documentId, dataToSet, collection, parentDocument) {
    const firestoreConverter = (0, conveter_1.createFirestoreConverter)(collection.schema);
    const collectionRef = parentDocument
        ? parentDocument.collection(collection.name)
        : firestore.collection(collection.name);
    try {
        await collectionRef
            .doc(documentId)
            .withConverter(firestoreConverter)
            .set(dataToSet);
        return (0, neverthrow_1.ok)(null);
    }
    catch (e) {
        console.error(e);
        logger.error({
            message: 'Set operation failed',
            documentId,
        });
        return (0, neverthrow_1.err)(null);
    }
}
exports.set = set;
async function updatePartially(documentId, dataToUpdate, collection, parentDocument) {
    const firestoreConverter = (0, conveter_1.createFirestoreConverter)(collection.schema);
    const collectionRef = parentDocument
        ? parentDocument.collection(collection.name)
        : firestore.collection(collection.name);
    try {
        const flattenedData = (0, object_1.flattenObject)(dataToUpdate);
        await collectionRef
            .doc(documentId)
            .withConverter(firestoreConverter)
            .update(flattenedData);
        return (0, neverthrow_1.ok)(null);
    }
    catch (e) {
        console.error(e);
        logger.error({
            message: 'Update failed',
            documentId,
        });
        return (0, neverthrow_1.err)(null);
    }
}
exports.updatePartially = updatePartially;
