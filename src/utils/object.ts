import { DocumentData } from '@google-cloud/firestore';

export function deepEqual(obj1: DocumentData, obj2: DocumentData): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function flattenObject(
  data: any,
  parentKey: string = '',
  result: any = {}
): any {
  Object.keys(data).forEach((key) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (
      typeof data[key] === 'object' &&
      data[key] !== null &&
      !(data[key] instanceof Date)
    ) {
      flattenObject(data[key], newKey, result);
    } else {
      result[newKey] = data[key];
    }
  });
  return result;
}
