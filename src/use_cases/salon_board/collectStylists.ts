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

export const collectStylists = async (browser: WebDriver, salonId: string) => {
  const stylists = await adapter.listStylists(browser, {
    takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
  });
  logger.info({
    message: 'retrieved stylists',
    reservations: stylists,
  });

  for (const stylistId in stylists) {
    if (!stylists.hasOwnProperty(stylistId)) {
      continue;
    }
    await adapter.updateStylist(salonId, stylists[stylistId]);
  }
};
