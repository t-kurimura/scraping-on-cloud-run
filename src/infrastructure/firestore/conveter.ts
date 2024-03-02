import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from '@google-cloud/firestore';
import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-explicit-any */
function dateToTimestampField(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value instanceof Date && !isNaN(value.getTime())) {
        return [key, Timestamp.fromDate(value)];
      } else if (value && typeof value === 'object') {
        return [key, dateToTimestampField(value)];
      }
      return [key, value];
    })
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function timestampToDateField(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value instanceof Timestamp) {
        return [key, value.toDate()];
      } else if (value && typeof value === 'object') {
        return [key, timestampToDateField(value)];
      }
      return [key, value];
    })
  );
}

export function createFirestoreConverter<T extends DocumentData>(
  schema: z.ZodType<T>
): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T): DocumentData {
      return dateToTimestampField({ ...modelObject });
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      return schema.parse(timestampToDateField({ ...data }));
    },
  };
}
