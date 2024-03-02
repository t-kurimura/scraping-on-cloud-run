"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObject = exports.deepEqual = void 0;
function deepEqual(obj1, obj2) {
    if (obj1 === obj2)
        return true;
    if (typeof obj1 !== 'object' ||
        obj1 === null ||
        typeof obj2 !== 'object' ||
        obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length)
        return false;
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key]))
            return false;
    }
    return true;
}
exports.deepEqual = deepEqual;
function flattenObject(data, parentKey = '', result = {}) {
    Object.keys(data).forEach((key) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof data[key] === 'object' &&
            data[key] !== null &&
            !(data[key] instanceof Date)) {
            flattenObject(data[key], newKey, result);
        }
        else {
            result[newKey] = data[key];
        }
    });
    return result;
}
exports.flattenObject = flattenObject;
