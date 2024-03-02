import {
  DocumentData,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { ZodType } from 'zod';
import { err, ok, Result } from 'neverthrow';

import * as logger from '../../utils/logger';
import { createFirestoreConverter } from './conveter';
import { flattenObject } from '../../utils/object';

const firestore = new Firestore();

export async function set<T extends DocumentData>(
  documentId: string,
  dataToSet: T,
  collection: {
    name: string;
    schema: ZodType<T>;
  },
  parentDocument?: DocumentReference
): Promise<Result<null, null>> {
  const firestoreConverter = createFirestoreConverter(collection.schema);
  const collectionRef = parentDocument
    ? parentDocument.collection(collection.name)
    : firestore.collection(collection.name);
  try {
    await collectionRef
      .doc(documentId)
      .withConverter(firestoreConverter)
      .set(dataToSet);
    return ok(null);
  } catch (e: unknown) {
    console.error(e);
    logger.error({
      message: 'Set operation failed',
      documentId,
    });
    return err(null);
  }
}

export async function updatePartially<T extends DocumentData>(
  documentId: string,
  dataToUpdate: Partial<T>,
  collection: {
    name: string;
    schema: ZodType<T>;
  },
  parentDocument?: DocumentReference
): Promise<Result<null, null>> {
  const firestoreConverter = createFirestoreConverter(collection.schema);
  const collectionRef = parentDocument
    ? parentDocument.collection(collection.name)
    : firestore.collection(collection.name);
  try {
    const flattenedData = flattenObject(dataToUpdate);
    await collectionRef
      .doc(documentId)
      .withConverter(firestoreConverter)
      .update(flattenedData);
    return ok(null);
  } catch (e: unknown) {
    console.error(e);
    logger.error({
      message: 'Update failed',
      documentId,
    });
    return err(null);
  }
}
