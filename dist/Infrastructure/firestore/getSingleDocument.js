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
exports.getSingleDocument = void 0;
const firestore_1 = require("@google-cloud/firestore");
const neverthrow_1 = require("neverthrow");
const logger = __importStar(require("../../utils/logger"));
function createFirestoreConverter(schema) {
    return {
        toFirestore(modelObject) {
            return modelObject;
        },
        fromFirestore(snapshot) {
            return schema.parse(snapshot.data());
        },
    };
}
const firestore = new firestore_1.Firestore();
async function getSingleDocument(documentId, collection) {
    const firestoreConverter = createFirestoreConverter(collection.schema);
    const collectionRef = firestore.collection(collection.name);
    try {
        const docSnapshot = await collectionRef
            .doc(documentId)
            .withConverter(firestoreConverter)
            .get();
        const data = docSnapshot.data();
        if (data === undefined) {
            logger.error({
                message: 'Not found',
                documentId,
            });
            return (0, neverthrow_1.err)(null);
        }
        return (0, neverthrow_1.ok)(data);
    }
    catch (e) {
        logger.error({
            message: 'Parse failed',
            documentId,
            e,
        });
        return (0, neverthrow_1.err)(null);
    }
}
exports.getSingleDocument = getSingleDocument;
