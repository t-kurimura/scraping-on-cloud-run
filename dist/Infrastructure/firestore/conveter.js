"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirestoreConverter = void 0;
const firestore_1 = require("@google-cloud/firestore");
function dateToTimestampField(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
        if (value instanceof Date && !isNaN(value.getTime())) {
            return [key, firestore_1.Timestamp.fromDate(value)];
        }
        else if (value && typeof value === 'object') {
            return [key, dateToTimestampField(value)];
        }
        return [key, value];
    }));
}
function timestampToDateField(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
        if (value instanceof firestore_1.Timestamp) {
            return [key, value.toDate()];
        }
        else if (value && typeof value === 'object') {
            return [key, timestampToDateField(value)];
        }
        return [key, value];
    }));
}
function createFirestoreConverter(schema) {
    return {
        toFirestore(modelObject) {
            return dateToTimestampField({ ...modelObject });
        },
        fromFirestore(snapshot) {
            const data = snapshot.data();
            return schema.parse(timestampToDateField({ ...data }));
        },
    };
}
exports.createFirestoreConverter = createFirestoreConverter;
