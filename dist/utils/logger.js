"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.error = exports.warning = exports.info = void 0;
const output = (severity, payload, error) => {
    const entry = {
        severity,
        ...payload,
    };
    if (error) {
        entry.errorMessage = error.message;
        entry.errorName = error.name;
    }
    if (severity === 'ERROR') {
        console.error(JSON.stringify(entry));
        return;
    }
    if (severity === 'WARNING') {
        console.warn(JSON.stringify(entry));
        return;
    }
    console.log(JSON.stringify(entry));
};
const info = (payload) => {
    output('INFO', payload);
};
exports.info = info;
const warning = (payload, error) => {
    output('WARNING', payload, error);
};
exports.warning = warning;
const error = (payload, error) => {
    output('ERROR', payload, error);
};
exports.error = error;
const debug = (payload, error) => {
    output('DEBUG', payload, error);
};
exports.debug = debug;
