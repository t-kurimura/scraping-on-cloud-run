import {
  DocumentData,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';
import { ZodType } from 'zod';
import { err, ok, Result } from 'neverthrow';

import * as logger from '../../utils/logger';
import { createFirestoreConverter } from './conveter';

const firestore = new Firestore();

export async function getTypedData<T extends DocumentData>(
  documentId: string,
  collection: {
    name: string;
    schema: ZodType<T>;
  },
  parentDocument?: DocumentReference
): Promise<Result<T, { type: 'notFound' | 'unknown' }>> {
  const firestoreConverter = createFirestoreConverter(collection.schema);
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
      return err({ type: 'notFound' });
    }
    return ok(data);
  } catch (e: unknown) {
    logger.error({
      message: 'Parse failed',
      documentId,
      e,
    });
    return err({ type: 'unknown' });
  }
}

export async function getTypedDataList<T extends DocumentData>(
  collection: {
    name: string;
    schema: ZodType<T>;
  },
  parentDocument?: DocumentReference
): Promise<Result<T[], null>> {
  const firestoreConverter = createFirestoreConverter(collection.schema);
  const collectionRef = parentDocument
    ? parentDocument.collection(collection.name)
    : firestore.collection(collection.name);

  try {
    const querySnapshot = await collectionRef
      .withConverter(firestoreConverter)
      .get();

    // 空の配列を初期化
    const allDocuments: T[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data !== undefined) {
        allDocuments.push(data);
      }
    });

    return ok(allDocuments);
  } catch (e: unknown) {
    logger.error({
      message: 'Failed to fetch all documents',
      e,
    });
    return err(null);
  }
}

export async function getReference<T extends DocumentData>(
  documentId: string,
  collection: {
    name: string;
    schema: ZodType<T>;
  },
  parentDocument?: DocumentReference
): Promise<Result<DocumentReference, { type: 'notFound' | 'unknown' }>> {
  const collectionRef = parentDocument
    ? parentDocument.collection(collection.name)
    : firestore.collection(collection.name);
  try {
    const docSnapshot = await collectionRef.doc(documentId);
    if (!(await docSnapshot.get()).exists) {
      return err({ type: 'notFound' });
    }
    return ok(docSnapshot);
  } catch (e: unknown) {
    logger.error({
      message: 'Parse failed',
      documentId,
      e,
    });
    return err({ type: 'unknown' });
  }
}
