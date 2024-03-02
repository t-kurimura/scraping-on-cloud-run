import { WebDriver } from 'selenium-webdriver';
import dayjs from 'dayjs';

import * as adapter from '../../adapters';
import * as logger from '../../utils/logger';

const takeScreenshotOnBrowserAndUploadGCS = async (
  browser: WebDriver,
  fileName: string
): Promise<void> => {
  const screenshot = await browser.takeScreenshot();
  await adapter.uploadScreenshot(screenshot, fileName);
};

export const collectReservations = async (
  browser: WebDriver,
  range: {
    from: string;
    to: string;
  },
  salonId: string
) => {
  const reservations = await adapter.listReservations(
    browser,
    range,
    {
      takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
    },
    {
      searchWithCondition: adapter.searchWithCondition,
    }
  );
  logger.info({
    message: 'retrieved reservations',
    reservations,
  });

  for (const reservationId in reservations) {
    if (!reservations.hasOwnProperty(reservationId)) {
      continue;
    }

    const updateResult = await adapter.updateListedReservationIfChanged(
      salonId,
      reservationId,
      reservations[reservationId]
    );
    if (updateResult.isErr()) {
      logger.error({
        message: 'update failed',
        reservationId,
        reservation: reservations[reservationId],
      });
      return;
    }
    if (!updateResult.value.hasChanged) {
      continue;
    }

    // 予約詳細ページの情報を保存
    const reservationPageResult = await adapter.diveReservation(
      browser,
      reservationId,
      range,
      {
        searchWithCondition: adapter.searchWithCondition,
      }
    );
    if (reservationPageResult.isErr()) {
      logger.error({
        message: 'failed to check reservation page',
        salonId,
        reservationId,
      });
      continue;
    }
    await adapter.updateDetailReservation(
      salonId,
      reservationPageResult.value.reservation
    );
    await adapter.updateCustomerPartially(
      salonId,
      reservationPageResult.value.customer
    );

    // 当該顧客の顧客ページの情報を保存
    const customerId = reservationPageResult.value.customer.id;
    const customerPageResult = await adapter.diveCustomer(browser, customerId, {
      takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
    });
    if (customerPageResult.isErr()) {
      logger.error({
        message: 'failed customer',
        error: customerPageResult.error,
      });
      continue;
    }
    await adapter.updateCustomerPartially(salonId, {
      id: customerId,
      birthday: customerPageResult.value.birthday,
      gender: customerPageResult.value.gender,
    });

    // 当該顧客の過去予約を保存
    for (const pastReservation of customerPageResult.value.pastReservation) {
      const pastReservationPageResult = await adapter.diveReservation(
        browser,
        pastReservation.reservationId,
        {
          from: dayjs(pastReservation.date).format('YYYYMMDD'),
          to: dayjs(pastReservation.date).format('YYYYMMDD'),
        },
        {
          searchWithCondition: adapter.searchWithCondition,
        }
      );
      if (pastReservationPageResult.isErr()) {
        logger.error({
          message: 'failed to check past reservation page',
          salonId,
          reservationId,
        });
        continue;
      }
      await adapter.updateDetailReservation(
        salonId,
        pastReservationPageResult.value.reservation
      );
    }

    logger.info({
      message: 'fetch reservationDetail',
      reservationDetail: reservationPageResult,
    });
  }
};
