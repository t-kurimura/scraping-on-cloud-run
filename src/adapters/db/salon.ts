import { err, ok, Result } from 'neverthrow';
import { z } from 'zod';
import dayjs from 'dayjs';

import * as firestore from '../../infrastructure/firestore';
import { getReference, updatePartially } from '../../infrastructure/firestore';
import { deepEqual } from '../../utils/object';
import * as logger from '../../utils/logger';

export const getSampleBoards = async (
  salonId: string
): Promise<
  Result<z.infer<typeof firestore.schema.sampleBoards.schema>[], null>
> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }
  return await firestore.getTypedDataList(
    firestore.schema.sampleBoards,
    salonRef.value
  );
};

export const updateCoupon = async (
  salonId: string,
  updateData: z.infer<typeof firestore.schema.coupons.schema>
): Promise<Result<null, null>> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }

  const sampleBoardsRef = await salonRef.value
    .collection(firestore.schema.sampleBoards.name)
    .get();

  await firestore.set(
    updateData.couponId,
    updateData,
    firestore.schema.coupons,
    sampleBoardsRef.docs[0].ref // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
  );
  return ok(null);
};

export const updateStylist = async (
  salonId: string,
  updateData: z.infer<typeof firestore.schema.stylists.schema>
): Promise<Result<null, null>> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }

  const sampleBoardsRef = await salonRef.value
    .collection(firestore.schema.sampleBoards.name)
    .get();

  await firestore.set(
    updateData.id,
    updateData,
    firestore.schema.stylists,
    sampleBoardsRef.docs[0].ref // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
  );
  return ok(null);
};

export const updateDetailReservation = async (
  salonId: string,
  updateData: z.infer<typeof firestore.schema.reservationDetail.schema>
): Promise<Result<null, null>> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }

  const sampleBoardsRef = await salonRef.value
    .collection(firestore.schema.sampleBoards.name)
    .get();

  // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
  // MUST BE DETERMINED WHICH SALON BOARD TO SEARCH
  const firstSampleBoardRef = sampleBoardsRef.docs[0].ref;

  let reservationRef = await firestore.getReference(
    updateData.id,
    firestore.schema.reservations,
    firstSampleBoardRef
  );
  if (reservationRef.isErr()) {
    if (reservationRef.error.type === 'notFound') {
      await firestore.set(
        updateData.id,
        {
          metadata: {
            createdAt: dayjs().toDate(),
          },
        },
        firestore.schema.reservations,
        firstSampleBoardRef
      );
      reservationRef = await firestore.getReference(
        updateData.id,
        firestore.schema.reservations,
        firstSampleBoardRef
      );
    }
  }
  if (reservationRef.isErr()) {
    logger.error({
      message: 'failed to get reservationRef',
      err: reservationRef.error,
      reservationId: updateData.id,
    });
    return err(null);
  }

  await firestore.set(
    updateData.id,
    updateData,
    firestore.schema.reservationDetail,
    reservationRef.value
  );

  return ok(null);
};

export const updateCustomerPartially = async (
  salonId: string,
  updateData: {
    id: string;
  } & Partial<z.infer<typeof firestore.schema.customers.schema>>
): Promise<Result<null, null>> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }

  const sampleBoardsRef = await salonRef.value
    .collection(firestore.schema.sampleBoards.name)
    .get();

  // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
  // MUST BE DETERMINED WHICH SALON BOARD TO SEARCH
  const firstSampleBoardRef = sampleBoardsRef.docs[0].ref;

  const customerRef = await getReference(
    updateData.id,
    firestore.schema.customers,
    firstSampleBoardRef
  );
  if (customerRef.isErr()) {
    if (customerRef.error.type === 'unknown') {
      logger.error({
        message: 'failed to get customerRef',
        err: customerRef.error,
        customerId: updateData.id,
      });
      return err(null);
    }
    await firestore.set(
      updateData.id,
      updateData,
      firestore.schema.customers,
      firstSampleBoardRef
    );
    return ok(null);
  }

  await updatePartially(
    updateData.id,
    updateData,
    firestore.schema.customers,
    firstSampleBoardRef
  );
  return ok(null);
};

export const updateListedReservationIfChanged = async (
  salonId: string,
  reservationId: string,
  updateData: z.infer<typeof firestore.schema.listedReservation.schema>
): Promise<
  Result<
    {
      hasChanged: boolean;
    },
    null
  >
> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }

  const sampleBoardsRef = await salonRef.value
    .collection(firestore.schema.sampleBoards.name)
    .get();

  // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
  // MUST BE DETERMINED WHICH SALON BOARD TO SEARCH
  const firstSampleBoardRef = sampleBoardsRef.docs[0].ref;

  let reservationRef = await firestore.getReference(
    reservationId,
    firestore.schema.reservations,
    firstSampleBoardRef
  );
  if (reservationRef.isErr()) {
    if (reservationRef.error.type === 'notFound') {
      await firestore.set(
        reservationId,
        {
          metadata: {
            createdAt: dayjs().toDate(),
          },
        },
        firestore.schema.reservations,
        firstSampleBoardRef
      );
      reservationRef = await firestore.getReference(
        reservationId,
        firestore.schema.reservations,
        firstSampleBoardRef
      );
    }
  }
  if (reservationRef.isErr()) {
    logger.error({
      message: 'failed to get reservationRef',
      err: reservationRef.error,
      reservationId,
    });
    return err(null);
  }

  const listedReservationResult = await firestore.getTypedData(
    reservationId,
    firestore.schema.listedReservation,
    reservationRef.value
  );
  if (listedReservationResult.isErr()) {
    if (listedReservationResult.error.type !== 'notFound') {
      logger.error({
        message: 'failed to get listedReservation',
        err: listedReservationResult.error,
        reservationId,
      });
      return err(null);
    }
    await firestore.set(
      reservationId,
      updateData,
      firestore.schema.listedReservation,
      reservationRef.value
    );
    return ok({
      hasChanged: true,
    });
  }

  if (deepEqual(listedReservationResult.value, updateData)) {
    return ok({
      hasChanged: false,
    });
  }

  await firestore.set(
    reservationId,
    updateData,
    firestore.schema.listedReservation,
    reservationRef.value
  );
  return ok({
    hasChanged: true,
  });
};

export const updateScrapingStatus = async (
  salonId: string,
  updateData: Pick<
    z.infer<typeof firestore.schema.sampleBoards.schema>,
    'scraping'
  >
): Promise<Result<null, null>> => {
  const salonRef = await firestore.getReference(
    salonId,
    firestore.schema.salons
  );
  if (salonRef.isErr()) {
    logger.error({
      message: 'failed to get salonRef',
      err: salonRef.error,
      salonId,
    });
    return err(null);
  }

  const sampleBoardsRef = await salonRef.value
    .collection(firestore.schema.sampleBoards.name)
    .get();

  // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
  // MUST BE DETERMINED WHICH SALON BOARD TO SEARCH
  const firstSampleBoardRef = sampleBoardsRef.docs[0].ref;

  await updatePartially(
    firstSampleBoardRef.id,
    updateData,
    firestore.schema.sampleBoards,
    salonRef.value
  );

  return ok(null);
};
