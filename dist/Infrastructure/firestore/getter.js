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
exports.getReference = exports.getTypedDataList = exports.getTypedData = void 0;
const firestore_1 = require("@google-cloud/firestore");
const neverthrow_1 = require("neverthrow");
const logger = __importStar(require("../../utils/logger"));
const conveter_1 = require("./conveter");
const firestore = new firestore_1.Firestore();
async function getTypedData(documentId, collection, parentDocument) {
    const firestoreConverter = (0, conveter_1.createFirestoreConverter)(collection.schema);
    const collectionRef = parentDocument
        ? parentDocument.collection(collection.name)
        : firestore.collection(collection.name);
    try {
        const docSnapshot = await collectionRef
            .doc(documentId)
            .withConverter(firestoreConverter)
            .get();
        const data = docSnapshot.data();
        if (data === undefined) {
            return (0, neverthrow_1.err)({ type: 'notFound' });
        }
        return (0, neverthrow_1.ok)(data);
    }
    catch (e) {
        logger.error({
            message: 'Parse failed',
            documentId,
            e,
        });
        return (0, neverthrow_1.err)({ type: 'unknown' });
    }
}
exports.getTypedData = getTypedData;
async function getTypedDataList(collection, parentDocument) {
    const firestoreConverter = (0, conveter_1.createFirestoreConverter)(collection.schema);
    const collectionRef = parentDocument
        ? parentDocument.collection(collection.name)
        : firestore.collection(collection.name);
    try {
        const querySnapshot = await collectionRef
            .withConverter(firestoreConverter)
            .get();
        const allDocuments = [];
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (data !== undefined) {
                allDocuments.push(data);
            }
        });
        return (0, neverthrow_1.ok)(allDocuments);
    }
    catch (e) {
        logger.error({
            message: 'Failed to fetch all documents',
            e,
        });
        return (0, neverthrow_1.err)(null);
    }
}
exports.getTypedDataList = getTypedDataList;
async function getReference(documentId, collection, parentDocument) {
    const collectionRef = parentDocument
        ? parentDocument.collection(collection.name)
        : firestore.collection(collection.name);
    try {
        const docSnapshot = await collectionRef.doc(documentId);
        if (!(await docSnapshot.get()).exists) {
            return (0, neverthrow_1.err)({ type: 'notFound' });
        }
        return (0, neverthrow_1.ok)(docSnapshot);
    }
    catch (e) {
        logger.error({
            message: 'Parse failed',
            documentId,
            e,
        });
        return (0, neverthrow_1.err)({ type: 'unknown' });
    }
}
exports.getReference = getReference;
