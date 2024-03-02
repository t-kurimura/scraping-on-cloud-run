import { WebDriver } from 'selenium-webdriver';

import * as adapter from '../../adapters';
import * as logger from '../../utils/logger';

const takeScreenshotOnBrowserAndUploadGCS = async (
  browser: WebDriver,
  fileName: string
): Promise<void> => {
  const screenshot = await browser.takeScreenshot();
  await adapter.uploadScreenshot(screenshot, fileName);
};

export const collectCoupons = async (browser: WebDriver, salonId: string) => {
  const coupons = await adapter.listCoupons(browser, {
    takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
  });
  logger.info({
    message: 'retrieved coupons',
    reservations: coupons,
  });

  for (const couponId in coupons) {
    if (!coupons.hasOwnProperty(couponId)) {
      continue;
    }
    await adapter.updateCoupon(salonId, coupons[couponId]);
  }
};
